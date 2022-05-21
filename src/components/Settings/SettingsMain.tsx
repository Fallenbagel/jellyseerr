import { SaveIcon } from '@heroicons/react/outline';
import { RefreshIcon } from '@heroicons/react/solid';
import axios from 'axios';
import { Field, Form, Formik } from 'formik';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useToasts } from 'react-toast-notifications';
import useSWR, { mutate } from 'swr';
import * as Yup from 'yup';
import { UserSettingsGeneralResponse } from '../../../server/interfaces/api/userSettingsInterfaces';
import type { MainSettings } from '../../../server/lib/settings';
import {
  availableLanguages,
  AvailableLocale,
} from '../../context/LanguageContext';
import useLocale from '../../hooks/useLocale';
import { Permission, useUser } from '../../hooks/useUser';
import globalMessages from '../../i18n/globalMessages';
import Badge from '../Common/Badge';
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';
import PageTitle from '../Common/PageTitle';
import SensitiveInput from '../Common/SensitiveInput';
import LanguageSelector from '../LanguageSelector';
import RegionSelector from '../RegionSelector';
import CopyButton from './CopyButton';

const messages = defineMessages({
  general: 'General',
  generalsettings: 'General Settings',
  generalsettingsDescription:
    'Configure global and default settings for Overseerr.',
  apikey: 'API Key',
  applicationTitle: 'Application Title',
  applicationurl: 'Application URL',
  region: 'Discover Region',
  regionTip: 'Filter content by regional availability',
  originallanguage: 'Discover Language',
  originallanguageTip: 'Filter content by original language',
  toastApiKeySuccess: 'New API key generated successfully!',
  toastApiKeyFailure: 'Something went wrong while generating a new API key.',
  toastSettingsSuccess: 'Settings saved successfully!',
  toastSettingsFailure: 'Something went wrong while saving settings.',
  hideAvailable: 'Hide Available Media',
  csrfProtection: 'Enable CSRF Protection',
  csrfProtectionTip:
    'Set external API access to read-only (requires HTTPS, and Overseerr must be reloaded for changes to take effect)',
  csrfProtectionHoverTip:
    'Do NOT enable this setting unless you understand what you are doing!',
  cacheImages: 'Enable Image Caching',
  cacheImagesTip:
    'Optimize and store all images locally (consumes a significant amount of disk space)',
  trustProxy: 'Enable Proxy Support',
  trustProxyTip:
    'Allow Overseerr to correctly register client IP addresses behind a proxy (Overseerr must be reloaded for changes to take effect)',
  validationApplicationTitle: 'You must provide an application title',
  validationApplicationUrl: 'You must provide a valid URL',
  validationApplicationUrlTrailingSlash: 'URL must not end in a trailing slash',
  partialRequestsEnabled: 'Allow Partial Series Requests',
  locale: 'Display Language',
});

const SettingsMain: React.FC = () => {
  const { addToast } = useToasts();
  const { user: currentUser, hasPermission: userHasPermission } = useUser();
  const intl = useIntl();
  const { setLocale } = useLocale();
  const {
    data,
    error,
    mutate: revalidate,
  } = useSWR<MainSettings>('/api/v1/settings/main');
  const { data: userData } = useSWR<UserSettingsGeneralResponse>(
    currentUser ? `/api/v1/user/${currentUser.id}/settings/main` : null
  );

  const MainSettingsSchema = Yup.object().shape({
    applicationTitle: Yup.string().required(
      intl.formatMessage(messages.validationApplicationTitle)
    ),
    applicationUrl: Yup.string()
      .url(intl.formatMessage(messages.validationApplicationUrl))
      .test(
        'no-trailing-slash',
        intl.formatMessage(messages.validationApplicationUrlTrailingSlash),
        (value) => !value || !value.endsWith('/')
      ),
  });

  const regenerate = async () => {
    try {
      await axios.post('/api/v1/settings/main/regenerate');

      revalidate();
      addToast(intl.formatMessage(messages.toastApiKeySuccess), {
        autoDismiss: true,
        appearance: 'success',
      });
    } catch (e) {
      addToast(intl.formatMessage(messages.toastApiKeyFailure), {
        autoDismiss: true,
        appearance: 'error',
      });
    }
  };

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <PageTitle
        title={[
          intl.formatMessage(messages.general),
          intl.formatMessage(globalMessages.settings),
        ]}
      />
      <div className="mb-6">
        <h3 className="heading">
          {intl.formatMessage(messages.generalsettings)}
        </h3>
        <p className="description">
          {intl.formatMessage(messages.generalsettingsDescription)}
        </p>
      </div>
      <div className="section">
        <Formik
          initialValues={{
            applicationTitle: data?.applicationTitle,
            applicationUrl: data?.applicationUrl,
            csrfProtection: data?.csrfProtection,
            hideAvailable: data?.hideAvailable,
            locale: data?.locale ?? 'en',
            region: data?.region,
            originalLanguage: data?.originalLanguage,
            partialRequestsEnabled: data?.partialRequestsEnabled,
            trustProxy: data?.trustProxy,
          }}
          enableReinitialize
          validationSchema={MainSettingsSchema}
          onSubmit={async (values) => {
            try {
              await axios.post('/api/v1/settings/main', {
                applicationTitle: values.applicationTitle,
                applicationUrl: values.applicationUrl,
                csrfProtection: values.csrfProtection,
                hideAvailable: values.hideAvailable,
                locale: values.locale,
                region: values.region,
                originalLanguage: values.originalLanguage,
                partialRequestsEnabled: values.partialRequestsEnabled,
                trustProxy: values.trustProxy,
              });
              mutate('/api/v1/settings/public');

              if (setLocale) {
                setLocale(
                  (userData?.locale
                    ? userData.locale
                    : values.locale) as AvailableLocale
                );
              }

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
          {({
            errors,
            touched,
            isSubmitting,
            isValid,
            values,
            setFieldValue,
          }) => {
            return (
              <Form className="section">
                {userHasPermission(Permission.ADMIN) && (
                  <div className="form-row">
                    <label htmlFor="apiKey" className="text-label">
                      {intl.formatMessage(messages.apikey)}
                    </label>
                    <div className="form-input-area">
                      <div className="form-input-field">
                        <SensitiveInput
                          type="text"
                          id="apiKey"
                          className="rounded-l-only"
                          value={data?.apiKey}
                          readOnly
                        />
                        <CopyButton
                          textToCopy={data?.apiKey ?? ''}
                          key={data?.apiKey}
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            regenerate();
                          }}
                          className="input-action"
                        >
                          <RefreshIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="form-row">
                  <label htmlFor="applicationTitle" className="text-label">
                    {intl.formatMessage(messages.applicationTitle)}
                  </label>
                  <div className="form-input-area">
                    <div className="form-input-field">
                      <Field
                        id="applicationTitle"
                        name="applicationTitle"
                        type="text"
                      />
                    </div>
                    {errors.applicationTitle && touched.applicationTitle && (
                      <div className="error">{errors.applicationTitle}</div>
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="applicationUrl" className="text-label">
                    {intl.formatMessage(messages.applicationurl)}
                  </label>
                  <div className="form-input-area">
                    <div className="form-input-field">
                      <Field
                        id="applicationUrl"
                        name="applicationUrl"
                        type="text"
                        inputMode="url"
                      />
                    </div>
                    {errors.applicationUrl && touched.applicationUrl && (
                      <div className="error">{errors.applicationUrl}</div>
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="trustProxy" className="checkbox-label">
                    <span>{intl.formatMessage(messages.trustProxy)}</span>
                    <span className="label-tip">
                      {intl.formatMessage(messages.trustProxyTip)}
                    </span>
                  </label>
                  <div className="form-input-area">
                    <Field
                      type="checkbox"
                      id="trustProxy"
                      name="trustProxy"
                      onChange={() => {
                        setFieldValue('trustProxy', !values.trustProxy);
                      }}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="csrfProtection" className="checkbox-label">
                    <span className="mr-2">
                      {intl.formatMessage(messages.csrfProtection)}
                    </span>
                    <Badge badgeType="danger">
                      {intl.formatMessage(globalMessages.advanced)}
                    </Badge>
                    <span className="label-tip">
                      {intl.formatMessage(messages.csrfProtectionTip)}
                    </span>
                  </label>
                  <div className="form-input-area">
                    <Field
                      type="checkbox"
                      id="csrfProtection"
                      name="csrfProtection"
                      title={intl.formatMessage(
                        messages.csrfProtectionHoverTip
                      )}
                      onChange={() => {
                        setFieldValue('csrfProtection', !values.csrfProtection);
                      }}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="locale" className="text-label">
                    {intl.formatMessage(messages.locale)}
                  </label>
                  <div className="form-input-area">
                    <div className="form-input-field">
                      <Field as="select" id="locale" name="locale">
                        {(
                          Object.keys(
                            availableLanguages
                          ) as (keyof typeof availableLanguages)[]
                        ).map((key) => (
                          <option
                            key={key}
                            value={availableLanguages[key].code}
                            lang={availableLanguages[key].code}
                          >
                            {availableLanguages[key].display}
                          </option>
                        ))}
                      </Field>
                    </div>
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="region" className="text-label">
                    <span>{intl.formatMessage(messages.region)}</span>
                    <span className="label-tip">
                      {intl.formatMessage(messages.regionTip)}
                    </span>
                  </label>
                  <div className="form-input-area">
                    <div className="form-input-field">
                      <RegionSelector
                        value={values.region ?? ''}
                        name="region"
                        onChange={setFieldValue}
                      />
                    </div>
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="originalLanguage" className="text-label">
                    <span>{intl.formatMessage(messages.originallanguage)}</span>
                    <span className="label-tip">
                      {intl.formatMessage(messages.originallanguageTip)}
                    </span>
                  </label>
                  <div className="form-input-area">
                    <div className="form-input-field">
                      <LanguageSelector
                        setFieldValue={setFieldValue}
                        value={values.originalLanguage}
                      />
                    </div>
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="hideAvailable" className="checkbox-label">
                    <span className="mr-2">
                      {intl.formatMessage(messages.hideAvailable)}
                    </span>
                    <Badge badgeType="warning">
                      {intl.formatMessage(globalMessages.experimental)}
                    </Badge>
                  </label>
                  <div className="form-input-area">
                    <Field
                      type="checkbox"
                      id="hideAvailable"
                      name="hideAvailable"
                      onChange={() => {
                        setFieldValue('hideAvailable', !values.hideAvailable);
                      }}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <label
                    htmlFor="partialRequestsEnabled"
                    className="checkbox-label"
                  >
                    <span className="mr-2">
                      {intl.formatMessage(messages.partialRequestsEnabled)}
                    </span>
                  </label>
                  <div className="form-input-area">
                    <Field
                      type="checkbox"
                      id="partialRequestsEnabled"
                      name="partialRequestsEnabled"
                      onChange={() => {
                        setFieldValue(
                          'partialRequestsEnabled',
                          !values.partialRequestsEnabled
                        );
                      }}
                    />
                  </div>
                </div>
                <div className="actions">
                  <div className="flex justify-end">
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

export default SettingsMain;
