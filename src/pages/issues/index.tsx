import IssueList from '@app/components/IssueList';
import useRouteGuard from '@app/hooks/useRouteGuard';
import { Permission } from '@app/hooks/useUser';
import type { NextPage } from 'next';

const IssuePage: NextPage = () => {
  useRouteGuard(
    [
      Permission.MANAGE_ISSUES,
      Permission.CREATE_ISSUES,
      Permission.VIEW_ISSUES,
    ],
    {
      type: 'or',
    }
  );
  return <IssueList />;
};

export default IssuePage;
