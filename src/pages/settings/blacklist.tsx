import SettingsBlacklist from '@app/components/Settings/SettingsBlacklist';
import SettingsLayout from '@app/components/Settings/SettingsLayout';
import useRouteGuard from '@app/hooks/useRouteGuard';
import { Permission } from '@server/lib/permissions';
import type { NextPage } from 'next';

const BlacklistPage: NextPage = () => {
  useRouteGuard(Permission.ADMIN);
  return (
    <SettingsLayout>
      <SettingsBlacklist />
    </SettingsLayout>
  );
};

export default BlacklistPage;
