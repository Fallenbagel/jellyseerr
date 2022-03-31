import { NextPage } from 'next';
import React from 'react';
import NotificationsPushbullet from '../../../components/Settings/Notifications/NotificationsPushbullet';
import SettingsLayout from '../../../components/Settings/SettingsLayout';
import SettingsNotifications from '../../../components/Settings/SettingsNotifications';

const NotificationsPage: NextPage = () => {
  return (
    <SettingsLayout>
      <SettingsNotifications>
        <NotificationsPushbullet />
      </SettingsNotifications>
    </SettingsLayout>
  );
};

export default NotificationsPage;
