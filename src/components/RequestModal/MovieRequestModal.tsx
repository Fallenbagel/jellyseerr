import React, { useCallback, useState, useEffect } from 'react';
import Modal from '../Common/Modal';
import { useUser } from '../../hooks/useUser';
import { Permission } from '../../../server/lib/permissions';
import { defineMessages, useIntl } from 'react-intl';
import { MediaRequest } from '../../../server/entity/MediaRequest';
import useSWR from 'swr';
import { MovieDetails } from '../../../server/models/Movie';
import { useToasts } from 'react-toast-notifications';
import axios from 'axios';
import {
  MediaStatus,
  MediaRequestStatus,
} from '../../../server/constants/media';
import DownloadIcon from '../../assets/download.svg';
import Alert from '../Common/Alert';
import AdvancedRequester, { RequestOverrides } from './AdvancedRequester';
import globalMessages from '../../i18n/globalMessages';

const messages = defineMessages({
  requestadmin:
    'Your request will be immediately approved. Do you wish to continue?',
  cancelrequest:
    'This will remove your request. Are you sure you want to continue?',
  requestSuccess: '<strong>{title}</strong> successfully requested!',
  requestCancel: 'Request for <strong>{title}</strong> canceled',
  requesttitle: 'Request {title}',
  request4ktitle: 'Request {title} in 4K',
  close: 'Close',
  cancel: 'Cancel Request',
  cancelling: 'Canceling…',
  pendingrequest: 'Pending request for {title}',
  pending4krequest: 'Pending request for {title} in 4K',
  requesting: 'Requesting…',
  request: 'Request',
  request4k: 'Request 4K',
  requestfrom: 'There is a pending request from {username}.',
  request4kfrom: 'There is a pending 4K request from {username}.',
  errorediting: 'Something went wrong while editing the request.',
  requestedited: 'Request edited.',
  autoapproval: 'Automatic Approval',
  requesterror: 'Something went wrong while submitting the request.',
});

interface RequestModalProps extends React.HTMLAttributes<HTMLDivElement> {
  tmdbId: number;
  is4k?: boolean;
  editRequest?: MediaRequest;
  onCancel?: () => void;
  onComplete?: (newStatus: MediaStatus) => void;
  onUpdating?: (isUpdating: boolean) => void;
}

const MovieRequestModal: React.FC<RequestModalProps> = ({
  onCancel,
  onComplete,
  tmdbId,
  onUpdating,
  editRequest,
  is4k = false,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [
    requestOverrides,
    setRequestOverrides,
  ] = useState<RequestOverrides | null>(null);
  const { addToast } = useToasts();
  const { data, error } = useSWR<MovieDetails>(`/api/v1/movie/${tmdbId}`, {
    revalidateOnMount: true,
  });
  const intl = useIntl();
  const { user, hasPermission } = useUser();

  useEffect(() => {
    if (onUpdating) {
      onUpdating(isUpdating);
    }
  }, [isUpdating, onUpdating]);

  const sendRequest = useCallback(async () => {
    setIsUpdating(true);

    try {
      let overrideParams = {};
      if (requestOverrides) {
        overrideParams = {
          serverId: requestOverrides.server,
          profileId: requestOverrides.profile,
          rootFolder: requestOverrides.folder,
          userId: requestOverrides.user?.id,
        };
      }
      const response = await axios.post<MediaRequest>('/api/v1/request', {
        mediaId: data?.id,
        mediaType: 'movie',
        is4k,
        ...overrideParams,
      });

      if (response.data) {
        if (onComplete) {
          onComplete(
            hasPermission(
              is4k ? Permission.AUTO_APPROVE_4K : Permission.AUTO_APPROVE
            ) ||
              hasPermission(
                is4k
                  ? Permission.AUTO_APPROVE_4K_MOVIE
                  : Permission.AUTO_APPROVE_MOVIE
              )
              ? MediaStatus.PROCESSING
              : MediaStatus.PENDING
          );
        }
        addToast(
          <span>
            {intl.formatMessage(messages.requestSuccess, {
              title: data?.title,
              strong: function strong(msg) {
                return <strong>{msg}</strong>;
              },
            })}
          </span>,
          { appearance: 'success', autoDismiss: true }
        );
      }
    } catch (e) {
      addToast(intl.formatMessage(messages.requesterror), {
        appearance: 'error',
        autoDismiss: true,
      });
    } finally {
      setIsUpdating(false);
    }
  }, [data, onComplete, addToast, requestOverrides]);

  const activeRequest = data?.mediaInfo?.requests?.find(
    (request) => request.is4k === !!is4k
  );

  const cancelRequest = async () => {
    setIsUpdating(true);

    try {
      const response = await axios.delete<MediaRequest>(
        `/api/v1/request/${activeRequest?.id}`
      );

      if (response.status === 204) {
        if (onComplete) {
          onComplete(MediaStatus.UNKNOWN);
        }
        addToast(
          <span>
            {intl.formatMessage(messages.requestCancel, {
              title: data?.title,
              strong: function strong(msg) {
                return <strong>{msg}</strong>;
              },
            })}
          </span>,
          { appearance: 'success', autoDismiss: true }
        );
      }
    } catch (e) {
      setIsUpdating(false);
    }
  };

  const updateRequest = async () => {
    setIsUpdating(true);

    try {
      await axios.put(`/api/v1/request/${editRequest?.id}`, {
        mediaType: 'movie',
        serverId: requestOverrides?.server,
        profileId: requestOverrides?.profile,
        rootFolder: requestOverrides?.folder,
        userId: requestOverrides?.user?.id,
      });

      addToast(<span>{intl.formatMessage(messages.requestedited)}</span>, {
        appearance: 'success',
        autoDismiss: true,
      });

      if (onComplete) {
        onComplete(MediaStatus.PENDING);
      }
    } catch (e) {
      addToast(<span>{intl.formatMessage(messages.errorediting)}</span>, {
        appearance: 'error',
        autoDismiss: true,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const isOwner = activeRequest
    ? activeRequest.requestedBy.id === user?.id ||
      hasPermission(Permission.MANAGE_REQUESTS)
    : false;

  if (activeRequest?.status === MediaRequestStatus.PENDING) {
    return (
      <Modal
        loading={!data && !error}
        backgroundClickable
        onCancel={onCancel}
        title={intl.formatMessage(
          is4k ? messages.pending4krequest : messages.pendingrequest,
          {
            title: data?.title,
          }
        )}
        onOk={() => updateRequest()}
        okDisabled={isUpdating}
        okText={intl.formatMessage(globalMessages.edit)}
        okButtonType="primary"
        onSecondary={isOwner ? () => cancelRequest() : undefined}
        secondaryDisabled={isUpdating}
        secondaryText={
          isUpdating
            ? intl.formatMessage(messages.cancelling)
            : intl.formatMessage(messages.cancel)
        }
        secondaryButtonType="danger"
        cancelText={intl.formatMessage(messages.close)}
        iconSvg={<DownloadIcon className="w-6 h-6" />}
      >
        {intl.formatMessage(
          is4k ? messages.request4kfrom : messages.requestfrom,
          {
            username: activeRequest.requestedBy.displayName,
          }
        )}
        {(hasPermission(Permission.REQUEST_ADVANCED) ||
          hasPermission(Permission.MANAGE_REQUESTS)) && (
          <div className="mt-4">
            <AdvancedRequester
              type="movie"
              is4k={is4k}
              requestUser={editRequest?.requestedBy}
              defaultOverrides={
                editRequest
                  ? {
                      folder: editRequest.rootFolder,
                      profile: editRequest.profileId,
                      server: editRequest.serverId,
                    }
                  : undefined
              }
              onChange={(overrides) => {
                setRequestOverrides(overrides);
              }}
            />
          </div>
        )}
      </Modal>
    );
  }

  return (
    <Modal
      loading={!data && !error}
      backgroundClickable
      onCancel={onCancel}
      onOk={sendRequest}
      okDisabled={isUpdating}
      title={intl.formatMessage(
        is4k ? messages.request4ktitle : messages.requesttitle,
        { title: data?.title }
      )}
      okText={
        isUpdating
          ? intl.formatMessage(messages.requesting)
          : intl.formatMessage(is4k ? messages.request4k : messages.request)
      }
      okButtonType={'primary'}
      iconSvg={<DownloadIcon className="w-6 h-6" />}
    >
      {(hasPermission(Permission.MANAGE_REQUESTS) ||
        hasPermission(
          is4k ? Permission.AUTO_APPROVE_4K : Permission.AUTO_APPROVE
        ) ||
        hasPermission(
          is4k
            ? Permission.AUTO_APPROVE_4K_MOVIE
            : Permission.AUTO_APPROVE_MOVIE
        )) && (
        <p className="mt-6">
          <Alert title={intl.formatMessage(messages.autoapproval)} type="info">
            {intl.formatMessage(messages.requestadmin)}
          </Alert>
        </p>
      )}
      {(hasPermission(Permission.REQUEST_ADVANCED) ||
        hasPermission(Permission.MANAGE_REQUESTS)) && (
        <AdvancedRequester
          type="movie"
          is4k={is4k}
          onChange={(overrides) => {
            setRequestOverrides(overrides);
          }}
        />
      )}
    </Modal>
  );
};

export default MovieRequestModal;
