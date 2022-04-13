import {
  CheckIcon,
  PencilIcon,
  RefreshIcon,
  TrashIcon,
  XIcon,
} from '@heroicons/react/solid';
import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { defineMessages, useIntl } from 'react-intl';
import { useToasts } from 'react-toast-notifications';
import useSWR, { mutate } from 'swr';
import {
  MediaRequestStatus,
  MediaStatus,
} from '../../../server/constants/media';
import type { MediaRequest } from '../../../server/entity/MediaRequest';
import type { MovieDetails } from '../../../server/models/Movie';
import type { TvDetails } from '../../../server/models/Tv';
import { Permission, useUser } from '../../hooks/useUser';
import globalMessages from '../../i18n/globalMessages';
import { withProperties } from '../../utils/typeHelpers';
import Badge from '../Common/Badge';
import Button from '../Common/Button';
import CachedImage from '../Common/CachedImage';
import RequestModal from '../RequestModal';
import StatusBadge from '../StatusBadge';

const messages = defineMessages({
  seasons: '{seasonCount, plural, one {Season} other {Seasons}}',
  failedretry: 'Something went wrong while retrying the request.',
  mediaerror: 'The associated title for this request is no longer available.',
  deleterequest: 'Delete Request',
});

const isMovie = (movie: MovieDetails | TvDetails): movie is MovieDetails => {
  return (movie as MovieDetails).title !== undefined;
};

const RequestCardPlaceholder: React.FC = () => {
  return (
    <div className="relative w-72 animate-pulse rounded-xl bg-gray-700 p-4 sm:w-96">
      <div className="w-20 sm:w-28">
        <div className="w-full" style={{ paddingBottom: '150%' }} />
      </div>
    </div>
  );
};

interface RequestCardErrorProps {
  mediaId?: number;
}

const RequestCardError: React.FC<RequestCardErrorProps> = ({ mediaId }) => {
  const { hasPermission } = useUser();
  const intl = useIntl();

  const deleteRequest = async () => {
    await axios.delete(`/api/v1/media/${mediaId}`);
    mutate('/api/v1/request?filter=all&take=10&sort=modified&skip=0');
  };

  return (
    <div className="relative w-72 rounded-xl bg-gray-800 p-4 ring-1 ring-red-500 sm:w-96">
      <div className="w-20 sm:w-28">
        <div className="w-full" style={{ paddingBottom: '150%' }}>
          <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center px-10">
            <div className="w-full whitespace-normal text-center text-xs text-gray-300 sm:text-sm">
              {intl.formatMessage(messages.mediaerror)}
            </div>
            {hasPermission(Permission.MANAGE_REQUESTS) && mediaId && (
              <Button
                buttonType="danger"
                buttonSize="sm"
                className="mt-4"
                onClick={() => deleteRequest()}
              >
                <TrashIcon />
                <span>{intl.formatMessage(messages.deleterequest)}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface RequestCardProps {
  request: MediaRequest;
  onTitleData?: (requestId: number, title: MovieDetails | TvDetails) => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, onTitleData }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
  });
  const intl = useIntl();
  const { user, hasPermission } = useUser();
  const { addToast } = useToasts();
  const [isRetrying, setRetrying] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const url =
    request.type === 'movie'
      ? `/api/v1/movie/${request.media.tmdbId}`
      : `/api/v1/tv/${request.media.tmdbId}`;
  const { data: title, error } = useSWR<MovieDetails | TvDetails>(
    inView ? `${url}` : null
  );
  const {
    data: requestData,
    error: requestError,
    mutate: revalidate,
  } = useSWR<MediaRequest>(`/api/v1/request/${request.id}`, {
    initialData: request,
  });

  const modifyRequest = async (type: 'approve' | 'decline') => {
    const response = await axios.post(`/api/v1/request/${request.id}/${type}`);

    if (response) {
      revalidate();
    }
  };

  const deleteRequest = async () => {
    await axios.delete(`/api/v1/request/${request.id}`);
    mutate('/api/v1/request?filter=all&take=10&sort=modified&skip=0');
  };

  const retryRequest = async () => {
    setRetrying(true);

    try {
      const response = await axios.post(`/api/v1/request/${request.id}/retry`);

      if (response) {
        revalidate();
      }
    } catch (e) {
      addToast(intl.formatMessage(messages.failedretry), {
        autoDismiss: true,
        appearance: 'error',
      });
    } finally {
      setRetrying(false);
    }
  };

  useEffect(() => {
    if (title && onTitleData) {
      onTitleData(request.id, title);
    }
  }, [title, onTitleData, request]);

  if (!title && !error) {
    return (
      <div ref={ref}>
        <RequestCardPlaceholder />
      </div>
    );
  }

  if (!requestData && !requestError) {
    return <RequestCardError />;
  }

  if (!title || !requestData) {
    return <RequestCardError mediaId={requestData?.media.id} />;
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
          revalidate();
          setShowEditModal(false);
        }}
      />
      <div className="relative flex w-72 overflow-hidden rounded-xl bg-gray-800 bg-cover bg-center p-4 text-gray-400 shadow ring-1 ring-gray-700 sm:w-96">
        {title.backdropPath && (
          <div className="absolute inset-0 z-0">
            <CachedImage
              alt=""
              src={`https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/${title.backdropPath}`}
              layout="fill"
              objectFit="cover"
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, rgba(17, 24, 39, 0.47) 0%, rgba(17, 24, 39, 1) 75%)',
              }}
            />
          </div>
        )}
        <div className="relative z-10 flex min-w-0 flex-1 flex-col pr-4">
          <div className="hidden text-xs font-medium text-white sm:flex">
            {(isMovie(title) ? title.releaseDate : title.firstAirDate)?.slice(
              0,
              4
            )}
          </div>
          <Link
            href={
              request.type === 'movie'
                ? `/movie/${requestData.media.tmdbId}`
                : `/tv/${requestData.media.tmdbId}`
            }
          >
            <a className="overflow-hidden overflow-ellipsis whitespace-nowrap text-base font-bold text-white hover:underline sm:text-lg">
              {isMovie(title) ? title.title : title.name}
            </a>
          </Link>
          {hasPermission(
            [Permission.MANAGE_REQUESTS, Permission.REQUEST_VIEW],
            { type: 'or' }
          ) && (
            <div className="card-field">
              <Link href={`/users/${requestData.requestedBy.id}`}>
                <a className="group flex items-center">
                  <img
                    src={requestData.requestedBy.avatar}
                    alt=""
                    className="avatar-sm"
                  />
                  <span className="truncate font-semibold group-hover:text-white group-hover:underline">
                    {requestData.requestedBy.displayName}
                  </span>
                </a>
              </Link>
            </div>
          )}
          {!isMovie(title) && request.seasons.length > 0 && (
            <div className="my-0.5 hidden items-center text-sm sm:my-1 sm:flex">
              <span className="mr-2 font-bold ">
                {intl.formatMessage(messages.seasons, {
                  seasonCount:
                    title.seasons.filter((season) => season.seasonNumber !== 0)
                      .length === request.seasons.length
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
                <div className="hide-scrollbar overflow-x-scroll">
                  {request.seasons.map((season) => (
                    <span key={`season-${season.id}`} className="mr-2">
                      <Badge>{season.seasonNumber}</Badge>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="mt-2 flex items-center text-sm sm:mt-1">
            <span className="mr-2 hidden font-bold sm:block">
              {intl.formatMessage(globalMessages.status)}
            </span>
            {requestData.status === MediaRequestStatus.DECLINED ? (
              <Badge badgeType="danger">
                {intl.formatMessage(globalMessages.declined)}
              </Badge>
            ) : requestData.media[requestData.is4k ? 'status4k' : 'status'] ===
              MediaStatus.UNKNOWN ? (
              <Badge
                badgeType="danger"
                //href={`/${requestData.type}/${requestData.media.tmdbId}?manage=1`}
              >
                {intl.formatMessage(globalMessages.failed)}
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
                tmdbId={requestData.media.tmdbId}
                mediaType={requestData.type}
                plexUrl={
                  requestData.media[
                    requestData.is4k ? 'mediaUrl4k' : 'mediaUrl'
                  ]
                }
              />
            )}
          </div>
          <div className="flex flex-1 items-end space-x-2">
            {requestData.media[requestData.is4k ? 'status4k' : 'status'] ===
              MediaStatus.UNKNOWN &&
              requestData.status !== MediaRequestStatus.DECLINED &&
              hasPermission(Permission.MANAGE_REQUESTS) && (
                <Button
                  buttonType="primary"
                  buttonSize="sm"
                  disabled={isRetrying}
                  onClick={() => retryRequest()}
                >
                  <RefreshIcon
                    className={isRetrying ? 'animate-spin' : ''}
                    style={{ marginRight: '0', animationDirection: 'reverse' }}
                  />
                  <span className="ml-1.5 hidden sm:block">
                    {intl.formatMessage(globalMessages.retry)}
                  </span>
                </Button>
              )}
            {requestData.status === MediaRequestStatus.PENDING &&
              hasPermission(Permission.MANAGE_REQUESTS) && (
                <>
                  <Button
                    buttonType="success"
                    buttonSize="sm"
                    onClick={() => modifyRequest('approve')}
                  >
                    <CheckIcon style={{ marginRight: '0' }} />
                    <span className="ml-1.5 hidden sm:block">
                      {intl.formatMessage(globalMessages.approve)}
                    </span>
                  </Button>
                  <Button
                    buttonType="danger"
                    buttonSize="sm"
                    onClick={() => modifyRequest('decline')}
                  >
                    <XIcon style={{ marginRight: '0' }} />
                    <span className="ml-1.5 hidden sm:block">
                      {intl.formatMessage(globalMessages.decline)}
                    </span>
                  </Button>
                </>
              )}
            {requestData.status === MediaRequestStatus.PENDING &&
              !hasPermission(Permission.MANAGE_REQUESTS) &&
              requestData.requestedBy.id === user?.id &&
              (requestData.type === 'tv' ||
                hasPermission(Permission.REQUEST_ADVANCED)) && (
                <Button
                  buttonType="primary"
                  buttonSize="sm"
                  onClick={() => setShowEditModal(true)}
                  className={`${
                    hasPermission(Permission.MANAGE_REQUESTS) ? 'sm:hidden' : ''
                  }`}
                >
                  <PencilIcon style={{ marginRight: '0' }} />
                  <span className="ml-1.5 hidden sm:block">
                    {intl.formatMessage(globalMessages.edit)}
                  </span>
                </Button>
              )}
            {requestData.status === MediaRequestStatus.PENDING &&
              !hasPermission(Permission.MANAGE_REQUESTS) &&
              requestData.requestedBy.id === user?.id && (
                <Button
                  buttonType="danger"
                  buttonSize="sm"
                  onClick={() => deleteRequest()}
                >
                  <XIcon style={{ marginRight: '0' }} />
                  <span className="ml-1.5 hidden sm:block">
                    {intl.formatMessage(globalMessages.cancel)}
                  </span>
                </Button>
              )}
          </div>
        </div>
        <Link
          href={
            request.type === 'movie'
              ? `/movie/${requestData.media.tmdbId}`
              : `/tv/${requestData.media.tmdbId}`
          }
        >
          <a className="w-20 flex-shrink-0 scale-100 transform-gpu cursor-pointer overflow-hidden rounded-md shadow-sm transition duration-300 hover:scale-105 hover:shadow-md sm:w-28">
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
            />
          </a>
        </Link>
      </div>
    </>
  );
};

export default withProperties(RequestCard, {
  Placeholder: RequestCardPlaceholder,
});
