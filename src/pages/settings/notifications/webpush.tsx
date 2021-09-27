import { NextPage } from 'next';
import React from 'react';
import NotificationsWebPush from '../../../components/Settings/Notifications/NotificationsWebPush';
import SettingsLayout from '../../../components/Settings/SettingsLayout';
import SettingsNotifications from '../../../components/Settings/SettingsNotifications';
import useRouteGuard from '../../../hooks/useRouteGuard';
import { Permission } from '../../../hooks/useUser';

const NotificationsWebPushPage: NextPage = () => {
  useRouteGuard(Permission.MANAGE_SETTINGS);
  return (
    <SettingsLayout>
      <SettingsNotifications>
        <NotificationsWebPush />
      </SettingsNotifications>
    </SettingsLayout>
  );
};

export default NotificationsWebPushPage;
