import UserSettings from '@app/components/UserProfile/UserSettings';
import UserPermissions from '@app/components/UserProfile/UserSettings/UserPermissions';
import type { NextPage } from 'next';

const UserPermissionsPage: NextPage = () => {
  return (
    <UserSettings>
      <UserPermissions />
    </UserSettings>
  );
};

export default UserPermissionsPage;
