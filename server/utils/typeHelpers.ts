import type {
  TmdbMovieDetails,
  TmdbMovieResult,
  TmdbPersonDetails,
  TmdbPersonResult,
  TmdbTvDetails,
  TmdbTvResult,
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

export const isMovieDetails = (
  movie: TmdbMovieDetails | TmdbTvDetails | TmdbPersonDetails
): movie is TmdbMovieDetails => {
  return (movie as TmdbMovieDetails).title !== undefined;
};

export const isTvDetails = (
  tv: TmdbMovieDetails | TmdbTvDetails | TmdbPersonDetails
): tv is TmdbTvDetails => {
  return (tv as TmdbTvDetails).number_of_seasons !== undefined;
};
