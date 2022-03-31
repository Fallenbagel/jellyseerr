import React, { useContext } from 'react';
import useSWR, { useSWRInfinite } from 'swr';
import type { MovieResult } from '../../../server/models/Search';
import ListView from '../Common/ListView';
import { useRouter } from 'next/router';
import Header from '../Common/Header';
import type { MovieDetails } from '../../../server/models/Movie';
import { LanguageContext } from '../../context/LanguageContext';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import useSettings from '../../hooks/useSettings';
import { MediaStatus } from '../../../server/constants/media';
import PageTitle from '../Common/PageTitle';

const messages = defineMessages({
  recommendations: 'Recommendations',
  recommendationssubtext: 'If you liked {title}, you might also like…',
});

interface SearchResult {
  page: number;
  totalResults: number;
  totalPages: number;
  results: MovieResult[];
}

const MovieRecommendations: React.FC = () => {
  const settings = useSettings();
  const intl = useIntl();
  const router = useRouter();
  const { locale } = useContext(LanguageContext);
  const { data: movieData, error: movieError } = useSWR<MovieDetails>(
    `/api/v1/movie/${router.query.movieId}?language=${locale}`
  );
  const { data, error, size, setSize } = useSWRInfinite<SearchResult>(
    (pageIndex: number, previousPageData: SearchResult | null) => {
      if (previousPageData && pageIndex + 1 > previousPageData.totalPages) {
        return null;
      }

      return `/api/v1/movie/${router.query.movieId}/recommendations?page=${
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
      <PageTitle
        title={[intl.formatMessage(messages.recommendations), movieData?.title]}
      />
      <div className="mt-1 mb-5">
        <Header
          subtext={
            movieData && !movieError
              ? intl.formatMessage(messages.recommendationssubtext, {
                  title: movieData.title,
                })
              : ''
          }
        >
          <FormattedMessage {...messages.recommendations} />
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

export default MovieRecommendations;
