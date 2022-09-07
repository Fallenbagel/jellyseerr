import NotificationsLunaSea from '@app/components/Settings/Notifications/NotificationsLunaSea';
import SettingsLayout from '@app/components/Settings/SettingsLayout';
import SettingsNotifications from '@app/components/Settings/SettingsNotifications';
import useRouteGuard from '@app/hooks/useRouteGuard';
import { Permission } from '@app/hooks/useUser';
import type { NextPage } from 'next';

const NotificationsPage: NextPage = () => {
  useRouteGuard(Permission.ADMIN);
  return (
    <SettingsLayout>
      <SettingsNotifications>
        <NotificationsLunaSea />
      </SettingsNotifications>
    </SettingsLayout>
  );
};

export default NotificationsPage;
