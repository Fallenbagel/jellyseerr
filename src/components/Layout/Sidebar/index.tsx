import {
  ClockIcon,
  CogIcon,
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
}

const SidebarLinks: SidebarLinkProps[] = [
  {
    href: '/',
    messagesKey: 'dashboard',
    svgIcon: <SparklesIcon className="w-6 h-6 mr-3" />,
    activeRegExp: /^\/(discover\/?(movies|tv)?)?$/,
  },
  {
    href: '/requests',
    messagesKey: 'requests',
    svgIcon: <ClockIcon className="w-6 h-6 mr-3" />,
    activeRegExp: /^\/requests/,
  },
  {
    href: '/users',
    messagesKey: 'users',
    svgIcon: <UsersIcon className="w-6 h-6 mr-3" />,
    activeRegExp: /^\/users/,
    requiredPermission: Permission.MANAGE_USERS,
  },
  {
    href: '/settings',
    messagesKey: 'settings',
    svgIcon: <CogIcon className="w-6 h-6 mr-3" />,
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
                <div className="relative flex flex-col flex-1 w-full max-w-xs bg-gray-800 sidebar">
                  <div className="absolute top-0 right-0 p-1 sidebar-close-button -mr-14">
                    <button
                      className="flex items-center justify-center w-12 h-12 rounded-full focus:outline-none focus:bg-gray-600"
                      aria-label="Close sidebar"
                      onClick={() => setClosed()}
                    >
                      <XIcon className="w-6 h-6 text-white" />
                    </button>
                  </div>
                  <div
                    ref={navRef}
                    className="flex flex-col flex-1 h-0 pt-8 pb-8 overflow-y-auto sm:pb-4"
                  >
                    <div className="flex items-center flex-shrink-0 px-2">
                      <span className="px-4 text-xl text-gray-50">
                        <a href="/">
                          <img src="/logo_full.svg" alt="Logo" />
                        </a>
                      </span>
                    </div>
                    <nav className="flex-1 px-4 mt-16 space-y-4">
                      {SidebarLinks.filter((link) =>
                        link.requiredPermission
                          ? hasPermission(link.requiredPermission)
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
                              className={`flex items-center px-2 py-2 text-base leading-6 font-medium rounded-md text-white focus:outline-none transition ease-in-out duration-150
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
                <div className="flex-shrink-0 w-14">
                  {/* <!-- Force sidebar to shrink to fit close icon --> */}
                </div>
              </>
            </Transition>
          </div>
        </Transition>
      </div>

      <div className="fixed top-0 bottom-0 left-0 z-30 hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 sidebar">
          <div className="flex flex-col flex-1 h-0">
            <div className="flex flex-col flex-1 pt-8 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0">
                <span className="px-4 text-2xl text-gray-50">
                  <a href="/">
                    <img src="/logo_full.svg" alt="Logo" />
                  </a>
                </span>
              </div>
              <nav className="flex-1 px-4 mt-16 space-y-4">
                {SidebarLinks.filter((link) =>
                  link.requiredPermission
                    ? hasPermission(link.requiredPermission)
                    : true
                ).map((sidebarLink) => {
                  return (
                    <Link
                      key={`desktop-${sidebarLink.messagesKey}`}
                      href={sidebarLink.href}
                      as={sidebarLink.as}
                    >
                      <a
                        className={`flex group items-center px-2 py-2 text-lg leading-6 font-medium rounded-md text-white focus:outline-none transition ease-in-out duration-150
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
