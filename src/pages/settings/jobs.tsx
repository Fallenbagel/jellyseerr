import React from 'react';
import type { NextPage } from 'next';
import SettingsLayout from '../../components/Settings/SettingsLayout';
import SettingsJobs from '../../components/Settings/SettingsJobsCache';
import { Permission } from '../../hooks/useUser';
import useRouteGuard from '../../hooks/useRouteGuard';

const SettingsMainPage: NextPage = () => {
  useRouteGuard(Permission.MANAGE_SETTINGS);
  return (
    <SettingsLayout>
      <SettingsJobs />
    </SettingsLayout>
  );
};

export default SettingsMainPage;
