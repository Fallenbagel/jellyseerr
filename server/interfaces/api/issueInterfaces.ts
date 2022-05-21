import Issue from '../../entity/Issue';
import { PaginatedResponse } from './common';

export interface IssueResultsResponse extends PaginatedResponse {
  results: Issue[];
}
