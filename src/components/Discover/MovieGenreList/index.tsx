import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useSWR from 'swr';
import { GenreSliderItem } from '../../../../server/interfaces/api/discoverInterfaces';
import Error from '../../../pages/_error';
import Header from '../../Common/Header';
import LoadingSpinner from '../../Common/LoadingSpinner';
import PageTitle from '../../Common/PageTitle';
import GenreCard from '../../GenreCard';
import { genreColorMap } from '../constants';

const messages = defineMessages({
  moviegenres: 'Movie Genres',
});

const MovieGenreList: React.FC = () => {
  const intl = useIntl();
  const { data, error } = useSWR<GenreSliderItem[]>(
    `/api/v1/discover/genreslider/movie`
  );

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <Error statusCode={404} />;
  }

  return (
    <>
      <PageTitle title={intl.formatMessage(messages.moviegenres)} />
      <div className="mt-1 mb-5">
        <Header>{intl.formatMessage(messages.moviegenres)}</Header>
      </div>
      <ul className="cards-horizontal">
        {data.map((genre, index) => (
          <li key={`genre-${genre.id}-${index}`}>
            <GenreCard
              name={genre.name}
              image={`https://image.tmdb.org/t/p/w1280_filter(duotone,${
                genreColorMap[genre.id] ?? genreColorMap[0]
              })${genre.backdrops[4]}`}
              url={`/discover/movies/genre/${genre.id}`}
              canExpand
            />
          </li>
        ))}
      </ul>
    </>
  );
};

export default MovieGenreList;
