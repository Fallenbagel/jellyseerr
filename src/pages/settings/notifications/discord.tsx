import { NextPage } from 'next';
import React from 'react';
import NotificationsDiscord from '../../../components/Settings/Notifications/NotificationsDiscord';
import SettingsLayout from '../../../components/Settings/SettingsLayout';
import SettingsNotifications from '../../../components/Settings/SettingsNotifications';

const NotificationsPage: NextPage = () => {
  return (
    <SettingsLayout>
      <SettingsNotifications>
        <NotificationsDiscord />
      </SettingsNotifications>
    </SettingsLayout>
  );
};

export default NotificationsPage;
