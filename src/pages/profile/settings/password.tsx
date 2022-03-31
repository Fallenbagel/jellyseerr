import { NextPage } from 'next';
import React from 'react';
import UserSettings from '../../../components/UserProfile/UserSettings';
import UserPasswordChange from '../../../components/UserProfile/UserSettings/UserPasswordChange';

const UserPassswordPage: NextPage = () => {
  return (
    <UserSettings>
      <UserPasswordChange />
    </UserSettings>
  );
};

export default UserPassswordPage;
