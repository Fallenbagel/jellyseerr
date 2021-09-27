import {
  ArrowCircleRightIcon,
  CogIcon,
  FilmIcon,
  PlayIcon,
} from '@heroicons/react/outline';
import {
  CheckCircleIcon,
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
import { ANIME_KEYWORD_ID } from '../../../server/api/themoviedb/constants';
import { MediaStatus } from '../../../server/constants/media';
import { MediaServerType } from '../../../server/constants/server';
import { Crew } from '../../../server/models/common';
import { TvDetails as TvDetailsType } from '../../../server/models/Tv';
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
import RequestModal from '../RequestModal';
import Slider from '../Slider';
import StatusBadge from '../StatusBadge';

const messages = defineMessages({
  firstAirDate: 'First Air Date',
  nextAirDate: 'Next Air Date',
  originallanguage: 'Original Language',
  overview: 'Overview',
  cast: 'Cast',
  recommendations: 'Recommendations',
  similar: 'Similar Series',
  watchtrailer: 'Watch Trailer',
  overviewunavailable: 'Overview unavailable.',
  manageModalTitle: 'Manage Series',
  manageModalRequests: 'Requests',
  manageModalNoRequests: 'No requests.',
  manageModalClearMedia: 'Clear Media Data',
  manageModalClearMediaWarning:
    '* This will irreversibly remove all data for this series, including any requests. If this item exists in your Plex library, the media information will be recreated during the next scan.',
  originaltitle: 'Original Title',
  showtype: 'Series Type',
  anime: 'Anime',
  network: '{networkCount, plural, one {Network} other {Networks}}',
  viewfullcrew: 'View Full Crew',
  opensonarr: 'Open Series in Sonarr',
  opensonarr4k: 'Open Series in 4K Sonarr',
  downloadstatus: 'Download Status',
  play: 'Play on {mediaServerName}',
  play4k: 'Play 4K on {mediaServerName}',
  markavailable: 'Mark as Available',
  mark4kavailable: 'Mark as Available in 4K',
  allseasonsmarkedavailable: '* All seasons will be marked as available.',
  seasons: '{seasonCount, plural, one {# Season} other {# Seasons}}',
  episodeRuntime: 'Episode Runtime',
  episodeRuntimeMinutes: '{runtime} minutes',
  streamingproviders: 'Currently Streaming On',
});

interface TvDetailsProps {
  tv?: TvDetailsType;
}

const TvDetails: React.FC<TvDetailsProps> = ({ tv }) => {
  const settings = useSettings();
  const { user, hasPermission } = useUser();
  const router = useRouter();
  const intl = useIntl();
  const { locale } = useLocale();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showManager, setShowManager] = useState(false);

  const { data, error, revalidate } = useSWR<TvDetailsType>(
    `/api/v1/tv/${router.query.tvId}`,
    {
      initialData: tv,
    }
  );

  const { data: ratingData } = useSWR<RTRating>(
    `/api/v1/tv/${router.query.tvId}/ratings`
  );

  const sortedCrew = useMemo(() => sortCrewPriority(data?.credits.crew ?? []), [
    data,
  ]);

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <Error statusCode={404} />;
  }

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
  const seriesAttributes: React.ReactNode[] = [];

  if (
    data.contentRatings.results.length &&
    data.contentRatings.results.find(
      (r) => r.iso_3166_1 === region || data.contentRatings.results[0].rating
    )
  ) {
    seriesAttributes.push(
      <span className="p-0.5 py-0 border rounded-md">
        {data.contentRatings.results.find((r) => r.iso_3166_1 === region)
          ?.rating || data.contentRatings.results[0].rating}
      </span>
    );
  }

  const seasonCount = data.seasons.filter((season) => season.seasonNumber !== 0)
    .length;

  if (seasonCount) {
    seriesAttributes.push(
      intl.formatMessage(messages.seasons, { seasonCount: seasonCount })
    );
  }

  if (data.genres.length) {
    seriesAttributes.push(
      data.genres
        .map((g) => (
          <Link href={`/discover/tv/genre/${g.id}`} key={`genre-${g.id}`}>
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

  const isComplete =
    seasonCount <=
    (
      data.mediaInfo?.seasons.filter(
        (season) => season.status === MediaStatus.AVAILABLE
      ) ?? []
    ).length;

  const is4kComplete =
    seasonCount <=
    (
      data.mediaInfo?.seasons.filter(
        (season) => season.status4k === MediaStatus.AVAILABLE
      ) ?? []
    ).length;

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
      <PageTitle title={data.name} />
      <RequestModal
        tmdbId={data.id}
        show={showRequestModal}
        type="tv"
        onComplete={() => {
          revalidate();
          setShowRequestModal(false);
        }}
        onCancel={() => setShowRequestModal(false)}
      />
      <SlideOver
        show={showManager}
        title={intl.formatMessage(messages.manageModalTitle)}
        onClose={() => setShowManager(false)}
        subText={data.name}
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
              settings.currentSettings.series4kEnabled)) && (
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
                settings.currentSettings.series4kEnabled && (
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
              <div className="mt-3 text-xs text-gray-400">
                {intl.formatMessage(messages.allseasonsmarkedavailable)}
              </div>
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
                  <span>{intl.formatMessage(messages.opensonarr)}</span>
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
                  <span>{intl.formatMessage(messages.opensonarr4k)}</span>
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
            {settings.currentSettings.series4kEnabled &&
              hasPermission([Permission.REQUEST_4K, Permission.REQUEST_4K_TV], {
                type: 'or',
              }) && (
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
            {data.name}{' '}
            {data.firstAirDate && (
              <span className="media-year">
                ({data.firstAirDate.slice(0, 4)})
              </span>
            )}
          </h1>
          <span className="media-attributes">
            {seriesAttributes.length > 0 &&
              seriesAttributes
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
            mediaType="tv"
            onUpdate={() => revalidate()}
            tmdbId={data?.id}
            media={data?.mediaInfo}
            isShowComplete={isComplete}
            is4kShowComplete={is4kComplete}
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
                {(data.createdBy.length > 0
                  ? [
                      ...data.createdBy.map(
                        (person): Partial<Crew> => ({
                          id: person.id,
                          job: 'Creator',
                          name: person.name,
                        })
                      ),
                      ...sortedCrew,
                    ]
                  : sortedCrew
                )
                  .slice(0, 6)
                  .map((person) => (
                    <li key={`crew-${person.job}-${person.id}`}>
                      <span>{person.job}</span>
                      <Link href={`/person/${person.id}`}>
                        <a className="crew-name">{person.name}</a>
                      </Link>
                    </li>
                  ))}
              </ul>
              <div className="flex justify-end mt-4">
                <Link href={`/tv/${data.id}/crew`}>
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
          <div className="media-facts">
            {(!!data.voteCount ||
              (ratingData?.criticsRating && !!ratingData?.criticsScore) ||
              (ratingData?.audienceRating && !!ratingData?.audienceScore)) && (
              <div className="media-ratings">
                {ratingData?.criticsRating && !!ratingData?.criticsScore && (
                  <span className="media-rating">
                    {ratingData.criticsRating === 'Rotten' ? (
                      <RTRotten className="w-6 mr-1" />
                    ) : (
                      <RTFresh className="w-6 mr-1" />
                    )}
                    {ratingData.criticsScore}%
                  </span>
                )}
                {ratingData?.audienceRating && !!ratingData?.audienceScore && (
                  <span className="media-rating">
                    {ratingData.audienceRating === 'Spilled' ? (
                      <RTAudRotten className="w-6 mr-1" />
                    ) : (
                      <RTAudFresh className="w-6 mr-1" />
                    )}
                    {ratingData.audienceScore}%
                  </span>
                )}
                {!!data.voteCount && (
                  <span className="media-rating">
                    <TmdbLogo className="w-6 mr-2" />
                    {data.voteAverage}/10
                  </span>
                )}
              </div>
            )}
            {data.originalName && data.originalLanguage !== locale.slice(0, 2) && (
              <div className="media-fact">
                <span>{intl.formatMessage(messages.originaltitle)}</span>
                <span className="media-fact-value">{data.originalName}</span>
              </div>
            )}
            {data.keywords.some(
              (keyword) => keyword.id === ANIME_KEYWORD_ID
            ) && (
              <div className="media-fact">
                <span>{intl.formatMessage(messages.showtype)}</span>
                <span className="media-fact-value">
                  {intl.formatMessage(messages.anime)}
                </span>
              </div>
            )}
            <div className="media-fact">
              <span>{intl.formatMessage(globalMessages.status)}</span>
              <span className="media-fact-value">{data.status}</span>
            </div>
            {data.firstAirDate && (
              <div className="media-fact">
                <span>{intl.formatMessage(messages.firstAirDate)}</span>
                <span className="media-fact-value">
                  {intl.formatDate(data.firstAirDate, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
            {data.nextEpisodeToAir &&
              data.nextEpisodeToAir.airDate !== data.firstAirDate && (
                <div className="media-fact">
                  <span>{intl.formatMessage(messages.nextAirDate)}</span>
                  <span className="media-fact-value">
                    {intl.formatDate(data.nextEpisodeToAir.airDate, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            {data.episodeRunTime.length > 0 && (
              <div className="media-fact">
                <span>{intl.formatMessage(messages.episodeRuntime)}</span>
                <span className="media-fact-value">
                  {intl.formatMessage(messages.episodeRuntimeMinutes, {
                    runtime: data.episodeRunTime[0],
                  })}
                </span>
              </div>
            )}
            {data.originalLanguage && (
              <div className="media-fact">
                <span>{intl.formatMessage(messages.originallanguage)}</span>
                <span className="media-fact-value">
                  <Link href={`/discover/tv/language/${data.originalLanguage}`}>
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
            {data.networks.length > 0 && (
              <div className="media-fact">
                <span>
                  {intl.formatMessage(messages.network, {
                    networkCount: data.networks.length,
                  })}
                </span>
                <span className="media-fact-value">
                  {data.networks
                    .map((n) => (
                      <Link
                        href={`/discover/tv/network/${n.id}`}
                        key={`network-${n.id}`}
                      >
                        <a>{n.name}</a>
                      </Link>
                    ))
                    .reduce((prev, curr) => (
                      <>
                        {prev}, {curr}
                      </>
                    ))}
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
                mediaType="tv"
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
            <Link href="/tv/[tvId]/cast" as={`/tv/${data.id}/cast`}>
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
        url={`/api/v1/tv/${router.query.tvId}/recommendations`}
        linkUrl={`/tv/${data.id}/recommendations`}
        hideWhenEmpty
      />
      <MediaSlider
        sliderKey="similar"
        title={intl.formatMessage(messages.similar)}
        url={`/api/v1/tv/${router.query.tvId}/similar`}
        linkUrl={`/tv/${data.id}/similar`}
        hideWhenEmpty
      />
      <div className="pb-8" />
    </div>
  );
};

export default TvDetails;
