import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useSWR from 'swr';
import { MovieDetails } from '../../../../server/models/Movie';
import { LanguageContext } from '../../../context/LanguageContext';
import Error from '../../../pages/_error';
import Header from '../../Common/Header';
import LoadingSpinner from '../../Common/LoadingSpinner';
import PersonCard from '../../PersonCard';
import PageTitle from '../../Common/PageTitle';

const messages = defineMessages({
  fullcast: 'Full Cast',
});

const MovieCast: React.FC = () => {
  const router = useRouter();
  const intl = useIntl();
  const { locale } = useContext(LanguageContext);
  const { data, error } = useSWR<MovieDetails>(
    `/api/v1/movie/${router.query.movieId}?language=${locale}`
  );

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <Error statusCode={404} />;
  }

  return (
    <>
      <PageTitle title={[intl.formatMessage(messages.fullcast), data.title]} />
      <div className="mt-1 mb-5">
        <Header
          subtext={
            <Link href={`/movie/${data.id}`}>
              <a className="hover:underline">{data.title}</a>
            </Link>
          }
        >
          {intl.formatMessage(messages.fullcast)}
        </Header>
      </div>
      <ul className="cardList">
        {data?.credits.cast.map((person, index) => {
          return (
            <li key={`cast-${person.id}-${index}`}>
              <PersonCard
                name={person.name}
                personId={person.id}
                subName={person.character}
                profilePath={person.profilePath}
                canExpand
              />
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default MovieCast;
