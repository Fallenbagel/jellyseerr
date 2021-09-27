import { NextPage } from 'next';
import React from 'react';
import UserSettings from '../../../../components/UserProfile/UserSettings';
import UserNotificationSettings from '../../../../components/UserProfile/UserSettings/UserNotificationSettings';
import UserNotificationsTelegram from '../../../../components/UserProfile/UserSettings/UserNotificationSettings/UserNotificationsTelegram';

const NotificationsPage: NextPage = () => {
  return (
    <UserSettings>
      <UserNotificationSettings>
        <UserNotificationsTelegram />
      </UserNotificationSettings>
    </UserSettings>
  );
};

export default NotificationsPage;
