import Button from '@app/components/Common/Button';
import LoadingSpinner from '@app/components/Common/LoadingSpinner';
import PageTitle from '@app/components/Common/PageTitle';
import FormErrorNotification from '@app/components/FormErrorNotification';
import LabeledCheckbox from '@app/components/LabeledCheckbox';
import PermissionEdit from '@app/components/PermissionEdit';
import QuotaSelector from '@app/components/QuotaSelector';
import useSettings from '@app/hooks/useSettings';
import globalMessages from '@app/i18n/globalMessages';
import { SaveIcon } from '@heroicons/react/outline';
import { MediaServerType } from '@server/constants/server';
import type { MainSettings } from '@server/lib/settings';
import axios from 'axios';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import getConfig from 'next/config';
import { defineMessages, useIntl } from 'react-intl';
import { useToasts } from 'react-toast-notifications';
import useSWR, { mutate } from 'swr';
import * as yup from 'yup';

const messages = defineMessages({
  users: 'Users',
  userSettings: 'User Settings',
  userSettingsDescription: 'Configure global and default user settings.',
  toastSettingsSuccess: 'User settings saved successfully!',
  toastSettingsFailure: 'Something went wrong while saving settings.',
  loginMethods: 'Login Methods',
  loginMethodsTip: 'Configure login methods for users.',
  localLogin: 'Enable Local Sign-In',
  localLoginTip:
    'Allow users to sign in using their email address and password, instead of Plex OAuth',
  newPlexLogin: 'Enable New {mediaServerName} Sign-In',
  newPlexLoginTip:
    'Allow {mediaServerName} users to sign in without first being imported',
  mediaServerLogin: 'Enable {mediaServerName} Sign-In',
  mediaServerLoginTip:
    'Allow users to sign in using their {mediaServerName} account',
  oidcLogin: 'Enable OIDC Sign-In',
  oidcLoginTip: 'Allow users to sign in using an OIDC identity provider',
  oidcDomain: 'OIDC Issuer URL',
  oidcDomainTip: "The base URL of the identity provider's OIDC endpoint",
  oidcName: 'OIDC Provider Name',
  oidcNameTip: 'Name of the OIDC Provider which appears on the login screen',
  oidcClientId: 'OIDC Client ID',
  oidcClientIdTip: 'The OIDC Client ID assigned to Jellyseerr',
  oidcClientSecret: 'OIDC Client Secret',
  oidcClientSecretTip: 'The OIDC Client Secret assigned to Jellyseerr',
  movieRequestLimitLabel: 'Global Movie Request Limit',
  tvRequestLimitLabel: 'Global Series Request Limit',
  defaultPermissions: 'Default Permissions',
  defaultPermissionsTip: 'Initial permissions assigned to new users',
});

const validationSchema = yup
  .object()
  .shape({
    localLogin: yup.boolean(),
    mediaServerLogin: yup.boolean(),
    oidcLogin: yup.boolean(),
    oidcName: yup.string().when('oidcLogin', {
      is: true,
      then: yup.string().required(),
    }),
    oidcClientId: yup.string().when('oidcLogin', {
      is: true,
      then: yup.string().required(),
    }),
    oidcClientSecret: yup.string().when('oidcLogin', {
      is: true,
      then: yup.string().required(),
    }),
    oidcDomain: yup.string().when('oidcLogin', {
      is: true,
      then: yup
        .string()
        .required()
        .test({
          message: 'Must be a valid domain without query string parameters.',
          test: (val) => {
            return (
              !!val &&
              // Any HTTP(S) domain without query string
              /^(https?:\/\/)([A-Za-z0-9-_.!~*'():]*)(((?!\?).)*$)/i.test(val)
            );
          },
        }),
    }),
  })
  .test({
    name: 'atLeastOneAuth',
    test: function (values) {
      const isValid = ['localLogin', 'mediaServerLogin', 'oidcLogin'].some(
        (field) => !!values[field]
      );

      if (isValid) return true;
      return this.createError({
        path: 'localLogin | mediaServerLogin | oidcLogin',
        message: 'At least one authentication method must be selected.',
      });
    },
  });

const SettingsUsers = () => {
  const { addToast } = useToasts();
  const intl = useIntl();
  const {
    data,
    error,
    mutate: revalidate,
  } = useSWR<MainSettings>('/api/v1/settings/main');
  const settings = useSettings();
  const { publicRuntimeConfig } = getConfig();

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  const mediaServerName =
    publicRuntimeConfig.JELLYFIN_TYPE == 'emby'
      ? 'Emby'
      : settings.currentSettings.mediaServerType === MediaServerType.PLEX
      ? 'Plex'
      : 'Jellyfin';

  return (
    <>
      <PageTitle
        title={[
          intl.formatMessage(messages.users),
          intl.formatMessage(globalMessages.settings),
        ]}
      />
      <div className="mb-6">
        <h3 className="heading">{intl.formatMessage(messages.userSettings)}</h3>
        <p className="description">
          {intl.formatMessage(messages.userSettingsDescription)}
        </p>
      </div>
      <div className="section">
        <Formik
          initialValues={{
            localLogin: data?.localLogin,
            newPlexLogin: data?.newPlexLogin,
            mediaServerLogin: data?.mediaServerLogin,
            oidcLogin: data?.oidcLogin,
            oidcName: data?.oidcName,
            oidcClientId: data?.oidcClientId,
            oidcClientSecret: data?.oidcClientSecret,
            oidcDomain: data?.oidcDomain,
            movieQuotaLimit: data?.defaultQuotas.movie.quotaLimit ?? 0,
            movieQuotaDays: data?.defaultQuotas.movie.quotaDays ?? 7,
            tvQuotaLimit: data?.defaultQuotas.tv.quotaLimit ?? 0,
            tvQuotaDays: data?.defaultQuotas.tv.quotaDays ?? 7,
            defaultPermissions: data?.defaultPermissions ?? 0,
          }}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={async (values) => {
            try {
              await axios.post('/api/v1/settings/main', {
                localLogin: values.localLogin,
                newPlexLogin: values.newPlexLogin,
                mediaServerLogin: values.mediaServerLogin,
                oidcLogin: values.oidcLogin,
                oidcName: values.oidcName,
                oidcClientId: values.oidcClientId,
                oidcClientSecret: values.oidcClientSecret,
                oidcDomain: values.oidcDomain,
                defaultQuotas: {
                  movie: {
                    quotaLimit: values.movieQuotaLimit,
                    quotaDays: values.movieQuotaDays,
                  },
                  tv: {
                    quotaLimit: values.tvQuotaLimit,
                    quotaDays: values.tvQuotaDays,
                  },
                },
                defaultPermissions: values.defaultPermissions,
              });
              mutate('/api/v1/settings/public');

              addToast(intl.formatMessage(messages.toastSettingsSuccess), {
                autoDismiss: true,
                appearance: 'success',
              });
            } catch (e) {
              addToast(intl.formatMessage(messages.toastSettingsFailure), {
                autoDismiss: true,
                appearance: 'error',
              });
            } finally {
              revalidate();
            }
          }}
        >
          {({ isSubmitting, values, setFieldValue, isValid, errors }) => {
            return (
              <Form className="section">
                <div
                  role="group"
                  aria-labelledby="group-label"
                  className="form-group"
                >
                  <div className="form-row">
                    <span id="group-label" className="group-label">
                      {intl.formatMessage(messages.loginMethods)}
                      <span className="label-tip">
                        {intl.formatMessage(messages.loginMethodsTip)}
                      </span>
                      {'localLogin | mediaServerLogin | oidcLogin' in
                        errors && (
                        <span className="error">
                          {
                            (errors as Record<string, string>)[
                              'localLogin | mediaServerLogin | oidcLogin'
                            ]
                          }
                        </span>
                      )}
                    </span>
                    <div className="form-input-area">
                      <div className="max-w-lg">
                        <LabeledCheckbox
                          id="localLogin"
                          label={intl.formatMessage(messages.localLogin)}
                          description={intl.formatMessage(
                            messages.localLoginTip
                          )}
                          onChange={() =>
                            setFieldValue('localLogin', !values.localLogin)
                          }
                        />
                        <LabeledCheckbox
                          id="mediaServerLogin"
                          label={intl.formatMessage(messages.mediaServerLogin, {
                            mediaServerName,
                          })}
                          description={intl.formatMessage(
                            messages.mediaServerLoginTip,
                            {
                              mediaServerName,
                            }
                          )}
                          onChange={() =>
                            setFieldValue(
                              'mediaServerLogin',
                              !values.mediaServerLogin
                            )
                          }
                        />
                        <LabeledCheckbox
                          id="oidcLogin"
                          label={intl.formatMessage(messages.oidcLogin)}
                          description={intl.formatMessage(
                            messages.oidcLoginTip
                          )}
                          onChange={() =>
                            setFieldValue('oidcLogin', !values.oidcLogin)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {values.oidcLogin && (
                  <>
                    <div className="form-row">
                      <label htmlFor="oidcDomain" className="text-label">
                        {intl.formatMessage(messages.oidcDomain)}
                        <span className="label-required">*</span>
                        <span className="label-tip">
                          {intl.formatMessage(messages.oidcDomainTip)}
                        </span>
                      </label>
                      <div className="form-input-area">
                        <Field id="oidcDomain" name="oidcDomain" type="text" />
                        <ErrorMessage
                          className="error"
                          component="span"
                          name="oidcDomain"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <label htmlFor="oidcName" className="text-label">
                        {intl.formatMessage(messages.oidcName)}
                        <span className="label-required">*</span>
                        <span className="label-tip">
                          {intl.formatMessage(messages.oidcNameTip)}
                        </span>
                      </label>
                      <div className="form-input-area">
                        <Field id="oidcName" name="oidcName" type="text" />
                        <ErrorMessage
                          className="error"
                          component="span"
                          name="oidcName"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <label htmlFor="oidcClientId" className="text-label">
                        {intl.formatMessage(messages.oidcClientId)}
                        <span className="label-required">*</span>
                        <span className="label-tip">
                          {intl.formatMessage(messages.oidcClientIdTip)}
                        </span>
                      </label>
                      <div className="form-input-area">
                        <Field
                          id="oidcClientId"
                          name="oidcClientId"
                          type="text"
                        />
                        <ErrorMessage
                          className="error"
                          component="span"
                          name="oidcClientId"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <label htmlFor="oidcClientSecret" className="text-label">
                        {intl.formatMessage(messages.oidcClientSecret)}
                        <span className="label-required">*</span>
                        <span className="label-tip">
                          {intl.formatMessage(messages.oidcClientSecretTip)}
                        </span>
                      </label>
                      <div className="form-input-area">
                        <Field
                          id="oidcClientSecret"
                          name="oidcClientSecret"
                          type="text"
                        />
                        <ErrorMessage
                          className="error"
                          component="span"
                          name="oidcClientSecret"
                        />
                      </div>
                    </div>
                  </>
                )}
                <div className="form-row">
                  <label htmlFor="newPlexLogin" className="checkbox-label">
                    {intl.formatMessage(messages.newPlexLogin, {
                      mediaServerName,
                    })}
                    <span className="label-tip">
                      {intl.formatMessage(messages.newPlexLoginTip, {
                        mediaServerName,
                      })}
                    </span>
                  </label>
                  <div className="form-input-area">
                    <Field
                      type="checkbox"
                      id="newPlexLogin"
                      name="newPlexLogin"
                      onChange={() => {
                        setFieldValue('newPlexLogin', !values.newPlexLogin);
                      }}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="applicationTitle" className="text-label">
                    {intl.formatMessage(messages.movieRequestLimitLabel)}
                  </label>
                  <div className="form-input-area">
                    <QuotaSelector
                      onChange={setFieldValue}
                      dayFieldName="movieQuotaDays"
                      limitFieldName="movieQuotaLimit"
                      mediaType="movie"
                      defaultDays={values.movieQuotaDays}
                      defaultLimit={values.movieQuotaLimit}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="applicationTitle" className="text-label">
                    {intl.formatMessage(messages.tvRequestLimitLabel)}
                  </label>
                  <div className="form-input-area">
                    <QuotaSelector
                      onChange={setFieldValue}
                      dayFieldName="tvQuotaDays"
                      limitFieldName="tvQuotaLimit"
                      mediaType="tv"
                      defaultDays={values.tvQuotaDays}
                      defaultLimit={values.tvQuotaLimit}
                    />
                  </div>
                </div>
                <div
                  role="group"
                  aria-labelledby="group-label"
                  className="form-group"
                >
                  <div className="form-row">
                    <span id="group-label" className="group-label">
                      {intl.formatMessage(messages.defaultPermissions)}
                      <span className="label-tip">
                        {intl.formatMessage(messages.defaultPermissionsTip)}
                      </span>
                    </span>
                    <div className="form-input-area">
                      <div className="max-w-lg">
                        <PermissionEdit
                          currentPermission={values.defaultPermissions}
                          onUpdate={(newPermissions) =>
                            setFieldValue('defaultPermissions', newPermissions)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="actions">
                  <div className="flex justify-end">
                    <span className="self-center">
                      <FormErrorNotification />
                    </span>
                    <span className="ml-3 inline-flex rounded-md shadow-sm">
                      <Button
                        buttonType="primary"
                        type="submit"
                        disabled={isSubmitting || !isValid}
                      >
                        <SaveIcon />
                        <span>
                          {isSubmitting
                            ? intl.formatMessage(globalMessages.saving)
                            : intl.formatMessage(globalMessages.save)}
                        </span>
                      </Button>
                    </span>
                  </div>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </>
  );
};

export default SettingsUsers;
