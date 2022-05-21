import { useRouter } from 'next/dist/client/router';
import React, { useEffect, useRef } from 'react';
import { User, useUser } from '../hooks/useUser';

interface UserContextProps {
  initialUser: User;
}

/**
 * This UserContext serves the purpose of just preparing the useUser hooks
 * cache on server side render. It also will handle redirecting the user to
 * the login page if their session ever becomes invalid.
 */
export const UserContext: React.FC<UserContextProps> = ({
  initialUser,
  children,
}) => {
  const { user, error, revalidate } = useUser({ initialData: initialUser });
  const router = useRouter();
  const routing = useRef(false);

  useEffect(() => {
    revalidate();
  }, [router.pathname, revalidate]);

  useEffect(() => {
    if (
      !router.pathname.match(/(setup|login|resetpassword)/) &&
      (!user || error) &&
      !routing.current
    ) {
      routing.current = true;
      location.href = '/login';
    }
  }, [router, user, error]);

  return <>{children}</>;
};
