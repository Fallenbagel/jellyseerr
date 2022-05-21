import { sortBy } from 'lodash';
import type { TmdbCollection } from '../api/themoviedb/interfaces';
import { MediaType } from '../constants/media';
import Media from '../entity/Media';
import { mapMovieResult, MovieResult } from './Search';

export interface Collection {
  id: number;
  name: string;
  overview?: string;
  posterPath?: string;
  backdropPath?: string;
  parts: MovieResult[];
}

export const mapCollection = (
  collection: TmdbCollection,
  media: Media[]
): Collection => ({
  id: collection.id,
  name: collection.name,
  overview: collection.overview,
  posterPath: collection.poster_path,
  backdropPath: collection.backdrop_path,
  parts: sortBy(collection.parts, 'release_date').map((part) =>
    mapMovieResult(
      part,
      media?.find(
        (req) => req.tmdbId === part.id && req.mediaType === MediaType.MOVIE
      )
    )
  ),
});
