import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useSWR from 'swr';
import type { MovieDetails } from '../../../server/models/Movie';
import type { MovieResult } from '../../../server/models/Search';
import useDiscover from '../../hooks/useDiscover';
import Error from '../../pages/_error';
import Header from '../Common/Header';
import ListView from '../Common/ListView';
import PageTitle from '../Common/PageTitle';

const messages = defineMessages({
  recommendations: 'Recommendations',
});

const MovieRecommendations: React.FC = () => {
  const intl = useIntl();
  const router = useRouter();
  const { data: movieData } = useSWR<MovieDetails>(
    `/api/v1/movie/${router.query.movieId}`
  );
  const {
    isLoadingInitialData,
    isEmpty,
    isLoadingMore,
    isReachingEnd,
    titles,
    fetchMore,
    error,
  } = useDiscover<MovieResult>(
    `/api/v1/movie/${router.query.movieId}/recommendations`
  );

  if (error) {
    return <Error statusCode={500} />;
  }

  return (
    <>
      <PageTitle
        title={[intl.formatMessage(messages.recommendations), movieData?.title]}
      />
      <div className="mt-1 mb-5">
        <Header
          subtext={
            <Link href={`/movie/${movieData?.id}`}>
              <a className="hover:underline">{movieData?.title}</a>
            </Link>
          }
        >
          {intl.formatMessage(messages.recommendations)}
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
