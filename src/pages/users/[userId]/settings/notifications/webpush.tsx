import UserSettings from '@app/components/UserProfile/UserSettings';
import UserNotificationSettings from '@app/components/UserProfile/UserSettings/UserNotificationSettings';
import UserWebPushSettings from '@app/components/UserProfile/UserSettings/UserNotificationSettings/UserNotificationsWebPush';
import useRouteGuard from '@app/hooks/useRouteGuard';
import { Permission } from '@app/hooks/useUser';
import type { NextPage } from 'next';

const WebPushNotificationsPage: NextPage = () => {
  useRouteGuard(Permission.MANAGE_USERS);
  return (
    <UserSettings>
      <UserNotificationSettings>
        <UserWebPushSettings />
      </UserNotificationSettings>
    </UserSettings>
  );
};

export default WebPushNotificationsPage;
