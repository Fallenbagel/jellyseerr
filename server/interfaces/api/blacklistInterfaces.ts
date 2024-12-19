import type { User } from '@server/entity/User';
import type { PaginatedResponse } from '@server/interfaces/api/common';

export interface BlacklistItem {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title?: string;
  createdAt?: Date;
  user: User;
}

export interface BlacklistResultsResponse extends PaginatedResponse {
  results: BlacklistItem[];
}
