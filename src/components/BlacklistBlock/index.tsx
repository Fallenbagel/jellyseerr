import Badge from '@app/components/Common/Badge';
import Button from '@app/components/Common/Button';
import Tooltip from '@app/components/Common/Tooltip';
import { useUser } from '@app/hooks/useUser';
import globalMessages from '@app/i18n/globalMessages';
import { CalendarIcon, TrashIcon, UserIcon } from '@heroicons/react/24/solid';
import type { Blacklist } from '@server/entity/Blacklist';
import axios from 'axios';
import Link from 'next/link';
import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  blacklistedby: 'Blacklisted By',
  remove: 'Remove from blacklist',
  blacklistdate: 'Blacklisted date',
});

interface BlacklistBlockProps {
  blacklistItem: Blacklist;
  onUpdate?: () => void;
}

const BlacklistBlock = ({ blacklistItem, onUpdate }: BlacklistBlockProps) => {
  const { user } = useUser();
  const intl = useIntl();
  const [isUpdating, setIsUpdating] = useState(false);

  const removeFromBlacklist = async (tmdbId: number) => {
    setIsUpdating(true);
    await axios.delete(`/api/v1/blacklist/${tmdbId}`);

    if (onUpdate) {
      onUpdate();
    }

    setIsUpdating(false);
  };

  return (
    <div className="px-4 py-3 text-gray-300">
      <div className="flex items-center justify-between">
        <div className="mr-6 min-w-0 flex-1 flex-col items-center text-sm leading-5">
          <div className="white mb-1 flex flex-nowrap">
            <Tooltip content={intl.formatMessage(messages.blacklistedby)}>
              <UserIcon className="mr-1.5 h-5 w-5 min-w-0 flex-shrink-0" />
            </Tooltip>
            <span className="w-40 truncate md:w-auto">
              <Link
                href={
                  blacklistItem.user.id === user?.id
                    ? '/profile'
                    : `/users/${blacklistItem.user.id}`
                }
              >
                <a className="font-semibold text-gray-100 transition duration-300 hover:text-white hover:underline">
                  {blacklistItem.user.displayName}
                </a>
              </Link>
            </span>
          </div>
        </div>
        <div className="ml-2 flex flex-shrink-0 flex-wrap">
          <Tooltip content={intl.formatMessage(messages.remove)}>
            <Button
              buttonType="danger"
              onClick={() => removeFromBlacklist(blacklistItem.tmdbId)}
              disabled={isUpdating}
            >
              <TrashIcon className="icon-sm" />
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className="mt-2 sm:flex sm:justify-between">
        <div className="sm:flex">
          <div className="mr-6 flex items-center text-sm leading-5">
            <Badge badgeType="danger">
              {intl.formatMessage(globalMessages.blacklisted)}
            </Badge>
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm leading-5 sm:mt-0">
          <Tooltip content={intl.formatMessage(messages.blacklistdate)}>
            <CalendarIcon className="mr-1.5 h-5 w-5 flex-shrink-0" />
          </Tooltip>
          <span>
            {intl.formatDate(blacklistItem.createdAt, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BlacklistBlock;
