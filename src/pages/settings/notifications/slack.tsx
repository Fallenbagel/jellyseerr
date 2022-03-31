import { NextPage } from 'next';
import React from 'react';
import NotificationsSlack from '../../../components/Settings/Notifications/NotificationsSlack';
import SettingsLayout from '../../../components/Settings/SettingsLayout';
import SettingsNotifications from '../../../components/Settings/SettingsNotifications';

const NotificationsSlackPage: NextPage = () => {
  return (
    <SettingsLayout>
      <SettingsNotifications>
        <NotificationsSlack />
      </SettingsNotifications>
    </SettingsLayout>
  );
};

export default NotificationsSlackPage;
