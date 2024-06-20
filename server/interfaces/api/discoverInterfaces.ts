import type { User } from '@server/entity/User';

export interface GenreSliderItem {
  id: number;
  name: string;
  backdrops: string[];
}

export interface WatchlistItem {
  ratingKey: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
}

export interface WatchlistResponse {
  page: number;
  totalPages: number;
  totalResults: number;
  results: WatchlistItem[];
}

export interface BlacklistItem {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title?: string;
  createdAt?: Date;
  user: User;
}
