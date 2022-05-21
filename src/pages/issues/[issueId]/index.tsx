import { NextPage } from 'next';
import React from 'react';
import IssueDetails from '../../../components/IssueDetails';
import useRouteGuard from '../../../hooks/useRouteGuard';
import { Permission } from '../../../hooks/useUser';

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
  return <IssueDetails />;
};

export default IssuePage;
