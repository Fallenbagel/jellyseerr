import UserSettings from '@app/components/UserProfile/UserSettings';
import UserNotificationSettings from '@app/components/UserProfile/UserSettings/UserNotificationSettings';
import UserNotificationsDiscord from '@app/components/UserProfile/UserSettings/UserNotificationSettings/UserNotificationsDiscord';
import type { NextPage } from 'next';

const NotificationsPage: NextPage = () => {
  return (
    <UserSettings>
      <UserNotificationSettings>
        <UserNotificationsDiscord />
      </UserNotificationSettings>
    </UserSettings>
  );
};

export default NotificationsPage;
