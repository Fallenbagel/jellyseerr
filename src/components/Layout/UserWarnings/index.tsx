import React from 'react';
import Link from 'next/link';
import { ExclamationIcon } from '@heroicons/react/outline';
import { defineMessages, useIntl } from 'react-intl';
import { useUser } from '../../../hooks/useUser';

const messages = defineMessages({
  emailRequired: 'An email address is required.',
  emailInvalid: 'Email address is invalid.',
  passwordRequired: 'A password is required.',
});

interface UserWarningsProps {
  onClick?: () => void;
}

const UserWarnings: React.FC<UserWarningsProps> = ({ onClick }) => {
  const intl = useIntl();
  const { user } = useUser();
  if (!user) {
    return null;
  }

  let res = null;

  //check if a user has warnings
  if (user.warnings.length > 0) {
    user.warnings.forEach((warning) => {
      let link = '';
      let warningText = '';
      let warningTitle = '';
      switch (warning) {
        case 'userEmailRequired':
          link = '/profile/settings/';
          warningTitle = 'Profile is incomplete';
          warningText = intl.formatMessage(messages.emailRequired);
      }

      res = (
        <Link href={link}>
          <a
            onClick={onClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && onClick) {
                onClick();
              }
            }}
            role="button"
            tabIndex={0}
            className="mx-2 mb-2 flex items-center rounded-lg bg-yellow-500 p-2 text-xs text-white ring-1 ring-gray-700 transition duration-300 hover:bg-yellow-400"
          >
            <ExclamationIcon className="h-6 w-6" />
            <div className="flex min-w-0 flex-1 flex-col truncate px-2 last:pr-0">
              <span className="font-bold">{warningTitle}</span>
              <span className="truncate">{warningText}</span>
            </div>
          </a>
        </Link>
      );
    });
  }

  return res;
};

export default UserWarnings;
