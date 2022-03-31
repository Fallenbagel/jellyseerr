import { NextPage } from 'next';
import React from 'react';
import NotificationsPushover from '../../../components/Settings/Notifications/NotificationsPushover';
import SettingsLayout from '../../../components/Settings/SettingsLayout';
import SettingsNotifications from '../../../components/Settings/SettingsNotifications';

const NotificationsPage: NextPage = () => {
  return (
    <SettingsLayout>
      <SettingsNotifications>
        <NotificationsPushover />
      </SettingsNotifications>
    </SettingsLayout>
  );
};

export default NotificationsPage;
