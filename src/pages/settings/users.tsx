import React from 'react';
import { NextPage } from 'next';
import SettingsLayout from '../../components/Settings/SettingsLayout';
import SettingsUsers from '../../components/Settings/SettingsUsers';
import { Permission } from '../../hooks/useUser';
import useRouteGuard from '../../hooks/useRouteGuard';

const SettingsUsersPage: NextPage = () => {
  useRouteGuard(Permission.MANAGE_SETTINGS);
  return (
    <SettingsLayout>
      <SettingsUsers />
    </SettingsLayout>
  );
};

export default SettingsUsersPage;
