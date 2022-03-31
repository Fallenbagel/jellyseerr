import { NextPage } from 'next';
import React from 'react';
import UserSettings from '../../../components/UserProfile/UserSettings';
import UserNotificationSettings from '../../../components/UserProfile/UserSettings/UserNotificationSettings';

const UserSettingsMainPage: NextPage = () => {
  return (
    <UserSettings>
      <UserNotificationSettings />
    </UserSettings>
  );
};

export default UserSettingsMainPage;
