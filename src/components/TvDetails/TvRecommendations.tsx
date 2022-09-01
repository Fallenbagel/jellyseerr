import Header from '@app/components/Common/Header';
import ListView from '@app/components/Common/ListView';
import PageTitle from '@app/components/Common/PageTitle';
import useDiscover from '@app/hooks/useDiscover';
import Error from '@app/pages/_error';
import type { TvResult } from '@server/models/Search';
import type { TvDetails } from '@server/models/Tv';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { defineMessages, useIntl } from 'react-intl';
import useSWR from 'swr';

const messages = defineMessages({
  recommendations: 'Recommendations',
});

const TvRecommendations = () => {
  const router = useRouter();
  const intl = useIntl();
  const { data: tvData } = useSWR<TvDetails>(`/api/v1/tv/${router.query.tvId}`);
  const {
    isLoadingInitialData,
    isEmpty,
    isLoadingMore,
    isReachingEnd,
    titles,
    fetchMore,
    error,
  } = useDiscover<TvResult>(`/api/v1/tv/${router.query.tvId}/recommendations`);

  if (error) {
    return <Error statusCode={500} />;
  }

  return (
    <>
      <PageTitle
        title={[intl.formatMessage(messages.recommendations), tvData?.name]}
      />
      <div className="mt-1 mb-5">
        <Header
          subtext={
            <Link href={`/tv/${tvData?.id}`}>
              <a className="hover:underline">{tvData?.name}</a>
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

export default TvRecommendations;
