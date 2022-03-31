import { NextPage } from 'next';
import React from 'react';
import NotificationsWebhook from '../../../components/Settings/Notifications/NotificationsWebhook';
import SettingsLayout from '../../../components/Settings/SettingsLayout';
import SettingsNotifications from '../../../components/Settings/SettingsNotifications';

const NotificationsPage: NextPage = () => {
  return (
    <SettingsLayout>
      <SettingsNotifications>
        <NotificationsWebhook />
      </SettingsNotifications>
    </SettingsLayout>
  );
};

export default NotificationsPage;
