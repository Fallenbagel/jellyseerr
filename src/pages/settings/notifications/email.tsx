import { NextPage } from 'next';
import React from 'react';
import NotificationsEmail from '../../../components/Settings/Notifications/NotificationsEmail';
import SettingsLayout from '../../../components/Settings/SettingsLayout';
import SettingsNotifications from '../../../components/Settings/SettingsNotifications';
import useRouteGuard from '../../../hooks/useRouteGuard';
import { Permission } from '../../../hooks/useUser';

const NotificationsPage: NextPage = () => {
  useRouteGuard(Permission.MANAGE_SETTINGS);
  return (
    <SettingsLayout>
      <SettingsNotifications>
        <NotificationsEmail />
      </SettingsNotifications>
    </SettingsLayout>
  );
};

export default NotificationsPage;
