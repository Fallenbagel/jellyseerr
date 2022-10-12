import type Issue from '@server/entity/Issue';
import type { PaginatedResponse } from './common';

export interface IssueResultsResponse extends PaginatedResponse {
  results: Issue[];
}
