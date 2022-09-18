import RequestList from '@app/components/RequestList';
import useRouteGuard from '@app/hooks/useRouteGuard';
import { Permission } from '@app/hooks/useUser';
import type { NextPage } from 'next';

const UserRequestsPage: NextPage = () => {
  useRouteGuard([Permission.MANAGE_REQUESTS, Permission.REQUEST_VIEW], {
    type: 'or',
  });
  return <RequestList />;
};

export default UserRequestsPage;
