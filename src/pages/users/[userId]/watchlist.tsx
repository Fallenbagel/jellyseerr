import DiscoverWatchlist from '@app/components/Discover/DiscoverWatchlist';
import useRouteGuard from '@app/hooks/useRouteGuard';
import { Permission } from '@app/hooks/useUser';
import type { NextPage } from 'next';

const UserRequestsPage: NextPage = () => {
  useRouteGuard([Permission.MANAGE_REQUESTS, Permission.WATCHLIST_VIEW], {
    type: 'or',
  });
  return <DiscoverWatchlist />;
};

export default UserRequestsPage;
