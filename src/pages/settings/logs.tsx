import SettingsLayout from '@app/components/Settings/SettingsLayout';
import SettingsLogs from '@app/components/Settings/SettingsLogs';
import useRouteGuard from '@app/hooks/useRouteGuard';
import { Permission } from '@app/hooks/useUser';
import type { NextPage } from 'next';

const SettingsLogsPage: NextPage = () => {
  useRouteGuard(Permission.ADMIN);
  return (
    <SettingsLayout>
      <SettingsLogs />
    </SettingsLayout>
  );
};

export default SettingsLogsPage;
