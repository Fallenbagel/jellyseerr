import React, { useState, useContext, useMemo } from 'react';
import { FormattedDate, defineMessages, useIntl } from 'react-intl';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import Button from '../Common/Button';
import Link from 'next/link';
import Slider from '../Slider';
import PersonCard from '../PersonCard';
import { LanguageContext } from '../../context/LanguageContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import { useUser, Permission } from '../../hooks/useUser';
import { TvDetails as TvDetailsType } from '../../../server/models/Tv';
import { MediaStatus } from '../../../server/constants/media';
import RequestModal from '../RequestModal';
import axios from 'axios';
import SlideOver from '../Common/SlideOver';
import RequestBlock from '../RequestBlock';
import Error from '../../pages/_error';
import TmdbLogo from '../../assets/tmdb_logo.svg';
import RTFresh from '../../assets/rt_fresh.svg';
import RTRotten from '../../assets/rt_rotten.svg';
import RTAudFresh from '../../assets/rt_aud_fresh.svg';
import RTAudRotten from '../../assets/rt_aud_rotten.svg';
import type { RTRating } from '../../../server/api/rottentomatoes';
import { ANIME_KEYWORD_ID } from '../../../server/api/themoviedb/constants';
import ExternalLinkBlock from '../ExternalLinkBlock';
import { sortCrewPriority } from '../../utils/creditHelpers';
import { Crew } from '../../../server/models/common';
import StatusBadge from '../StatusBadge';
import RequestButton from '../RequestButton';
import MediaSlider from '../MediaSlider';
import ConfirmButton from '../Common/ConfirmButton';
import DownloadBlock from '../DownloadBlock';
import PageTitle from '../Common/PageTitle';
import useSettings from '../../hooks/useSettings';
import PlayButton, { PlayButtonLink } from '../Common/PlayButton';
import { MediaServerType } from '../../../server/constants/server';

const messages = defineMessages({
  firstAirDate: 'First Air Date',
  nextAirDate: 'Next Air Date',
  userrating: 'User Rating',
  status: 'Status',
  originallanguage: 'Original Language',
  overview: 'Overview',
  cast: 'Cast',
  recommendations: 'Recommendations',
  similar: 'Similar Series',
  cancelrequest: 'Cancel Request',
  watchtrailer: 'Watch Trailer',
  available: 'Available',
  unavailable: 'Unavailable',
  pending: 'Pending',
  overviewunavailable: 'Overview unavailable.',
  manageModalTitle: 'Manage Series',
  manageModalRequests: 'Requests',
  manageModalNoRequests: 'No Requests',
  manageModalClearMedia: 'Clear All Media Data',
  manageModalClearMediaWarning:
    'This will irreversibly remove all data for this TV series, including any requests. If this item exists in your Plex library, the media information will be recreated during the next sync.',
  approve: 'Approve',
  decline: 'Decline',
  showtype: 'Show Type',
  anime: 'Anime',
  network: 'Network',
  viewfullcrew: 'View Full Crew',
  areyousure: 'Are you sure?',
  opensonarr: 'Open Series in Sonarr',
  opensonarr4k: 'Open Series in 4K Sonarr',
  downloadstatus: 'Download Status',
  play: 'Play on {mediaServerName}',
  play4k: 'Play 4K on {mediaServerName}',
  markavailable: 'Mark as Available',
  mark4kavailable: 'Mark 4K as Available',
  allseasonsmarkedavailable: '* All seasons will be marked as available.',
});

interface TvDetailsProps {
  tv?: TvDetailsType;
}

const TvDetails: React.FC<TvDetailsProps> = ({ tv }) => {
  const settings = useSettings();
  const { user, hasPermission } = useUser();
  const router = useRouter();
  const intl = useIntl();
  const { locale } = useContext(LanguageContext);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showManager, setShowManager] = useState(false);

  const { data, error, revalidate } = useSWR<TvDetailsType>(
    `/api/v1/tv/${router.query.tvId}?language=${locale}`,
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

  if (data.genres.length) {
    seriesAttributes.push(data.genres.map((g) => g.name).join(', '));
  }

  const isComplete =
    data.seasons.filter((season) => season.seasonNumber !== 0).length <=
    (
      data.mediaInfo?.seasons.filter(
        (season) => season.status === MediaStatus.AVAILABLE
      ) ?? []
    ).length;

  const is4kComplete =
    data.seasons.filter((season) => season.seasonNumber !== 0).length <=
    (
      data.mediaInfo?.seasons.filter(
        (season) => season.status4k === MediaStatus.AVAILABLE
      ) ?? []
    ).length;

  return (
    <div
      className="px-4 pt-16 -mx-4 -mt-16 bg-center bg-cover"
      style={{
        height: 493,
        backgroundImage: `linear-gradient(180deg, rgba(17, 24, 39, 0.47) 0%, rgba(17, 24, 39, 1) 100%), url(//image.tmdb.org/t/p/w1920_and_h800_multi_faces/${data.backdropPath})`,
      }}
    >
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
            <h3 className="mb-2 text-xl">
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
                      <svg
                        className="w-5 h-5 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                          clipRule="evenodd"
                        />
                      </svg>
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
                      <svg
                        className="w-5 h-5 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>
                        {intl.formatMessage(messages.mark4kavailable)}
                      </span>
                    </Button>
                  </div>
                )}
              <div className="mt-3 text-xs text-gray-300">
                {intl.formatMessage(messages.allseasonsmarkedavailable)}
              </div>
            </div>
          )}
        <h3 className="mb-2 text-xl">
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
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
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
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
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
              confirmText={intl.formatMessage(messages.areyousure)}
              className="w-full"
            >
              {intl.formatMessage(messages.manageModalClearMedia)}
            </ConfirmButton>
            <div className="mt-2 text-sm text-gray-400">
              {intl.formatMessage(messages.manageModalClearMediaWarning)}
            </div>
          </div>
        )}
      </SlideOver>
      <div className="flex flex-col items-center pt-4 lg:flex-row lg:items-end">
        <div className="lg:mr-4">
          <img
            src={
              data.posterPath
                ? `//image.tmdb.org/t/p/w600_and_h900_bestv2${data.posterPath}`
                : '/images/overseerr_poster_not_found.png'
            }
            alt=""
            className="w-32 rounded shadow md:rounded-lg md:shadow-2xl md:w-44 lg:w-52"
          />
        </div>
        <div className="flex flex-col flex-1 mt-4 text-center text-white lg:mr-4 lg:mt-0 lg:text-left">
          <div className="mb-2 space-x-2">
            {data.mediaInfo && data.mediaInfo.status !== MediaStatus.UNKNOWN && (
              <span className="ml-2 lg:ml-0">
                <StatusBadge
                  status={data.mediaInfo?.status}
                  inProgress={(data.mediaInfo.downloadStatus ?? []).length > 0}
                  mediaUrl={data.mediaInfo?.mediaUrl}
                  mediaUrl4k={data.mediaInfo?.mediaUrl4k}
                />
              </span>
            )}
            <span>
              <StatusBadge
                status={data.mediaInfo?.status}
                inProgress={(data.mediaInfo?.downloadStatus ?? []).length > 0}
                mediaUrl={data.mediaInfo?.mediaUrl}
                mediaUrl4k={
                  data.mediaInfo?.mediaUrl4k &&
                  (hasPermission(Permission.REQUEST_4K) ||
                    hasPermission(Permission.REQUEST_4K_TV))
                    ? data.mediaInfo.mediaUrl4k
                    : undefined
                }
              />
            </span>
            {settings.currentSettings.series4kEnabled &&
              hasPermission([Permission.REQUEST_4K, Permission.REQUEST_4K_TV], {
                type: 'or',
              }) && (
                <span>
                  <StatusBadge
                    status={data.mediaInfo?.status4k}
                    is4k
                    inProgress={
                      (data.mediaInfo?.downloadStatus4k ?? []).length > 0
                    }
                    mediaUrl4k={data.mediaInfo?.mediaUrl4k}
                  />
                </span>
              )}
          </div>
          <h1 className="text-2xl lg:text-4xl">
            {data.name}{' '}
            {data.firstAirDate && (
              <span className="text-2xl">
                ({data.firstAirDate.slice(0, 4)})
              </span>
            )}
          </h1>
          <span className="mt-1 text-xs lg:text-base lg:mt-0">
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
        <div className="relative z-10 flex flex-wrap justify-center flex-shrink-0 mt-4 sm:justify-end sm:flex-nowrap lg:mt-0">
          <div className="mb-3 sm:mb-0">
            <PlayButton links={mediaLinks} />
          </div>
          <div className="mb-3 sm:mb-0">
            <RequestButton
              mediaType="tv"
              onUpdate={() => revalidate()}
              tmdbId={data?.id}
              media={data?.mediaInfo}
              isShowComplete={isComplete}
              is4kShowComplete={is4kComplete}
            />
          </div>
          {hasPermission(Permission.MANAGE_REQUESTS) && (
            <Button
              buttonType="default"
              className="mb-3 ml-2 first:ml-0 sm:mb-0"
              onClick={() => setShowManager(true)}
            >
              <svg
                className="w-5"
                style={{ height: 20 }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-col pt-8 pb-4 text-white md:flex-row">
        <div className="flex-1 md:mr-8">
          <h2 className="text-xl md:text-2xl">
            {intl.formatMessage(messages.overview)}
          </h2>
          <p className="pt-2 text-sm md:text-base">
            {data.overview
              ? data.overview
              : intl.formatMessage(messages.overviewunavailable)}
          </p>
          <ul className="grid grid-cols-2 gap-6 mt-6 sm:grid-cols-3">
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
                <li
                  className="flex flex-col col-span-1"
                  key={`crew-${person.job}-${person.id}`}
                >
                  <span className="font-bold">{person.job}</span>
                  <Link href={`/person/${person.id}`}>
                    <a className="text-gray-400 transition duration-300 hover:text-underline hover:text-gray-100">
                      {person.name}
                    </a>
                  </Link>
                </li>
              ))}
          </ul>
          {sortedCrew.length > 0 && (
            <div className="flex justify-end mt-4">
              <Link href={`/tv/${data.id}/crew`}>
                <a className="flex items-center text-gray-400 transition duration-300 hover:text-gray-100">
                  <span>{intl.formatMessage(messages.viewfullcrew)}</span>
                  <svg
                    className="inline-block w-5 h-5 ml-1"
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
          )}
        </div>
        <div className="w-full mt-8 md:w-80 md:mt-0">
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow">
            {(!!data.voteCount ||
              (ratingData?.criticsRating && !!ratingData?.criticsScore) ||
              (ratingData?.audienceRating && !!ratingData?.audienceScore)) && (
              <div className="flex items-center justify-center px-4 py-2 border-b border-gray-800 last:border-b-0">
                {ratingData?.criticsRating && !!ratingData?.criticsScore && (
                  <>
                    <span className="text-sm">
                      {ratingData.criticsRating === 'Rotten' ? (
                        <RTRotten className="w-6 mr-1" />
                      ) : (
                        <RTFresh className="w-6 mr-1" />
                      )}
                    </span>
                    <span className="mr-4 text-sm text-gray-400 last:mr-0">
                      {ratingData.criticsScore}%
                    </span>
                  </>
                )}
                {ratingData?.audienceRating && !!ratingData?.audienceScore && (
                  <>
                    <span className="text-sm">
                      {ratingData.audienceRating === 'Spilled' ? (
                        <RTAudRotten className="w-6 mr-1" />
                      ) : (
                        <RTAudFresh className="w-6 mr-1" />
                      )}
                    </span>
                    <span className="mr-4 text-sm text-gray-400 last:mr-0">
                      {ratingData.audienceScore}%
                    </span>
                  </>
                )}
                {!!data.voteCount && (
                  <>
                    <span className="text-sm">
                      <TmdbLogo className="w-6 mr-2" />
                    </span>
                    <span className="text-sm text-gray-400">
                      {data.voteAverage}/10
                    </span>
                  </>
                )}
              </div>
            )}
            {data.keywords.some(
              (keyword) => keyword.id === ANIME_KEYWORD_ID
            ) && (
              <div className="flex px-4 py-2 border-b border-gray-800 last:border-b-0">
                <span className="text-sm">
                  {intl.formatMessage(messages.showtype)}
                </span>
                <span className="flex-1 text-sm text-right text-gray-400">
                  {intl.formatMessage(messages.anime)}
                </span>
              </div>
            )}
            {data.firstAirDate && (
              <div className="flex px-4 py-2 border-b border-gray-800 last:border-b-0">
                <span className="text-sm">
                  {intl.formatMessage(messages.firstAirDate)}
                </span>
                <span className="flex-1 text-sm text-right text-gray-400">
                  <FormattedDate
                    value={new Date(data.firstAirDate)}
                    year="numeric"
                    month="long"
                    day="numeric"
                  />
                </span>
              </div>
            )}
            {data.nextEpisodeToAir && (
              <div className="flex px-4 py-2 border-b border-gray-800 last:border-b-0">
                <span className="text-sm">
                  {intl.formatMessage(messages.nextAirDate)}
                </span>
                <span className="flex-1 text-sm text-right text-gray-400">
                  <FormattedDate
                    value={new Date(data.nextEpisodeToAir?.airDate)}
                    year="numeric"
                    month="long"
                    day="numeric"
                  />
                </span>
              </div>
            )}
            <div className="flex px-4 py-2 border-b border-gray-800 last:border-b-0">
              <span className="text-sm">
                {intl.formatMessage(messages.status)}
              </span>
              <span className="flex-1 text-sm text-right text-gray-400">
                {data.status}
              </span>
            </div>
            {data.spokenLanguages.some(
              (lng) => lng.iso_639_1 === data.originalLanguage
            ) && (
              <div className="flex px-4 py-2 border-b border-gray-800 last:border-b-0">
                <span className="text-sm">
                  {intl.formatMessage(messages.originallanguage)}
                </span>
                <span className="flex-1 text-sm text-right text-gray-400">
                  {
                    data.spokenLanguages.find(
                      (lng) => lng.iso_639_1 === data.originalLanguage
                    )?.name
                  }
                </span>
              </div>
            )}
            {data.networks.length > 0 && (
              <div className="flex px-4 py-2 border-b border-gray-800 last:border-b-0">
                <span className="text-sm">
                  {intl.formatMessage(messages.network)}
                </span>
                <span className="flex-1 text-sm text-right text-gray-400">
                  {data.networks.map((n) => n.name).join(', ')}
                </span>
              </div>
            )}
          </div>
          <div className="mt-4">
            <ExternalLinkBlock
              mediaType="tv"
              tmdbId={data.id}
              tvdbId={data.externalIds.tvdbId}
              imdbId={data.externalIds.imdbId}
              rtUrl={ratingData?.url}
              mediaUrl={data.mediaInfo?.mediaUrl ?? data.mediaInfo?.mediaUrl4k}
            />
          </div>
        </div>
      </div>
      {data.credits.cast.length > 0 && (
        <>
          <div className="mt-6 mb-4 md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <Link href="/tv/[tvId]/cast" as={`/tv/${data.id}/cast`}>
                <a className="inline-flex items-center text-xl leading-7 text-gray-300 hover:text-white sm:text-2xl sm:leading-9 sm:truncate">
                  <span>{intl.formatMessage(messages.cast)}</span>
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
