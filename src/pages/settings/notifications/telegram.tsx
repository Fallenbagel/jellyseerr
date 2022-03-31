import { NextPage } from 'next';
import React from 'react';
import NotificationsTelegram from '../../../components/Settings/Notifications/NotificationsTelegram';
import SettingsLayout from '../../../components/Settings/SettingsLayout';
import SettingsNotifications from '../../../components/Settings/SettingsNotifications';

const NotificationsPage: NextPage = () => {
  return (
    <SettingsLayout>
      <SettingsNotifications>
        <NotificationsTelegram />
      </SettingsNotifications>
    </SettingsLayout>
  );
};

export default NotificationsPage;
