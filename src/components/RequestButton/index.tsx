import { DownloadIcon } from '@heroicons/react/outline';
import {
  CheckIcon,
  InformationCircleIcon,
  XIcon,
} from '@heroicons/react/solid';
import axios from 'axios';
import React, { useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  MediaRequestStatus,
  MediaStatus,
} from '../../../server/constants/media';
import Media from '../../../server/entity/Media';
import { MediaRequest } from '../../../server/entity/MediaRequest';
import useSettings from '../../hooks/useSettings';
import { Permission, useUser } from '../../hooks/useUser';
import globalMessages from '../../i18n/globalMessages';
import ButtonWithDropdown from '../Common/ButtonWithDropdown';
import RequestModal from '../RequestModal';

const messages = defineMessages({
  viewrequest: 'View Request',
  viewrequest4k: 'View 4K Request',
  requestmore: 'Request More',
  requestmore4k: 'Request More in 4K',
  approverequest: 'Approve Request',
  approverequest4k: 'Approve 4K Request',
  declinerequest: 'Decline Request',
  declinerequest4k: 'Decline 4K Request',
  approverequests:
    'Approve {requestCount, plural, one {Request} other {{requestCount} Requests}}',
  declinerequests:
    'Decline {requestCount, plural, one {Request} other {{requestCount} Requests}}',
  approve4krequests:
    'Approve {requestCount, plural, one {4K Request} other {{requestCount} 4K Requests}}',
  decline4krequests:
    'Decline {requestCount, plural, one {4K Request} other {{requestCount} 4K Requests}}',
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
  const { user, hasPermission } = useUser();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showRequest4kModal, setShowRequest4kModal] = useState(false);
  const [editRequest, setEditRequest] = useState(false);

  // All pending requests
  const activeRequests = media?.requests.filter(
    (request) => request.status === MediaRequestStatus.PENDING && !request.is4k
  );
  const active4kRequests = media?.requests.filter(
    (request) => request.status === MediaRequestStatus.PENDING && request.is4k
  );

  const activeRequest = useMemo(() => {
    return activeRequests && activeRequests.length > 0
      ? activeRequests.find((request) => request.requestedBy.id === user?.id) ??
          activeRequests[0]
      : undefined;
  }, [activeRequests, user]);

  const active4kRequest = useMemo(() => {
    return active4kRequests && active4kRequests.length > 0
      ? active4kRequests.find(
          (request) => request.requestedBy.id === user?.id
        ) ?? active4kRequests[0]
      : undefined;
  }, [active4kRequests, user]);

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
    hasPermission(
      [
        Permission.REQUEST,
        mediaType === 'movie'
          ? Permission.REQUEST_MOVIE
          : Permission.REQUEST_TV,
      ],
      { type: 'or' }
    )
  ) {
    buttons.push({
      id: 'request',
      text: intl.formatMessage(globalMessages.request),
      action: () => {
        setEditRequest(false);
        setShowRequestModal(true);
      },
      svg: <DownloadIcon />,
    });
  }

  if (
    (!media || media.status4k === MediaStatus.UNKNOWN) &&
    hasPermission(
      [
        Permission.REQUEST_4K,
        mediaType === 'movie'
          ? Permission.REQUEST_4K_MOVIE
          : Permission.REQUEST_4K_TV,
      ],
      { type: 'or' }
    ) &&
    ((settings.currentSettings.movie4kEnabled && mediaType === 'movie') ||
      (settings.currentSettings.series4kEnabled && mediaType === 'tv'))
  ) {
    buttons.push({
      id: 'request4k',
      text: intl.formatMessage(globalMessages.request4k),
      action: () => {
        setEditRequest(false);
        setShowRequest4kModal(true);
      },
      svg: <DownloadIcon />,
    });
  }

  if (
    activeRequest &&
    (activeRequest.requestedBy.id === user?.id ||
      (activeRequests?.length === 1 &&
        hasPermission(Permission.MANAGE_REQUESTS)))
  ) {
    buttons.push({
      id: 'active-request',
      text: intl.formatMessage(messages.viewrequest),
      action: () => {
        setEditRequest(true);
        setShowRequestModal(true);
      },
      svg: <InformationCircleIcon />,
    });
  }

  if (
    active4kRequest &&
    (active4kRequest.requestedBy.id === user?.id ||
      (active4kRequests?.length === 1 &&
        hasPermission(Permission.MANAGE_REQUESTS)))
  ) {
    buttons.push({
      id: 'active-4k-request',
      text: intl.formatMessage(messages.viewrequest4k),
      action: () => {
        setEditRequest(true);
        setShowRequest4kModal(true);
      },
      svg: <InformationCircleIcon />,
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
        svg: <CheckIcon />,
      },
      {
        id: 'decline-request',
        text: intl.formatMessage(messages.declinerequest),
        action: () => {
          modifyRequest(activeRequest, 'decline');
        },
        svg: <XIcon />,
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
        svg: <CheckIcon />,
      },
      {
        id: 'decline-request-batch',
        text: intl.formatMessage(messages.declinerequests, {
          requestCount: activeRequests.length,
        }),
        action: () => {
          modifyRequests(activeRequests, 'decline');
        },
        svg: <XIcon />,
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
        svg: <CheckIcon />,
      },
      {
        id: 'decline-4k-request',
        text: intl.formatMessage(messages.declinerequest4k),
        action: () => {
          modifyRequest(active4kRequest, 'decline');
        },
        svg: <XIcon />,
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
        id: 'approve-4k-request-batch',
        text: intl.formatMessage(messages.approve4krequests, {
          requestCount: active4kRequests.length,
        }),
        action: () => {
          modifyRequests(active4kRequests, 'approve');
        },
        svg: <CheckIcon />,
      },
      {
        id: 'decline-4k-request-batch',
        text: intl.formatMessage(messages.decline4krequests, {
          requestCount: active4kRequests.length,
        }),
        action: () => {
          modifyRequests(active4kRequests, 'decline');
        },
        svg: <XIcon />,
      }
    );
  }

  if (
    mediaType === 'tv' &&
    (!activeRequest || activeRequest.requestedBy.id !== user?.id) &&
    hasPermission([Permission.REQUEST, Permission.REQUEST_TV], {
      type: 'or',
    }) &&
    media &&
    media.status !== MediaStatus.AVAILABLE &&
    media.status !== MediaStatus.UNKNOWN &&
    !isShowComplete
  ) {
    buttons.push({
      id: 'request-more',
      text: intl.formatMessage(messages.requestmore),
      action: () => {
        setEditRequest(false);
        setShowRequestModal(true);
      },
      svg: <DownloadIcon />,
    });
  }

  if (
    mediaType === 'tv' &&
    (!active4kRequest || active4kRequest.requestedBy.id !== user?.id) &&
    hasPermission([Permission.REQUEST_4K, Permission.REQUEST_4K_TV], {
      type: 'or',
    }) &&
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
        setEditRequest(false);
        setShowRequest4kModal(true);
      },
      svg: <DownloadIcon />,
    });
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
        editRequest={editRequest ? activeRequest : undefined}
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
        editRequest={editRequest ? active4kRequest : undefined}
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
            {buttonOne.svg}
            <span>{buttonOne.text}</span>
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
                <span>{button.text}</span>
              </ButtonWithDropdown.Item>
            ))
          : null}
      </ButtonWithDropdown>
    </>
  );
};

export default RequestButton;
