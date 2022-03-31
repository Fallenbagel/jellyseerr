import { useRouter } from 'next/router';
import React, { useContext, useMemo, useState } from 'react';
import TruncateMarkup from 'react-truncate-markup';
import useSWR from 'swr';
import type { PersonDetail } from '../../../server/models/Person';
import type { PersonCombinedCreditsResponse } from '../../../server/interfaces/api/personInterfaces';
import Error from '../../pages/_error';
import LoadingSpinner from '../Common/LoadingSpinner';
import TitleCard from '../TitleCard';
import { defineMessages, useIntl } from 'react-intl';
import { LanguageContext } from '../../context/LanguageContext';
import ImageFader from '../Common/ImageFader';
import Ellipsis from '../../assets/ellipsis.svg';
import { groupBy } from 'lodash';
import PageTitle from '../Common/PageTitle';

const messages = defineMessages({
  appearsin: 'Appears in',
  crewmember: 'Crew Member',
  ascharacter: 'as {character}',
  nobiography: 'No biography available.',
});

const PersonDetails: React.FC = () => {
  const intl = useIntl();
  const { locale } = useContext(LanguageContext);
  const router = useRouter();
  const { data, error } = useSWR<PersonDetail>(
    `/api/v1/person/${router.query.personId}`
  );
  const [showBio, setShowBio] = useState(false);

  const {
    data: combinedCredits,
    error: errorCombinedCredits,
  } = useSWR<PersonCombinedCreditsResponse>(
    `/api/v1/person/${router.query.personId}/combined_credits?language=${locale}`
  );

  const sortedCast = useMemo(() => {
    const grouped = groupBy(combinedCredits?.cast ?? [], 'id');

    const reduced = Object.values(grouped).map((objs) => ({
      ...objs[0],
      character: objs.map((pos) => pos.character).join(', '),
    }));

    return reduced.sort((a, b) => {
      const aVotes = a.voteCount ?? 0;
      const bVotes = b.voteCount ?? 0;
      if (aVotes > bVotes) {
        return -1;
      }
      return 1;
    });
  }, [combinedCredits]);

  const sortedCrew = useMemo(() => {
    const grouped = groupBy(combinedCredits?.crew ?? [], 'id');

    const reduced = Object.values(grouped).map((objs) => ({
      ...objs[0],
      job: objs.map((pos) => pos.job).join(', '),
    }));

    return reduced.sort((a, b) => {
      const aVotes = a.voteCount ?? 0;
      const bVotes = b.voteCount ?? 0;
      if (aVotes > bVotes) {
        return -1;
      }
      return 1;
    });
  }, [combinedCredits]);

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <Error statusCode={404} />;
  }

  const isLoading = !combinedCredits && !errorCombinedCredits;

  const cast = (sortedCast ?? []).length > 0 && (
    <>
      <div className="relative z-10 mt-6 mb-4 md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center text-xl leading-7 text-gray-300 hover:text-white sm:text-2xl sm:leading-9 sm:truncate">
            <span>{intl.formatMessage(messages.appearsin)}</span>
          </div>
        </div>
      </div>
      <ul className="cardList">
        {sortedCast?.map((media, index) => {
          return (
            <li key={`list-cast-item-${media.id}-${index}`}>
              <TitleCard
                id={media.id}
                title={media.mediaType === 'movie' ? media.title : media.name}
                userScore={media.voteAverage}
                year={
                  media.mediaType === 'movie'
                    ? media.releaseDate
                    : media.firstAirDate
                }
                image={media.posterPath}
                summary={media.overview}
                mediaType={media.mediaType as 'movie' | 'tv'}
                status={media.mediaInfo?.status}
                canExpand
              />
              {media.character && (
                <div className="mt-2 text-xs text-center text-gray-300 truncate w-36 sm:w-36 md:w-44">
                  {intl.formatMessage(messages.ascharacter, {
                    character: media.character,
                  })}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );

  const crew = (sortedCrew ?? []).length > 0 && (
    <>
      <div className="relative z-10 mt-6 mb-4 md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center text-xl leading-7 text-gray-300 hover:text-white sm:text-2xl sm:leading-9 sm:truncate">
            <span>{intl.formatMessage(messages.crewmember)}</span>
          </div>
        </div>
      </div>
      <ul className="cardList">
        {sortedCrew?.map((media, index) => {
          return (
            <li key={`list-crew-item-${media.id}-${index}`}>
              <TitleCard
                id={media.id}
                title={media.mediaType === 'movie' ? media.title : media.name}
                userScore={media.voteAverage}
                year={
                  media.mediaType === 'movie'
                    ? media.releaseDate
                    : media.firstAirDate
                }
                image={media.posterPath}
                summary={media.overview}
                mediaType={media.mediaType as 'movie' | 'tv'}
                status={media.mediaInfo?.status}
                canExpand
              />
              {media.job && (
                <div className="mt-2 text-xs text-center text-gray-300 truncate w-36 sm:w-36 md:w-44">
                  {media.job}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );

  return (
    <>
      <PageTitle title={data.name} />
      {(sortedCrew || sortedCast) && (
        <div className="absolute left-0 right-0 z-0 -top-16 h-96">
          <ImageFader
            isDarker
            backgroundImages={[...(sortedCast ?? []), ...(sortedCrew ?? [])]
              .filter((media) => media.backdropPath)
              .map(
                (media) =>
                  `//image.tmdb.org/t/p/w1920_and_h800_multi_faces/${media.backdropPath}`
              )
              .slice(0, 6)}
          />
        </div>
      )}
      <div className="relative z-10 flex flex-col items-center mt-4 mb-8 md:flex-row md:items-start">
        {data.profilePath && (
          <div
            style={{
              backgroundImage: `url(https://image.tmdb.org/t/p/w600_and_h900_bestv2${data.profilePath})`,
            }}
            className="flex-shrink-0 mb-6 mr-0 bg-center bg-cover rounded-full w-36 h-36 md:w-44 md:h-44 md:mb-0 md:mr-6"
          />
        )}
        <div className="text-center text-gray-300 md:text-left">
          <h1 className="mb-4 text-3xl text-white md:text-4xl">{data.name}</h1>
          <div className="relative">
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
            <div
              className="outline-none group ring-0"
              onClick={() => setShowBio((show) => !show)}
              role="button"
              tabIndex={-1}
            >
              <TruncateMarkup
                lines={showBio ? 200 : 6}
                ellipsis={
                  <Ellipsis className="relative inline-block ml-2 -top-0.5 opacity-70 group-hover:opacity-100 transition duration-300" />
                }
              >
                <div>
                  {data.biography
                    ? data.biography
                    : intl.formatMessage(messages.nobiography)}
                </div>
              </TruncateMarkup>
            </div>
          </div>
        </div>
      </div>
      {data.knownForDepartment === 'Acting' ? [cast, crew] : [crew, cast]}
      {isLoading && <LoadingSpinner />}
    </>
  );
};

export default PersonDetails;
