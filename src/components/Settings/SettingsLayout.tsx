import getConfig from 'next/config';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { MediaServerType } from '../../../server/constants/server';
import useSettings from '../../hooks/useSettings';
import globalMessages from '../../i18n/globalMessages';
import PageTitle from '../Common/PageTitle';
import SettingsTabs, { SettingsRoute } from '../Common/SettingsTabs';

const messages = defineMessages({
  menuGeneralSettings: 'General',
  menuUsers: 'Users',
  menuPlexSettings: 'Plex',
  menuJellyfinSettings: '{mediaServerName}',
  menuServices: 'Services',
  menuNotifications: 'Notifications',
  menuLogs: 'Logs',
  menuJobs: 'Jobs & Cache',
  menuAbout: 'About',
});

const SettingsLayout: React.FC = ({ children }) => {
  const intl = useIntl();
  const { publicRuntimeConfig } = getConfig();
  const settings = useSettings();
  const settingsRoutes: SettingsRoute[] = [
    {
      text: intl.formatMessage(messages.menuGeneralSettings),
      route: '/settings/main',
      regex: /^\/settings(\/main)?$/,
    },
    {
      text: intl.formatMessage(messages.menuUsers),
      route: '/settings/users',
      regex: /^\/settings\/users/,
    },
    settings.currentSettings.mediaServerType === MediaServerType.PLEX
      ? {
          text: intl.formatMessage(messages.menuPlexSettings),
          route: '/settings/plex',
          regex: /^\/settings\/plex/,
        }
      : {
          text: getAvailableMediaServerName(),
          route: '/settings/jellyfin',
          regex: /^\/settings\/jellyfin/,
        },
    {
      text: intl.formatMessage(messages.menuServices),
      route: '/settings/services',
      regex: /^\/settings\/services/,
    },
    {
      text: intl.formatMessage(messages.menuNotifications),
      route: '/settings/notifications/email',
      regex: /^\/settings\/notifications/,
    },
    {
      text: intl.formatMessage(messages.menuLogs),
      route: '/settings/logs',
      regex: /^\/settings\/logs/,
    },
    {
      text: intl.formatMessage(messages.menuJobs),
      route: '/settings/jobs',
      regex: /^\/settings\/jobs/,
    },
    {
      text: intl.formatMessage(messages.menuAbout),
      route: '/settings/about',
      regex: /^\/settings\/about/,
    },
  ];

  return (
    <>
      <PageTitle title={intl.formatMessage(globalMessages.settings)} />
      <div className="mt-6">
        <SettingsTabs settingsRoutes={settingsRoutes} />
      </div>
      <div className="mt-10 text-white">{children}</div>
    </>
  );
  function getAvailableMediaServerName() {
    return intl.formatMessage(messages.menuJellyfinSettings, {
      mediaServerName:
        publicRuntimeConfig.JELLYFIN_TYPE === 'emby' ? 'Emby' : 'Jellyfin',
    });
  }
};

export default SettingsLayout;
