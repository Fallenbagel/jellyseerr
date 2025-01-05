import Button from '@app/components/Common/Button';
import Ellipsis from '@app/assets/ellipsis.svg';
import CachedImage from '@app/components/Common/CachedImage';
import ImageFader from '@app/components/Common/ImageFader';
import LoadingSpinner from '@app/components/Common/LoadingSpinner';
import PageTitle from '@app/components/Common/PageTitle';
import TitleCard from '@app/components/TitleCard';
import globalMessages from '@app/i18n/globalMessages';
import Error from '@app/pages/_error';
import defineMessages from '@app/utils/defineMessages';
import type { ArtistDetailsType } from '@server/models/Artist';
import { groupBy } from 'lodash';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import TruncateMarkup from 'react-truncate-markup';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';

interface Album {
  id: string;
  title: string;
  type: string;
  releasedate: string;
  images: {
    CoverType: string;
    Url: string;
  }[];
  mediaInfo?: {
    status?: number;
    downloadStatus?: unknown[];
    watchlists?: unknown[];
  };
}

interface DiscographyResponse {
  page: number;
  pageInfo: {
    total: number;
    totalPages: number;
  };
  results: Album[];
}

const messages = defineMessages('components.GroupDetails', {
  type: 'Type: {type}',
  genres: 'Genres: {genres}',
  albums: 'Albums',
  singles: 'Singles',
  eps: 'EPs',
  other: 'Other Releases',
  overview: 'Overview',
  status: 'Status: {status}',
  loadmore: 'Load More',
});

const GroupDetails = () => {
  const intl = useIntl();
  const router = useRouter();
  const { data: artistData, error } = useSWR<ArtistDetailsType>(
    `/api/v1/group/${router.query.groupId}`
  );

  const fetchDiscography = (type: string) => {
    const { data, size, setSize, isLoading } = useSWRInfinite<DiscographyResponse>(
      (index: number) =>
        `/api/v1/group/${router.query.groupId}/discography?page=${index + 1}&type=${type}`,
      { revalidateFirstPage: false }
    );

    const albums = data ? data.flatMap((page) => page.results) : [];
    const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
    const isEmpty = data?.[0]?.results.length === 0;
    const isReachingEnd = isEmpty || (data && data[data.length - 1]?.results.length < 20);

    return {
      albums,
      isLoadingMore,
      isReachingEnd,
      loadMore: () => setSize(size + 1)
    };
  };

  const {
    albums: albumsList,
    isLoadingMore: isLoadingAlbums,
    isReachingEnd: isReachingEndAlbums,
    loadMore: loadMoreAlbums
  } = fetchDiscography('Album');

  const {
    albums: singlesList,
    isLoadingMore: isLoadingSingles,
    isReachingEnd: isReachingEndSingles,
    loadMore: loadMoreSingles
  } = fetchDiscography('Single');

  const {
    albums: epsList,
    isLoadingMore: isLoadingEps,
    isReachingEnd: isReachingEndEps,
    loadMore: loadMoreEps
  } = fetchDiscography('EP');

  const {
    albums: otherList,
    isLoadingMore: isLoadingOther,
    isReachingEnd: isReachingEndOther,
    loadMore: loadMoreOther
  } = fetchDiscography('Other');

  const [showBio, setShowBio] = useState(false);

  if (!artistData && !error) {
    return (
      <div>
        <div className="slider-header">
          <div className="slider-title">
            <span>&nbsp;</span>
          </div>
        </div>
        <ul className="cards-vertical">
          {[...Array(20)].map((_, index) => (
            <li key={`placeholder-${index}`}>
              <TitleCard.Placeholder canExpand />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (!artistData) {
    return <Error statusCode={404} />;
  }

  const groupAttributes: string[] = [];

  if (artistData.type) {
    groupAttributes.push(
      intl.formatMessage(messages.type, {
        type: artistData.type,
      })
    );
  }

  if (artistData.genres?.length > 0) {
    groupAttributes.push(
      intl.formatMessage(messages.genres, {
        genres: artistData.genres.join(', '),
      })
    );
  }

  if (artistData.status) {
    const capitalizeFirstLetter = (str: string) =>
      str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    groupAttributes.push(
      intl.formatMessage(messages.status, {
        status: capitalizeFirstLetter(artistData.status),
      })
    );
  }

  const renderAlbumSection = (
    title: string,
    albums: Album[],
    isLoading: boolean,
    isReachingEnd: boolean,
    onLoadMore: () => void
  ) => {
    if (!albums.length && !isLoading) return null;

    return (
      <>
        <div className="slider-header">
          <div className="slider-title">
            <span>{title}</span>
          </div>
        </div>
        <ul className="cards-vertical">
          {albums.map((album) => (
            <li key={`album-${album.id}`}>
              <TitleCard
                id={album.id}
                isAddedToWatchlist={album.mediaInfo?.watchlists?.length ?? 0}
                title={album.title}
                image={album.images?.[0]?.Url}
                year={album.releasedate}
                type={album.type}
                mediaType="album"
                status={album.mediaInfo?.status}
                inProgress={(album.mediaInfo?.downloadStatus ?? []).length > 0}
                canExpand
              />
            </li>
          ))}
          {isLoading &&
            [...Array(20)].map((_, index) => (
              <li key={`placeholder-${index}`}>
                <TitleCard.Placeholder canExpand />
              </li>
            ))}
        </ul>
        {!isReachingEnd && (
          <div className="mt-4 flex justify-center">
            <Button
              onClick={onLoadMore}
              disabled={isLoading}
              className="w-32 h-9 flex items-center justify-center"
            >
              {isLoading ? (
                <LoadingSpinner className="w-5 h-5" />
              ) : (
                intl.formatMessage(messages.loadmore)
              )}
            </Button>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <PageTitle title={artistData.name} />

      {(albumsList?.length > 0 || singlesList?.length > 0 || epsList?.length > 0) && (
        <div className="absolute top-0 left-0 right-0 z-0 h-96">
          <ImageFader
            isDarker
            backgroundImages={[...albumsList, ...singlesList, ...epsList]
              .filter((album): album is (typeof album & { images: NonNullable<typeof album.images> }) =>
                Array.isArray(album.images) && album.images.length > 0)
              .map((album) => album.images[0].Url)
              .slice(0, 6)}
          />
        </div>
      )}

      <div className="relative z-10 mt-4 mb-8 flex flex-col items-center lg:flex-row lg:items-start">
        {artistData.images?.[0]?.Url && (
          <div className="relative mb-6 mr-0 h-36 w-36 flex-shrink-0 overflow-hidden rounded-full ring-1 ring-gray-700 lg:mb-0 lg:mr-6 lg:h-44 lg:w-44">
          <CachedImage
            type="music"
            src={artistData.images?.find(image => image.CoverType === 'Poster')?.Url ?? '/images/overseerr_poster_not_found.png'}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            fill
          />
          </div>
        )}
        <div className="text-center text-gray-300 lg:text-left">
          <h1 className="text-3xl text-white lg:text-4xl">{artistData.name}</h1>
          <div className="mt-1 mb-2 space-y-1 text-xs text-white sm:text-sm lg:text-base">
            <div>{groupAttributes.join(' | ')}</div>
          </div>
          {artistData.overview && (
            <div className="relative text-left">
              <div
                className="group outline-none ring-0"
                onClick={() => setShowBio((show) => !show)}
                role="button"
                tabIndex={-1}
              >
                <TruncateMarkup
                  lines={showBio ? 200 : 6}
                  ellipsis={
                    <Ellipsis className="relative -top-0.5 ml-2 inline-block opacity-70 transition duration-300 group-hover:opacity-100" />
                  }
                >
                  <p className="pt-2 text-sm lg:text-base">{artistData.overview}</p>
                </TruncateMarkup>
              </div>
            </div>
          )}
        </div>
      </div>
      {renderAlbumSection(
        intl.formatMessage(messages.albums),
        albumsList,
        isLoadingAlbums ?? false,
        isReachingEndAlbums ?? false,
        loadMoreAlbums
      )}
      {renderAlbumSection(
        intl.formatMessage(messages.singles),
        singlesList,
        isLoadingSingles ?? false,
        isReachingEndSingles ?? false,
        loadMoreSingles
      )}
      {renderAlbumSection(
        intl.formatMessage(messages.eps),
        epsList,
        isLoadingEps ?? false,
        isReachingEndEps ?? false,
        loadMoreEps
      )}
      {renderAlbumSection(
        intl.formatMessage(messages.other),
        otherList,
        isLoadingOther ?? false,
        isReachingEndOther ?? false,
        loadMoreOther
      )}
    </>
  );
};

export default GroupDetails;
