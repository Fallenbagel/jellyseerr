import React, { useContext, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import type { MediaRequest } from '../../../../server/entity/MediaRequest';
import {
  useIntl,
  FormattedDate,
  FormattedRelativeTime,
  defineMessages,
} from 'react-intl';
import { useUser, Permission } from '../../../hooks/useUser';
import { LanguageContext } from '../../../context/LanguageContext';
import type { MovieDetails } from '../../../../server/models/Movie';
import type { TvDetails } from '../../../../server/models/Tv';
import useSWR from 'swr';
import Badge from '../../Common/Badge';
import StatusBadge from '../../StatusBadge';
import Table from '../../Common/Table';
import {
  MediaRequestStatus,
  MediaStatus,
} from '../../../../server/constants/media';
import Button from '../../Common/Button';
import axios from 'axios';
import globalMessages from '../../../i18n/globalMessages';
import Link from 'next/link';
import { useToasts } from 'react-toast-notifications';
import RequestModal from '../../RequestModal';

const messages = defineMessages({
  seasons: 'Seasons',
  notavailable: 'N/A',
  failedretry: 'Something went wrong while retrying the request.',
});

const isMovie = (movie: MovieDetails | TvDetails): movie is MovieDetails => {
  return (movie as MovieDetails).title !== undefined;
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
  const { hasPermission } = useUser();
  const [showEditModal, setShowEditModal] = useState(false);
  const { locale } = useContext(LanguageContext);
  const url =
    request.type === 'movie'
      ? `/api/v1/movie/${request.media.tmdbId}`
      : `/api/v1/tv/${request.media.tmdbId}`;
  const { data: title, error } = useSWR<MovieDetails | TvDetails>(
    inView ? `${url}?language=${locale}` : null
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
      <tr className="w-full h-24 animate-pulse" ref={ref}>
        <td colSpan={6}></td>
      </tr>
    );
  }

  if (!title || !requestData) {
    return (
      <tr className="w-full h-24 animate-pulse">
        <td colSpan={6}></td>
      </tr>
    );
  }

  return (
    <tr className="relative w-full h-24 p-2">
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
      <Table.TD>
        <div className="flex items-center">
          <Link
            href={
              request.type === 'movie'
                ? `/movie/${request.media.tmdbId}`
                : `/tv/${request.media.tmdbId}`
            }
          >
            <a className="flex-shrink-0 hidden mr-4 sm:block">
              <img
                src={
                  title.posterPath
                    ? `//image.tmdb.org/t/p/w600_and_h900_bestv2${title.posterPath}`
                    : '/images/overseerr_poster_not_found.png'
                }
                alt=""
                className="w-12 transition duration-300 scale-100 rounded-md shadow-sm cursor-pointer transform-gpu hover:scale-105 hover:shadow-md"
              />
            </a>
          </Link>
          <div className="flex-shrink overflow-hidden">
            <Link
              href={
                requestData.type === 'movie'
                  ? `/movie/${requestData.media.tmdbId}`
                  : `/tv/${requestData.media.tmdbId}`
              }
            >
              <a className="min-w-0 mr-2 text-xl text-white truncate hover:underline">
                {isMovie(title) ? title.title : title.name}
              </a>
            </Link>
            <Link href={`/users/${requestData.requestedBy.id}`}>
              <a className="flex items-center mt-1">
                <img
                  src={requestData.requestedBy.avatar}
                  alt=""
                  className="w-5 mr-2 rounded-full"
                />
                <span className="text-sm hover:underline">
                  {requestData.requestedBy.displayName}
                </span>
              </a>
            </Link>
            {requestData.seasons.length > 0 && (
              <div className="items-center hidden mt-2 text-sm sm:flex">
                <span className="mr-2">
                  {intl.formatMessage(messages.seasons)}
                </span>
                {requestData.seasons.map((season) => (
                  <span key={`season-${season.id}`} className="mr-2">
                    <Badge>{season.seasonNumber}</Badge>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Table.TD>
      <Table.TD>
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
            status={requestData.media[requestData.is4k ? 'status4k' : 'status']}
            inProgress={
              (
                requestData.media[
                  requestData.is4k ? 'downloadStatus4k' : 'downloadStatus'
                ] ?? []
              ).length > 0
            }
            is4k={requestData.is4k}
          />
        )}
      </Table.TD>
      <Table.TD>
        <div className="flex flex-col">
          <span className="text-sm text-gray-300">
            <FormattedDate value={requestData.createdAt} />
          </span>
        </div>
      </Table.TD>
      <Table.TD>
        <div className="flex flex-col">
          {requestData.modifiedBy ? (
            <span className="text-sm text-gray-300">
              <div className="flex items-center">
                <img
                  src={requestData.modifiedBy.avatar}
                  alt=""
                  className="w-5 mr-2 rounded-full"
                />
                <span className="text-sm">
                  {requestData.modifiedBy.displayName} (
                  <FormattedRelativeTime
                    value={Math.floor(
                      (new Date(requestData.updatedAt).getTime() - Date.now()) /
                        1000
                    )}
                    updateIntervalInSeconds={1}
                  />
                  )
                </span>
              </div>
            </span>
          ) : (
            <span className="text-sm text-gray-300">N/A</span>
          )}
        </div>
      </Table.TD>
      <Table.TD alignText="right">
        {requestData.media[requestData.is4k ? 'status4k' : 'status'] ===
          MediaStatus.UNKNOWN &&
          requestData.status !== MediaRequestStatus.DECLINED &&
          hasPermission(Permission.MANAGE_REQUESTS) && (
            <Button
              className="mr-2"
              buttonType="primary"
              buttonSize="sm"
              disabled={isRetrying}
              onClick={() => retryRequest()}
            >
              <svg
                className="w-4 h-4 mr-0 sm:mr-1"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="18px"
                height="18px"
              >
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
              </svg>
              <span className="hidden sm:block">
                {intl.formatMessage(globalMessages.retry)}
              </span>
            </Button>
          )}
        {requestData.status !== MediaRequestStatus.PENDING &&
          hasPermission(Permission.MANAGE_REQUESTS) && (
            <Button
              buttonType="danger"
              buttonSize="sm"
              onClick={() => deleteRequest()}
            >
              <svg
                className="w-4 h-4 mr-0 sm:mr-1"
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
              <span className="hidden sm:block">
                {intl.formatMessage(globalMessages.delete)}
              </span>
            </Button>
          )}
        {requestData.status === MediaRequestStatus.PENDING &&
          hasPermission(Permission.MANAGE_REQUESTS) && (
            <>
              <span className="mr-2">
                <Button
                  buttonType="success"
                  buttonSize="sm"
                  onClick={() => modifyRequest('approve')}
                >
                  <svg
                    className="w-4 h-4 mr-0 sm:mr-1"
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
                  <span className="hidden sm:block">
                    {intl.formatMessage(globalMessages.approve)}
                  </span>
                </Button>
              </span>
              <span className="mr-2">
                <Button
                  buttonType="danger"
                  buttonSize="sm"
                  onClick={() => modifyRequest('decline')}
                >
                  <svg
                    className="w-4 h-4 mr-0 sm:mr-1"
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
                  <span className="hidden sm:block">
                    {intl.formatMessage(globalMessages.decline)}
                  </span>
                </Button>
              </span>
              <span>
                <Button
                  buttonType="primary"
                  buttonSize="sm"
                  onClick={() => setShowEditModal(true)}
                >
                  <svg
                    className="w-4 h-4 mr-0 sm:mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  <span className="hidden sm:block">
                    {intl.formatMessage(globalMessages.edit)}
                  </span>
                </Button>
              </span>
            </>
          )}
      </Table.TD>
    </tr>
  );
};

export default RequestItem;
