import React from 'react';
import type { NextPage } from 'next';
import SettingsLayout from '../../components/Settings/SettingsLayout';
import SettingsServices from '../../components/Settings/SettingsServices';
import { Permission } from '../../hooks/useUser';
import useRouteGuard from '../../hooks/useRouteGuard';

const ServicesSettingsPage: NextPage = () => {
  useRouteGuard(Permission.MANAGE_SETTINGS);
  return (
    <SettingsLayout>
      <SettingsServices />
    </SettingsLayout>
  );
};

export default ServicesSettingsPage;
