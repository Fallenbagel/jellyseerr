import type { PaginatedResponse } from './common';
import type { MediaRequest } from '../../entity/MediaRequest';

export interface RequestResultsResponse extends PaginatedResponse {
  results: MediaRequest[];
}
