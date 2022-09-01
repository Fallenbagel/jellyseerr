import UserSettings from '@app/components/UserProfile/UserSettings';
import UserNotificationSettings from '@app/components/UserProfile/UserSettings/UserNotificationSettings';
import UserNotificationsPushover from '@app/components/UserProfile/UserSettings/UserNotificationSettings/UserNotificationsPushover';
import type { NextPage } from 'next';

const NotificationsPage: NextPage = () => {
  return (
    <UserSettings>
      <UserNotificationSettings>
        <UserNotificationsPushover />
      </UserNotificationSettings>
    </UserSettings>
  );
};

export default NotificationsPage;
