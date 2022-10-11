import UserSettings from '@app/components/UserProfile/UserSettings';
import UserNotificationSettings from '@app/components/UserProfile/UserSettings/UserNotificationSettings';
import UserNotificationsTelegram from '@app/components/UserProfile/UserSettings/UserNotificationSettings/UserNotificationsTelegram';
import type { NextPage } from 'next';

const NotificationsPage: NextPage = () => {
  return (
    <UserSettings>
      <UserNotificationSettings>
        <UserNotificationsTelegram />
      </UserNotificationSettings>
    </UserSettings>
  );
};

export default NotificationsPage;
