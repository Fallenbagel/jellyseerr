import { Permission, useUser } from './useUser';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const useRouteGuard = (permission: Permission | Permission[]): void => {
  const router = useRouter();
  const { user, hasPermission } = useUser();

  useEffect(() => {
    if (user && !hasPermission(permission)) {
      router.push('/');
    }
  }, [user, permission, router, hasPermission]);
};

export default useRouteGuard;
