import NotificationsPushbullet from '@app/components/Settings/Notifications/NotificationsPushbullet';
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
        <NotificationsPushbullet />
      </SettingsNotifications>
    </SettingsLayout>
  );
};

export default NotificationsPage;
