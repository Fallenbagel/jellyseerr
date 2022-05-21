import {
  ClockIcon,
  CogIcon,
  ExclamationIcon,
  SparklesIcon,
  UsersIcon,
  XIcon,
} from '@heroicons/react/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { ReactNode, useRef } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useClickOutside from '../../../hooks/useClickOutside';
import { Permission, useUser } from '../../../hooks/useUser';
import Transition from '../../Transition';
import VersionStatus from '../VersionStatus';

const messages = defineMessages({
  dashboard: 'Discover',
  requests: 'Requests',
  issues: 'Issues',
  users: 'Users',
  settings: 'Settings',
});

interface SidebarProps {
  open?: boolean;
  setClosed: () => void;
}

interface SidebarLinkProps {
  href: string;
  svgIcon: ReactNode;
  messagesKey: keyof typeof messages;
  activeRegExp: RegExp;
  as?: string;
  requiredPermission?: Permission | Permission[];
  permissionType?: 'and' | 'or';
}

const SidebarLinks: SidebarLinkProps[] = [
  {
    href: '/',
    messagesKey: 'dashboard',
    svgIcon: <SparklesIcon className="mr-3 h-6 w-6" />,
    activeRegExp: /^\/(discover\/?(movies|tv)?)?$/,
  },
  {
    href: '/requests',
    messagesKey: 'requests',
    svgIcon: <ClockIcon className="mr-3 h-6 w-6" />,
    activeRegExp: /^\/requests/,
  },
  {
    href: '/issues',
    messagesKey: 'issues',
    svgIcon: (
      <ExclamationIcon className="mr-3 h-6 w-6 text-gray-300 transition duration-150 ease-in-out group-hover:text-gray-100 group-focus:text-gray-300" />
    ),
    activeRegExp: /^\/issues/,
    requiredPermission: [
      Permission.MANAGE_ISSUES,
      Permission.CREATE_ISSUES,
      Permission.VIEW_ISSUES,
    ],
    permissionType: 'or',
  },
  {
    href: '/users',
    messagesKey: 'users',
    svgIcon: <UsersIcon className="mr-3 h-6 w-6" />,
    activeRegExp: /^\/users/,
    requiredPermission: Permission.MANAGE_USERS,
  },
  {
    href: '/settings',
    messagesKey: 'settings',
    svgIcon: <CogIcon className="mr-3 h-6 w-6" />,
    activeRegExp: /^\/settings/,
    requiredPermission: Permission.MANAGE_SETTINGS,
  },
];

const Sidebar: React.FC<SidebarProps> = ({ open, setClosed }) => {
  const navRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const intl = useIntl();
  const { hasPermission } = useUser();
  useClickOutside(navRef, () => setClosed());

  return (
    <>
      <div className="lg:hidden">
        <Transition show={open}>
          <div className="fixed inset-0 z-40 flex">
            <Transition
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0">
                <div className="absolute inset-0 bg-gray-900 opacity-90"></div>
              </div>
            </Transition>
            <Transition
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <>
                <div className="sidebar relative flex w-full max-w-xs flex-1 flex-col bg-gray-800">
                  <div className="sidebar-close-button absolute top-0 right-0 -mr-14 p-1">
                    <button
                      className="flex h-12 w-12 items-center justify-center rounded-full focus:bg-gray-600 focus:outline-none"
                      aria-label="Close sidebar"
                      onClick={() => setClosed()}
                    >
                      <XIcon className="h-6 w-6 text-white" />
                    </button>
                  </div>
                  <div
                    ref={navRef}
                    className="flex h-0 flex-1 flex-col overflow-y-auto pt-8 pb-8 sm:pb-4"
                  >
                    <div className="flex flex-shrink-0 items-center px-2">
                      <span className="px-4 text-xl text-gray-50">
                        <a href="/">
                          <img src="/logo_full.svg" alt="Logo" />
                        </a>
                      </span>
                    </div>
                    <nav className="mt-16 flex-1 space-y-4 px-4">
                      {SidebarLinks.filter((link) =>
                        link.requiredPermission
                          ? hasPermission(link.requiredPermission, {
                              type: link.permissionType ?? 'and',
                            })
                          : true
                      ).map((sidebarLink) => {
                        return (
                          <Link
                            key={`mobile-${sidebarLink.messagesKey}`}
                            href={sidebarLink.href}
                            as={sidebarLink.as}
                          >
                            <a
                              onClick={() => setClosed()}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  setClosed();
                                }
                              }}
                              role="button"
                              tabIndex={0}
                              className={`flex items-center rounded-md px-2 py-2 text-base font-medium leading-6 text-white transition duration-150 ease-in-out focus:outline-none
                                ${
                                  router.pathname.match(
                                    sidebarLink.activeRegExp
                                  )
                                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'
                                    : 'hover:bg-gray-700 focus:bg-gray-700'
                                }
                              `}
                            >
                              {sidebarLink.svgIcon}
                              {intl.formatMessage(
                                messages[sidebarLink.messagesKey]
                              )}
                            </a>
                          </Link>
                        );
                      })}
                    </nav>
                    {hasPermission(Permission.ADMIN) && (
                      <div className="px-2">
                        <VersionStatus onClick={() => setClosed()} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-14 flex-shrink-0">
                  {/* <!-- Force sidebar to shrink to fit close icon --> */}
                </div>
              </>
            </Transition>
          </div>
        </Transition>
      </div>

      <div className="fixed top-0 bottom-0 left-0 z-30 hidden lg:flex lg:flex-shrink-0">
        <div className="sidebar flex w-64 flex-col">
          <div className="flex h-0 flex-1 flex-col">
            <div className="flex flex-1 flex-col overflow-y-auto pt-8 pb-4">
              <div className="flex flex-shrink-0 items-center">
                <span className="px-4 text-2xl text-gray-50">
                  <a href="/">
                    <img src="/logo_full.svg" alt="Logo" />
                  </a>
                </span>
              </div>
              <nav className="mt-16 flex-1 space-y-4 px-4">
                {SidebarLinks.filter((link) =>
                  link.requiredPermission
                    ? hasPermission(link.requiredPermission, {
                        type: link.permissionType ?? 'and',
                      })
                    : true
                ).map((sidebarLink) => {
                  return (
                    <Link
                      key={`desktop-${sidebarLink.messagesKey}`}
                      href={sidebarLink.href}
                      as={sidebarLink.as}
                    >
                      <a
                        className={`group flex items-center rounded-md px-2 py-2 text-lg font-medium leading-6 text-white transition duration-150 ease-in-out focus:outline-none
                                ${
                                  router.pathname.match(
                                    sidebarLink.activeRegExp
                                  )
                                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'
                                    : 'hover:bg-gray-700 focus:bg-gray-700'
                                }
                              `}
                      >
                        {sidebarLink.svgIcon}
                        {intl.formatMessage(messages[sidebarLink.messagesKey])}
                      </a>
                    </Link>
                  );
                })}
              </nav>
              {hasPermission(Permission.ADMIN) && (
                <div className="px-2">
                  <VersionStatus />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
