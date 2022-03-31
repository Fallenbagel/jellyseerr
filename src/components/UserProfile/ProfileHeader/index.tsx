import Link from 'next/link';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Permission, User, useUser } from '../../../hooks/useUser';
import Button from '../../Common/Button';

const messages = defineMessages({
  settings: 'Edit Settings',
  profile: 'View Profile',
});

interface ProfileHeaderProps {
  user: User;
  isSettingsPage?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isSettingsPage,
}) => {
  const intl = useIntl();
  const { user: loggedInUser, hasPermission } = useUser();

  return (
    <div className="relative z-40 mt-6 mb-12 md:flex md:items-end md:justify-between md:space-x-5">
      <div className="flex items-end space-x-5 justify-items-end">
        <div className="flex-shrink-0">
          <div className="relative">
            <img
              className="w-24 h-24 bg-gray-600 rounded-full"
              src={user.avatar}
              alt=""
            />
            <span
              className="absolute inset-0 rounded-full shadow-inner"
              aria-hidden="true"
            ></span>
          </div>
        </div>
        <div className="pt-1.5">
          <h1 className="flex flex-col mb-1 sm:items-center sm:flex-row">
            <Link
              href={
                user.id === loggedInUser?.id ? '/profile' : `/users/${user.id}`
              }
            >
              <a className="text-lg font-bold text-transparent sm:text-2xl bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-400 hover:to-purple-200">
                {user.displayName}
              </a>
            </Link>
            {user.email && (
              <span className="text-sm text-gray-400 sm:text-lg sm:ml-2">
                ({user.email})
              </span>
            )}
          </h1>
          <p className="text-sm font-medium text-gray-400">
            Joined {intl.formatDate(user.createdAt)} |{' '}
            {intl.formatNumber(user.requestCount)} Requests
          </p>
        </div>
      </div>
      <div className="flex flex-col-reverse mt-6 space-y-4 space-y-reverse justify-stretch sm:flex-row-reverse sm:justify-end sm:space-x-reverse sm:space-y-0 sm:space-x-3 md:mt-0 md:flex-row md:space-x-3">
        {(loggedInUser?.id === user.id ||
          hasPermission(Permission.MANAGE_USERS)) &&
        !isSettingsPage ? (
          <Link
            href={
              loggedInUser?.id === user.id
                ? `/profile/settings`
                : `/users/${user.id}/settings`
            }
            passHref
          >
            <Button as="a">
              <svg
                className="w-5 h-5 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
              {intl.formatMessage(messages.settings)}
            </Button>
          </Link>
        ) : (
          <Link
            href={
              loggedInUser?.id === user.id ? `/profile` : `/users/${user.id}`
            }
            passHref
          >
            <Button as="a">
              <svg
                className="w-5 h-5 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              {intl.formatMessage(messages.profile)}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
