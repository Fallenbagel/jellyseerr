import { ArrowCircleRightIcon } from '@heroicons/react/outline';
import Link from 'next/link';
import React, { useEffect } from 'react';
import useSWRInfinite from 'swr/infinite';
import { MediaStatus } from '../../../server/constants/media';
import type {
  MovieResult,
  PersonResult,
  TvResult,
} from '../../../server/models/Search';
import useSettings from '../../hooks/useSettings';
import PersonCard from '../PersonCard';
import Slider from '../Slider';
import TitleCard from '../TitleCard';
import ShowMoreCard from './ShowMoreCard';

interface MixedResult {
  page: number;
  totalResults: number;
  totalPages: number;
  results: (TvResult | MovieResult | PersonResult)[];
}

interface MediaSliderProps {
  title: string;
  url: string;
  linkUrl?: string;
  sliderKey: string;
  hideWhenEmpty?: boolean;
}

const MediaSlider: React.FC<MediaSliderProps> = ({
  title,
  url,
  linkUrl,
  sliderKey,
  hideWhenEmpty = false,
}) => {
  const settings = useSettings();
  const { data, error, setSize, size } = useSWRInfinite<MixedResult>(
    (pageIndex: number, previousPageData: MixedResult | null) => {
      if (previousPageData && pageIndex + 1 > previousPageData.totalPages) {
        return null;
      }

      return `${url}?page=${pageIndex + 1}`;
    },
    {
      initialSize: 2,
    }
  );

  let titles = (data ?? []).reduce(
    (a, v) => [...a, ...v.results],
    [] as (MovieResult | TvResult | PersonResult)[]
  );

  if (settings.currentSettings.hideAvailable) {
    titles = titles.filter(
      (i) =>
        (i.mediaType === 'movie' || i.mediaType === 'tv') &&
        i.mediaInfo?.status !== MediaStatus.AVAILABLE &&
        i.mediaInfo?.status !== MediaStatus.PARTIALLY_AVAILABLE
    );
  }

  useEffect(() => {
    if (
      titles.length < 24 &&
      size < 5 &&
      (data?.[0]?.totalResults ?? 0) > size * 20
    ) {
      setSize(size + 1);
    }
  }, [titles, setSize, size, data]);

  if (hideWhenEmpty && (data?.[0].results ?? []).length === 0) {
    return null;
  }

  const finalTitles = titles.slice(0, 20).map((title) => {
    switch (title.mediaType) {
      case 'movie':
        return (
          <TitleCard
            id={title.id}
            image={title.posterPath}
            status={title.mediaInfo?.status}
            summary={title.overview}
            title={title.title}
            userScore={title.voteAverage}
            year={title.releaseDate}
            mediaType={title.mediaType}
            inProgress={(title.mediaInfo?.downloadStatus ?? []).length > 0}
          />
        );
      case 'tv':
        return (
          <TitleCard
            id={title.id}
            image={title.posterPath}
            status={title.mediaInfo?.status}
            summary={title.overview}
            title={title.name}
            userScore={title.voteAverage}
            year={title.firstAirDate}
            mediaType={title.mediaType}
            inProgress={(title.mediaInfo?.downloadStatus ?? []).length > 0}
          />
        );
      case 'person':
        return (
          <PersonCard
            personId={title.id}
            name={title.name}
            profilePath={title.profilePath}
          />
        );
    }
  });

  if (linkUrl && titles.length > 20) {
    finalTitles.push(
      <ShowMoreCard
        url={linkUrl}
        posters={titles
          .slice(20, 24)
          .map((title) =>
            title.mediaType !== 'person' ? title.posterPath : undefined
          )}
      />
    );
  }

  return (
    <>
      <div className="slider-header">
        {linkUrl ? (
          <Link href={linkUrl}>
            <a className="slider-title">
              <span>{title}</span>
              <ArrowCircleRightIcon />
            </a>
          </Link>
        ) : (
          <div className="slider-title">
            <span>{title}</span>
          </div>
        )}
      </div>
      <Slider
        sliderKey={sliderKey}
        isLoading={!data && !error}
        isEmpty={false}
        items={finalTitles}
      />
    </>
  );
};

export default MediaSlider;
