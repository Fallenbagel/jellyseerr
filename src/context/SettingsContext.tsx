import React from 'react';
import useSWR from 'swr';
import { MediaServerType } from '../../server/constants/server';
import { PublicSettingsResponse } from '../../server/interfaces/api/settingsInterfaces';

export interface SettingsContextProps {
  currentSettings: PublicSettingsResponse;
}

const defaultSettings = {
  initialized: false,
  applicationTitle: 'Jellyseerr',
  applicationUrl: '',
  hideAvailable: false,
  localLogin: true,
  movie4kEnabled: false,
  series4kEnabled: false,
  region: '',
  originalLanguage: '',
  mediaServerType: MediaServerType.NOT_CONFIGURED,
  partialRequestsEnabled: true,
  cacheImages: false,
  vapidPublic: '',
  enablePushRegistration: false,
  locale: 'en',
  emailEnabled: false,
};

export const SettingsContext = React.createContext<SettingsContextProps>({
  currentSettings: defaultSettings,
});

export const SettingsProvider: React.FC<SettingsContextProps> = ({
  children,
  currentSettings,
}) => {
  const { data, error } = useSWR<PublicSettingsResponse>(
    '/api/v1/settings/public',
    { initialData: currentSettings }
  );

  let newSettings = defaultSettings;

  if (data && !error) {
    newSettings = data;
  }

  return (
    <SettingsContext.Provider value={{ currentSettings: newSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
