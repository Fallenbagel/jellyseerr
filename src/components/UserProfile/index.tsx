import { ArrowCircleRightIcon } from '@heroicons/react/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useSWR from 'swr';
import {
  QuotaResponse,
  UserRequestsResponse,
} from '../../../server/interfaces/api/userInterfaces';
import { MovieDetails } from '../../../server/models/Movie';
import { TvDetails } from '../../../server/models/Tv';
import { Permission, useUser } from '../../hooks/useUser';
import Error from '../../pages/_error';
import ImageFader from '../Common/ImageFader';
import LoadingSpinner from '../Common/LoadingSpinner';
import PageTitle from '../Common/PageTitle';
import ProgressCircle from '../Common/ProgressCircle';
import RequestCard from '../RequestCard';
import Slider from '../Slider';
import ProfileHeader from './ProfileHeader';

const messages = defineMessages({
  recentrequests: 'Recent Requests',
  norequests: 'No requests.',
  limit: '{remaining} of {limit}',
  requestsperdays: '{limit} remaining',
  unlimited: 'Unlimited',
  totalrequests: 'Total Requests',
  pastdays: '{type} (past {days} days)',
  movierequests: 'Movie Requests',
  seriesrequest: 'Series Requests',
});

type MediaTitle = MovieDetails | TvDetails;

const UserProfile: React.FC = () => {
  const intl = useIntl();
  const router = useRouter();
  const { user, error } = useUser({
    id: Number(router.query.userId),
  });
  const { user: currentUser, hasPermission: currentHasPermission } = useUser();
  const [availableTitles, setAvailableTitles] = useState<
    Record<number, MediaTitle>
  >({});

  const { data: requests, error: requestError } = useSWR<UserRequestsResponse>(
    user ? `/api/v1/user/${user?.id}/requests?take=10&skip=0` : null
  );
  const { data: quota } = useSWR<QuotaResponse>(
    user ? `/api/v1/user/${user.id}/quota` : null
  );

  const updateAvailableTitles = useCallback(
    (requestId: number, mediaTitle: MediaTitle) => {
      setAvailableTitles((titles) => ({
        ...titles,
        [requestId]: mediaTitle,
      }));
    },
    []
  );

  useEffect(() => {
    setAvailableTitles({});
  }, [user?.id]);

  if (!user && !error) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Error statusCode={404} />;
  }

  return (
    <>
      <PageTitle title={user.displayName} />
      {Object.keys(availableTitles).length > 0 && (
        <div className="absolute left-0 right-0 z-0 -top-16 h-96">
          <ImageFader
            key={user.id}
            isDarker
            backgroundImages={Object.values(availableTitles)
              .filter((media) => media.backdropPath)
              .map(
                (media) =>
                  `https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/${media.backdropPath}`
              )
              .slice(0, 6)}
          />
        </div>
      )}
      <ProfileHeader user={user} />
      {quota &&
        (user.id === currentUser?.id ||
          currentHasPermission(Permission.MANAGE_USERS)) && (
          <div className="relative z-40">
            <dl className="grid grid-cols-1 gap-5 mt-5 lg:grid-cols-3">
              <div className="px-4 py-5 overflow-hidden bg-gray-800 bg-opacity-50 rounded-lg shadow ring-1 ring-gray-700 sm:p-6">
                <dt className="text-sm font-bold text-gray-300 truncate">
                  {intl.formatMessage(messages.totalrequests)}
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-white">
                  {intl.formatNumber(user.requestCount)}
                </dd>
              </div>

              <div
                className={`px-4 py-5 overflow-hidden bg-gray-800 bg-opacity-50 rounded-lg shadow ring-1 ${
                  quota.movie.restricted
                    ? 'ring-red-500 from-red-900 to-transparent bg-gradient-to-t'
                    : 'ring-gray-700'
                } sm:p-6`}
              >
                <dt
                  className={`text-sm font-bold truncate ${
                    quota.movie.restricted ? 'text-red-500' : 'text-gray-300'
                  }`}
                >
                  {quota.movie.limit
                    ? intl.formatMessage(messages.pastdays, {
                        type: intl.formatMessage(messages.movierequests),
                        days: quota?.movie.days,
                      })
                    : intl.formatMessage(messages.movierequests)}
                </dt>
                <dd
                  className={`flex mt-1 text-sm items-center ${
                    quota.movie.restricted ? 'text-red-500' : 'text-white'
                  }`}
                >
                  {quota.movie.limit ? (
                    <>
                      <ProgressCircle
                        progress={Math.round(
                          ((quota?.movie.remaining ?? 0) /
                            (quota?.movie.limit ?? 1)) *
                            100
                        )}
                        useHeatLevel
                        className="w-8 h-8 mr-2"
                      />
                      <div>
                        {intl.formatMessage(messages.requestsperdays, {
                          limit: (
                            <span className="text-3xl font-semibold">
                              {intl.formatMessage(messages.limit, {
                                remaining: quota.movie.remaining,
                                limit: quota.movie.limit,
                              })}
                            </span>
                          ),
                        })}
                      </div>
                    </>
                  ) : (
                    <span className="text-3xl font-semibold">
                      {intl.formatMessage(messages.unlimited)}
                    </span>
                  )}
                </dd>
              </div>

              <div
                className={`px-4 py-5 overflow-hidden bg-gray-800 bg-opacity-50 rounded-lg shadow ring-1 ${
                  quota.tv.restricted
                    ? 'ring-red-500 from-red-900 to-transparent bg-gradient-to-t'
                    : 'ring-gray-700'
                } sm:p-6`}
              >
                <dt
                  className={`text-sm font-bold truncate ${
                    quota.tv.restricted ? 'text-red-500' : 'text-gray-300'
                  }`}
                >
                  {quota.tv.limit
                    ? intl.formatMessage(messages.pastdays, {
                        type: intl.formatMessage(messages.seriesrequest),
                        days: quota?.tv.days,
                      })
                    : intl.formatMessage(messages.seriesrequest)}
                </dt>
                <dd
                  className={`flex items-center mt-1 text-sm ${
                    quota.tv.restricted ? 'text-red-500' : 'text-white'
                  }`}
                >
                  {quota.tv.limit ? (
                    <>
                      <ProgressCircle
                        progress={Math.round(
                          ((quota?.tv.remaining ?? 0) /
                            (quota?.tv.limit ?? 1)) *
                            100
                        )}
                        useHeatLevel
                        className="w-8 h-8 mr-2"
                      />
                      <div>
                        {intl.formatMessage(messages.requestsperdays, {
                          limit: (
                            <span className="text-3xl font-semibold">
                              {intl.formatMessage(messages.limit, {
                                remaining: quota.tv.remaining,
                                limit: quota.tv.limit,
                              })}
                            </span>
                          ),
                        })}
                      </div>
                    </>
                  ) : (
                    <span className="text-3xl font-semibold">
                      {intl.formatMessage(messages.unlimited)}
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        )}
      {(user.id === currentUser?.id ||
        currentHasPermission(
          [Permission.MANAGE_REQUESTS, Permission.REQUEST_VIEW],
          { type: 'or' }
        )) && (
        <>
          <div className="slider-header">
            <Link href={`/users/${user?.id}/requests?filter=all`}>
              <a className="slider-title">
                <span>{intl.formatMessage(messages.recentrequests)}</span>
                <ArrowCircleRightIcon />
              </a>
            </Link>
          </div>
          <Slider
            sliderKey="requests"
            isLoading={!requests && !requestError}
            isEmpty={
              !!requests && !requestError && requests.results.length === 0
            }
            items={(requests?.results ?? []).map((request) => (
              <RequestCard
                key={`request-slider-item-${request.id}`}
                request={request}
                onTitleData={updateAvailableTitles}
              />
            ))}
            placeholder={<RequestCard.Placeholder />}
            emptyMessage={intl.formatMessage(messages.norequests)}
          />
        </>
      )}
    </>
  );
};

export default UserProfile;
