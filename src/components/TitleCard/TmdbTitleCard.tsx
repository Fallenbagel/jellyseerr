import React, { useContext } from 'react';
import { useInView } from 'react-intersection-observer';
import useSWR from 'swr';
import type { MovieDetails } from '../../../server/models/Movie';
import type { TvDetails } from '../../../server/models/Tv';
import TitleCard from '.';
import { LanguageContext } from '../../context/LanguageContext';

interface TmdbTitleCardProps {
  tmdbId: number;
  type: 'movie' | 'tv';
}

const isMovie = (movie: MovieDetails | TvDetails): movie is MovieDetails => {
  return (movie as MovieDetails).title !== undefined;
};

const TmdbTitleCard: React.FC<TmdbTitleCardProps> = ({ tmdbId, type }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
  });
  const { locale } = useContext(LanguageContext);
  const url =
    type === 'movie' ? `/api/v1/movie/${tmdbId}` : `/api/v1/tv/${tmdbId}`;
  const { data: title, error } = useSWR<MovieDetails | TvDetails>(
    inView ? `${url}?language=${locale}` : null
  );

  if (!title && !error) {
    return (
      <div ref={ref}>
        <TitleCard.Placeholder />
      </div>
    );
  }

  if (!title) {
    return <TitleCard.Placeholder />;
  }

  return isMovie(title) ? (
    <TitleCard
      id={title.id}
      image={title.posterPath}
      status={title.mediaInfo?.status}
      summary={title.overview}
      title={title.title}
      userScore={title.voteAverage}
      year={title.releaseDate}
      mediaType={'movie'}
    />
  ) : (
    <TitleCard
      id={title.id}
      image={title.posterPath}
      status={title.mediaInfo?.status}
      summary={title.overview}
      title={title.name}
      userScore={title.voteAverage}
      year={title.firstAirDate}
      mediaType={'tv'}
    />
  );
};

export default TmdbTitleCard;
