import React from 'react';
import type { MovieResult } from '../../../../server/models/Search';
import ListView from '../../Common/ListView';
import { defineMessages, useIntl } from 'react-intl';
import Header from '../../Common/Header';
import PageTitle from '../../Common/PageTitle';
import { useRouter } from 'next/router';
import globalMessages from '../../../i18n/globalMessages';
import useDiscover from '../../../hooks/useDiscover';
import Error from '../../../pages/_error';

const messages = defineMessages({
  languageMovies: '{language} Movies',
});

const DiscoverMovieLanguage: React.FC = () => {
  const router = useRouter();
  const intl = useIntl();

  const {
    isLoadingInitialData,
    isEmpty,
    isLoadingMore,
    isReachingEnd,
    titles,
    fetchMore,
    error,
  } = useDiscover<
    MovieResult,
    {
      originalLanguage: {
        iso_639_1: string;
        english_name: string;
        name: string;
      };
    }
  >(`/api/v1/discover/movies/language/${router.query.language}`);

  if (error) {
    return <Error statusCode={500} />;
  }

  const title = isLoadingInitialData
    ? intl.formatMessage(globalMessages.loading)
    : intl.formatMessage(messages.languageMovies, {
        language: intl.formatDisplayName(router.query.language as string, {
          type: 'language',
          fallback: 'none',
        }),
      });

  return (
    <>
      <PageTitle title={title} />
      <div className="mt-1 mb-5">
        <Header>{title}</Header>
      </div>
      <ListView
        items={titles}
        isEmpty={isEmpty}
        isLoading={
          isLoadingInitialData || (isLoadingMore && (titles?.length ?? 0) > 0)
        }
        isReachingEnd={isReachingEnd}
        onScrollBottom={fetchMore}
      />
    </>
  );
};

export default DiscoverMovieLanguage;
