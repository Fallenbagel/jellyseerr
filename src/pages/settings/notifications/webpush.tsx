import NotificationsWebPush from '@app/components/Settings/Notifications/NotificationsWebPush';
import SettingsLayout from '@app/components/Settings/SettingsLayout';
import SettingsNotifications from '@app/components/Settings/SettingsNotifications';
import useRouteGuard from '@app/hooks/useRouteGuard';
import { Permission } from '@app/hooks/useUser';
import type { NextPage } from 'next';

const NotificationsWebPushPage: NextPage = () => {
  useRouteGuard(Permission.ADMIN);
  return (
    <SettingsLayout>
      <SettingsNotifications>
        <NotificationsWebPush />
      </SettingsNotifications>
    </SettingsLayout>
  );
};

export default NotificationsWebPushPage;
