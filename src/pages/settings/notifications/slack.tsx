import { NextPage } from 'next';
import React from 'react';
import NotificationsSlack from '../../../components/Settings/Notifications/NotificationsSlack';
import SettingsLayout from '../../../components/Settings/SettingsLayout';
import SettingsNotifications from '../../../components/Settings/SettingsNotifications';
import useRouteGuard from '../../../hooks/useRouteGuard';
import { Permission } from '../../../hooks/useUser';

const NotificationsSlackPage: NextPage = () => {
  useRouteGuard(Permission.MANAGE_SETTINGS);
  return (
    <SettingsLayout>
      <SettingsNotifications>
        <NotificationsSlack />
      </SettingsNotifications>
    </SettingsLayout>
  );
};

export default NotificationsSlackPage;
