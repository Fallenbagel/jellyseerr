import { NextPage } from 'next';
import React from 'react';
import UserSettings from '../../../../components/UserProfile/UserSettings';
import UserPasswordChange from '../../../../components/UserProfile/UserSettings/UserPasswordChange';
import useRouteGuard from '../../../../hooks/useRouteGuard';
import { Permission } from '../../../../hooks/useUser';

const UserPassswordPage: NextPage = () => {
  useRouteGuard(Permission.MANAGE_USERS);
  return (
    <UserSettings>
      <UserPasswordChange />
    </UserSettings>
  );
};

export default UserPassswordPage;
