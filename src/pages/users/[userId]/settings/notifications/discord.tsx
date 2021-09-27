import { NextPage } from 'next';
import React from 'react';
import UserSettings from '../../../../../components/UserProfile/UserSettings';
import UserNotificationSettings from '../../../../../components/UserProfile/UserSettings/UserNotificationSettings';
import UserNotificationsDiscord from '../../../../../components/UserProfile/UserSettings/UserNotificationSettings/UserNotificationsDiscord';
import useRouteGuard from '../../../../../hooks/useRouteGuard';
import { Permission } from '../../../../../hooks/useUser';

const NotificationsPage: NextPage = () => {
  useRouteGuard(Permission.MANAGE_USERS);
  return (
    <UserSettings>
      <UserNotificationSettings>
        <UserNotificationsDiscord />
      </UserNotificationSettings>
    </UserSettings>
  );
};

export default NotificationsPage;
