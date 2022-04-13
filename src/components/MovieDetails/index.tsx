import {
  ArrowCircleRightIcon,
  CogIcon,
  FilmIcon,
  PlayIcon,
} from '@heroicons/react/outline';
import {
  CheckCircleIcon,
  ChevronDoubleDownIcon,
  ChevronDoubleUpIcon,
  DocumentRemoveIcon,
  ExternalLinkIcon,
} from '@heroicons/react/solid';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useSWR from 'swr';
import type { RTRating } from '../../../server/api/rottentomatoes';
import { MediaStatus } from '../../../server/constants/media';
import { MediaServerType } from '../../../server/constants/server';
import type { MovieDetails as MovieDetailsType } from '../../../server/models/Movie';
import RTAudFresh from '../../assets/rt_aud_fresh.svg';
import RTAudRotten from '../../assets/rt_aud_rotten.svg';
import RTFresh from '../../assets/rt_fresh.svg';
import RTRotten from '../../assets/rt_rotten.svg';
import TmdbLogo from '../../assets/tmdb_logo.svg';
import useLocale from '../../hooks/useLocale';
import useSettings from '../../hooks/useSettings';
import { Permission, useUser } from '../../hooks/useUser';
import globalMessages from '../../i18n/globalMessages';
import Error from '../../pages/_error';
import { sortCrewPriority } from '../../utils/creditHelpers';
import Button from '../Common/Button';
import CachedImage from '../Common/CachedImage';
import ConfirmButton from '../Common/ConfirmButton';
import LoadingSpinner from '../Common/LoadingSpinner';
import PageTitle from '../Common/PageTitle';
import PlayButton, { PlayButtonLink } from '../Common/PlayButton';
import SlideOver from '../Common/SlideOver';
import DownloadBlock from '../DownloadBlock';
import ExternalLinkBlock from '../ExternalLinkBlock';
import MediaSlider from '../MediaSlider';
import PersonCard from '../PersonCard';
import RequestBlock from '../RequestBlock';
import RequestButton from '../RequestButton';
import Slider from '../Slider';
import StatusBadge from '../StatusBadge';

const messages = defineMessages({
  originaltitle: 'Original Title',
  releasedate: 'Release Date',
  revenue: 'Revenue',
  budget: 'Budget',
  watchtrailer: 'Watch Trailer',
  originallanguage: 'Original Language',
  overview: 'Overview',
  runtime: '{minutes} minutes',
  cast: 'Cast',
  recommendations: 'Recommendations',
  similar: 'Similar Titles',
  overviewunavailable: 'Overview unavailable.',
  manageModalTitle: 'Manage Movie',
  manageModalRequests: 'Requests',
  manageModalNoRequests: 'No requests.',
  manageModalClearMedia: 'Clear Media Data',
  manageModalClearMediaWarning:
    '* This will irreversibly remove all data for this movie, including any requests. If this item exists in your Plex library, the media information will be recreated during the next scan.',
  studio: '{studioCount, plural, one {Studio} other {Studios}}',
  viewfullcrew: 'View Full Crew',
  openradarr: 'Open Movie in Radarr',
  openradarr4k: 'Open Movie in 4K Radarr',
  downloadstatus: 'Download Status',
  play: 'Play on {mediaServerName}',
  play4k: 'Play 4K on {mediaServerName}',
  markavailable: 'Mark as Available',
  mark4kavailable: 'Mark as Available in 4K',
  showmore: 'Show More',
  showless: 'Show Less',
  streamingproviders: 'Currently Streaming On',
});

interface MovieDetailsProps {
  movie?: MovieDetailsType;
}

const MovieDetails: React.FC<MovieDetailsProps> = ({ movie }) => {
  const settings = useSettings();
  const { user, hasPermission } = useUser();
  const router = useRouter();
  const intl = useIntl();
  const { locale } = useLocale();
  const [showManager, setShowManager] = useState(false);
  const minStudios = 3;
  const [showMoreStudios, setShowMoreStudios] = useState(false);

  const { data, error, revalidate } = useSWR<MovieDetailsType>(
    `/api/v1/movie/${router.query.movieId}`,
    {
      initialData: movie,
    }
  );

  const { data: ratingData } = useSWR<RTRating>(
    `/api/v1/movie/${router.query.movieId}/ratings`
  );

  const sortedCrew = useMemo(
    () => sortCrewPriority(data?.credits.crew ?? []),
    [data]
  );

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <Error statusCode={404} />;
  }

  const showAllStudios = data.productionCompanies.length <= minStudios + 1;
  const mediaLinks: PlayButtonLink[] = [];

  if (data.mediaInfo?.mediaUrl) {
    mediaLinks.push({
      text:
        settings.currentSettings.mediaServerType === MediaServerType.JELLYFIN
          ? intl.formatMessage(messages.play, { mediaServerName: 'Jellyfin' })
          : intl.formatMessage(messages.play, { mediaServerName: 'Plex' }),
      url: data.mediaInfo?.mediaUrl,
      svg: <PlayIcon />,
    });
  }

  if (
    data.mediaInfo?.mediaUrl4k &&
    hasPermission([Permission.REQUEST_4K, Permission.REQUEST_4K_TV], {
      type: 'or',
    })
  ) {
    mediaLinks.push({
      text:
        settings.currentSettings.mediaServerType === MediaServerType.JELLYFIN
          ? intl.formatMessage(messages.play4k, { mediaServerName: 'Jellyfin' })
          : intl.formatMessage(messages.play4k, { mediaServerName: 'Plex' }),
      url: data.mediaInfo?.mediaUrl4k,
      svg: <PlayIcon />,
    });
  }

  const trailerUrl = data.relatedVideos
    ?.filter((r) => r.type === 'Trailer')
    .sort((a, b) => a.size - b.size)
    .pop()?.url;

  if (trailerUrl) {
    mediaLinks.push({
      text: intl.formatMessage(messages.watchtrailer),
      url: trailerUrl,
      svg: <FilmIcon />,
    });
  }

  const deleteMedia = async () => {
    if (data?.mediaInfo?.id) {
      await axios.delete(`/api/v1/media/${data?.mediaInfo?.id}`);
      revalidate();
    }
  };

  const markAvailable = async (is4k = false) => {
    await axios.post(`/api/v1/media/${data?.mediaInfo?.id}/available`, {
      is4k,
    });
    revalidate();
  };

  const region = user?.settings?.region
    ? user.settings.region
    : settings.currentSettings.region
    ? settings.currentSettings.region
    : 'US';
  const movieAttributes: React.ReactNode[] = [];

  if (
    data.releases.results.length &&
    (data.releases.results.find((r) => r.iso_3166_1 === region)
      ?.release_dates[0].certification ||
      data.releases.results[0].release_dates[0].certification)
  ) {
    movieAttributes.push(
      <span className="p-0.5 py-0 border rounded-md">
        {data.releases.results.find((r) => r.iso_3166_1 === region)
          ?.release_dates[0].certification ||
          data.releases.results[0].release_dates[0].certification}
      </span>
    );
  }

  if (data.runtime) {
    movieAttributes.push(
      intl.formatMessage(messages.runtime, { minutes: data.runtime })
    );
  }

  if (data.genres.length) {
    movieAttributes.push(
      data.genres
        .map((g) => (
          <Link href={`/discover/movies/genre/${g.id}`} key={`genre-${g.id}`}>
            <a className="hover:underline">{g.name}</a>
          </Link>
        ))
        .reduce((prev, curr) => (
          <>
            {intl.formatMessage(globalMessages.delimitedlist, {
              a: prev,
              b: curr,
            })}
          </>
        ))
    );
  }

  const streamingProviders =
    data?.watchProviders?.find((provider) => provider.iso_3166_1 === region)
      ?.flatrate ?? [];

  return (
    <div
      className="media-page"
      style={{
        height: 493,
      }}
    >
      {data.backdropPath && (
        <div className="media-page-bg-image">
          <CachedImage
            alt=""
            src={`https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/${data.backdropPath}`}
            layout="fill"
            objectFit="cover"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(180deg, rgba(17, 24, 39, 0.47) 0%, rgba(17, 24, 39, 1) 100%)',
            }}
          />
        </div>
      )}
      <PageTitle title={data.title} />
      <SlideOver
        show={showManager}
        title={intl.formatMessage(messages.manageModalTitle)}
        onClose={() => setShowManager(false)}
        subText={data.title}
      >
        {((data?.mediaInfo?.downloadStatus ?? []).length > 0 ||
          (data?.mediaInfo?.downloadStatus4k ?? []).length > 0) && (
          <>
            <h3 className="mb-2 text-xl font-bold">
              {intl.formatMessage(messages.downloadstatus)}
            </h3>
            <div className="mb-6 overflow-hidden bg-gray-600 rounded-md shadow">
              <ul>
                {data.mediaInfo?.downloadStatus?.map((status, index) => (
                  <li
                    key={`dl-status-${status.externalId}-${index}`}
                    className="border-b border-gray-700 last:border-b-0"
                  >
                    <DownloadBlock downloadItem={status} />
                  </li>
                ))}
                {data.mediaInfo?.downloadStatus4k?.map((status, index) => (
                  <li
                    key={`dl-status-${status.externalId}-${index}`}
                    className="border-b border-gray-700 last:border-b-0"
                  >
                    <DownloadBlock downloadItem={status} is4k />
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
        {data?.mediaInfo &&
          (data.mediaInfo.status !== MediaStatus.AVAILABLE ||
            (data.mediaInfo.status4k !== MediaStatus.AVAILABLE &&
              settings.currentSettings.movie4kEnabled)) && (
            <div className="mb-6">
              {data?.mediaInfo &&
                data?.mediaInfo.status !== MediaStatus.AVAILABLE && (
                  <div className="flex flex-col mb-2 sm:flex-row flex-nowrap">
                    <Button
                      onClick={() => markAvailable()}
                      className="w-full sm:mb-0"
                      buttonType="success"
                    >
                      <CheckCircleIcon />
                      <span>{intl.formatMessage(messages.markavailable)}</span>
                    </Button>
                  </div>
                )}
              {data?.mediaInfo &&
                data?.mediaInfo.status4k !== MediaStatus.AVAILABLE &&
                settings.currentSettings.movie4kEnabled && (
                  <div className="flex flex-col mb-2 sm:flex-row flex-nowrap">
                    <Button
                      onClick={() => markAvailable(true)}
                      className="w-full sm:mb-0"
                      buttonType="success"
                    >
                      <CheckCircleIcon />
                      <span>
                        {intl.formatMessage(messages.mark4kavailable)}
                      </span>
                    </Button>
                  </div>
                )}
            </div>
          )}
        <h3 className="mb-2 text-xl font-bold">
          {intl.formatMessage(messages.manageModalRequests)}
        </h3>
        <div className="overflow-hidden bg-gray-600 rounded-md shadow">
          <ul>
            {data.mediaInfo?.requests?.map((request) => (
              <li
                key={`manage-request-${request.id}`}
                className="border-b border-gray-700 last:border-b-0"
              >
                <RequestBlock request={request} onUpdate={() => revalidate()} />
              </li>
            ))}
            {(data.mediaInfo?.requests ?? []).length === 0 && (
              <li className="py-4 text-center text-gray-400">
                {intl.formatMessage(messages.manageModalNoRequests)}
              </li>
            )}
          </ul>
        </div>
        {(data?.mediaInfo?.serviceUrl || data?.mediaInfo?.serviceUrl4k) && (
          <div className="mt-8">
            {data?.mediaInfo?.serviceUrl && (
              <a
                href={data?.mediaInfo?.serviceUrl}
                target="_blank"
                rel="noreferrer"
                className="block mb-2 last:mb-0"
              >
                <Button buttonType="ghost" className="w-full">
                  <ExternalLinkIcon />
                  <span>{intl.formatMessage(messages.openradarr)}</span>
                </Button>
              </a>
            )}
            {data?.mediaInfo?.serviceUrl4k && (
              <a
                href={data?.mediaInfo?.serviceUrl4k}
                target="_blank"
                rel="noreferrer"
              >
                <Button buttonType="ghost" className="w-full">
                  <ExternalLinkIcon />
                  <span>{intl.formatMessage(messages.openradarr4k)}</span>
                </Button>
              </a>
            )}
          </div>
        )}
        {data?.mediaInfo && (
          <div className="mt-8">
            <ConfirmButton
              onClick={() => deleteMedia()}
              confirmText={intl.formatMessage(globalMessages.areyousure)}
              className="w-full"
            >
              <DocumentRemoveIcon />
              <span>{intl.formatMessage(messages.manageModalClearMedia)}</span>
            </ConfirmButton>
            <div className="mt-3 text-xs text-gray-400">
              {intl.formatMessage(messages.manageModalClearMediaWarning)}
            </div>
          </div>
        )}
      </SlideOver>
      <div className="media-header">
        <div className="media-poster">
          <CachedImage
            src={
              data.posterPath
                ? `https://image.tmdb.org/t/p/w600_and_h900_bestv2${data.posterPath}`
                : '/images/overseerr_poster_not_found.png'
            }
            alt=""
            layout="responsive"
            width={600}
            height={900}
            priority
          />
        </div>
        <div className="media-title">
          <div className="media-status">
            <StatusBadge
              status={data.mediaInfo?.status}
              inProgress={(data.mediaInfo?.downloadStatus ?? []).length > 0}
              mediaUrl={data.mediaInfo?.mediaUrl}
            />
            {settings.currentSettings.movie4kEnabled &&
              hasPermission(
                [Permission.REQUEST_4K, Permission.REQUEST_4K_MOVIE],
                {
                  type: 'or',
                }
              ) && (
                <StatusBadge
                  status={data.mediaInfo?.status4k}
                  is4k
                  inProgress={
                    (data.mediaInfo?.downloadStatus4k ?? []).length > 0
                  }
                  mediaUrl4k={data.mediaInfo?.mediaUrl4k}
                />
              )}
          </div>
          <h1>
            {data.title}{' '}
            {data.releaseDate && (
              <span className="media-year">
                ({data.releaseDate.slice(0, 4)})
              </span>
            )}
          </h1>
          <span className="media-attributes">
            {movieAttributes.length > 0 &&
              movieAttributes
                .map((t, k) => <span key={k}>{t}</span>)
                .reduce((prev, curr) => (
                  <>
                    {prev} | {curr}
                  </>
                ))}
          </span>
        </div>
        <div className="media-actions">
          <PlayButton links={mediaLinks} />
          <RequestButton
            mediaType="movie"
            media={data.mediaInfo}
            tmdbId={data.id}
            onUpdate={() => revalidate()}
          />
          {hasPermission(Permission.MANAGE_REQUESTS) && (
            <Button
              buttonType="default"
              className="ml-2 first:ml-0"
              onClick={() => setShowManager(true)}
            >
              <CogIcon />
            </Button>
          )}
        </div>
      </div>
      <div className="media-overview">
        <div className="media-overview-left">
          {data.tagline && <div className="tagline">{data.tagline}</div>}
          <h2>{intl.formatMessage(messages.overview)}</h2>
          <p>
            {data.overview
              ? data.overview
              : intl.formatMessage(messages.overviewunavailable)}
          </p>
          {sortedCrew.length > 0 && (
            <>
              <ul className="media-crew">
                {sortedCrew.slice(0, 6).map((person) => (
                  <li key={`crew-${person.job}-${person.id}`}>
                    <span>{person.job}</span>
                    <Link href={`/person/${person.id}`}>
                      <a className="crew-name">{person.name}</a>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex justify-end mt-4">
                <Link href={`/movie/${data.id}/crew`}>
                  <a className="flex items-center text-gray-400 transition duration-300 hover:text-gray-100">
                    <span>{intl.formatMessage(messages.viewfullcrew)}</span>
                    <ArrowCircleRightIcon className="inline-block w-5 h-5 ml-1.5" />
                  </a>
                </Link>
              </div>
            </>
          )}
        </div>
        <div className="media-overview-right">
          {data.collection && (
            <div className="mb-6">
              <Link href={`/collection/${data.collection.id}`}>
                <a>
                  <div className="relative z-0 overflow-hidden transition duration-300 scale-100 bg-gray-800 bg-center bg-cover rounded-lg shadow-md cursor-pointer transform-gpu group hover:scale-105 ring-1 ring-gray-700 hover:ring-gray-500">
                    <div className="absolute inset-0 z-0">
                      <CachedImage
                        src={`https://image.tmdb.org/t/p/w1440_and_h320_multi_faces/${data.collection.backdropPath}`}
                        alt=""
                        layout="fill"
                        objectFit="cover"
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage:
                            'linear-gradient(180deg, rgba(31, 41, 55, 0.47) 0%, rgba(31, 41, 55, 0.80) 100%)',
                        }}
                      />
                    </div>
                    <div className="relative z-10 flex items-center justify-between p-4 text-gray-200 transition duration-300 h-14 group-hover:text-white">
                      <div>{data.collection.name}</div>
                      <Button buttonSize="sm">
                        {intl.formatMessage(globalMessages.view)}
                      </Button>
                    </div>
                  </div>
                </a>
              </Link>
            </div>
          )}
          <div className="media-facts">
            {(!!data.voteCount ||
              (ratingData?.criticsRating && !!ratingData?.criticsScore) ||
              (ratingData?.audienceRating && !!ratingData?.audienceScore)) && (
              <div className="media-ratings">
                {ratingData?.criticsRating && !!ratingData?.criticsScore && (
                  <>
                    <span className="media-rating">
                      {ratingData.criticsRating === 'Rotten' ? (
                        <RTRotten className="w-6 mr-1" />
                      ) : (
                        <RTFresh className="w-6 mr-1" />
                      )}
                      {ratingData.criticsScore}%
                    </span>
                  </>
                )}
                {ratingData?.audienceRating && !!ratingData?.audienceScore && (
                  <>
                    <span className="media-rating">
                      {ratingData.audienceRating === 'Spilled' ? (
                        <RTAudRotten className="w-6 mr-1" />
                      ) : (
                        <RTAudFresh className="w-6 mr-1" />
                      )}
                      {ratingData.audienceScore}%
                    </span>
                  </>
                )}
                {!!data.voteCount && (
                  <>
                    <span className="media-rating">
                      <TmdbLogo className="w-6 mr-2" />
                      {data.voteAverage}/10
                    </span>
                  </>
                )}
              </div>
            )}
            {data.originalTitle &&
              data.originalLanguage !== locale.slice(0, 2) && (
                <div className="media-fact">
                  <span>{intl.formatMessage(messages.originaltitle)}</span>
                  <span className="media-fact-value">{data.originalTitle}</span>
                </div>
              )}
            <div className="media-fact">
              <span>{intl.formatMessage(globalMessages.status)}</span>
              <span className="media-fact-value">{data.status}</span>
            </div>
            {data.releaseDate && (
              <div className="media-fact">
                <span>{intl.formatMessage(messages.releasedate)}</span>
                <span className="media-fact-value">
                  {intl.formatDate(data.releaseDate, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
            {data.revenue > 0 && (
              <div className="media-fact">
                <span>{intl.formatMessage(messages.revenue)}</span>
                <span className="media-fact-value">
                  {intl.formatNumber(data.revenue, {
                    currency: 'USD',
                    style: 'currency',
                  })}
                </span>
              </div>
            )}
            {data.budget > 0 && (
              <div className="media-fact">
                <span>{intl.formatMessage(messages.budget)}</span>
                <span className="media-fact-value">
                  {intl.formatNumber(data.budget, {
                    currency: 'USD',
                    style: 'currency',
                  })}
                </span>
              </div>
            )}
            {data.originalLanguage && (
              <div className="media-fact">
                <span>{intl.formatMessage(messages.originallanguage)}</span>
                <span className="media-fact-value">
                  <Link
                    href={`/discover/movies/language/${data.originalLanguage}`}
                  >
                    <a>
                      {intl.formatDisplayName(data.originalLanguage, {
                        type: 'language',
                        fallback: 'none',
                      }) ??
                        data.spokenLanguages.find(
                          (lng) => lng.iso_639_1 === data.originalLanguage
                        )?.name}
                    </a>
                  </Link>
                </span>
              </div>
            )}
            {data.productionCompanies.length > 0 && (
              <div className="media-fact">
                <span>
                  {intl.formatMessage(messages.studio, {
                    studioCount: data.productionCompanies.length,
                  })}
                </span>
                <span className="media-fact-value">
                  {data.productionCompanies
                    .slice(
                      0,
                      showAllStudios || showMoreStudios
                        ? data.productionCompanies.length
                        : minStudios
                    )
                    .map((s) => {
                      return (
                        <Link
                          href={`/discover/movies/studio/${s.id}`}
                          key={`studio-${s.id}`}
                        >
                          <a className="block">{s.name}</a>
                        </Link>
                      );
                    })}
                  {!showAllStudios && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMoreStudios(!showMoreStudios);
                      }}
                    >
                      <span className="flex items-center">
                        {intl.formatMessage(
                          !showMoreStudios
                            ? messages.showmore
                            : messages.showless
                        )}
                        {!showMoreStudios ? (
                          <ChevronDoubleDownIcon className="w-4 h-4 ml-1" />
                        ) : (
                          <ChevronDoubleUpIcon className="w-4 h-4 ml-1" />
                        )}
                      </span>
                    </button>
                  )}
                </span>
              </div>
            )}
            {!!streamingProviders.length && (
              <div className="media-fact">
                <span>{intl.formatMessage(messages.streamingproviders)}</span>
                <span className="media-fact-value">
                  {streamingProviders.map((p) => {
                    return (
                      <span className="block" key={`provider-${p.id}`}>
                        {p.name}
                      </span>
                    );
                  })}
                </span>
              </div>
            )}
            <div className="media-fact">
              <ExternalLinkBlock
                mediaType="movie"
                tmdbId={data.id}
                tvdbId={data.externalIds.tvdbId}
                imdbId={data.externalIds.imdbId}
                rtUrl={ratingData?.url}
                mediaUrl={
                  data.mediaInfo?.mediaUrl ?? data.mediaInfo?.mediaUrl4k
                }
              />
            </div>
          </div>
        </div>
      </div>
      {data.credits.cast.length > 0 && (
        <>
          <div className="slider-header">
            <Link href="/movie/[movieId]/cast" as={`/movie/${data.id}/cast`}>
              <a className="slider-title">
                <span>{intl.formatMessage(messages.cast)}</span>
                <ArrowCircleRightIcon />
              </a>
            </Link>
          </div>
          <Slider
            sliderKey="cast"
            isLoading={false}
            isEmpty={false}
            items={data.credits.cast.slice(0, 20).map((person) => (
              <PersonCard
                key={`cast-item-${person.id}`}
                personId={person.id}
                name={person.name}
                subName={person.character}
                profilePath={person.profilePath}
              />
            ))}
          />
        </>
      )}
      <MediaSlider
        sliderKey="recommendations"
        title={intl.formatMessage(messages.recommendations)}
        url={`/api/v1/movie/${router.query.movieId}/recommendations`}
        linkUrl={`/movie/${data.id}/recommendations`}
        hideWhenEmpty
      />
      <MediaSlider
        sliderKey="similar"
        title={intl.formatMessage(messages.similar)}
        url={`/api/v1/movie/${router.query.movieId}/similar`}
        linkUrl={`/movie/${data.id}/similar`}
        hideWhenEmpty
      />
      <div className="pb-8" />
    </div>
  );
};

export default MovieDetails;
