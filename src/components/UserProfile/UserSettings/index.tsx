import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Permission, useUser } from '../../../hooks/useUser';
import Error from '../../../pages/_error';
import LoadingSpinner from '../../Common/LoadingSpinner';
import PageTitle from '../../Common/PageTitle';
import ProfileHeader from '../ProfileHeader';
import useSettings from '../../../hooks/useSettings';

const messages = defineMessages({
  settings: 'User Settings',
  menuGeneralSettings: 'General Settings',
  menuChangePass: 'Password',
  menuNotifications: 'Notifications',
  menuPermissions: 'Permissions',
});

interface SettingsRoute {
  text: string;
  route: string;
  regex: RegExp;
  requiredPermission?: Permission | Permission[];
  permissionType?: { type: 'and' | 'or' };
}

const UserSettings: React.FC = ({ children }) => {
  const router = useRouter();
  const settings = useSettings();
  const { hasPermission } = useUser();
  const { user, error } = useUser({ id: Number(router.query.userId) });
  const intl = useIntl();

  if (!user && !error) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Error statusCode={500} />;
  }

  const settingsRoutes: SettingsRoute[] = [
    {
      text: intl.formatMessage(messages.menuGeneralSettings),
      route: '/settings/main',
      regex: /\/settings(\/main)?$/,
    },
    {
      text: intl.formatMessage(messages.menuChangePass),
      route: '/settings/password',
      regex: /\/settings\/password/,
    },
    {
      text: intl.formatMessage(messages.menuNotifications),
      route: '/settings/notifications',
      regex: /\/settings\/notifications/,
    },
    {
      text: intl.formatMessage(messages.menuPermissions),
      route: '/settings/permissions',
      regex: /\/settings\/permissions/,
      requiredPermission: Permission.MANAGE_USERS,
    },
  ];

  const activeLinkColor =
    'border-indigo-600 text-indigo-500 focus:outline-none focus:text-indigo-500 focus:border-indigo-500';

  const inactiveLinkColor =
    'border-transparent text-gray-500 hover:text-gray-400 hover:border-gray-300 focus:outline-none focus:text-gray-4700 focus:border-gray-300';

  const SettingsLink: React.FC<{
    route: string;
    regex: RegExp;
    isMobile?: boolean;
  }> = ({ children, route, regex, isMobile = false }) => {
    if (
      route === '/settings/password' &&
      !settings.currentSettings.localLogin &&
      !hasPermission(Permission.MANAGE_SETTINGS)
    ) {
      return null;
    }

    const finalRoute = router.asPath.includes('/profile')
      ? `/profile${route}`
      : `/users/${user.id}${route}`;
    if (isMobile) {
      return <option value={finalRoute}>{children}</option>;
    }

    return (
      <Link href={finalRoute}>
        <a
          className={`whitespace-nowrap ml-8 first:ml-0 py-4 px-1 border-b-2 border-transparent font-medium text-sm leading-5 ${
            router.pathname.match(regex) ? activeLinkColor : inactiveLinkColor
          }`}
          aria-current="page"
        >
          {children}
        </a>
      </Link>
    );
  };

  const currentRoute = settingsRoutes.find(
    (route) => !!router.pathname.match(route.regex)
  )?.route;

  const finalRoute = router.asPath.includes('/profile')
    ? `/profile${currentRoute}`
    : `/users/${user.id}${currentRoute}`;

  return (
    <>
      <PageTitle title={intl.formatMessage(messages.settings)} />
      <ProfileHeader user={user} isSettingsPage />
      <div className="mt-6">
        <div className="sm:hidden">
          <select
            onChange={(e) => {
              router.push(e.target.value);
            }}
            onBlur={(e) => {
              router.push(e.target.value);
            }}
            defaultValue={finalRoute}
            aria-label="Selected tab"
          >
            {settingsRoutes
              .filter((route) =>
                route.requiredPermission
                  ? hasPermission(
                      route.requiredPermission,
                      route.permissionType
                    )
                  : true
              )
              .map((route, index) => (
                <SettingsLink
                  route={route.route}
                  regex={route.regex}
                  isMobile
                  key={`mobile-settings-link-${index}`}
                >
                  {route.text}
                </SettingsLink>
              ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-600">
            <nav className="flex -mb-px">
              {settingsRoutes
                .filter((route) =>
                  route.requiredPermission
                    ? hasPermission(
                        route.requiredPermission,
                        route.permissionType
                      )
                    : true
                )
                .map((route, index) => (
                  <SettingsLink
                    route={route.route}
                    regex={route.regex}
                    key={`standard-settings-link-${index}`}
                  >
                    {route.text}
                  </SettingsLink>
                ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="mt-10 text-white">{children}</div>
    </>
  );
};

export default UserSettings;
