import React from 'react';
import useSWR from 'swr';
import TmdbTitleCard from '../TitleCard/TmdbTitleCard';
import Slider from '../Slider';
import Link from 'next/link';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import type { MediaResultsResponse } from '../../../server/interfaces/api/mediaInterfaces';
import type { RequestResultsResponse } from '../../../server/interfaces/api/requestInterfaces';
import RequestCard from '../RequestCard';
import MediaSlider from '../MediaSlider';
import PageTitle from '../Common/PageTitle';

const messages = defineMessages({
  discover: 'Discover',
  recentrequests: 'Recent Requests',
  popularmovies: 'Popular Movies',
  populartv: 'Popular Series',
  upcomingtv: 'Upcoming Series',
  recentlyAdded: 'Recently Added',
  nopending: 'No Pending Requests',
  upcoming: 'Upcoming Movies',
  trending: 'Trending',
});

const Discover: React.FC = () => {
  const intl = useIntl();

  const { data: media, error: mediaError } = useSWR<MediaResultsResponse>(
    '/api/v1/media?filter=allavailable&take=20&sort=mediaAdded'
  );

  const {
    data: requests,
    error: requestError,
  } = useSWR<RequestResultsResponse>(
    '/api/v1/request?filter=unavailable&take=10&sort=modified&skip=0'
  );

  return (
    <>
      <PageTitle title={intl.formatMessage(messages.discover)} />
      <div className="mt-6 mb-4 md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center text-xl leading-7 text-gray-300 hover:text-white sm:text-2xl sm:leading-9 sm:truncate">
            <span>
              <FormattedMessage {...messages.recentlyAdded} />
            </span>
          </div>
        </div>
      </div>
      <Slider
        sliderKey="media"
        isLoading={!media && !mediaError}
        isEmpty={!!media && !mediaError && media.results.length === 0}
        items={media?.results?.map((item) => (
          <TmdbTitleCard
            key={`media-slider-item-${item.id}`}
            tmdbId={item.tmdbId}
            type={item.mediaType}
          />
        ))}
      />
      <div className="mt-6 mb-4 md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <Link href="/requests">
            <a className="inline-flex items-center text-xl leading-7 text-gray-300 hover:text-white sm:text-2xl sm:leading-9 sm:truncate">
              <span>
                <FormattedMessage {...messages.recentrequests} />
              </span>
              <svg
                className="w-6 h-6 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </a>
          </Link>
        </div>
      </div>
      <Slider
        sliderKey="requests"
        isLoading={!requests && !requestError}
        isEmpty={!!requests && !requestError && requests.results.length === 0}
        items={(requests?.results ?? []).map((request) => (
          <RequestCard
            key={`request-slider-item-${request.id}`}
            request={request}
          />
        ))}
        placeholder={<RequestCard.Placeholder />}
        emptyMessage={intl.formatMessage(messages.nopending)}
      />
      <MediaSlider
        sliderKey="trending"
        title={intl.formatMessage(messages.trending)}
        url="/api/v1/discover/trending"
        linkUrl="/discover/trending"
      />
      <MediaSlider
        sliderKey="popular-movies"
        title={intl.formatMessage(messages.popularmovies)}
        url="/api/v1/discover/movies"
        linkUrl="/discover/movies"
      />
      <MediaSlider
        sliderKey="upcoming"
        title={intl.formatMessage(messages.upcoming)}
        linkUrl="/discover/movies/upcoming"
        url="/api/v1/discover/movies/upcoming"
      />
      <MediaSlider
        sliderKey="popular-tv"
        title={intl.formatMessage(messages.populartv)}
        url="/api/v1/discover/tv"
        linkUrl="/discover/tv"
      />
      <MediaSlider
        sliderKey="upcoming-tv"
        title={intl.formatMessage(messages.upcomingtv)}
        url="/api/v1/discover/tv/upcoming"
        linkUrl="/discover/tv/upcoming"
      />
    </>
  );
};

export default Discover;
