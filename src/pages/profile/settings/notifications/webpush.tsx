import { NextPage } from 'next';
import React from 'react';
import UserSettings from '../../../../components/UserProfile/UserSettings';
import UserNotificationSettings from '../../../../components/UserProfile/UserSettings/UserNotificationSettings';
import UserWebPushSettings from '../../../../components/UserProfile/UserSettings/UserNotificationSettings/UserNotificationsWebPush';

const WebPushProfileNotificationsPage: NextPage = () => {
  return (
    <UserSettings>
      <UserNotificationSettings>
        <UserWebPushSettings />
      </UserNotificationSettings>
    </UserSettings>
  );
};

export default WebPushProfileNotificationsPage;
