import { NextPage } from 'next';
import React from 'react';
import SettingsLayout from '../../../components/Settings/SettingsLayout';
import SettingsNotifications from '../../../components/Settings/SettingsNotifications';
import NotificationsEmail from '../../../components/Settings/Notifications/NotificationsEmail';

const NotificationsPage: NextPage = () => {
  return (
    <SettingsLayout>
      <SettingsNotifications>
        <NotificationsEmail />
      </SettingsNotifications>
    </SettingsLayout>
  );
};

export default NotificationsPage;
