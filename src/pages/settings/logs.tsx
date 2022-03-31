import { NextPage } from 'next';
import React from 'react';
import SettingsLayout from '../../components/Settings/SettingsLayout';
import SettingsLogs from '../../components/Settings/SettingsLogs';

const SettingsLogsPage: NextPage = () => {
  return (
    <SettingsLayout>
      <SettingsLogs />
    </SettingsLayout>
  );
};

export default SettingsLogsPage;
