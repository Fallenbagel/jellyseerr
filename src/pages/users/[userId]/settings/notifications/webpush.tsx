import { NextPage } from 'next';
import React from 'react';
import UserSettings from '../../../../../components/UserProfile/UserSettings';
import UserNotificationSettings from '../../../../../components/UserProfile/UserSettings/UserNotificationSettings';
import UserWebPushSettings from '../../../../../components/UserProfile/UserSettings/UserNotificationSettings/UserNotificationsWebPush';
import useRouteGuard from '../../../../../hooks/useRouteGuard';
import { Permission } from '../../../../../hooks/useUser';

const WebPushNotificationsPage: NextPage = () => {
  useRouteGuard(Permission.MANAGE_USERS);
  return (
    <UserSettings>
      <UserNotificationSettings>
        <UserWebPushSettings />
      </UserNotificationSettings>
    </UserSettings>
  );
};

export default WebPushNotificationsPage;
