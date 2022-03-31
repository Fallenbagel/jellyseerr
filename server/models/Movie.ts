import type {
  TmdbMovieDetails,
  TmdbMovieReleaseResult,
} from '../api/themoviedb/interfaces';
import {
  ProductionCompany,
  Genre,
  Cast,
  Crew,
  mapCast,
  mapCrew,
  ExternalIds,
  mapExternalIds,
  mapVideos,
} from './common';
import Media from '../entity/Media';

export interface Video {
  url?: string;
  site: 'YouTube';
  key: string;
  name: string;
  size: number;
  type:
    | 'Clip'
    | 'Teaser'
    | 'Trailer'
    | 'Featurette'
    | 'Opening Credits'
    | 'Behind the Scenes'
    | 'Bloopers';
}

export interface MovieDetails {
  id: number;
  imdbId?: string;
  adult: boolean;
  backdropPath?: string;
  budget: number;
  genres: Genre[];
  homepage?: string;
  originalLanguage: string;
  originalTitle: string;
  overview?: string;
  popularity: number;
  relatedVideos?: Video[];
  posterPath?: string;
  productionCompanies: ProductionCompany[];
  productionCountries: {
    iso_3166_1: string;
    name: string;
  }[];
  releaseDate: string;
  releases: TmdbMovieReleaseResult;
  revenue: number;
  runtime?: number;
  spokenLanguages: {
    iso_639_1: string;
    name: string;
  }[];
  status: string;
  tagline?: string;
  title: string;
  video: boolean;
  voteAverage: number;
  voteCount: number;
  credits: {
    cast: Cast[];
    crew: Crew[];
  };
  collection?: {
    id: number;
    name: string;
    posterPath?: string;
    backdropPath?: string;
  };
  mediaInfo?: Media;
  externalIds: ExternalIds;
  plexUrl?: string;
}

export const mapMovieDetails = (
  movie: TmdbMovieDetails,
  media?: Media
): MovieDetails => ({
  id: movie.id,
  adult: movie.adult,
  budget: movie.budget,
  genres: movie.genres,
  relatedVideos: mapVideos(movie.videos),
  originalLanguage: movie.original_language,
  originalTitle: movie.original_title,
  popularity: movie.popularity,
  productionCompanies: movie.production_companies.map((company) => ({
    id: company.id,
    logoPath: company.logo_path,
    originCountry: company.origin_country,
    name: company.name,
  })),
  productionCountries: movie.production_countries,
  releaseDate: movie.release_date,
  releases: movie.release_dates,
  revenue: movie.revenue,
  spokenLanguages: movie.spoken_languages,
  status: movie.status,
  title: movie.title,
  video: movie.video,
  voteAverage: movie.vote_average,
  voteCount: movie.vote_count,
  backdropPath: movie.backdrop_path,
  homepage: movie.homepage,
  imdbId: movie.imdb_id,
  overview: movie.overview,
  posterPath: movie.poster_path,
  runtime: movie.runtime,
  tagline: movie.tagline,
  credits: {
    cast: movie.credits.cast.map(mapCast),
    crew: movie.credits.crew.map(mapCrew),
  },
  collection: movie.belongs_to_collection
    ? {
        id: movie.belongs_to_collection.id,
        name: movie.belongs_to_collection.name,
        posterPath: movie.belongs_to_collection.poster_path,
        backdropPath: movie.belongs_to_collection.backdrop_path,
      }
    : undefined,
  externalIds: mapExternalIds(movie.external_ids),
  mediaInfo: media,
});
