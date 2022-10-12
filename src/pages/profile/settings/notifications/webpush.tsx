import UserSettings from '@app/components/UserProfile/UserSettings';
import UserNotificationSettings from '@app/components/UserProfile/UserSettings/UserNotificationSettings';
import UserWebPushSettings from '@app/components/UserProfile/UserSettings/UserNotificationSettings/UserNotificationsWebPush';
import type { NextPage } from 'next';

const WebPushProfileNotificationsPage: NextPage = () => {
  return (
    <UserSettings>
      <UserNotificationSettings>
        <UserWebPushSettings />
      </UserNotificationSettings>
    </UserSettings>
  );
};

export default WebPushProfileNotificationsPage;
