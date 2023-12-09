import Button from '@app/components/Common/Button';
import LoadingSpinner from '@app/components/Common/LoadingSpinner';
import PageTitle from '@app/components/Common/PageTitle';
import FormErrorNotification from '@app/components/FormErrorNotification';
import LabeledCheckbox from '@app/components/LabeledCheckbox';
import PermissionEdit from '@app/components/PermissionEdit';
import QuotaSelector from '@app/components/QuotaSelector';
import OidcModal, {
  oidcSettingsSchema,
} from '@app/components/Settings/OidcModal';
import useSettings from '@app/hooks/useSettings';
import globalMessages from '@app/i18n/globalMessages';
import { ArrowDownOnSquareIcon } from '@heroicons/react/24/outline';
import { CogIcon } from '@heroicons/react/24/solid';
import { MediaServerType } from '@server/constants/server';
import type { MainSettings } from '@server/lib/settings';
import axios from 'axios';
import { Field, Form, Formik } from 'formik';
import getConfig from 'next/config';
import { useState } from 'react';
import { defineMessages, useIntl, type IntlShape } from 'react-intl';
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
    'Allow users to sign in using their email address and password, instead of {mediaServerName} OAuth',
  newPlexLogin: 'Enable New {mediaServerName} Sign-In',
  newPlexLoginTip:
    'Allow {mediaServerName} users to sign in without first being imported',
  mediaServerLogin: 'Enable {mediaServerName} Sign-In',
  mediaServerLoginTip:
    'Allow users to sign in using their {mediaServerName} account',
  oidcLogin: 'Enable OIDC Sign-In',
  oidcLoginTip: 'Allow users to sign in using an OIDC identity provider',
  movieRequestLimitLabel: 'Global Movie Request Limit',
  tvRequestLimitLabel: 'Global Series Request Limit',
  defaultPermissions: 'Default Permissions',
  defaultPermissionsTip: 'Initial permissions assigned to new users',
});

const createValidationSchema = (intl: IntlShape) => {
  return yup
    .object()
    .shape({
      localLogin: yup.boolean(),
      mediaServerLogin: yup.boolean(),
      oidcLogin: yup.boolean(),
      oidc: yup.object().when('oidcLogin', {
        is: true,
        then: oidcSettingsSchema(intl),
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
    })
    .test({
      name: 'automaticLoginExclusive',
      test: function (values) {
        const isValid =
          !values.oidcLogin ||
          !values.oidc.automaticLogin ||
          !['localLogin', 'mediaServerLogin'].some((field) => !!values[field]);

        if (isValid) return true;
        return this.createError({
          path: 'localLogin | mediaServerLogin | oidcLogin',
          message:
            'Only OIDC login may be enabled when automatic login is enabled.',
        });
      },
    });
};

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
  // [showDialog, isFirstOpen]
  const [showOidcDialog, setShowOidcDialog] = useState<boolean>(false);

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
            oidc: data?.oidc ?? {},
            movieQuotaLimit: data?.defaultQuotas.movie.quotaLimit ?? 0,
            movieQuotaDays: data?.defaultQuotas.movie.quotaDays ?? 7,
            tvQuotaLimit: data?.defaultQuotas.tv.quotaLimit ?? 0,
            tvQuotaDays: data?.defaultQuotas.tv.quotaDays ?? 7,
            defaultPermissions: data?.defaultPermissions ?? 0,
          }}
          validationSchema={() => createValidationSchema(intl)}
          enableReinitialize
          onSubmit={async (values) => {
            try {
              await axios.post('/api/v1/settings/main', {
                localLogin: values.localLogin,
                newPlexLogin: values.newPlexLogin,
                mediaServerLogin: values.mediaServerLogin,
                oidcLogin: values.oidcLogin,
                oidc: values.oidc,
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
                            messages.localLoginTip,
                            { mediaServerName }
                          )}
                          onChange={() =>
                            setFieldValue('localLogin', !values.localLogin)
                          }
                        />
                        <LabeledCheckbox
                          id="mediaServerLogin"
                          className="mt-4"
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
                        <div className="mt-4 flex">
                          <div className="grow">
                            <LabeledCheckbox
                              id="oidcLogin"
                              label={intl.formatMessage(messages.oidcLogin)}
                              description={intl.formatMessage(
                                messages.oidcLoginTip
                              )}
                              onChange={() => {
                                const newValue = !values.oidcLogin;
                                setFieldValue('oidcLogin', newValue);
                                if (newValue) setShowOidcDialog(true);
                              }}
                            />
                          </div>
                          <CogIcon
                            className="ml-4 w-8 cursor-pointer text-gray-400"
                            onClick={() => setShowOidcDialog(true)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {values.oidcLogin && values.oidc && showOidcDialog && (
                  <OidcModal
                    values={values.oidc}
                    errors={errors.oidc}
                    setFieldValue={setFieldValue}
                    mediaServerName={mediaServerName}
                    onOk={() => setShowOidcDialog(false)}
                    onClose={() => setFieldValue('oidcLogin', false)}
                  />
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
                        <ArrowDownOnSquareIcon />
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
