import React, { useState } from 'react';
import useSWR from 'swr';
import type { RequestResultsResponse } from '../../../server/interfaces/api/requestInterfaces';
import LoadingSpinner from '../Common/LoadingSpinner';
import RequestItem from './RequestItem';
import Header from '../Common/Header';
import Table from '../Common/Table';
import Button from '../Common/Button';
import { defineMessages, useIntl } from 'react-intl';
import PageTitle from '../Common/PageTitle';

const messages = defineMessages({
  requests: 'Requests',
  mediaInfo: 'Media Info',
  status: 'Status',
  requestedAt: 'Requested At',
  modifiedBy: 'Last Modified By',
  showingresults:
    'Showing <strong>{from}</strong> to <strong>{to}</strong> of <strong>{total}</strong> results',
  resultsperpage: 'Display {pageSize} results per page',
  next: 'Next',
  previous: 'Previous',
  filterAll: 'All',
  filterPending: 'Pending',
  filterApproved: 'Approved',
  filterAvailable: 'Available',
  filterProcessing: 'Processing',
  noresults: 'No results.',
  showallrequests: 'Show All Requests',
  sortAdded: 'Request Date',
  sortModified: 'Last Modified',
});

type Filter = 'all' | 'pending' | 'approved' | 'processing' | 'available';
type Sort = 'added' | 'modified';

const RequestList: React.FC = () => {
  const intl = useIntl();
  const [pageIndex, setPageIndex] = useState(0);
  const [currentFilter, setCurrentFilter] = useState<Filter>('pending');
  const [currentSort, setCurrentSort] = useState<Sort>('added');
  const [currentPageSize, setCurrentPageSize] = useState<number>(10);

  const { data, error, revalidate } = useSWR<RequestResultsResponse>(
    `/api/v1/request?take=${currentPageSize}&skip=${
      pageIndex * currentPageSize
    }&filter=${currentFilter}&sort=${currentSort}`
  );
  if (!data && !error) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <LoadingSpinner />;
  }

  const hasNextPage = data.pageInfo.pages > pageIndex + 1;
  const hasPrevPage = pageIndex > 0;

  return (
    <>
      <PageTitle title={intl.formatMessage(messages.requests)} />
      <div className="flex flex-col justify-between lg:items-end lg:flex-row">
        <Header>{intl.formatMessage(messages.requests)}</Header>
        <div className="flex flex-col flex-grow mt-2 sm:flex-row lg:flex-grow-0">
          <div className="flex flex-grow mb-2 sm:mb-0 sm:mr-2 lg:flex-grow-0">
            <span className="inline-flex items-center px-3 text-sm text-gray-100 bg-gray-800 border border-r-0 border-gray-500 cursor-default rounded-l-md">
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <select
              id="filter"
              name="filter"
              onChange={(e) => {
                setPageIndex(0);
                setCurrentFilter(e.target.value as Filter);
              }}
              value={currentFilter}
              className="rounded-r-only"
            >
              <option value="all">
                {intl.formatMessage(messages.filterAll)}
              </option>
              <option value="pending">
                {intl.formatMessage(messages.filterPending)}
              </option>
              <option value="approved">
                {intl.formatMessage(messages.filterApproved)}
              </option>
              <option value="processing">
                {intl.formatMessage(messages.filterProcessing)}
              </option>
              <option value="available">
                {intl.formatMessage(messages.filterAvailable)}
              </option>
            </select>
          </div>
          <div className="flex flex-grow mb-2 sm:mb-0 lg:flex-grow-0">
            <span className="inline-flex items-center px-3 text-gray-100 bg-gray-800 border border-r-0 border-gray-500 cursor-default sm:text-sm rounded-l-md">
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
              </svg>
            </span>
            <select
              id="sort"
              name="sort"
              onChange={(e) => {
                setPageIndex(0);
                setCurrentSort(e.target.value as Sort);
              }}
              onBlur={(e) => {
                setPageIndex(0);
                setCurrentSort(e.target.value as Sort);
              }}
              value={currentSort}
              className="rounded-r-only"
            >
              <option value="added">
                {intl.formatMessage(messages.sortAdded)}
              </option>
              <option value="modified">
                {intl.formatMessage(messages.sortModified)}
              </option>
            </select>
          </div>
        </div>
      </div>
      <Table>
        <thead>
          <tr>
            <Table.TH>{intl.formatMessage(messages.mediaInfo)}</Table.TH>
            <Table.TH>{intl.formatMessage(messages.status)}</Table.TH>
            <Table.TH>{intl.formatMessage(messages.requestedAt)}</Table.TH>
            <Table.TH>{intl.formatMessage(messages.modifiedBy)}</Table.TH>
            <Table.TH></Table.TH>
          </tr>
        </thead>
        <Table.TBody>
          {data.results.map((request) => {
            return (
              <RequestItem
                request={request}
                key={`request-list-${request.id}`}
                revalidateList={() => revalidate()}
              />
            );
          })}

          {data.results.length === 0 && (
            <tr className="relative h-24 p-2 text-white">
              <Table.TD colSpan={6} noPadding>
                <div className="flex flex-col items-center justify-center w-screen p-6 lg:w-full">
                  <span className="text-base">
                    {intl.formatMessage(messages.noresults)}
                  </span>
                  {currentFilter !== 'all' && (
                    <div className="mt-4">
                      <Button
                        buttonSize="sm"
                        buttonType="primary"
                        onClick={() => setCurrentFilter('all')}
                      >
                        {intl.formatMessage(messages.showallrequests)}
                      </Button>
                    </div>
                  )}
                </div>
              </Table.TD>
            </tr>
          )}
          <tr className="bg-gray-700">
            <Table.TD colSpan={6} noPadding>
              <nav
                className="flex flex-col items-center w-screen px-6 py-3 space-x-4 space-y-3 sm:space-y-0 sm:flex-row lg:w-full"
                aria-label="Pagination"
              >
                <div className="hidden lg:flex lg:flex-1">
                  <p className="text-sm">
                    {data.results.length > 0 &&
                      intl.formatMessage(messages.showingresults, {
                        from: pageIndex * currentPageSize + 1,
                        to:
                          data.results.length < currentPageSize
                            ? pageIndex * currentPageSize + data.results.length
                            : (pageIndex + 1) * currentPageSize,
                        total: data.pageInfo.results,
                        strong: function strong(msg) {
                          return <span className="font-medium">{msg}</span>;
                        },
                      })}
                  </p>
                </div>
                <div className="flex justify-center sm:flex-1 sm:justify-start lg:justify-center">
                  <span className="items-center -mt-3 text-sm sm:-ml-4 lg:ml-0 sm:mt-0">
                    {intl.formatMessage(messages.resultsperpage, {
                      pageSize: (
                        <select
                          id="pageSize"
                          name="pageSize"
                          onChange={(e) => {
                            setPageIndex(0);
                            setCurrentPageSize(Number(e.target.value));
                          }}
                          value={currentPageSize}
                          className="inline short"
                        >
                          <option value="5">5</option>
                          <option value="10">10</option>
                          <option value="25">25</option>
                          <option value="50">50</option>
                          <option value="100">100</option>
                        </select>
                      ),
                    })}
                  </span>
                </div>
                <div className="flex justify-center flex-auto space-x-2 sm:justify-end sm:flex-1">
                  <Button
                    disabled={!hasPrevPage}
                    onClick={() => setPageIndex((current) => current - 1)}
                  >
                    {intl.formatMessage(messages.previous)}
                  </Button>
                  <Button
                    disabled={!hasNextPage}
                    onClick={() => setPageIndex((current) => current + 1)}
                  >
                    {intl.formatMessage(messages.next)}
                  </Button>
                </div>
              </nav>
            </Table.TD>
          </tr>
        </Table.TBody>
      </Table>
    </>
  );
};

export default RequestList;
