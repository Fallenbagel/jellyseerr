import axios from 'axios';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  MediaRequestStatus,
  MediaStatus,
} from '../../../server/constants/media';
import Media from '../../../server/entity/Media';
import { MediaRequest } from '../../../server/entity/MediaRequest';
import useSettings from '../../hooks/useSettings';
import { Permission, useUser } from '../../hooks/useUser';
import ButtonWithDropdown from '../Common/ButtonWithDropdown';
import RequestModal from '../RequestModal';

const messages = defineMessages({
  viewrequest: 'View Request',
  viewrequest4k: 'View 4K Request',
  request: 'Request',
  request4k: 'Request 4K',
  requestmore: 'Request More',
  requestmore4k: 'Request More 4K',
  approverequest: 'Approve Request',
  approverequest4k: 'Approve 4K Request',
  declinerequest: 'Decline Request',
  declinerequest4k: 'Decline 4K Request',
  approverequests:
    'Approve {requestCount} {requestCount, plural, one {Request} other {Requests}}',
  declinerequests:
    'Decline {requestCount} {requestCount, plural, one {Request} other {Requests}}',
  approve4krequests:
    'Approve {requestCount} 4K {requestCount, plural, one {Request} other {Requests}}',
  decline4krequests:
    'Decline {requestCount} 4K {requestCount, plural, one {Request} other {Requests}}',
});

interface ButtonOption {
  id: string;
  text: string;
  action: () => void;
  svg?: React.ReactNode;
}

interface RequestButtonProps {
  mediaType: 'movie' | 'tv';
  onUpdate: () => void;
  tmdbId: number;
  media?: Media;
  isShowComplete?: boolean;
  is4kShowComplete?: boolean;
}

const RequestButton: React.FC<RequestButtonProps> = ({
  tmdbId,
  onUpdate,
  media,
  mediaType,
  isShowComplete = false,
  is4kShowComplete = false,
}) => {
  const intl = useIntl();
  const settings = useSettings();
  const { hasPermission } = useUser();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showRequest4kModal, setShowRequest4kModal] = useState(false);

  const activeRequest = media?.requests.find(
    (request) => request.status === MediaRequestStatus.PENDING && !request.is4k
  );
  const active4kRequest = media?.requests.find(
    (request) => request.status === MediaRequestStatus.PENDING && request.is4k
  );

  // All pending
  const activeRequests = media?.requests.filter(
    (request) => request.status === MediaRequestStatus.PENDING && !request.is4k
  );

  const active4kRequests = media?.requests.filter(
    (request) => request.status === MediaRequestStatus.PENDING && request.is4k
  );

  const modifyRequest = async (
    request: MediaRequest,
    type: 'approve' | 'decline'
  ) => {
    const response = await axios.post(`/api/v1/request/${request.id}/${type}`);

    if (response) {
      onUpdate();
    }
  };

  const modifyRequests = async (
    requests: MediaRequest[],
    type: 'approve' | 'decline'
  ): Promise<void> => {
    if (!requests) {
      return;
    }

    await Promise.all(
      requests.map(async (request) => {
        return axios.post(`/api/v1/request/${request.id}/${type}`);
      })
    );

    onUpdate();
  };

  const buttons: ButtonOption[] = [];
  if (
    (!media || media.status === MediaStatus.UNKNOWN) &&
    hasPermission(Permission.REQUEST)
  ) {
    buttons.push({
      id: 'request',
      text: intl.formatMessage(messages.request),
      action: () => {
        setShowRequestModal(true);
      },
      svg: (
        <svg
          className="w-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
      ),
    });
  }

  if (
    hasPermission(Permission.REQUEST) &&
    mediaType === 'tv' &&
    media &&
    media.status !== MediaStatus.AVAILABLE &&
    media.status !== MediaStatus.UNKNOWN &&
    !isShowComplete
  ) {
    buttons.push({
      id: 'request-more',
      text: intl.formatMessage(messages.requestmore),
      action: () => {
        setShowRequestModal(true);
      },
      svg: (
        <svg
          className="w-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
      ),
    });
  }

  if (
    (!media || media.status4k === MediaStatus.UNKNOWN) &&
    (hasPermission(Permission.REQUEST_4K) ||
      (mediaType === 'movie' && hasPermission(Permission.REQUEST_4K_MOVIE)) ||
      (mediaType === 'tv' && hasPermission(Permission.REQUEST_4K_TV))) &&
    ((settings.currentSettings.movie4kEnabled && mediaType === 'movie') ||
      (settings.currentSettings.series4kEnabled && mediaType === 'tv'))
  ) {
    buttons.push({
      id: 'request4k',
      text: intl.formatMessage(messages.request4k),
      action: () => {
        setShowRequest4kModal(true);
      },
      svg: (
        <svg
          className="w-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
      ),
    });
  }

  if (
    mediaType === 'tv' &&
    (hasPermission(Permission.REQUEST_4K) ||
      (mediaType === 'tv' && hasPermission(Permission.REQUEST_4K_TV))) &&
    media &&
    media.status4k !== MediaStatus.AVAILABLE &&
    media.status4k !== MediaStatus.UNKNOWN &&
    !is4kShowComplete &&
    settings.currentSettings.series4kEnabled
  ) {
    buttons.push({
      id: 'request-more-4k',
      text: intl.formatMessage(messages.requestmore4k),
      action: () => {
        setShowRequest4kModal(true);
      },
      svg: (
        <svg
          className="w-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
      ),
    });
  }

  if (
    activeRequest &&
    mediaType === 'movie' &&
    hasPermission(Permission.REQUEST)
  ) {
    buttons.push({
      id: 'active-request',
      text: intl.formatMessage(messages.viewrequest),
      action: () => setShowRequestModal(true),
      svg: (
        <svg
          className="w-4 mr-1"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      ),
    });
  }

  if (
    active4kRequest &&
    mediaType === 'movie' &&
    (hasPermission(Permission.REQUEST_4K) ||
      hasPermission(Permission.REQUEST_4K_MOVIE))
  ) {
    buttons.push({
      id: 'active-4k-request',
      text: intl.formatMessage(messages.viewrequest4k),
      action: () => setShowRequest4kModal(true),
      svg: (
        <svg
          className="w-4 mr-1"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      ),
    });
  }

  if (
    activeRequest &&
    hasPermission(Permission.MANAGE_REQUESTS) &&
    mediaType === 'movie'
  ) {
    buttons.push(
      {
        id: 'approve-request',
        text: intl.formatMessage(messages.approverequest),
        action: () => {
          modifyRequest(activeRequest, 'approve');
        },
        svg: (
          <svg
            className="w-4 mr-1"
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
        ),
      },
      {
        id: 'decline-request',
        text: intl.formatMessage(messages.declinerequest),
        action: () => {
          modifyRequest(activeRequest, 'decline');
        },
        svg: (
          <svg
            className="w-4 mr-1"
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
        ),
      }
    );
  }

  if (
    activeRequests &&
    activeRequests.length > 0 &&
    hasPermission(Permission.MANAGE_REQUESTS) &&
    mediaType === 'tv'
  ) {
    buttons.push(
      {
        id: 'approve-request-batch',
        text: intl.formatMessage(messages.approverequests, {
          requestCount: activeRequests.length,
        }),
        action: () => {
          modifyRequests(activeRequests, 'approve');
        },
        svg: (
          <svg
            className="w-4 mr-1"
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
        ),
      },
      {
        id: 'decline-request-batch',
        text: intl.formatMessage(messages.declinerequests, {
          requestCount: activeRequests.length,
        }),
        action: () => {
          modifyRequests(activeRequests, 'decline');
        },
        svg: (
          <svg
            className="w-4 mr-1"
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
        ),
      }
    );
  }

  if (
    active4kRequest &&
    hasPermission(Permission.MANAGE_REQUESTS) &&
    mediaType === 'movie'
  ) {
    buttons.push(
      {
        id: 'approve-4k-request',
        text: intl.formatMessage(messages.approverequest4k),
        action: () => {
          modifyRequest(active4kRequest, 'approve');
        },
        svg: (
          <svg
            className="w-4 mr-1"
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
        ),
      },
      {
        id: 'decline-4k-request',
        text: intl.formatMessage(messages.declinerequest4k),
        action: () => {
          modifyRequest(active4kRequest, 'decline');
        },
        svg: (
          <svg
            className="w-4 mr-1"
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
        ),
      }
    );
  }

  if (
    active4kRequests &&
    active4kRequests.length > 0 &&
    hasPermission(Permission.MANAGE_REQUESTS) &&
    mediaType === 'tv'
  ) {
    buttons.push(
      {
        id: 'approve-request-batch',
        text: intl.formatMessage(messages.approve4krequests, {
          requestCount: active4kRequests.length,
        }),
        action: () => {
          modifyRequests(active4kRequests, 'approve');
        },
        svg: (
          <svg
            className="w-4 mr-1"
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
        ),
      },
      {
        id: 'decline-request-batch',
        text: intl.formatMessage(messages.decline4krequests, {
          requestCount: active4kRequests.length,
        }),
        action: () => {
          modifyRequests(active4kRequests, 'decline');
        },
        svg: (
          <svg
            className="w-4 mr-1"
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
        ),
      }
    );
  }

  const [buttonOne, ...others] = buttons;

  if (!buttonOne) {
    return null;
  }

  return (
    <>
      <RequestModal
        tmdbId={tmdbId}
        show={showRequestModal}
        type={mediaType}
        onComplete={() => {
          onUpdate();
          setShowRequestModal(false);
        }}
        onCancel={() => setShowRequestModal(false)}
      />
      <RequestModal
        tmdbId={tmdbId}
        show={showRequest4kModal}
        type={mediaType}
        is4k
        onComplete={() => {
          onUpdate();
          setShowRequest4kModal(false);
        }}
        onCancel={() => setShowRequest4kModal(false)}
      />
      <ButtonWithDropdown
        text={
          <>
            {buttonOne.svg ?? null}
            {buttonOne.text}
          </>
        }
        onClick={buttonOne.action}
        className="ml-2"
      >
        {others && others.length > 0
          ? others.map((button) => (
              <ButtonWithDropdown.Item
                onClick={button.action}
                key={`request-option-${button.id}`}
              >
                {button.svg}
                {button.text}
              </ButtonWithDropdown.Item>
            ))
          : null}
      </ButtonWithDropdown>
    </>
  );
};

export default RequestButton;
