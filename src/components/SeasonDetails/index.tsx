import React from 'react';
import { SeasonWithEpisodes } from '../../../server/models/Tv';
import useSWR from 'swr';
import LoadingSpinner from '../Common/LoadingSpinner';
import Error from '../../pages/_error';
import { useRouter } from 'next/router';
import CachedImage from '../Common/CachedImage';
import PageTitle from '../Common/PageTitle';
import { TvDetails as TvDetailsType } from '../../../server/models/Tv';
import StatusBadge from '../StatusBadge';
import { Permission } from '../../../server/lib/permissions';
import useSettings from '../../hooks/useSettings';
import { useUser } from '../../hooks/useUser';
import Link from 'next/link';
import globalMessages from '../../i18n/globalMessages';
import { defineMessages, useIntl } from 'react-intl';
import PlayButton, { PlayButtonLink } from '../Common/PlayButton';
import { PlayIcon } from '@heroicons/react/outline';
import { MediaServerType } from '../../../server/constants/server';
import getConfig from 'next/config';

const messages = defineMessages({
  episodes: '{episodeCount, plural, one {episode} other {# episodes}}',
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
  seasonsTitle: '{seasonCount, plural, one {Season} other {Seasons}}',
  episodeRuntime: 'Episode Runtime',
  episodeRuntimeMinutes: '{runtime} minutes',
  streamingproviders: 'Currently Streaming On',
  productioncountries:
    'Production {countryCount, plural, one {Country} other {Countries}}',
});

interface SeasonDetailsProps {
  season?: SeasonWithEpisodes;
  tv?: TvDetailsType;
}

const SeasonDetails: React.FC<SeasonDetailsProps> = ({ season, tv }) => {
  const settings = useSettings();
  const { hasPermission } = useUser();
  const router = useRouter();
  const intl = useIntl();
  const { publicRuntimeConfig } = getConfig();

  const seriesAttributes: React.ReactNode[] = [];

  const { data: seasonData, error: seasonError } = useSWR<SeasonWithEpisodes>(
    `/api/v1/tv/${router.query.tvId}/season/${router.query.seasonnumber}`,
    {
      fallbackData: season,
    }
  );

  const { data: seriesData, error: seriesError } = useSWR<TvDetailsType>(
    `/api/v1/tv/${router.query.tvId}`,
    {
      fallbackData: tv,
    }
  );

  if (!seasonData && !seasonError && !seriesData && !seriesError) {
    return <LoadingSpinner />;
  }

  if (!seasonData) {
    return <Error statusCode={404} />;
  }

  if (!seriesData) {
    return <Error statusCode={404} />;
  }

  const mediaLinks: PlayButtonLink[] = [];

  if (
    seriesData.mediaInfo?.mediaUrl &&
    hasPermission([Permission.REQUEST, Permission.REQUEST_TV], {
      type: 'or',
    })
  ) {
    mediaLinks.push({
      text: getAvalaibleMediaServerName(),
      url: seriesData.mediaInfo?.mediaUrl,
      svg: <PlayIcon />,
    });
  }

  if (
    settings.currentSettings.series4kEnabled &&
    seriesData.mediaInfo?.mediaUrl4k &&
    hasPermission([Permission.REQUEST_4K, Permission.REQUEST_4K_TV], {
      type: 'or',
    })
  ) {
    mediaLinks.push({
      text: getAvalaible4kMediaServerName(),
      url: seriesData.mediaInfo?.mediaUrl4k,
      svg: <PlayIcon />,
    });
  }

  if (seriesData.genres.length) {
    seriesAttributes.push(
      seriesData.genres
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
    <div className="media-page h-[493px]">
      {seriesData.backdropPath && (
        <div className="media-page-bg-image">
          <CachedImage
            alt=""
            src={`https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/${seriesData.backdropPath}`}
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
      <PageTitle title={`${seriesData.name} [${seasonData.name}]`} />
      <div className="media-header">
        <div className="media-poster">
          <CachedImage
            src={
              seasonData.posterPath
                ? `https://image.tmdb.org/t/p/w600_and_h900_bestv2${seasonData.posterPath}`
                : '/images/overseerr_poster_not_found.png'
            }
            alt={seasonData.name}
            layout="responsive"
            width={600}
            height={900}
            priority
          />
        </div>
        <div className="media-title">
          <div className="media-status">
            <StatusBadge
              status={
                seriesData.mediaInfo?.seasons.find(
                  (s) => s.seasonNumber === seasonData.seasonNumber
                )?.status
              }
              inProgress={
                (seriesData.mediaInfo?.downloadStatus ?? []).length > 0
              }
              tmdbId={seriesData.mediaInfo?.tmdbId}
              mediaType="tv"
              plexUrl={seriesData.mediaInfo?.mediaUrl}
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
                  status={
                    seriesData.mediaInfo?.seasons.find(
                      (s) => s.seasonNumber === seasonData.seasonNumber
                    )?.status4k
                  }
                  is4k
                  inProgress={
                    (seriesData.mediaInfo?.downloadStatus4k ?? []).length > 0
                  }
                  tmdbId={seriesData.mediaInfo?.tmdbId}
                  mediaType="tv"
                  plexUrl={seriesData.mediaInfo?.mediaUrl4k}
                />
              )}
          </div>
          <h1>
            {`${seriesData.name} [${seasonData.name}] `}
            <span className="media-year">
              ({seasonData.airDate ? seasonData.airDate.substring(0, 4) : ''})
            </span>
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

          <div className="media-actions">
            <PlayButton links={mediaLinks} />
          </div>
        </div>
      </div>
      <div className="media-overview">
        <div className="media-overview-left">
          {seriesData.tagline && (
            <div className="tagline">{seriesData.tagline}</div>
          )}
          <h2>{intl.formatMessage(messages.overview)}</h2>
          <p>
            {seasonData.overview
              ? seasonData.overview
              : seriesData.overview
              ? seriesData.overview
              : intl.formatMessage(messages.overviewunavailable)}
          </p>

          <h2>
            {intl.formatMessage(messages.episodes, {
              episodeCount: seasonData.episodes.length,
            })}
          </h2>
          <div className="grid md:grid-cols-2 md:gap-2 lg:grid-cols-4 lg:gap-2">
            {seasonData.episodes.map((episode) => (
              <>
                <div className="season-episode">
                  <div className="season-episode--img">
                    <img
                      src={
                        episode.stillPath
                          ? `https://image.tmdb.org/t/p/w500${episode.stillPath}`
                          : '/images/overseerr_poster_not_found.png'
                      }
                      alt={episode.name}
                    />
                  </div>
                  <div className="season-episode--info">
                    <p className="upper small ep-num">
                      Episode {episode.episodeNumber} -{' '}
                      {episode.airDate && (
                        <span className="aired">Has Aired on TV</span>
                      )}
                    </p>
                    <h4 className="sub-title">{episode.name}</h4>
                    <p className="small detail">{episode.overview}</p>
                  </div>
                </div>
              </>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeasonDetails;
