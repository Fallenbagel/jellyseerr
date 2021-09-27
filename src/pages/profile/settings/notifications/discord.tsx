import { NextPage } from 'next';
import React from 'react';
import UserSettings from '../../../../components/UserProfile/UserSettings';
import UserNotificationSettings from '../../../../components/UserProfile/UserSettings/UserNotificationSettings';
import UserNotificationsDiscord from '../../../../components/UserProfile/UserSettings/UserNotificationSettings/UserNotificationsDiscord';

const NotificationsPage: NextPage = () => {
  return (
    <UserSettings>
      <UserNotificationSettings>
        <UserNotificationsDiscord />
      </UserNotificationSettings>
    </UserSettings>
  );
};

export default NotificationsPage;
