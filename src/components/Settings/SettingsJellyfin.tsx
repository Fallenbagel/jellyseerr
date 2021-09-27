import axios from 'axios';
import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import useSWR from 'swr';
import type { JellyfinSettings } from '../../../server/lib/settings';
import Badge from '../Common/Badge';
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';
import LibraryItem from './LibraryItem';

const messages = defineMessages({
  jellyfinsettings: 'Jellyfin Settings',
  jellyfinsettingsDescription:
    'Configure the settings for your Jellyfin server. Overseerr scans your Jellyfin libraries to see what content is available.',
  timeout: 'Timeout',
  save: 'Save Changes',
  saving: 'Saving…',
  jellyfinlibraries: 'Jellyfin Libraries',
  jellyfinlibrariesDescription:
    'The libraries Overseerr scans for titles. Click the button below if no libraries are listed.',
  syncing: 'Syncing',
  syncJellyfin: 'Sync Libraries',
  manualscanJellyfin: 'Manual Library Scan',
  manualscanDescriptionJellyfin:
    "Normally, this will only be run once every 24 hours. Overseerr will check your Jellyfin server's recently added more aggressively. If this is your first time configuring Jellyfin, a one-time full manual library scan is recommended!",
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
  onComplete?: () => void;
}

const SettingsJellyfin: React.FC<SettingsJellyfinProps> = ({ onComplete }) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const {
    data: data,
    error: error,
    // revalidate: revalidate,
  } = useSWR<JellyfinSettings>('/api/v1/settings/jellyfin');
  const revalidate = () => undefined; //TODO
  const revalidateSync = () => undefined; //TODO

  const {
    data: dataSync, //, revalidate: revalidateSync
  } = useSWR<SyncStatus>('/api/v1/settings/jellyfin/sync', {
    refreshInterval: 1000,
  });
  const intl = useIntl();

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
          <FormattedMessage {...messages.jellyfinlibraries} />
        </h3>
        <p className="description">
          <FormattedMessage {...messages.jellyfinlibrariesDescription} />
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
          <FormattedMessage {...messages.manualscanDescriptionJellyfin} />
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
    </>
  );
};

export default SettingsJellyfin;
