import type { User } from '../../entity/User';
import { MediaRequest } from '../../entity/MediaRequest';
import { PaginatedResponse } from './common';

export interface UserResultsResponse extends PaginatedResponse {
  results: User[];
}

export interface UserRequestsResponse extends PaginatedResponse {
  results: MediaRequest[];
}
