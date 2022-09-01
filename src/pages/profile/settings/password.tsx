import UserSettings from '@app/components/UserProfile/UserSettings';
import UserPasswordChange from '@app/components/UserProfile/UserSettings/UserPasswordChange';
import type { NextPage } from 'next';

const UserPassswordPage: NextPage = () => {
  return (
    <UserSettings>
      <UserPasswordChange />
    </UserSettings>
  );
};

export default UserPassswordPage;
