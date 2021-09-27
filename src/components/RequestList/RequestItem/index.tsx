import {
  CheckIcon,
  PencilIcon,
  RefreshIcon,
  TrashIcon,
  XIcon,
} from '@heroicons/react/solid';
import axios from 'axios';
import Link from 'next/link';
import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { defineMessages, FormattedRelativeTime, useIntl } from 'react-intl';
import { useToasts } from 'react-toast-notifications';
import useSWR from 'swr';
import {
  MediaRequestStatus,
  MediaStatus,
} from '../../../../server/constants/media';
import type { MediaRequest } from '../../../../server/entity/MediaRequest';
import type { MovieDetails } from '../../../../server/models/Movie';
import type { TvDetails } from '../../../../server/models/Tv';
import { Permission, useUser } from '../../../hooks/useUser';
import globalMessages from '../../../i18n/globalMessages';
import Badge from '../../Common/Badge';
import Button from '../../Common/Button';
import CachedImage from '../../Common/CachedImage';
import ConfirmButton from '../../Common/ConfirmButton';
import RequestModal from '../../RequestModal';
import StatusBadge from '../../StatusBadge';

const messages = defineMessages({
  seasons: '{seasonCount, plural, one {Season} other {Seasons}}',
  failedretry: 'Something went wrong while retrying the request.',
  requested: 'Requested',
  requesteddate: 'Requested',
  modified: 'Modified',
  modifieduserdate: '{date} by {user}',
  mediaerror: 'The associated title for this request is no longer available.',
  editrequest: 'Edit Request',
  deleterequest: 'Delete Request',
  cancelRequest: 'Cancel Request',
});

const isMovie = (movie: MovieDetails | TvDetails): movie is MovieDetails => {
  return (movie as MovieDetails).title !== undefined;
};

interface RequestItemErroProps {
  mediaId?: number;
  revalidateList: () => void;
}

const RequestItemError: React.FC<RequestItemErroProps> = ({
  mediaId,
  revalidateList,
}) => {
  const intl = useIntl();
  const { hasPermission } = useUser();

  const deleteRequest = async () => {
    await axios.delete(`/api/v1/media/${mediaId}`);
    revalidateList();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-64 px-10 bg-gray-800 lg:flex-row ring-1 ring-red-500 rounded-xl xl:h-32">
      <span className="text-sm text-center text-gray-300 lg:text-left">
        {intl.formatMessage(messages.mediaerror)}
      </span>
      {hasPermission(Permission.MANAGE_REQUESTS) && mediaId && (
        <div className="mt-4 lg:ml-4 lg:mt-0">
          <Button
            buttonType="danger"
            buttonSize="sm"
            onClick={() => deleteRequest()}
          >
            <TrashIcon />
            <span>{intl.formatMessage(messages.deleterequest)}</span>
          </Button>
        </div>
      )}
    </div>
  );
};

interface RequestItemProps {
  request: MediaRequest;
  revalidateList: () => void;
}

const RequestItem: React.FC<RequestItemProps> = ({
  request,
  revalidateList,
}) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
  });
  const { addToast } = useToasts();
  const intl = useIntl();
  const { user, hasPermission } = useUser();
  const [showEditModal, setShowEditModal] = useState(false);
  const url =
    request.type === 'movie'
      ? `/api/v1/movie/${request.media.tmdbId}`
      : `/api/v1/tv/${request.media.tmdbId}`;
  const { data: title, error } = useSWR<MovieDetails | TvDetails>(
    inView ? `${url}` : null
  );
  const { data: requestData, revalidate, mutate } = useSWR<MediaRequest>(
    `/api/v1/request/${request.id}`,
    {
      initialData: request,
    }
  );

  const [isRetrying, setRetrying] = useState(false);

  const modifyRequest = async (type: 'approve' | 'decline') => {
    const response = await axios.post(`/api/v1/request/${request.id}/${type}`);

    if (response) {
      revalidate();
    }
  };

  const deleteRequest = async () => {
    await axios.delete(`/api/v1/request/${request.id}`);

    revalidateList();
  };

  const retryRequest = async () => {
    setRetrying(true);

    try {
      const result = await axios.post(`/api/v1/request/${request.id}/retry`);
      mutate(result.data);
    } catch (e) {
      addToast(intl.formatMessage(messages.failedretry), {
        autoDismiss: true,
        appearance: 'error',
      });
    } finally {
      setRetrying(false);
    }
  };

  if (!title && !error) {
    return (
      <div
        className="w-full h-64 bg-gray-800 rounded-xl xl:h-32 animate-pulse"
        ref={ref}
      />
    );
  }

  if (!title || !requestData) {
    return (
      <RequestItemError
        mediaId={requestData?.media.id}
        revalidateList={revalidateList}
      />
    );
  }

  return (
    <>
      <RequestModal
        show={showEditModal}
        tmdbId={request.media.tmdbId}
        type={request.type}
        is4k={request.is4k}
        editRequest={request}
        onCancel={() => setShowEditModal(false)}
        onComplete={() => {
          revalidateList();
          setShowEditModal(false);
        }}
      />
      <div className="relative flex flex-col justify-between w-full py-4 overflow-hidden text-gray-400 bg-gray-800 shadow-md ring-1 ring-gray-700 rounded-xl xl:h-32 xl:flex-row">
        {title.backdropPath && (
          <div className="absolute inset-0 z-0 w-full bg-center bg-cover xl:w-2/3">
            <CachedImage
              src={`https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/${title.backdropPath}`}
              alt=""
              layout="fill"
              objectFit="cover"
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, rgba(31, 41, 55, 0.47) 0%, rgba(31, 41, 55, 1) 100%)',
              }}
            />
          </div>
        )}
        <div className="relative flex flex-col justify-between w-full overflow-hidden sm:flex-row">
          <div className="relative z-10 flex items-center w-full pl-4 pr-4 overflow-hidden xl:w-7/12 2xl:w-2/3 sm:pr-0">
            <Link
              href={
                requestData.type === 'movie'
                  ? `/movie/${requestData.media.tmdbId}`
                  : `/tv/${requestData.media.tmdbId}`
              }
            >
              <a className="relative flex-shrink-0 w-12 h-auto overflow-hidden transition duration-300 scale-100 rounded-md sm:w-14 transform-gpu hover:scale-105">
                <CachedImage
                  src={
                    title.posterPath
                      ? `https://image.tmdb.org/t/p/w600_and_h900_bestv2${title.posterPath}`
                      : '/images/overseerr_poster_not_found.png'
                  }
                  alt=""
                  layout="responsive"
                  width={600}
                  height={900}
                  objectFit="cover"
                />
              </a>
            </Link>
            <div className="flex flex-col justify-center pl-2 overflow-hidden xl:pl-4">
              <div className="font-medium pt-0.5 sm:pt-1 text-xs text-white">
                {(isMovie(title)
                  ? title.releaseDate
                  : title.firstAirDate
                )?.slice(0, 4)}
              </div>
              <Link
                href={
                  requestData.type === 'movie'
                    ? `/movie/${requestData.media.tmdbId}`
                    : `/tv/${requestData.media.tmdbId}`
                }
              >
                <a className="min-w-0 mr-2 text-lg font-bold text-white truncate xl:text-xl hover:underline">
                  {isMovie(title) ? title.title : title.name}
                </a>
              </Link>
              {!isMovie(title) && request.seasons.length > 0 && (
                <div className="card-field">
                  <span className="card-field-name">
                    {intl.formatMessage(messages.seasons, {
                      seasonCount:
                        title.seasons.filter(
                          (season) => season.seasonNumber !== 0
                        ).length === request.seasons.length
                          ? 0
                          : request.seasons.length,
                    })}
                  </span>
                  {title.seasons.filter((season) => season.seasonNumber !== 0)
                    .length === request.seasons.length ? (
                    <span className="mr-2 uppercase">
                      <Badge>{intl.formatMessage(globalMessages.all)}</Badge>
                    </span>
                  ) : (
                    <div className="flex overflow-x-scroll hide-scrollbar flex-nowrap">
                      {request.seasons.map((season) => (
                        <span key={`season-${season.id}`} className="mr-2">
                          <Badge>{season.seasonNumber}</Badge>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="z-10 flex flex-col justify-center w-full pr-4 mt-4 ml-4 overflow-hidden text-sm sm:ml-2 sm:mt-0 xl:flex-1 xl:pr-0">
            <div className="card-field">
              <span className="card-field-name">
                {intl.formatMessage(globalMessages.status)}
              </span>
              {requestData.media[requestData.is4k ? 'status4k' : 'status'] ===
                MediaStatus.UNKNOWN ||
              requestData.status === MediaRequestStatus.DECLINED ? (
                <Badge badgeType="danger">
                  {requestData.status === MediaRequestStatus.DECLINED
                    ? intl.formatMessage(globalMessages.declined)
                    : intl.formatMessage(globalMessages.failed)}
                </Badge>
              ) : (
                <StatusBadge
                  status={
                    requestData.media[requestData.is4k ? 'status4k' : 'status']
                  }
                  inProgress={
                    (
                      requestData.media[
                        requestData.is4k ? 'downloadStatus4k' : 'downloadStatus'
                      ] ?? []
                    ).length > 0
                  }
                  is4k={requestData.is4k}
                  plexUrl={requestData.media.plexUrl}
                  plexUrl4k={requestData.media.plexUrl4k}
                />
              )}
            </div>
            <div className="card-field">
              {hasPermission(
                [Permission.MANAGE_REQUESTS, Permission.REQUEST_VIEW],
                { type: 'or' }
              ) ? (
                <>
                  <span className="card-field-name">
                    {intl.formatMessage(messages.requested)}
                  </span>
                  <span className="flex text-sm text-gray-300 truncate">
                    {intl.formatMessage(messages.modifieduserdate, {
                      date: (
                        <FormattedRelativeTime
                          value={Math.floor(
                            (new Date(requestData.createdAt).getTime() -
                              Date.now()) /
                              1000
                          )}
                          updateIntervalInSeconds={1}
                          numeric="auto"
                        />
                      ),
                      user: (
                        <Link href={`/users/${requestData.requestedBy.id}`}>
                          <a className="flex items-center truncate group">
                            <img
                              src={requestData.requestedBy.avatar}
                              alt=""
                              className="ml-1.5 avatar-sm"
                            />
                            <span className="text-sm truncate group-hover:underline">
                              {requestData.requestedBy.displayName}
                            </span>
                          </a>
                        </Link>
                      ),
                    })}
                  </span>
                </>
              ) : (
                <>
                  <span className="card-field-name">
                    {intl.formatMessage(messages.requesteddate)}
                  </span>
                  <span className="flex text-sm text-gray-300 truncate">
                    <FormattedRelativeTime
                      value={Math.floor(
                        (new Date(requestData.createdAt).getTime() -
                          Date.now()) /
                          1000
                      )}
                      updateIntervalInSeconds={1}
                      numeric="auto"
                    />
                  </span>
                </>
              )}
            </div>
            {requestData.modifiedBy && (
              <div className="card-field">
                <span className="card-field-name">
                  {intl.formatMessage(messages.modified)}
                </span>
                <span className="flex text-sm text-gray-300 truncate">
                  {intl.formatMessage(messages.modifieduserdate, {
                    date: (
                      <FormattedRelativeTime
                        value={Math.floor(
                          (new Date(requestData.updatedAt).getTime() -
                            Date.now()) /
                            1000
                        )}
                        updateIntervalInSeconds={1}
                        numeric="auto"
                      />
                    ),
                    user: (
                      <Link href={`/users/${requestData.modifiedBy.id}`}>
                        <a className="flex items-center truncate group">
                          <img
                            src={requestData.modifiedBy.avatar}
                            alt=""
                            className="ml-1.5 avatar-sm"
                          />
                          <span className="text-sm truncate group-hover:underline">
                            {requestData.modifiedBy.displayName}
                          </span>
                        </a>
                      </Link>
                    ),
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="z-10 flex flex-col justify-center w-full pl-4 pr-4 mt-4 space-y-2 xl:mt-0 xl:items-end xl:w-96 xl:pl-0">
          {requestData.media[requestData.is4k ? 'status4k' : 'status'] ===
            MediaStatus.UNKNOWN &&
            requestData.status !== MediaRequestStatus.DECLINED &&
            hasPermission(Permission.MANAGE_REQUESTS) && (
              <Button
                className="w-full"
                buttonType="primary"
                disabled={isRetrying}
                onClick={() => retryRequest()}
              >
                <RefreshIcon
                  className={isRetrying ? 'animate-spin' : ''}
                  style={{ animationDirection: 'reverse' }}
                />
                <span>
                  {intl.formatMessage(
                    isRetrying ? globalMessages.retrying : globalMessages.retry
                  )}
                </span>
              </Button>
            )}
          {requestData.status !== MediaRequestStatus.PENDING &&
            hasPermission(Permission.MANAGE_REQUESTS) && (
              <ConfirmButton
                onClick={() => deleteRequest()}
                confirmText={intl.formatMessage(globalMessages.areyousure)}
                className="w-full"
              >
                <TrashIcon />
                <span>{intl.formatMessage(messages.deleterequest)}</span>
              </ConfirmButton>
            )}
          {requestData.status === MediaRequestStatus.PENDING &&
            hasPermission(Permission.MANAGE_REQUESTS) && (
              <div className="flex flex-row w-full space-x-2">
                <span className="w-full">
                  <Button
                    className="w-full"
                    buttonType="success"
                    onClick={() => modifyRequest('approve')}
                  >
                    <CheckIcon />
                    <span>{intl.formatMessage(globalMessages.approve)}</span>
                  </Button>
                </span>
                <span className="w-full">
                  <Button
                    className="w-full"
                    buttonType="danger"
                    onClick={() => modifyRequest('decline')}
                  >
                    <XIcon />
                    <span>{intl.formatMessage(globalMessages.decline)}</span>
                  </Button>
                </span>
              </div>
            )}
          {requestData.status === MediaRequestStatus.PENDING &&
            (hasPermission(Permission.MANAGE_REQUESTS) ||
              (requestData.requestedBy.id === user?.id &&
                (requestData.type === 'tv' ||
                  hasPermission(Permission.REQUEST_ADVANCED)))) && (
              <span className="w-full">
                <Button
                  className="w-full"
                  buttonType="primary"
                  onClick={() => setShowEditModal(true)}
                >
                  <PencilIcon />
                  <span>{intl.formatMessage(messages.editrequest)}</span>
                </Button>
              </span>
            )}
          {requestData.status === MediaRequestStatus.PENDING &&
            !hasPermission(Permission.MANAGE_REQUESTS) &&
            requestData.requestedBy.id === user?.id && (
              <ConfirmButton
                onClick={() => deleteRequest()}
                confirmText={intl.formatMessage(globalMessages.areyousure)}
                className="w-full"
              >
                <XIcon />
                <span>{intl.formatMessage(messages.cancelRequest)}</span>
              </ConfirmButton>
            )}
        </div>
      </div>
    </>
  );
};

export default RequestItem;
