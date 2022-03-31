import React, { useMemo, useState } from 'react';
import LoadingSpinner from '../Common/LoadingSpinner';
import type { PlexSettings } from '../../../server/lib/settings';
import type { PlexDevice } from '../../../server/interfaces/api/plexInterfaces';
import useSWR from 'swr';
import { useToasts } from 'react-toast-notifications';
import { Formik, Field } from 'formik';
import Button from '../Common/Button';
import axios from 'axios';
import LibraryItem from './LibraryItem';
import Badge from '../Common/Badge';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import * as Yup from 'yup';
import Alert from '../Common/Alert';
import Spinner from '../../assets/spinner.svg';

const messages = defineMessages({
  plexsettings: 'Plex Settings',
  plexsettingsDescription:
    'Configure the settings for your Plex server. Overseerr scans your Plex libraries to see what content is available.',
  servername: 'Server Name',
  servernameTip: 'Automatically retrieved from Plex after saving',
  servernamePlaceholder: 'Plex Server Name',
  serverpreset: 'Server',
  serverpresetPlaceholder: 'Plex Server',
  serverLocal: 'local',
  serverRemote: 'remote',
  serverConnected: 'connected',
  serverpresetManualMessage: 'Manual configuration',
  serverpresetRefreshing: 'Retrieving servers…',
  serverpresetLoad: 'Press the button to load available servers',
  toastPlexRefresh: 'Retrieving server list from Plex',
  toastPlexRefreshSuccess: 'Retrieved server list from Plex',
  toastPlexRefreshFailure: 'Unable to retrieve server list from Plex',
  toastPlexConnecting: 'Attempting to connect to Plex server',
  toastPlexConnectingSuccess: 'Connected to Plex server',
  toastPlexConnectingFailure: 'Unable to connect to Plex server',
  settingUpPlex: 'Setting Up Plex',
  settingUpPlexDescription:
    'To set up Plex, you can either enter your details manually \
    or select a server retrieved from <RegisterPlexTVLink>plex.tv</RegisterPlexTVLink>.\
    Press the button to the right of the dropdown to check connectivity and retrieve available servers.',
  hostname: 'Hostname/IP',
  port: 'Port',
  ssl: 'SSL',
  timeout: 'Timeout',
  save: 'Save Changes',
  saving: 'Saving…',
  plexlibraries: 'Plex Libraries',
  plexlibrariesDescription:
    'The libraries Overseerr scans for titles. Set up and save your Plex connection settings, then click the button below if no libraries are listed.',
  syncing: 'Syncing',
  sync: 'Sync Plex Libraries',
  manualscan: 'Manual Library Scan',
  manualscanDescription:
    "Normally, this will only be run once every 24 hours. Overseerr will check your Plex server's recently added more aggressively. If this is your first time configuring Plex, a one-time full manual library scan is recommended!",
  notrunning: 'Not Running',
  currentlibrary: 'Current Library: {name}',
  librariesRemaining: 'Libraries Remaining: {count}',
  startscan: 'Start Scan',
  cancelscan: 'Cancel Scan',
  validationHostnameRequired: 'You must provide a hostname/IP',
  validationPortRequired: 'You must provide a port',
});

interface Library {
  id: string;
  name: string;
  enabled: boolean;
}

interface SyncStatus {
  running: boolean;
  progress: number;
  total: number;
  currentLibrary?: Library;
  libraries: Library[];
}

interface PresetServerDisplay {
  name: string;
  ssl: boolean;
  uri: string;
  address: string;
  host?: string;
  port: number;
  local: boolean;
  status?: boolean;
  message?: string;
}
interface SettingsPlexProps {
  onComplete?: () => void;
}

const SettingsPlex: React.FC<SettingsPlexProps> = ({ onComplete }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRefreshingPresets, setIsRefreshingPresets] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [availableServers, setAvailableServers] = useState<PlexDevice[] | null>(
    null
  );
  const {
    data: data,
    error: error,
    revalidate: revalidate,
  } = useSWR<PlexSettings>('/api/v1/settings/plex');
  const { data: dataSync, revalidate: revalidateSync } = useSWR<SyncStatus>(
    '/api/v1/settings/plex/sync',
    {
      refreshInterval: 1000,
    }
  );
  const intl = useIntl();
  const { addToast, removeToast } = useToasts();
  const PlexSettingsSchema = Yup.object().shape({
    hostname: Yup.string().required(
      intl.formatMessage(messages.validationHostnameRequired)
    ),
    port: Yup.number().required(
      intl.formatMessage(messages.validationPortRequired)
    ),
  });

  const activeLibraries =
    data?.libraries
      .filter((library) => library.enabled)
      .map((library) => library.id) ?? [];

  const availablePresets = useMemo(() => {
    const finalPresets: PresetServerDisplay[] = [];
    availableServers?.forEach((dev) => {
      dev.connection.forEach((conn) =>
        finalPresets.push({
          name: dev.name,
          ssl: conn.protocol === 'https' ? true : false,
          uri: conn.uri,
          address: conn.address,
          port: conn.port,
          local: conn.local,
          host: conn.host,
          status: conn.status === 200 ? true : false,
          message: conn.message,
        })
      );
    });
    finalPresets.sort((a, b) => {
      if (a.status && !b.status) {
        return -1;
      } else {
        return 1;
      }
    });
    return finalPresets;
  }, [availableServers]);

  const syncLibraries = async () => {
    setIsSyncing(true);

    const params: { sync: boolean; enable?: string } = {
      sync: true,
    };

    if (activeLibraries.length > 0) {
      params.enable = activeLibraries.join(',');
    }

    await axios.get('/api/v1/settings/plex/library', {
      params,
    });
    setIsSyncing(false);
    revalidate();
  };

  const refreshPresetServers = async () => {
    setIsRefreshingPresets(true);
    let toastId: string | undefined;
    try {
      addToast(
        intl.formatMessage(messages.toastPlexRefresh),
        {
          autoDismiss: false,
          appearance: 'info',
        },
        (id) => {
          toastId = id;
        }
      );
      const response = await axios.get<PlexDevice[]>(
        '/api/v1/settings/plex/devices/servers'
      );
      if (response.data) {
        setAvailableServers(response.data);
      }
      if (toastId) {
        removeToast(toastId);
      }
      addToast(intl.formatMessage(messages.toastPlexRefreshSuccess), {
        autoDismiss: true,
        appearance: 'success',
      });
    } catch (e) {
      if (toastId) {
        removeToast(toastId);
      }
      addToast(intl.formatMessage(messages.toastPlexRefreshFailure), {
        autoDismiss: true,
        appearance: 'error',
      });
    } finally {
      setIsRefreshingPresets(false);
    }
  };

  const startScan = async () => {
    await axios.post('/api/v1/settings/plex/sync', {
      start: true,
    });
    revalidateSync();
  };

  const cancelScan = async () => {
    await axios.post('/api/v1/settings/plex/sync', {
      cancel: true,
    });
    revalidateSync();
  };

  const toggleLibrary = async (libraryId: string) => {
    setIsSyncing(true);
    if (activeLibraries.includes(libraryId)) {
      const params: { enable?: string } = {};

      if (activeLibraries.length > 1) {
        params.enable = activeLibraries
          .filter((id) => id !== libraryId)
          .join(',');
      }

      await axios.get('/api/v1/settings/plex/library', {
        params,
      });
    } else {
      await axios.get('/api/v1/settings/plex/library', {
        params: {
          enable: [...activeLibraries, libraryId].join(','),
        },
      });
    }
    setIsSyncing(false);
    revalidate();
  };

  if (!data && !error) {
    return <LoadingSpinner />;
  }
  return (
    <>
      <div className="mb-6">
        <h3 className="heading">
          <FormattedMessage {...messages.plexsettings} />
        </h3>
        <p className="description">
          <FormattedMessage {...messages.plexsettingsDescription} />
        </p>
        <div className="section">
          <Alert title={intl.formatMessage(messages.settingUpPlex)} type="info">
            {intl.formatMessage(messages.settingUpPlexDescription, {
              RegisterPlexTVLink: function RegisterPlexTVLink(msg) {
                return (
                  <a
                    href="https://plex.tv"
                    className="text-indigo-100 hover:text-white hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {msg}
                  </a>
                );
              },
            })}
          </Alert>
        </div>
      </div>
      <Formik
        initialValues={{
          hostname: data?.ip,
          port: data?.port,
          useSsl: data?.useSsl,
          selectedPreset: undefined,
        }}
        validationSchema={PlexSettingsSchema}
        onSubmit={async (values) => {
          let toastId: string | null = null;
          try {
            addToast(
              intl.formatMessage(messages.toastPlexConnecting),
              {
                autoDismiss: false,
                appearance: 'info',
              },
              (id) => {
                toastId = id;
              }
            );
            await axios.post('/api/v1/settings/plex', {
              ip: values.hostname,
              port: Number(values.port),
              useSsl: values.useSsl,
            } as PlexSettings);

            revalidate();
            setSubmitError(null);
            if (toastId) {
              removeToast(toastId);
            }
            addToast(intl.formatMessage(messages.toastPlexConnectingSuccess), {
              autoDismiss: true,
              appearance: 'success',
            });
            if (onComplete) {
              onComplete();
            }
          } catch (e) {
            if (toastId) {
              removeToast(toastId);
            }
            addToast(intl.formatMessage(messages.toastPlexConnectingFailure), {
              autoDismiss: true,
              appearance: 'error',
            });
            setSubmitError(e.response.data.message);
          }
        }}
      >
        {({
          errors,
          touched,
          values,
          handleSubmit,
          setFieldValue,
          setFieldTouched,
          isSubmitting,
        }) => {
          return (
            <form className="section" onSubmit={handleSubmit}>
              <div className="form-row">
                <label htmlFor="name" className="text-label">
                  <div className="flex flex-col">
                    <span>
                      <FormattedMessage {...messages.servername} />
                    </span>
                    <span className="text-gray-500">
                      <FormattedMessage {...messages.servernameTip} />
                    </span>
                  </div>
                </label>
                <div className="form-input">
                  <div className="flex max-w-lg rounded-md shadow-sm">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder={intl.formatMessage(
                        messages.servernamePlaceholder
                      )}
                      value={data?.name}
                      readOnly
                    />
                  </div>
                </div>
              </div>
              <div className="form-row">
                <label htmlFor="preset" className="text-label">
                  <FormattedMessage {...messages.serverpreset} />
                </label>
                <div className="form-input">
                  <div className="flex max-w-lg rounded-md shadow-sm input-group">
                    <select
                      id="preset"
                      name="preset"
                      placeholder={intl.formatMessage(
                        messages.serverpresetPlaceholder
                      )}
                      value={values.selectedPreset}
                      disabled={!availableServers || isRefreshingPresets}
                      className="rounded-l-only"
                      onChange={async (e) => {
                        const targPreset =
                          availablePresets[Number(e.target.value)];
                        if (targPreset) {
                          setFieldValue('hostname', targPreset.host);
                          setFieldValue('port', targPreset.port);
                          setFieldValue('useSsl', targPreset.ssl);
                        }
                        setFieldTouched('hostname');
                        setFieldTouched('port');
                        setFieldTouched('useSsl');
                      }}
                    >
                      <option value="manual">
                        {availableServers || isRefreshingPresets
                          ? isRefreshingPresets
                            ? intl.formatMessage(
                                messages.serverpresetRefreshing
                              )
                            : intl.formatMessage(
                                messages.serverpresetManualMessage
                              )
                          : intl.formatMessage(messages.serverpresetLoad)}
                      </option>
                      {availablePresets.map((server, index) => (
                        <option
                          key={`preset-server-${index}`}
                          value={index}
                          disabled={!server.status}
                        >
                          {`
                            ${server.name} (${server.address})
                            [${
                              server.local
                                ? intl.formatMessage(messages.serverLocal)
                                : intl.formatMessage(messages.serverRemote)
                            }]
                            ${server.status ? '' : '(' + server.message + ')'}
                          `}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        refreshPresetServers();
                      }}
                      className="relative inline-flex items-center px-4 py-2 -ml-px text-sm font-medium leading-5 text-white transition duration-150 ease-in-out bg-indigo-600 border border-gray-500 rounded-r-md hover:bg-indigo-500 focus:outline-none focus:ring-blue focus:border-blue-300 active:bg-gray-100 active:text-gray-700"
                    >
                      {isRefreshingPresets ? (
                        <Spinner className="w-5 h-5" />
                      ) : (
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
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className="form-row">
                <label htmlFor="hostname" className="text-label">
                  <FormattedMessage {...messages.hostname} />
                </label>
                <div className="form-input">
                  <div className="flex max-w-lg rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 text-gray-100 bg-gray-800 border border-r-0 border-gray-500 cursor-default rounded-l-md sm:text-sm">
                      {values.useSsl ? 'https://' : 'http://'}
                    </span>
                    <Field
                      type="text"
                      id="hostname"
                      name="hostname"
                      placeholder="127.0.0.1"
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
                  <FormattedMessage {...messages.port} />
                </label>
                <div className="form-input">
                  <div className="max-w-lg rounded-md shadow-sm sm:max-w-xs">
                    <Field
                      type="text"
                      id="port"
                      name="port"
                      placeholder="32400"
                      className="short"
                    />
                  </div>
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
                    id="useSsl"
                    name="useSsl"
                    onChange={() => {
                      setFieldValue('useSsl', !values.useSsl);
                    }}
                  />
                </div>
              </div>
              {submitError && (
                <div className="mt-6 sm:gap-4 sm:items-start">
                  <Alert
                    title={intl.formatMessage(
                      messages.toastPlexConnectingFailure
                    )}
                    type="error"
                  >
                    {submitError}
                  </Alert>
                </div>
              )}
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
            </form>
          );
        }}
      </Formik>
      <div className="mt-10 mb-6">
        <h3 className="heading">
          <FormattedMessage {...messages.plexlibraries} />
        </h3>
        <p className="description">
          <FormattedMessage {...messages.plexlibrariesDescription} />
        </p>
      </div>
      <div className="section">
        <Button onClick={() => syncLibraries()} disabled={isSyncing}>
          <svg
            className={`${isSyncing ? 'animate-spin' : ''} w-5 h-5 mr-1`}
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
          {isSyncing
            ? intl.formatMessage(messages.syncing)
            : intl.formatMessage(messages.sync)}
        </Button>
        <ul className="grid grid-cols-1 gap-5 mt-6 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {data?.libraries.map((library) => (
            <LibraryItem
              name={library.name}
              isEnabled={library.enabled}
              key={`setting-library-${library.id}`}
              onToggle={() => toggleLibrary(library.id)}
            />
          ))}
        </ul>
      </div>
      <div className="mt-10 mb-6">
        <h3 className="heading">
          <FormattedMessage {...messages.manualscan} />
        </h3>
        <p className="description">
          <FormattedMessage {...messages.manualscanDescription} />
        </p>
      </div>
      <div className="section">
        <div className="p-4 bg-gray-800 rounded-md">
          <div className="relative w-full h-8 mb-6 overflow-hidden bg-gray-600 rounded-full">
            {dataSync?.running && (
              <div
                className="h-8 transition-all duration-200 ease-in-out bg-indigo-600"
                style={{
                  width: `${Math.round(
                    (dataSync.progress / dataSync.total) * 100
                  )}%`,
                }}
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center w-full h-8 text-sm">
              <span>
                {dataSync?.running
                  ? `${dataSync.progress} of ${dataSync.total}`
                  : 'Not running'}
              </span>
            </div>
          </div>
          <div className="flex flex-col w-full sm:flex-row">
            {dataSync?.running && (
              <>
                {dataSync.currentLibrary && (
                  <div className="flex items-center mb-2 mr-0 sm:mb-0 sm:mr-2">
                    <Badge>
                      <FormattedMessage
                        {...messages.currentlibrary}
                        values={{ name: dataSync.currentLibrary.name }}
                      />
                    </Badge>
                  </div>
                )}
                <div className="flex items-center">
                  <Badge badgeType="warning">
                    <FormattedMessage
                      {...messages.librariesRemaining}
                      values={{
                        count: dataSync.currentLibrary
                          ? dataSync.libraries.slice(
                              dataSync.libraries.findIndex(
                                (library) =>
                                  library.id === dataSync.currentLibrary?.id
                              ) + 1
                            ).length
                          : 0,
                      }}
                    />
                  </Badge>
                </div>
              </>
            )}
            <div className="flex-1 text-right">
              {!dataSync?.running && (
                <Button buttonType="warning" onClick={() => startScan()}>
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <FormattedMessage {...messages.startscan} />
                </Button>
              )}

              {dataSync?.running && (
                <Button buttonType="danger" onClick={() => cancelScan()}>
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <FormattedMessage {...messages.cancelscan} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPlex;
