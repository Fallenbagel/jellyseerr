import { NextPage } from 'next';
import React from 'react';
import UserSettings from '../../../../components/UserProfile/UserSettings';
import UserNotificationSettings from '../../../../components/UserProfile/UserSettings/UserNotificationSettings';
import UserNotificationsPushover from '../../../../components/UserProfile/UserSettings/UserNotificationSettings/UserNotificationsPushover';

const NotificationsPage: NextPage = () => {
  return (
    <UserSettings>
      <UserNotificationSettings>
        <UserNotificationsPushover />
      </UserNotificationSettings>
    </UserSettings>
  );
};

export default NotificationsPage;
