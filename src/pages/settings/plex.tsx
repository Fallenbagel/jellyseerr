import React from 'react';
import type { NextPage } from 'next';
import SettingsLayout from '../../components/Settings/SettingsLayout';
import SettingsPlex from '../../components/Settings/SettingsPlex';
import { Permission } from '../../hooks/useUser';
import useRouteGuard from '../../hooks/useRouteGuard';

const PlexSettingsPage: NextPage = () => {
  useRouteGuard(Permission.MANAGE_SETTINGS);
  return (
    <SettingsLayout>
      <SettingsPlex />
    </SettingsLayout>
  );
};

export default PlexSettingsPage;
