import useSWR from 'swr';
import { MutatorCallback } from 'swr/dist/types';
import { UserType } from '../../server/constants/user';
import {
  hasPermission,
  Permission,
  PermissionCheckOptions,
} from '../../server/lib/permissions';
import { NotificationAgentKey } from '../../server/lib/settings';

export { Permission, UserType };
export type { PermissionCheckOptions };

export interface User {
  id: number;
  plexUsername?: string;
  username?: string;
  displayName: string;
  email: string;
  avatar: string;
  permissions: number;
  userType: number;
  createdAt: Date;
  updatedAt: Date;
  requestCount: number;
  settings?: UserSettings;
}

type NotificationAgentTypes = Record<NotificationAgentKey, number>;

export interface UserSettings {
  discordId?: string;
  region?: string;
  originalLanguage?: string;
  locale?: string;
  notificationTypes: Partial<NotificationAgentTypes>;
}

interface UserHookResponse {
  user?: User;
  loading: boolean;
  error: string;
  revalidate: (
    data?: User | Promise<User> | MutatorCallback<User> | undefined,
    shouldRevalidate?: boolean | undefined
  ) => Promise<User | undefined>;
  hasPermission: (
    permission: Permission | Permission[],
    options?: PermissionCheckOptions
  ) => boolean;
}

export const useUser = ({
  id,
  initialData,
}: { id?: number; initialData?: User } = {}): UserHookResponse => {
  const {
    data,
    error,
    mutate: revalidate,
  } = useSWR<User>(id ? `/api/v1/user/${id}` : `/api/v1/auth/me`, {
    fallbackData: initialData,
    refreshInterval: 30000,
    errorRetryInterval: 30000,
    shouldRetryOnError: false,
  });

  const checkPermission = (
    permission: Permission | Permission[],
    options?: PermissionCheckOptions
  ): boolean => {
    return hasPermission(permission, data?.permissions ?? 0, options);
  };

  return {
    user: data,
    loading: !data && !error,
    error,
    hasPermission: checkPermission,
    revalidate,
  };
};
