import {
  ArrowCircleRightIcon,
  CogIcon,
  ExclamationIcon,
  FilmIcon,
  PlayIcon,
} from '@heroicons/react/outline';
import { hasFlag } from 'country-flag-icons';
import 'country-flag-icons/3x2/flags.css';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useSWR from 'swr';
import type { RTRating } from '../../../server/api/rottentomatoes';
import { ANIME_KEYWORD_ID } from '../../../server/api/themoviedb/constants';
import { IssueStatus } from '../../../server/constants/issue';
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
import LoadingSpinner from '../Common/LoadingSpinner';
import PageTitle from '../Common/PageTitle';
import PlayButton, { PlayButtonLink } from '../Common/PlayButton';
import ExternalLinkBlock from '../ExternalLinkBlock';
import IssueModal from '../IssueModal';
import ManageSlideOver from '../ManageSlideOver';
import MediaSlider from '../MediaSlider';
import PersonCard from '../PersonCard';
import RequestButton from '../RequestButton';
import RequestModal from '../RequestModal';
import Slider from '../Slider';
import StatusBadge from '../StatusBadge';
import getConfig from 'next/config';

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
  originaltitle: 'Original Title',
  showtype: 'Series Type',
  anime: 'Anime',
  network: '{networkCount, plural, one {Network} other {Networks}}',
  viewfullcrew: 'View Full Crew',
  play: 'Play on {mediaServerName}',
  play4k: 'Play 4K on {mediaServerName}',
  seasons: '{seasonCount, plural, one {# Season} other {# Seasons}}',
  episodeRuntime: 'Episode Runtime',
  episodeRuntimeMinutes: '{runtime} minutes',
  streamingproviders: 'Currently Streaming On',
  productioncountries:
    'Production {countryCount, plural, one {Country} other {Countries}}',
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
  const [showManager, setShowManager] = useState(
    router.query.manage == '1' ? true : false
  );
  const [showIssueModal, setShowIssueModal] = useState(false);
  const { publicRuntimeConfig } = getConfig();

  const {
    data,
    error,
    mutate: revalidate,
  } = useSWR<TvDetailsType>(`/api/v1/tv/${router.query.tvId}`, {
    fallbackData: tv,
  });

  const { data: ratingData } = useSWR<RTRating>(
    `/api/v1/tv/${router.query.tvId}/ratings`
  );

  const sortedCrew = useMemo(
    () => sortCrewPriority(data?.credits.crew ?? []),
    [data]
  );

  useEffect(() => {
    setShowManager(router.query.manage == '1' ? true : false);
  }, [router.query.manage]);

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <Error statusCode={404} />;
  }

  const mediaLinks: PlayButtonLink[] = [];

  if (
    data.mediaInfo?.mediaUrl &&
    hasPermission([Permission.REQUEST, Permission.REQUEST_TV], {
      type: 'or',
    })
  ) {
    mediaLinks.push({
      text: getAvalaibleMediaServerName(),
      url: data.mediaInfo?.mediaUrl,
      svg: <PlayIcon />,
    });
  }

  if (
    settings.currentSettings.series4kEnabled &&
    data.mediaInfo?.mediaUrl4k &&
    hasPermission([Permission.REQUEST_4K, Permission.REQUEST_4K_TV], {
      type: 'or',
    })
  ) {
    mediaLinks.push({
      text: getAvalaible4kMediaServerName(),
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

  const region = user?.settings?.region
    ? user.settings.region
    : settings.currentSettings.region
    ? settings.currentSettings.region
    : 'US';
  const seriesAttributes: React.ReactNode[] = [];

  const contentRating = data.contentRatings.results.find(
    (r) => r.iso_3166_1 === region
  )?.rating;
  if (contentRating) {
    seriesAttributes.push(
      <span className="rounded-md border p-0.5 py-0">{contentRating}</span>
    );
  }

  const seasonCount = data.seasons.filter(
    (season) => season.seasonNumber !== 0
  ).length;

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

  function getAvalaibleMediaServerName() {
    if (publicRuntimeConfig.JELLYFIN_TYPE === 'emby') {
      return intl.formatMessage(messages.play, { mediaServerName: 'Emby' });
    }

    if (settings.currentSettings.mediaServerType === MediaServerType.PLEX) {
      return intl.formatMessage(messages.play, { mediaServerName: 'Plex' });
    }

    return intl.formatMessage(messages.play, { mediaServerName: 'Jellyfin' });
  }

  function getAvalaible4kMediaServerName() {
    if (publicRuntimeConfig.JELLYFIN_TYPE === 'emby') {
      return intl.formatMessage(messages.play4k, { mediaServerName: 'Emby' });
    }

    if (settings.currentSettings.mediaServerType === MediaServerType.PLEX) {
      return intl.formatMessage(messages.play4k, { mediaServerName: 'Plex' });
    }

    return intl.formatMessage(messages.play4k, { mediaServerName: 'Jellyfin' });
  }

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
      <IssueModal
        onCancel={() => setShowIssueModal(false)}
        show={showIssueModal}
        mediaType="tv"
        tmdbId={data.id}
      />
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
      <ManageSlideOver
        data={data}
        mediaType="tv"
        onClose={() => {
          setShowManager(false);
          router.push({
            pathname: router.pathname,
            query: { tvId: router.query.tvId },
          });
        }}
        revalidate={() => revalidate()}
        show={showManager}
      />
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
              tmdbId={data.mediaInfo?.tmdbId}
              mediaType="tv"
              plexUrl={data.mediaInfo?.mediaUrl}
            />
            {settings.currentSettings.series4kEnabled &&
              hasPermission(
                [
                  Permission.MANAGE_REQUESTS,
                  Permission.REQUEST_4K,
                  Permission.REQUEST_4K_TV,
                ],
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
                  tmdbId={data.mediaInfo?.tmdbId}
                  mediaType="tv"
                  plexUrl={data.mediaInfo?.mediaUrl4k}
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
                    {prev}
                    <span>|</span>
                    {curr}
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
          {(data.mediaInfo?.status === MediaStatus.AVAILABLE ||
            data.mediaInfo?.status === MediaStatus.PARTIALLY_AVAILABLE ||
            (settings.currentSettings.series4kEnabled &&
              hasPermission([Permission.REQUEST_4K, Permission.REQUEST_4K_TV], {
                type: 'or',
              }) &&
              (data.mediaInfo?.status4k === MediaStatus.AVAILABLE ||
                data?.mediaInfo?.status4k ===
                  MediaStatus.PARTIALLY_AVAILABLE))) &&
            hasPermission(
              [Permission.CREATE_ISSUES, Permission.MANAGE_ISSUES],
              {
                type: 'or',
              }
            ) && (
              <Button
                buttonType="warning"
                className="ml-2 first:ml-0"
                onClick={() => setShowIssueModal(true)}
              >
                <ExclamationIcon className="w-5" />
              </Button>
            )}
          {hasPermission(Permission.MANAGE_REQUESTS) && data.mediaInfo && (
            <Button
              buttonType="default"
              className="relative ml-2 first:ml-0"
              onClick={() => setShowManager(true)}
            >
              <CogIcon className="!mr-0" />
              {hasPermission(
                [Permission.MANAGE_ISSUES, Permission.VIEW_ISSUES],
                {
                  type: 'or',
                }
              ) &&
                (
                  data.mediaInfo?.issues.filter(
                    (issue) => issue.status === IssueStatus.OPEN
                  ) ?? []
                ).length > 0 && (
                  <>
                    <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-600" />
                    <div className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-red-600" />
                  </>
                )}
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
              <div className="mt-4 flex justify-end">
                <Link href={`/tv/${data.id}/crew`}>
                  <a className="flex items-center text-gray-400 transition duration-300 hover:text-gray-100">
                    <span>{intl.formatMessage(messages.viewfullcrew)}</span>
                    <ArrowCircleRightIcon className="ml-1.5 inline-block h-5 w-5" />
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
                      <RTRotten className="mr-1 w-6" />
                    ) : (
                      <RTFresh className="mr-1 w-6" />
                    )}
                    {ratingData.criticsScore}%
                  </span>
                )}
                {ratingData?.audienceRating && !!ratingData?.audienceScore && (
                  <span className="media-rating">
                    {ratingData.audienceRating === 'Spilled' ? (
                      <RTAudRotten className="mr-1 w-6" />
                    ) : (
                      <RTAudFresh className="mr-1 w-6" />
                    )}
                    {ratingData.audienceScore}%
                  </span>
                )}
                {!!data.voteCount && (
                  <span className="media-rating">
                    <TmdbLogo className="mr-2 w-6" />
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
            {data.productionCountries.length > 0 && (
              <div className="media-fact">
                <span>
                  {intl.formatMessage(messages.productioncountries, {
                    countryCount: data.productionCountries.length,
                  })}
                </span>
                <span className="media-fact-value">
                  {data.productionCountries.map((c) => {
                    return (
                      <span
                        className="flex items-center justify-end"
                        key={`prodcountry-${c.iso_3166_1}`}
                      >
                        {hasFlag(c.iso_3166_1) && (
                          <span
                            className={`mr-1.5 text-xs leading-5 flag:${c.iso_3166_1}`}
                          />
                        )}
                        <span>
                          {intl.formatDisplayName(c.iso_3166_1, {
                            type: 'region',
                            fallback: 'none',
                          }) ?? c.name}
                        </span>
                      </span>
                    );
                  })}
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
                        {intl.formatMessage(globalMessages.delimitedlist, {
                          a: prev,
                          b: curr,
                        })}
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
      <MediaSlider
        sliderKey="seasons"
        title={intl.formatMessage(messages.seasons)}
        url={`/api/v1/tv/${data.id}/seasons`}
        linkUrl={`/tv/${data.id}/seasons`}
        hideWhenEmpty={false}
      />

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
