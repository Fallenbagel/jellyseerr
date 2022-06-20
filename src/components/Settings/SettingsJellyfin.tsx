import { SaveIcon } from '@heroicons/react/outline';
import axios from 'axios';
import { Field, Formik } from 'formik';
import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useToasts } from 'react-toast-notifications';
import useSWR from 'swr';
import * as Yup from 'yup';
import { JellyfinSettings } from '../../../server/lib/settings';
import globalMessages from '../../i18n/globalMessages';
import Badge from '../Common/Badge';
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';
import LibraryItem from './LibraryItem';
import getConfig from 'next/config';

const messages = defineMessages({
  jellyfinsettings: '{mediaServerName} Settings',
  jellyfinsettingsDescription:
    'Configure the settings for your {mediaServerName} server. {mediaServerName} scans your {mediaServerName} libraries to see what content is available.',
  timeout: 'Timeout',
  save: 'Save Changes',
  saving: 'Saving…',
  jellyfinlibraries: '{mediaServerName} Libraries',
  jellyfinlibrariesDescription:
    'The libraries {mediaServerName} scans for titles. Click the button below if no libraries are listed.',
  jellyfinSettingsFailure:
    'Something went wrong while saving {mediaServerName} settings.',
  jellyfinSettingsSuccess: '{mediaServerName} settings saved successfully!',
  jellyfinSettings: '{mediaServerName} Settings',
  jellyfinSettingsDescription:
    'Optionally configure an external player endpoint for your {mediaServerName} server that is different to the internal URL used during setup',
  externalUrl: 'External URL',
  validationUrl: 'You must provide a valid URL',
  syncing: 'Syncing',
  syncJellyfin: 'Sync Libraries',
  manualscanJellyfin: 'Manual Library Scan',
  manualscanDescriptionJellyfin:
    "Normally, this will only be run once every 24 hours. Jellyseerr will check your {mediaServerName} server's recently added more aggressively. If this is your first time configuring Jellyseerr, a one-time full manual library scan is recommended!",
  notrunning: 'Not Running',
  currentlibrary: 'Current Library: {name}',
  librariesRemaining: 'Libraries Remaining: {count}',
  startscan: 'Start Scan',
  cancelscan: 'Cancel Scan',
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
interface SettingsJellyfinProps {
  showAdvancedSettings?: boolean;
  onComplete?: () => void;
}

const SettingsJellyfin: React.FC<SettingsJellyfinProps> = ({
  onComplete,
  showAdvancedSettings,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const {
    data,
    error,
    mutate: revalidate,
  } = useSWR<JellyfinSettings>('/api/v1/settings/jellyfin');
  const { data: dataSync, mutate: revalidateSync } = useSWR<SyncStatus>(
    '/api/v1/settings/jellyfin/sync',
    {
      refreshInterval: 1000,
    }
  );
  const intl = useIntl();
  const { addToast } = useToasts();
  const { publicRuntimeConfig } = getConfig();

  const JellyfinSettingsSchema = Yup.object().shape({
    jellyfinExternalUrl: Yup.string().matches(
      /^(?:(?:(?:https?):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/,
      intl.formatMessage(messages.validationUrl)
    ),
  });

  const activeLibraries =
    data?.libraries
      .filter((library) => library.enabled)
      .map((library) => library.id) ?? [];

  const syncLibraries = async () => {
    setIsSyncing(true);

    const params: { sync: boolean; enable?: string } = {
      sync: true,
    };

    if (activeLibraries.length > 0) {
      params.enable = activeLibraries.join(',');
    }

    await axios.get('/api/v1/settings/jellyfin/library', {
      params,
    });
    setIsSyncing(false);
    revalidate();
  };

  const startScan = async () => {
    await axios.post('/api/v1/settings/jellyfin/sync', {
      start: true,
    });
    revalidateSync();
  };

  const cancelScan = async () => {
    await axios.post('/api/v1/settings/jellyfin/sync', {
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

      await axios.get('/api/v1/settings/jellyfin/library', {
        params,
      });
    } else {
      await axios.get('/api/v1/settings/jellyfin/library', {
        params: {
          enable: [...activeLibraries, libraryId].join(','),
        },
      });
    }
    if (onComplete) {
      onComplete();
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
          {publicRuntimeConfig.JELLYFIN_TYPE == 'emby'
            ? intl.formatMessage(messages.jellyfinlibraries, {
                mediaServerName: 'Emby',
              })
            : intl.formatMessage(messages.jellyfinlibraries, {
                mediaServerName: 'Jellyfin',
              })}
        </h3>
        <p className="description">
          {publicRuntimeConfig.JELLYFIN_TYPE == 'emby'
            ? intl.formatMessage(messages.jellyfinlibrariesDescription, {
                mediaServerName: 'Emby',
              })
            : intl.formatMessage(messages.jellyfinlibrariesDescription, {
                mediaServerName: 'Jellyfin',
              })}
        </p>
      </div>
      <div className="section">
        <Button onClick={() => syncLibraries()} disabled={isSyncing}>
          <svg
            className={`${isSyncing ? 'animate-spin' : ''} mr-1 h-5 w-5`}
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
            : intl.formatMessage(messages.syncJellyfin)}
        </Button>
        <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
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
          <FormattedMessage {...messages.manualscanJellyfin} />
        </h3>
        <p className="description">
          {publicRuntimeConfig.JELLYFIN_TYPE == 'emby'
            ? intl.formatMessage(messages.manualscanDescriptionJellyfin, {
                mediaServerName: 'Emby',
              })
            : intl.formatMessage(messages.manualscanDescriptionJellyfin, {
                mediaServerName: 'Jellyfin',
              })}
        </p>
      </div>
      <div className="section">
        <div className="rounded-md bg-gray-800 p-4">
          <div className="relative mb-6 h-8 w-full overflow-hidden rounded-full bg-gray-600">
            {dataSync?.running && (
              <div
                className="h-8 bg-indigo-600 transition-all duration-200 ease-in-out"
                style={{
                  width: `${Math.round(
                    (dataSync.progress / dataSync.total) * 100
                  )}%`,
                }}
              />
            )}
            <div className="absolute inset-0 flex h-8 w-full items-center justify-center text-sm">
              <span>
                {dataSync?.running
                  ? `${dataSync.progress} of ${dataSync.total}`
                  : 'Not running'}
              </span>
            </div>
          </div>
          <div className="flex w-full flex-col sm:flex-row">
            {dataSync?.running && (
              <>
                {dataSync.currentLibrary && (
                  <div className="mb-2 mr-0 flex items-center sm:mb-0 sm:mr-2">
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
                    className="mr-1 h-5 w-5"
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
                    className="mr-1 h-5 w-5"
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
      {showAdvancedSettings && (
        <>
          <div className="mt-10 mb-6">
            <h3 className="heading">
              {publicRuntimeConfig.JELLYFIN_TYPE == 'emby'
                ? intl.formatMessage(messages.jellyfinSettings, {
                    mediaServerName: 'Emby',
                  })
                : intl.formatMessage(messages.jellyfinSettings, {
                    mediaServerName: 'Jellyfin',
                  })}
            </h3>
            <p className="description">
              {publicRuntimeConfig.JELLYFIN_TYPE == 'emby'
                ? intl.formatMessage(messages.jellyfinSettingsDescription, {
                    mediaServerName: 'Emby',
                  })
                : intl.formatMessage(messages.jellyfinSettingsDescription, {
                    mediaServerName: 'Jellyfin',
                  })}
            </p>
          </div>
          <Formik
            initialValues={{
              jellyfinExternalUrl: data?.externalHostname || '',
            }}
            validationSchema={JellyfinSettingsSchema}
            onSubmit={async (values) => {
              try {
                await axios.post('/api/v1/settings/jellyfin', {
                  externalHostname: values.jellyfinExternalUrl,
                } as JellyfinSettings);

                addToast(
                  intl.formatMessage(messages.jellyfinSettingsSuccess, {
                    mediaServerName:
                      publicRuntimeConfig.JELLYFIN_TYPE == 'emby'
                        ? 'Emby'
                        : 'Jellyfin',
                  }),
                  {
                    autoDismiss: true,
                    appearance: 'success',
                  }
                );
              } catch (e) {
                addToast(
                  intl.formatMessage(messages.jellyfinSettingsFailure, {
                    mediaServerName:
                      publicRuntimeConfig.JELLYFIN_TYPE == 'emby'
                        ? 'Emby'
                        : 'Jellyfin',
                  }),
                  {
                    autoDismiss: true,
                    appearance: 'error',
                  }
                );
              } finally {
                revalidate();
              }
            }}
          >
            {({ errors, touched, handleSubmit, isSubmitting, isValid }) => {
              return (
                <form className="section" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <label htmlFor="jellyfinExternalUrl" className="text-label">
                      {intl.formatMessage(messages.externalUrl)}
                    </label>
                    <div className="form-input-area">
                      <div className="form-input-field">
                        <Field
                          type="text"
                          inputMode="url"
                          id="jellyfinExternalUrl"
                          name="jellyfinExternalUrl"
                        />
                      </div>
                      {errors.jellyfinExternalUrl &&
                        touched.jellyfinExternalUrl && (
                          <div className="error">
                            {errors.jellyfinExternalUrl}
                          </div>
                        )}
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
                </form>
              );
            }}
          </Formik>
        </>
      )}
    </>
  );
};

export default SettingsJellyfin;
