import { NextPage } from 'next';
import React from 'react';
import UserSettings from '../../../../components/UserProfile/UserSettings';
import UserGeneralSettings from '../../../../components/UserProfile/UserSettings/UserGeneralSettings';
import useRouteGuard from '../../../../hooks/useRouteGuard';
import { Permission } from '../../../../hooks/useUser';

const UserSettingsPage: NextPage = () => {
  useRouteGuard(Permission.MANAGE_USERS);
  return (
    <UserSettings>
      <UserGeneralSettings />
    </UserSettings>
  );
};

export default UserSettingsPage;
