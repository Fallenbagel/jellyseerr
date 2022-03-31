import React, { useState, useEffect, useCallback, useRef } from 'react';
import Transition from '../../Transition';
import Modal from '../../Common/Modal';
import { Formik, Field } from 'formik';
import type { SonarrSettings } from '../../../../server/lib/settings';
import * as Yup from 'yup';
import axios from 'axios';
import { useToasts } from 'react-toast-notifications';
import { useIntl, defineMessages } from 'react-intl';

const messages = defineMessages({
  createsonarr: 'Add New Sonarr Server',
  editsonarr: 'Edit Sonarr Server',
  validationNameRequired: 'You must provide a server name',
  validationHostnameRequired: 'You must provide a hostname/IP',
  validationPortRequired: 'You must provide a port',
  validationApiKeyRequired: 'You must provide an API key',
  validationRootFolderRequired: 'You must select a root folder',
  validationProfileRequired: 'You must select a quality profile',
  validationLanguageProfileRequired: 'You must select a language profile',
  toastSonarrTestSuccess: 'Sonarr connection established!',
  toastSonarrTestFailure: 'Failed to connect to Sonarr.',
  saving: 'Saving…',
  save: 'Save Changes',
  add: 'Add Server',
  test: 'Test',
  testing: 'Testing…',
  defaultserver: 'Default Server',
  servername: 'Server Name',
  servernamePlaceholder: 'A Sonarr Server',
  hostname: 'Hostname',
  port: 'Port',
  ssl: 'SSL',
  apiKey: 'API Key',
  apiKeyPlaceholder: 'Your Sonarr API key',
  baseUrl: 'Base URL',
  baseUrlPlaceholder: 'Example: /sonarr',
  qualityprofile: 'Quality Profile',
  languageprofile: 'Language Profile',
  rootfolder: 'Root Folder',
  animequalityprofile: 'Anime Quality Profile',
  animelanguageprofile: 'Anime Language Profile',
  animerootfolder: 'Anime Root Folder',
  seasonfolders: 'Season Folders',
  server4k: '4K Server',
  selectQualityProfile: 'Select quality profile',
  selectRootFolder: 'Select root folder',
  selectLanguageProfile: 'Select language profile',
  loadingprofiles: 'Loading quality profiles…',
  testFirstQualityProfiles: 'Test connection to load quality profiles',
  loadingrootfolders: 'Loading root folders…',
  testFirstRootFolders: 'Test connection to load root folders',
  loadinglanguageprofiles: 'Loading language profiles…',
  testFirstLanguageProfiles: 'Test connection to load language profiles',
  syncEnabled: 'Enable Sync',
  externalUrl: 'External URL',
  externalUrlPlaceholder: 'External URL pointing to your Sonarr server',
  preventSearch: 'Disable Auto-Search',
  validationApplicationUrl: 'You must provide a valid URL',
  validationApplicationUrlTrailingSlash: 'URL must not end in a trailing slash',
  validationBaseUrlLeadingSlash: 'Base URL must have a leading slash',
  validationBaseUrlTrailingSlash: 'Base URL must not end in a trailing slash',
});

interface TestResponse {
  profiles: {
    id: number;
    name: string;
  }[];
  rootFolders: {
    id: number;
    path: string;
  }[];
  languageProfiles: {
    id: number;
    name: string;
  }[];
}

interface SonarrModalProps {
  sonarr: SonarrSettings | null;
  onClose: () => void;
  onSave: () => void;
}

const SonarrModal: React.FC<SonarrModalProps> = ({
  onClose,
  sonarr,
  onSave,
}) => {
  const intl = useIntl();
  const initialLoad = useRef(false);
  const { addToast } = useToasts();
  const [isValidated, setIsValidated] = useState(sonarr ? true : false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResponse, setTestResponse] = useState<TestResponse>({
    profiles: [],
    rootFolders: [],
    languageProfiles: [],
  });
  const SonarrSettingsSchema = Yup.object().shape({
    name: Yup.string().required(
      intl.formatMessage(messages.validationNameRequired)
    ),
    hostname: Yup.string().required(
      intl.formatMessage(messages.validationHostnameRequired)
    ),
    port: Yup.number().required(
      intl.formatMessage(messages.validationPortRequired)
    ),
    apiKey: Yup.string().required(
      intl.formatMessage(messages.validationApiKeyRequired)
    ),
    rootFolder: Yup.string().required(
      intl.formatMessage(messages.validationRootFolderRequired)
    ),
    activeProfileId: Yup.string().required(
      intl.formatMessage(messages.validationProfileRequired)
    ),
    activeLanguageProfileId: Yup.number().required(
      intl.formatMessage(messages.validationLanguageProfileRequired)
    ),
    externalUrl: Yup.string()
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
    baseUrl: Yup.string()
      .test(
        'leading-slash',
        intl.formatMessage(messages.validationBaseUrlLeadingSlash),
        (value) => {
          if (value && value?.substr(0, 1) !== '/') {
            return false;
          }
          return true;
        }
      )
      .test(
        'no-trailing-slash',
        intl.formatMessage(messages.validationBaseUrlTrailingSlash),
        (value) => {
          if (value?.substr(value.length - 1) === '/') {
            return false;
          }
          return true;
        }
      ),
  });

  const testConnection = useCallback(
    async ({
      hostname,
      port,
      apiKey,
      baseUrl,
      useSsl = false,
    }: {
      hostname: string;
      port: number;
      apiKey: string;
      baseUrl?: string;
      useSsl?: boolean;
    }) => {
      setIsTesting(true);
      try {
        const response = await axios.post<TestResponse>(
          '/api/v1/settings/sonarr/test',
          {
            hostname,
            apiKey,
            port: Number(port),
            baseUrl,
            useSsl,
          }
        );

        setIsValidated(true);
        setTestResponse(response.data);
        if (initialLoad.current) {
          addToast('Sonarr connection established!', {
            appearance: 'success',
            autoDismiss: true,
          });
        }
      } catch (e) {
        setIsValidated(false);
        if (initialLoad.current) {
          addToast('Failed to connect to Sonarr server', {
            appearance: 'error',
            autoDismiss: true,
          });
        }
      } finally {
        setIsTesting(false);
        initialLoad.current = true;
      }
    },
    [addToast]
  );

  useEffect(() => {
    if (sonarr) {
      testConnection({
        apiKey: sonarr.apiKey,
        hostname: sonarr.hostname,
        port: sonarr.port,
        baseUrl: sonarr.baseUrl,
        useSsl: sonarr.useSsl,
      });
    }
  }, [sonarr, testConnection]);

  return (
    <Transition
      appear
      show
      enter="transition ease-in-out duration-300 transform opacity-0"
      enterFrom="opacity-0"
      enterTo="opacuty-100"
      leave="transition ease-in-out duration-300 transform opacity-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <Formik
        initialValues={{
          name: sonarr?.name,
          hostname: sonarr?.hostname,
          port: sonarr?.port,
          ssl: sonarr?.useSsl ?? false,
          apiKey: sonarr?.apiKey,
          baseUrl: sonarr?.baseUrl,
          activeProfileId: sonarr?.activeProfileId,
          activeLanguageProfileId: sonarr?.activeLanguageProfileId,
          rootFolder: sonarr?.activeDirectory,
          activeAnimeProfileId: sonarr?.activeAnimeProfileId,
          activeAnimeLanguageProfileId: sonarr?.activeAnimeLanguageProfileId,
          activeAnimeRootFolder: sonarr?.activeAnimeDirectory,
          isDefault: sonarr?.isDefault ?? false,
          is4k: sonarr?.is4k ?? false,
          enableSeasonFolders: sonarr?.enableSeasonFolders ?? false,
          externalUrl: sonarr?.externalUrl,
          syncEnabled: sonarr?.syncEnabled ?? false,
          preventSearch: sonarr?.preventSearch ?? false,
        }}
        validationSchema={SonarrSettingsSchema}
        onSubmit={async (values) => {
          try {
            const profileName = testResponse.profiles.find(
              (profile) => profile.id === Number(values.activeProfileId)
            )?.name;
            const animeProfileName = testResponse.profiles.find(
              (profile) => profile.id === Number(values.activeAnimeProfileId)
            )?.name;

            const submission = {
              name: values.name,
              hostname: values.hostname,
              port: Number(values.port),
              apiKey: values.apiKey,
              useSsl: values.ssl,
              baseUrl: values.baseUrl,
              activeProfileId: Number(values.activeProfileId),
              activeLanguageProfileId: values.activeLanguageProfileId
                ? Number(values.activeLanguageProfileId)
                : undefined,
              activeProfileName: profileName,
              activeDirectory: values.rootFolder,
              activeAnimeProfileId: values.activeAnimeProfileId
                ? Number(values.activeAnimeProfileId)
                : undefined,
              activeAnimeLanguageProfileId: values.activeAnimeLanguageProfileId
                ? Number(values.activeAnimeLanguageProfileId)
                : undefined,
              activeAnimeProfileName: animeProfileName ?? undefined,
              activeAnimeDirectory: values.activeAnimeRootFolder,
              is4k: values.is4k,
              isDefault: values.isDefault,
              enableSeasonFolders: values.enableSeasonFolders,
              externalUrl: values.externalUrl,
              syncEnabled: values.syncEnabled,
              preventSearch: values.preventSearch,
            };
            if (!sonarr) {
              await axios.post('/api/v1/settings/sonarr', submission);
            } else {
              await axios.put(
                `/api/v1/settings/sonarr/${sonarr.id}`,
                submission
              );
            }

            onSave();
          } catch (e) {
            // set error here
          }
        }}
      >
        {({
          errors,
          touched,
          values,
          handleSubmit,
          setFieldValue,
          isSubmitting,
          isValid,
        }) => {
          return (
            <Modal
              onCancel={onClose}
              okButtonType="primary"
              okText={
                isSubmitting
                  ? intl.formatMessage(messages.saving)
                  : sonarr
                  ? intl.formatMessage(messages.save)
                  : intl.formatMessage(messages.add)
              }
              secondaryButtonType="warning"
              secondaryText={
                isTesting
                  ? intl.formatMessage(messages.testing)
                  : intl.formatMessage(messages.test)
              }
              onSecondary={() => {
                if (values.apiKey && values.hostname && values.port) {
                  testConnection({
                    apiKey: values.apiKey,
                    baseUrl: values.baseUrl,
                    hostname: values.hostname,
                    port: values.port,
                    useSsl: values.ssl,
                  });
                }
              }}
              secondaryDisabled={
                !values.apiKey || !values.hostname || !values.port || isTesting
              }
              okDisabled={!isValidated || isSubmitting || isTesting || !isValid}
              onOk={() => handleSubmit()}
              title={
                !sonarr
                  ? intl.formatMessage(messages.createsonarr)
                  : intl.formatMessage(messages.editsonarr)
              }
            >
              <div className="mb-6">
                <div className="form-row">
                  <label htmlFor="isDefault" className="checkbox-label">
                    {intl.formatMessage(messages.defaultserver)}
                  </label>
                  <div className="form-input">
                    <Field type="checkbox" id="isDefault" name="isDefault" />
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="is4k" className="checkbox-label">
                    {intl.formatMessage(messages.server4k)}
                  </label>
                  <div className="form-input">
                    <Field type="checkbox" id="is4k" name="is4k" />
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="name" className="text-label">
                    {intl.formatMessage(messages.servername)}
                    <span className="label-required">*</span>
                  </label>
                  <div className="form-input">
                    <div className="flex max-w-lg rounded-md shadow-sm">
                      <Field
                        id="name"
                        name="name"
                        type="text"
                        placeholder={intl.formatMessage(
                          messages.servernamePlaceholder
                        )}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setIsValidated(false);
                          setFieldValue('name', e.target.value);
                        }}
                      />
                    </div>
                    {errors.name && touched.name && (
                      <div className="error">{errors.name}</div>
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="hostname" className="text-label">
                    {intl.formatMessage(messages.hostname)}
                    <span className="label-required">*</span>
                  </label>
                  <div className="form-input">
                    <div className="flex max-w-lg rounded-md shadow-sm">
                      <span className="protocol">
                        {values.ssl ? 'https://' : 'http://'}
                      </span>
                      <Field
                        id="hostname"
                        name="hostname"
                        type="text"
                        placeholder="127.0.0.1"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setIsValidated(false);
                          setFieldValue('hostname', e.target.value);
                        }}
                        className="rounded-r-only"
                      />
                    </div>
                    {errors.hostname && touched.hostname && (
                      <div className="error">{errors.hostname}</div>
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="port" className="text-label">
                    {intl.formatMessage(messages.port)}
                    <span className="label-required">*</span>
                  </label>
                  <div className="form-input">
                    <Field
                      id="port"
                      name="port"
                      type="text"
                      placeholder="8989"
                      className="short"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setIsValidated(false);
                        setFieldValue('port', e.target.value);
                      }}
                    />
                    {errors.port && touched.port && (
                      <div className="error">{errors.port}</div>
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="ssl" className="checkbox-label">
                    {intl.formatMessage(messages.ssl)}
                  </label>
                  <div className="form-input">
                    <Field
                      type="checkbox"
                      id="ssl"
                      name="ssl"
                      onChange={() => {
                        setIsValidated(false);
                        setFieldValue('ssl', !values.ssl);
                      }}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="apiKey" className="text-label">
                    {intl.formatMessage(messages.apiKey)}
                    <span className="label-required">*</span>
                  </label>
                  <div className="form-input">
                    <div className="flex max-w-lg rounded-md shadow-sm">
                      <Field
                        id="apiKey"
                        name="apiKey"
                        type="text"
                        placeholder={intl.formatMessage(
                          messages.apiKeyPlaceholder
                        )}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setIsValidated(false);
                          setFieldValue('apiKey', e.target.value);
                        }}
                      />
                    </div>
                    {errors.apiKey && touched.apiKey && (
                      <div className="error">{errors.apiKey}</div>
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="baseUrl" className="text-label">
                    {intl.formatMessage(messages.baseUrl)}
                  </label>
                  <div className="form-input">
                    <div className="flex max-w-lg rounded-md shadow-sm">
                      <Field
                        id="baseUrl"
                        name="baseUrl"
                        type="text"
                        placeholder={intl.formatMessage(
                          messages.baseUrlPlaceholder
                        )}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setIsValidated(false);
                          setFieldValue('baseUrl', e.target.value);
                        }}
                      />
                    </div>
                    {errors.baseUrl && touched.baseUrl && (
                      <div className="error">{errors.baseUrl}</div>
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="activeProfileId" className="text-label">
                    {intl.formatMessage(messages.qualityprofile)}
                    <span className="label-required">*</span>
                  </label>
                  <div className="form-input">
                    <div className="flex max-w-lg rounded-md shadow-sm">
                      <Field
                        as="select"
                        id="activeProfileId"
                        name="activeProfileId"
                        disabled={!isValidated || isTesting}
                      >
                        <option value="">
                          {isTesting
                            ? intl.formatMessage(messages.loadingprofiles)
                            : !isValidated
                            ? intl.formatMessage(
                                messages.testFirstQualityProfiles
                              )
                            : intl.formatMessage(messages.selectQualityProfile)}
                        </option>
                        {testResponse.profiles.length > 0 &&
                          testResponse.profiles.map((profile) => (
                            <option
                              key={`loaded-profile-${profile.id}`}
                              value={profile.id}
                            >
                              {profile.name}
                            </option>
                          ))}
                      </Field>
                    </div>
                    {errors.activeProfileId && touched.activeProfileId && (
                      <div className="error">{errors.activeProfileId}</div>
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="rootFolder" className="text-label">
                    {intl.formatMessage(messages.rootfolder)}
                    <span className="label-required">*</span>
                  </label>
                  <div className="form-input">
                    <div className="flex max-w-lg rounded-md shadow-sm">
                      <Field
                        as="select"
                        id="rootFolder"
                        name="rootFolder"
                        disabled={!isValidated || isTesting}
                      >
                        <option value="">
                          {isTesting
                            ? intl.formatMessage(messages.loadingrootfolders)
                            : !isValidated
                            ? intl.formatMessage(messages.testFirstRootFolders)
                            : intl.formatMessage(messages.selectRootFolder)}
                        </option>
                        {testResponse.rootFolders.length > 0 &&
                          testResponse.rootFolders.map((folder) => (
                            <option
                              key={`loaded-profile-${folder.id}`}
                              value={folder.path}
                            >
                              {folder.path}
                            </option>
                          ))}
                      </Field>
                    </div>
                    {errors.rootFolder && touched.rootFolder && (
                      <div className="error">{errors.rootFolder}</div>
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <label
                    htmlFor="activeLanguageProfileId"
                    className="text-label"
                  >
                    {intl.formatMessage(messages.languageprofile)}
                    <span className="label-required">*</span>
                  </label>
                  <div className="form-input">
                    <div className="flex max-w-lg rounded-md shadow-sm">
                      <Field
                        as="select"
                        id="activeLanguageProfileId"
                        name="activeLanguageProfileId"
                        disabled={!isValidated || isTesting}
                      >
                        <option value="">
                          {isTesting
                            ? intl.formatMessage(
                                messages.loadinglanguageprofiles
                              )
                            : !isValidated
                            ? intl.formatMessage(
                                messages.testFirstLanguageProfiles
                              )
                            : intl.formatMessage(
                                messages.selectLanguageProfile
                              )}
                        </option>
                        {testResponse.languageProfiles.length > 0 &&
                          testResponse.languageProfiles.map((language) => (
                            <option
                              key={`loaded-profile-${language.id}`}
                              value={language.id}
                            >
                              {language.name}
                            </option>
                          ))}
                      </Field>
                    </div>
                    {errors.activeLanguageProfileId &&
                      touched.activeLanguageProfileId && (
                        <div className="error">
                          {errors.activeLanguageProfileId}
                        </div>
                      )}
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="activeAnimeProfileId" className="text-label">
                    {intl.formatMessage(messages.animequalityprofile)}
                  </label>
                  <div className="form-input">
                    <div className="flex max-w-lg rounded-md shadow-sm">
                      <Field
                        as="select"
                        id="activeAnimeProfileId"
                        name="activeAnimeProfileId"
                        disabled={!isValidated || isTesting}
                      >
                        <option value="">
                          {isTesting
                            ? intl.formatMessage(messages.loadingprofiles)
                            : !isValidated
                            ? intl.formatMessage(
                                messages.testFirstQualityProfiles
                              )
                            : intl.formatMessage(messages.selectQualityProfile)}
                        </option>
                        {testResponse.profiles.length > 0 &&
                          testResponse.profiles.map((profile) => (
                            <option
                              key={`loaded-profile-${profile.id}`}
                              value={profile.id}
                            >
                              {profile.name}
                            </option>
                          ))}
                      </Field>
                    </div>
                    {errors.activeAnimeProfileId &&
                      touched.activeAnimeProfileId && (
                        <div className="error">
                          {errors.activeAnimeProfileId}
                        </div>
                      )}
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="activeAnimeRootFolder" className="text-label">
                    {intl.formatMessage(messages.animerootfolder)}
                  </label>
                  <div className="form-input">
                    <div className="flex max-w-lg rounded-md shadow-sm">
                      <Field
                        as="select"
                        id="activeAnimeRootFolder"
                        name="activeAnimeRootFolder"
                        disabled={!isValidated || isTesting}
                      >
                        <option value="">
                          {isTesting
                            ? intl.formatMessage(messages.loadingrootfolders)
                            : !isValidated
                            ? intl.formatMessage(messages.testFirstRootFolders)
                            : intl.formatMessage(messages.selectRootFolder)}
                        </option>
                        {testResponse.rootFolders.length > 0 &&
                          testResponse.rootFolders.map((folder) => (
                            <option
                              key={`loaded-profile-${folder.id}`}
                              value={folder.path}
                            >
                              {folder.path}
                            </option>
                          ))}
                      </Field>
                    </div>
                    {errors.activeAnimeRootFolder &&
                      touched.activeAnimeRootFolder && (
                        <div className="error">{errors.rootFolder}</div>
                      )}
                  </div>
                </div>
                <div className="form-row">
                  <label
                    htmlFor="activeAnimeLanguageProfileId"
                    className="text-label"
                  >
                    {intl.formatMessage(messages.animelanguageprofile)}
                  </label>
                  <div className="form-input">
                    <div className="flex max-w-lg rounded-md shadow-sm">
                      <Field
                        as="select"
                        id="activeAnimeLanguageProfileId"
                        name="activeAnimeLanguageProfileId"
                        disabled={!isValidated || isTesting}
                      >
                        <option value="">
                          {isTesting
                            ? intl.formatMessage(
                                messages.loadinglanguageprofiles
                              )
                            : !isValidated
                            ? intl.formatMessage(
                                messages.testFirstLanguageProfiles
                              )
                            : intl.formatMessage(
                                messages.selectLanguageProfile
                              )}
                        </option>
                        {testResponse.languageProfiles.length > 0 &&
                          testResponse.languageProfiles.map((language) => (
                            <option
                              key={`loaded-profile-${language.id}`}
                              value={language.id}
                            >
                              {language.name}
                            </option>
                          ))}
                      </Field>
                    </div>
                    {errors.activeAnimeLanguageProfileId &&
                      touched.activeAnimeLanguageProfileId && (
                        <div className="error">
                          {errors.activeAnimeLanguageProfileId}
                        </div>
                      )}
                  </div>
                </div>
                <div className="form-row">
                  <label
                    htmlFor="enableSeasonFolders"
                    className="checkbox-label"
                  >
                    {intl.formatMessage(messages.seasonfolders)}
                  </label>
                  <div className="form-input">
                    <Field
                      type="checkbox"
                      id="enableSeasonFolders"
                      name="enableSeasonFolders"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="externalUrl" className="text-label">
                    {intl.formatMessage(messages.externalUrl)}
                  </label>
                  <div className="form-input">
                    <div className="flex max-w-lg rounded-md shadow-sm">
                      <Field
                        id="externalUrl"
                        name="externalUrl"
                        type="text"
                        placeholder={intl.formatMessage(
                          messages.externalUrlPlaceholder
                        )}
                      />
                    </div>
                    {errors.externalUrl && touched.externalUrl && (
                      <div className="error">{errors.externalUrl}</div>
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="syncEnabled" className="checkbox-label">
                    {intl.formatMessage(messages.syncEnabled)}
                  </label>
                  <div className="form-input">
                    <Field
                      type="checkbox"
                      id="syncEnabled"
                      name="syncEnabled"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="preventSearch" className="checkbox-label">
                    {intl.formatMessage(messages.preventSearch)}
                  </label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <Field
                      type="checkbox"
                      id="preventSearch"
                      name="preventSearch"
                    />
                  </div>
                </div>
              </div>
            </Modal>
          );
        }}
      </Formik>
    </Transition>
  );
};

export default SonarrModal;
