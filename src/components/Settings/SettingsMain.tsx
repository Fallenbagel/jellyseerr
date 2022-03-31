import React from 'react';
import useSWR from 'swr';
import LoadingSpinner from '../Common/LoadingSpinner';
import type { MainSettings, Language } from '../../../server/lib/settings';
import CopyButton from './CopyButton';
import { Form, Formik, Field } from 'formik';
import axios from 'axios';
import Button from '../Common/Button';
import { defineMessages, useIntl } from 'react-intl';
import { useUser, Permission } from '../../hooks/useUser';
import { useToasts } from 'react-toast-notifications';
import Badge from '../Common/Badge';
import globalMessages from '../../i18n/globalMessages';
import PermissionEdit from '../PermissionEdit';
import * as Yup from 'yup';
import RegionSelector from '../RegionSelector';

const messages = defineMessages({
  generalsettings: 'General Settings',
  generalsettingsDescription:
    'Configure global and default settings for Overseerr.',
  save: 'Save Changes',
  saving: 'Saving…',
  apikey: 'API Key',
  applicationTitle: 'Application Title',
  applicationurl: 'Application URL',
  region: 'Discover Region',
  regionTip:
    'Filter content by region (only applies to the "Popular" and "Upcoming" categories)',
  originallanguage: 'Discover Language',
  originallanguageTip:
    'Filter content by original language (only applies to the "Popular" and "Upcoming" categories)',
  toastApiKeySuccess: 'New API key generated!',
  toastApiKeyFailure: 'Something went wrong while generating a new API key.',
  toastSettingsSuccess: 'Settings successfully saved!',
  toastSettingsFailure: 'Something went wrong while saving settings.',
  defaultPermissions: 'Default User Permissions',
  hideAvailable: 'Hide Available Media',
  csrfProtection: 'Enable CSRF Protection',
  csrfProtectionTip:
    'Sets external API access to read-only (requires HTTPS and Overseerr must be reloaded for changes to take effect)',
  csrfProtectionHoverTip:
    'Do NOT enable this unless you understand what you are doing!',
  trustProxy: 'Enable Proxy Support',
  trustProxyTip:
    'Allows Overseerr to correctly register client IP addresses behind a proxy (Overseerr must be reloaded for changes to take effect)',
  localLogin: 'Enable Local User Sign-In',
  validationApplicationTitle: 'You must provide an application title',
  validationApplicationUrl: 'You must provide a valid URL',
  validationApplicationUrlTrailingSlash: 'URL must not end in a trailing slash',
  originalLanguageDefault: 'All Languages',
});

const SettingsMain: React.FC = () => {
  const { addToast } = useToasts();
  const { hasPermission: userHasPermission } = useUser();
  const intl = useIntl();
  const { data, error, revalidate } = useSWR<MainSettings>(
    '/api/v1/settings/main'
  );
  const { data: languages, error: languagesError } = useSWR<Language[]>(
    '/api/v1/languages'
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
        (value) => {
          if (value?.substr(value.length - 1) === '/') {
            return false;
          }
          return true;
        }
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

  if (!data && !error && !languages && !languagesError) {
    return <LoadingSpinner />;
  }

  return (
    <>
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
            defaultPermissions: data?.defaultPermissions ?? 0,
            hideAvailable: data?.hideAvailable,
            localLogin: data?.localLogin,
            region: data?.region,
            originalLanguage: data?.originalLanguage,
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
                defaultPermissions: values.defaultPermissions,
                hideAvailable: values.hideAvailable,
                localLogin: values.localLogin,
                region: values.region,
                originalLanguage: values.originalLanguage,
                trustProxy: values.trustProxy,
              });

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
          {({ errors, touched, isSubmitting, values, setFieldValue }) => {
            return (
              <Form className="section">
                {userHasPermission(Permission.ADMIN) && (
                  <div className="form-row">
                    <label htmlFor="apiKey" className="text-label">
                      {intl.formatMessage(messages.apikey)}
                    </label>
                    <div className="form-input">
                      <div className="flex max-w-lg rounded-md shadow-sm">
                        <input
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
                          className="relative inline-flex items-center px-4 py-2 -ml-px text-sm font-medium leading-5 text-white transition duration-150 ease-in-out bg-indigo-600 border border-gray-500 rounded-r-md hover:bg-indigo-500 focus:outline-none focus:ring-blue focus:border-blue-300 active:bg-gray-100 active:text-gray-700"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="form-row">
                  <label htmlFor="applicationTitle" className="text-label">
                    {intl.formatMessage(messages.applicationTitle)}
                  </label>
                  <div className="form-input">
                    <div className="flex max-w-lg rounded-md shadow-sm">
                      <Field
                        id="applicationTitle"
                        name="applicationTitle"
                        type="text"
                        placeholder="Overseerr"
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
                  <div className="form-input">
                    <div className="flex max-w-lg rounded-md shadow-sm">
                      <Field
                        id="applicationUrl"
                        name="applicationUrl"
                        type="text"
                        placeholder="https://os.example.com"
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
                  <div className="form-input">
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
                  <div className="form-input">
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
                  <label htmlFor="region" className="text-label">
                    <span>{intl.formatMessage(messages.region)}</span>
                    <span className="label-tip">
                      {intl.formatMessage(messages.regionTip)}
                    </span>
                  </label>
                  <div className="form-input">
                    <RegionSelector
                      value={values.region ?? ''}
                      name="region"
                      onChange={setFieldValue}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="originalLanguage" className="text-label">
                    <span>{intl.formatMessage(messages.originallanguage)}</span>
                    <span className="label-tip">
                      {intl.formatMessage(messages.originallanguageTip)}
                    </span>
                  </label>
                  <div className="form-input">
                    <div className="flex max-w-lg rounded-md shadow-sm">
                      <Field
                        as="select"
                        id="originalLanguage"
                        name="originalLanguage"
                      >
                        <option value="">
                          {intl.formatMessage(messages.originalLanguageDefault)}
                        </option>
                        {languages?.map((language) => (
                          <option
                            key={`language-key-${language.iso_639_1}`}
                            value={language.iso_639_1}
                          >
                            {intl.formatDisplayName(language.iso_639_1, {
                              type: 'language',
                              fallback: 'none',
                            }) ?? language.english_name}
                          </option>
                        ))}
                      </Field>
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
                  <div className="form-input">
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
                  <label htmlFor="localLogin" className="checkbox-label">
                    <span>{intl.formatMessage(messages.localLogin)}</span>
                  </label>
                  <div className="form-input">
                    <Field
                      type="checkbox"
                      id="localLogin"
                      name="localLogin"
                      onChange={() => {
                        setFieldValue('localLogin', !values.localLogin);
                      }}
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
                    </span>
                    <div className="form-input">
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
                    <span className="inline-flex ml-3 rounded-md shadow-sm">
                      <Button
                        buttonType="primary"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting
                          ? intl.formatMessage(messages.saving)
                          : intl.formatMessage(messages.save)}
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
