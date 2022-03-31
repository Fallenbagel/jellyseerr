interface PageInfo {
  pages: number;
  page: number;
  results: number;
  pageSize: number;
}

export interface PaginatedResponse {
  pageInfo: PageInfo;
}
