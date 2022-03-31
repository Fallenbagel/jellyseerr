import React, { useContext } from 'react';
import useSWR, { useSWRInfinite } from 'swr';
import type { MovieResult } from '../../../server/models/Search';
import ListView from '../Common/ListView';
import { useRouter } from 'next/router';
import { LanguageContext } from '../../context/LanguageContext';
import { useIntl, defineMessages, FormattedMessage } from 'react-intl';
import type { TvDetails } from '../../../server/models/Tv';
import Header from '../Common/Header';
import { MediaStatus } from '../../../server/constants/media';
import useSettings from '../../hooks/useSettings';
import PageTitle from '../Common/PageTitle';

const messages = defineMessages({
  similar: 'Similar Series',
  similarsubtext: 'Other series similar to {title}',
});

interface SearchResult {
  page: number;
  totalResults: number;
  totalPages: number;
  results: MovieResult[];
}

const TvSimilar: React.FC = () => {
  const settings = useSettings();
  const router = useRouter();
  const intl = useIntl();
  const { locale } = useContext(LanguageContext);
  const { data: tvData, error: tvError } = useSWR<TvDetails>(
    `/api/v1/tv/${router.query.tvId}?language=${locale}`
  );
  const { data, error, size, setSize } = useSWRInfinite<SearchResult>(
    (pageIndex: number, previousPageData: SearchResult | null) => {
      if (previousPageData && pageIndex + 1 > previousPageData.totalPages) {
        return null;
      }

      return `/api/v1/tv/${router.query.tvId}/similar?page=${
        pageIndex + 1
      }&language=${locale}`;
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
    [] as MovieResult[]
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
      <PageTitle title={[intl.formatMessage(messages.similar), tvData?.name]} />
      <div className="mt-1 mb-5">
        <Header
          subtext={
            tvData && !tvError
              ? intl.formatMessage(messages.similarsubtext, {
                  title: tvData.name,
                })
              : undefined
          }
        >
          <FormattedMessage {...messages.similar} />
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

export default TvSimilar;
