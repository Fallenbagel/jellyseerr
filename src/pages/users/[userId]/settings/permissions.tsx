import { NextPage } from 'next';
import React from 'react';
import UserSettings from '../../../../components/UserProfile/UserSettings';
import UserPermissions from '../../../../components/UserProfile/UserSettings/UserPermissions';
import useRouteGuard from '../../../../hooks/useRouteGuard';
import { Permission } from '../../../../hooks/useUser';

const UserPermissionsPage: NextPage = () => {
  useRouteGuard(Permission.MANAGE_USERS);
  return (
    <UserSettings>
      <UserPermissions />
    </UserSettings>
  );
};

export default UserPermissionsPage;
