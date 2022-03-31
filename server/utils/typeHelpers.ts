import type {
  TmdbMovieResult,
  TmdbTvResult,
  TmdbPersonResult,
} from '../api/themoviedb/interfaces';

export const isMovie = (
  movie: TmdbMovieResult | TmdbTvResult | TmdbPersonResult
): movie is TmdbMovieResult => {
  return (movie as TmdbMovieResult).title !== undefined;
};

export const isPerson = (
  person: TmdbMovieResult | TmdbTvResult | TmdbPersonResult
): person is TmdbPersonResult => {
  return (person as TmdbPersonResult).known_for !== undefined;
};
