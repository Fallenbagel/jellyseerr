import React, { useState } from 'react';
import type { MediaRequest } from '../../../server/entity/MediaRequest';
import { FormattedDate, useIntl, defineMessages } from 'react-intl';
import Badge from '../Common/Badge';
import { MediaRequestStatus } from '../../../server/constants/media';
import Button from '../Common/Button';
import axios from 'axios';
import globalMessages from '../../i18n/globalMessages';
import RequestModal from '../RequestModal';
import useRequestOverride from '../../hooks/useRequestOverride';

const messages = defineMessages({
  seasons: 'Seasons',
  requestoverrides: 'Request Overrides',
  server: 'Server',
  profilechanged: 'Profile Changed',
  rootfolder: 'Root Folder',
});

interface RequestBlockProps {
  request: MediaRequest;
  onUpdate?: () => void;
}

const RequestBlock: React.FC<RequestBlockProps> = ({ request, onUpdate }) => {
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
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-col items-center flex-1 min-w-0 mr-6 text-sm leading-5 text-gray-300">
            <div className="flex mb-1 flex-nowrap white">
              <svg
                className="min-w-0 flex-shrink-0 mr-1.5 h-5 w-5 text-gray-300"
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
              <span className="w-40 truncate md:w-auto">
                {request.requestedBy.displayName}
              </span>
            </div>
            {request.modifiedBy && (
              <div className="flex flex-nowrap">
                <svg
                  className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="w-40 truncate md:w-auto">
                  {request.modifiedBy?.displayName}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap flex-shrink-0 ml-2">
            {request.status === MediaRequestStatus.PENDING && (
              <>
                <span className="mr-1">
                  <Button
                    buttonType="success"
                    onClick={() => updateRequest('approve')}
                    disabled={isUpdating}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Button>
                </span>
                <span className="mr-1">
                  <Button
                    buttonType="danger"
                    onClick={() => updateRequest('decline')}
                    disabled={isUpdating}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Button>
                </span>
                <span>
                  <Button
                    buttonType="primary"
                    onClick={() => setShowEditModal(true)}
                    disabled={isUpdating}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </Button>
                </span>
              </>
            )}
            {request.status !== MediaRequestStatus.PENDING && (
              <Button
                buttonType="danger"
                onClick={() => deleteRequest()}
                disabled={isUpdating}
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            )}
          </div>
        </div>
        <div className="mt-2 sm:flex sm:justify-between">
          <div className="sm:flex">
            <div className="flex items-center mr-6 text-sm leading-5 text-gray-300">
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
          <div className="flex items-center mt-2 text-sm leading-5 text-gray-300 sm:mt-0">
            <svg
              className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-300"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              <FormattedDate value={request.createdAt} />
            </span>
          </div>
        </div>
        {(request.seasons ?? []).length > 0 && (
          <div className="flex flex-col mt-2 text-sm">
            <div className="mb-2">{intl.formatMessage(messages.seasons)}</div>
            <div>
              {request.seasons.map((season) => (
                <span
                  key={`season-${season.id}`}
                  className="inline-block mb-1 mr-2"
                >
                  <Badge>{season.seasonNumber}</Badge>
                </span>
              ))}
            </div>
          </div>
        )}
        {(server || profile || rootFolder) && (
          <>
            <div className="mt-4 mb-1 text-sm">
              {intl.formatMessage(messages.requestoverrides)}
            </div>
            <ul className="px-2 text-xs bg-gray-800 divide-y divide-gray-700 rounded-md">
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
