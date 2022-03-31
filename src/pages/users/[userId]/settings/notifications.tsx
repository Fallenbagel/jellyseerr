import { NextPage } from 'next';
import React from 'react';
import UserSettings from '../../../../components/UserProfile/UserSettings';
import UserNotificationSettings from '../../../../components/UserProfile/UserSettings/UserNotificationSettings';
import useRouteGuard from '../../../../hooks/useRouteGuard';
import { Permission } from '../../../../hooks/useUser';

const UserSettingsMainPage: NextPage = () => {
  useRouteGuard(Permission.MANAGE_USERS);
  return (
    <UserSettings>
      <UserNotificationSettings />
    </UserSettings>
  );
};

export default UserSettingsMainPage;
