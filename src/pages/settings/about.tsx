import { NextPage } from 'next';
import React from 'react';
import SettingsAbout from '../../components/Settings/SettingsAbout';
import SettingsLayout from '../../components/Settings/SettingsLayout';
import useRouteGuard from '../../hooks/useRouteGuard';
import { Permission } from '../../hooks/useUser';

const SettingsAboutPage: NextPage = () => {
  useRouteGuard(Permission.MANAGE_SETTINGS);
  return (
    <SettingsLayout>
      <SettingsAbout />
    </SettingsLayout>
  );
};

export default SettingsAboutPage;
