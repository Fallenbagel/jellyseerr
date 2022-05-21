import {
  CalendarIcon,
  CheckIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  XIcon,
} from '@heroicons/react/solid';
import axios from 'axios';
import Link from 'next/link';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { MediaRequestStatus } from '../../../server/constants/media';
import type { MediaRequest } from '../../../server/entity/MediaRequest';
import useRequestOverride from '../../hooks/useRequestOverride';
import { useUser } from '../../hooks/useUser';
import globalMessages from '../../i18n/globalMessages';
import Badge from '../Common/Badge';
import Button from '../Common/Button';
import RequestModal from '../RequestModal';

const messages = defineMessages({
  seasons: '{seasonCount, plural, one {Season} other {Seasons}}',
  requestoverrides: 'Request Overrides',
  server: 'Destination Server',
  profilechanged: 'Quality Profile',
  rootfolder: 'Root Folder',
});

interface RequestBlockProps {
  request: MediaRequest;
  onUpdate?: () => void;
}

const RequestBlock: React.FC<RequestBlockProps> = ({ request, onUpdate }) => {
  const { user } = useUser();
  const intl = useIntl();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { profile, rootFolder, server } = useRequestOverride(request);

  const updateRequest = async (type: 'approve' | 'decline'): Promise<void> => {
    setIsUpdating(true);
    await axios.post(`/api/v1/request/${request.id}/${type}`);

    if (onUpdate) {
      onUpdate();
    }
    setIsUpdating(false);
  };

  const deleteRequest = async () => {
    setIsUpdating(true);
    await axios.delete(`/api/v1/request/${request.id}`);

    if (onUpdate) {
      onUpdate();
    }

    setIsUpdating(false);
  };

  return (
    <div className="block">
      <RequestModal
        show={showEditModal}
        tmdbId={request.media.tmdbId}
        type={request.type}
        is4k={request.is4k}
        editRequest={request}
        onCancel={() => setShowEditModal(false)}
        onComplete={() => {
          if (onUpdate) {
            onUpdate();
          }
          setShowEditModal(false);
        }}
      />
      <div className="px-4 py-3 text-gray-300">
        <div className="flex items-center justify-between">
          <div className="mr-6 min-w-0 flex-1 flex-col items-center text-sm leading-5">
            <div className="white mb-1 flex flex-nowrap">
              <UserIcon className="mr-1.5 h-5 w-5 min-w-0 flex-shrink-0" />
              <span className="w-40 truncate md:w-auto">
                <Link
                  href={
                    request.requestedBy.id === user?.id
                      ? '/profile'
                      : `/users/${request.requestedBy.id}`
                  }
                >
                  <a className="font-semibold text-gray-100 transition duration-300 hover:text-white hover:underline">
                    {request.requestedBy.displayName}
                  </a>
                </Link>
              </span>
            </div>
            {request.modifiedBy && (
              <div className="flex flex-nowrap">
                <EyeIcon className="mr-1.5 h-5 w-5 flex-shrink-0" />
                <span className="w-40 truncate md:w-auto">
                  <Link
                    href={
                      request.modifiedBy.id === user?.id
                        ? '/profile'
                        : `/users/${request.modifiedBy.id}`
                    }
                  >
                    <a className="font-semibold text-gray-100 transition duration-300 hover:text-white hover:underline">
                      {request.modifiedBy.displayName}
                    </a>
                  </Link>
                </span>
              </div>
            )}
          </div>
          <div className="ml-2 flex flex-shrink-0 flex-wrap">
            {request.status === MediaRequestStatus.PENDING && (
              <>
                <Button
                  buttonType="success"
                  className="mr-1"
                  onClick={() => updateRequest('approve')}
                  disabled={isUpdating}
                >
                  <CheckIcon className="icon-sm" />
                </Button>
                <Button
                  buttonType="danger"
                  className="mr-1"
                  onClick={() => updateRequest('decline')}
                  disabled={isUpdating}
                >
                  <XIcon />
                </Button>
                <Button
                  buttonType="primary"
                  onClick={() => setShowEditModal(true)}
                  disabled={isUpdating}
                >
                  <PencilIcon className="icon-sm" />
                </Button>
              </>
            )}
            {request.status !== MediaRequestStatus.PENDING && (
              <Button
                buttonType="danger"
                onClick={() => deleteRequest()}
                disabled={isUpdating}
              >
                <TrashIcon className="icon-sm" />
              </Button>
            )}
          </div>
        </div>
        <div className="mt-2 sm:flex sm:justify-between">
          <div className="sm:flex">
            <div className="mr-6 flex items-center text-sm leading-5">
              {request.is4k && (
                <span className="mr-1">
                  <Badge badgeType="warning">4K</Badge>
                </span>
              )}
              {request.status === MediaRequestStatus.APPROVED && (
                <Badge badgeType="success">
                  {intl.formatMessage(globalMessages.approved)}
                </Badge>
              )}
              {request.status === MediaRequestStatus.DECLINED && (
                <Badge badgeType="danger">
                  {intl.formatMessage(globalMessages.declined)}
                </Badge>
              )}
              {request.status === MediaRequestStatus.PENDING && (
                <Badge badgeType="warning">
                  {intl.formatMessage(globalMessages.pending)}
                </Badge>
              )}
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm leading-5 sm:mt-0">
            <CalendarIcon className="mr-1.5 h-5 w-5 flex-shrink-0" />
            <span>
              {intl.formatDate(request.createdAt, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
        {(request.seasons ?? []).length > 0 && (
          <div className="mt-2 flex flex-col text-sm">
            <div className="mb-1 font-medium">
              {intl.formatMessage(messages.seasons, {
                seasonCount: request.seasons.length,
              })}
            </div>
            <div>
              {request.seasons.map((season) => (
                <span
                  key={`season-${season.id}`}
                  className="mb-1 mr-2 inline-block"
                >
                  <Badge>{season.seasonNumber}</Badge>
                </span>
              ))}
            </div>
          </div>
        )}
        {(server || profile !== null || rootFolder) && (
          <>
            <div className="mt-4 mb-1 text-sm">
              {intl.formatMessage(messages.requestoverrides)}
            </div>
            <ul className="divide-y divide-gray-700 rounded-md bg-gray-800 px-2 text-xs">
              {server && (
                <li className="flex justify-between px-1 py-2">
                  <span className="font-bold">
                    {intl.formatMessage(messages.server)}
                  </span>
                  <span>{server}</span>
                </li>
              )}
              {profile !== null && (
                <li className="flex justify-between px-1 py-2">
                  <span className="font-bold">
                    {intl.formatMessage(messages.profilechanged)}
                  </span>
                  <span>ID {profile}</span>
                </li>
              )}
              {rootFolder && (
                <li className="flex justify-between px-1 py-2">
                  <span className="mr-2 font-bold">
                    {intl.formatMessage(messages.rootfolder)}
                  </span>
                  <span>{rootFolder}</span>
                </li>
              )}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default RequestBlock;
