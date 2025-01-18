import SettingsAutoApproval from '@app/components/Settings/SettingsAutoApproval';
import SettingsLayout from '@app/components/Settings/SettingsLayout';
import useRouteGuard from '@app/hooks/useRouteGuard';
import { Permission } from '@app/hooks/useUser';
import type { NextPage } from 'next';

const SettingsAutoApprovalPage: NextPage = () => {
  useRouteGuard(Permission.ADMIN);
  return (
    <SettingsLayout>
      <SettingsAutoApproval />
    </SettingsLayout>
  );
};

export default SettingsAutoApprovalPage;
