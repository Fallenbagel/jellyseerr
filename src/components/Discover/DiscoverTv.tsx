import React, { useContext } from 'react';
import { useSWRInfinite } from 'swr';
import type { TvResult } from '../../../server/models/Search';
import ListView from '../Common/ListView';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { LanguageContext } from '../../context/LanguageContext';
import Header from '../Common/Header';
import useSettings from '../../hooks/useSettings';
import { MediaStatus } from '../../../server/constants/media';
import PageTitle from '../Common/PageTitle';

const messages = defineMessages({
  discovertv: 'Popular Series',
});

interface SearchResult {
  page: number;
  totalResults: number;
  totalPages: number;
  results: TvResult[];
}

const DiscoverTv: React.FC = () => {
  const intl = useIntl();
  const settings = useSettings();
  const { locale } = useContext(LanguageContext);
  const { data, error, size, setSize } = useSWRInfinite<SearchResult>(
    (pageIndex: number, previousPageData: SearchResult | null) => {
      if (previousPageData && pageIndex + 1 > previousPageData.totalPages) {
        return null;
      }

      return `/api/v1/discover/tv?page=${pageIndex + 1}&language=${locale}`;
    },
    {
      initialSize: 3,
    }
  );

  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === 'undefined');

  const fetchMore = () => {
    setSize(size + 1);
  };

  if (error) {
    return <div>{error}</div>;
  }

  let titles = (data ?? []).reduce(
    (a, v) => [...a, ...v.results],
    [] as TvResult[]
  );

  if (settings.currentSettings.hideAvailable) {
    titles = titles.filter(
      (i) =>
        i.mediaInfo?.status !== MediaStatus.AVAILABLE &&
        i.mediaInfo?.status !== MediaStatus.PARTIALLY_AVAILABLE
    );
  }

  const isEmpty = !isLoadingInitialData && titles?.length === 0;
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.results.length < 20);

  return (
    <>
      <PageTitle title={intl.formatMessage(messages.discovertv)} />
      <div className="mt-1 mb-5">
        <Header>
          <FormattedMessage {...messages.discovertv} />
        </Header>
      </div>
      <ListView
        items={titles}
        isEmpty={isEmpty}
        isReachingEnd={isReachingEnd}
        isLoading={
          isLoadingInitialData || (isLoadingMore && (titles?.length ?? 0) > 0)
        }
        onScrollBottom={fetchMore}
      />
    </>
  );
};

export default DiscoverTv;
