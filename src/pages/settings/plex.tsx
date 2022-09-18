import SettingsLayout from '@app/components/Settings/SettingsLayout';
import SettingsPlex from '@app/components/Settings/SettingsPlex';
import useRouteGuard from '@app/hooks/useRouteGuard';
import { Permission } from '@app/hooks/useUser';
import type { NextPage } from 'next';

const PlexSettingsPage: NextPage = () => {
  useRouteGuard(Permission.ADMIN);
  return (
    <SettingsLayout>
      <SettingsPlex />
    </SettingsLayout>
  );
};

export default PlexSettingsPage;
