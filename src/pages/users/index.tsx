import React from 'react';
import type { NextPage } from 'next';
import UserList from '../../components/UserList';
import useRouteGuard from '../../hooks/useRouteGuard';
import { Permission } from '../../hooks/useUser';

const UsersPage: NextPage = () => {
  useRouteGuard(Permission.MANAGE_USERS);
  return <UserList />;
};

export default UsersPage;
