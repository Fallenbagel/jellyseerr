import SettingsLayout from '@app/components/Settings/SettingsLayout';
import SettingsUsers from '@app/components/Settings/SettingsUsers';
import useRouteGuard from '@app/hooks/useRouteGuard';
import { Permission } from '@app/hooks/useUser';
import type { NextPage } from 'next';

const SettingsUsersPage: NextPage = () => {
  useRouteGuard(Permission.ADMIN);
  return (
    <SettingsLayout>
      <SettingsUsers />
    </SettingsLayout>
  );
};

export default SettingsUsersPage;
