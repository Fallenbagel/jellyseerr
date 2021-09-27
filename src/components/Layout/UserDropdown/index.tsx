import { LogoutIcon } from '@heroicons/react/outline';
import { CogIcon, UserIcon } from '@heroicons/react/solid';
import axios from 'axios';
import Link from 'next/link';
import React, { useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useClickOutside from '../../../hooks/useClickOutside';
import { useUser } from '../../../hooks/useUser';
import Transition from '../../Transition';

const messages = defineMessages({
  myprofile: 'Profile',
  settings: 'Settings',
  signout: 'Sign Out',
});

const UserDropdown: React.FC = () => {
  const intl = useIntl();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, revalidate } = useUser();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  useClickOutside(dropdownRef, () => setDropdownOpen(false));

  const logout = async () => {
    const response = await axios.post('/api/v1/auth/logout');

    if (response.data?.status === 'ok') {
      revalidate();
    }
  };

  return (
    <div className="relative ml-3">
      <div>
        <button
          className="flex items-center max-w-xs text-sm rounded-full ring-1 ring-gray-700 focus:outline-none focus:ring-gray-500 hover:ring-gray-500"
          id="user-menu"
          aria-label="User menu"
          aria-haspopup="true"
          onClick={() => setDropdownOpen(true)}
        >
          <img
            className="w-8 h-8 rounded-full sm:w-10 sm:h-10"
            src={user?.avatar}
            alt=""
          />
        </button>
      </div>
      <Transition
        show={isDropdownOpen}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div
          className="absolute right-0 w-48 mt-2 origin-top-right rounded-md shadow-lg"
          ref={dropdownRef}
        >
          <div
            className="py-1 bg-gray-700 rounded-md ring-1 ring-black ring-opacity-5"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu"
          >
            <Link href={`/profile`}>
              <a
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-200 transition duration-150 ease-in-out hover:bg-gray-600"
                role="menuitem"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setDropdownOpen(false);
                  }
                }}
                onClick={() => setDropdownOpen(false)}
              >
                <UserIcon className="inline w-5 h-5 mr-2" />
                <span>{intl.formatMessage(messages.myprofile)}</span>
              </a>
            </Link>
            <Link href={`/profile/settings`}>
              <a
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-200 transition duration-150 ease-in-out hover:bg-gray-600"
                role="menuitem"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setDropdownOpen(false);
                  }
                }}
                onClick={() => setDropdownOpen(false)}
              >
                <CogIcon className="inline w-5 h-5 mr-2" />
                <span>{intl.formatMessage(messages.settings)}</span>
              </a>
            </Link>
            <a
              href="#"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-200 transition duration-150 ease-in-out hover:bg-gray-600"
              role="menuitem"
              onClick={() => logout()}
            >
              <LogoutIcon className="inline w-5 h-5 mr-2" />
              <span>{intl.formatMessage(messages.signout)}</span>
            </a>
          </div>
        </div>
      </Transition>
    </div>
  );
};

export default UserDropdown;
