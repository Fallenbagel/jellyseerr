import React from 'react';
import type { NextPage } from 'next';
import SettingsLayout from '../../components/Settings/SettingsLayout';
import SettingsJellyfin from '../../components/Settings/SettingsJellyfin';
import { Permission } from '../../hooks/useUser';
import useRouteGuard from '../../hooks/useRouteGuard';

const JellyfinSettingsPage: NextPage = () => {
  useRouteGuard(Permission.MANAGE_SETTINGS);
  return (
    <SettingsLayout>
      <SettingsJellyfin />
    </SettingsLayout>
  );
};

export default JellyfinSettingsPage;
