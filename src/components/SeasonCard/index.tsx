import { withProperties } from '../../utils/typeHelpers';
import Placeholder from './Placeholder';
import React, { useEffect, useState } from 'react';
import { useIsTouch } from '../../hooks/useIsTouch';
import CachedImage from '../Common/CachedImage';
import { MediaStatus } from '../../../server/constants/media';
import { BellIcon, CheckIcon, ClockIcon } from '@heroicons/react/solid';
import Spinner from '../../assets/spinner.svg';
import Transition from '../Transition';
import Link from 'next/link';

interface SeasonCardProps {
  tvId: number;
  image?: string;
  status?: MediaStatus;
  seasonNumber: number;
  inProgress?: boolean;
  airDate: Date;
  title: string;
  summary: string;
  canExpand?: boolean;
  episodeCount?: number;
  availableEpisodes?: number;
}

const SeasonCard: React.FC<SeasonCardProps> = ({
  tvId,
  image,
  status = MediaStatus.UNKNOWN,
  inProgress = false,
  seasonNumber,
  airDate,
  title,
  summary,
  canExpand = false,
  episodeCount = 0,
  availableEpisodes = 0,
}) => {
  const isTouch = useIsTouch();
  const [isUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [showDetail, setShowDetail] = useState(false);

  const year = airDate.getFullYear();

  useEffect(() => {
    setCurrentStatus(status);
  }, [status]);

  return (
    <div className={canExpand ? 'w-full' : 'w-36 sm:w-36 md:w-44'}>
      <div
        className={`relative transform-gpu cursor-default overflow-hidden rounded-xl bg-gray-800 bg-cover outline-none ring-1 transition duration-300 ${
          showDetail
            ? 'scale-105 shadow-lg ring-gray-500'
            : 'rin-gray-700 scale-100 shadow'
        }`}
        style={{ paddingBottom: '150%' }}
        onMouseEnter={() => {
          if (!isTouch) {
            setShowDetail(true);
          }
        }}
        onMouseLeave={() => setShowDetail(false)}
        onClick={() => setShowDetail(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setShowDetail(true);
          }
        }}
        role="link"
        tabIndex={0}
      >
        <div className="absolute inset-0 h-full w-full overflow-hidden">
          <CachedImage
            className="absolute inset-0 h-full w-full"
            alt="TODO: Add Season number here"
            src={
              image
                ? `https://image.tmdb.org/t/p/w300_and_h450_face${image}`
                : `/images/overseerr_poster_not_found_logo_top.png`
            }
            layout="fill"
            objectFit="cover"
          />
          <div className="absolute left-0 right-0 flex items-center justify-between p-2">
            <div className="pointer-events-none z-40">
              {(currentStatus === MediaStatus.AVAILABLE ||
                currentStatus === MediaStatus.PARTIALLY_AVAILABLE) && (
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-400 text-white shadow sm:h-5 sm:w-5">
                  <CheckIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
              )}
              {currentStatus === MediaStatus.PENDING && (
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500 text-white shadow sm:h-5 sm:w-5">
                  <BellIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
              )}
              {currentStatus === MediaStatus.PROCESSING && (
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-white shadow sm:h-5 sm:w-5">
                  {inProgress ? (
                    <Spinner className="h-3 w-3" />
                  ) : (
                    <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </div>
              )}
            </div>
          </div>
          <Transition
            show={isUpdating}
            enter="transition ease-in-out duration-300 transform opacity-0"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition ease-in-out duration-300 transform opacity-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute inset-0 z-40 flex items-center justify-center rounded-xl bg-gray-800 bg-opacity-75 text-white">
              <Spinner className="h-10 w-10" />
            </div>
          </Transition>

          <Transition
            show={!image || showDetail}
            enter="transition transform opacity-0"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition transform opacity-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute inset-0 overflow-hidden rounded-xl">
              <Link href={`/tv/${tvId}/season/${seasonNumber}`}>
                <a
                  className="absolute inset-0 h-full w-full cursor-pointer overflow-hidden text-left"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(45, 55, 72, 0.4) 0%, rgba(45, 55, 72, 0.9) 100%)',
                  }}
                >
                  <div className="flex h-full w-full items-end">
                    <div className="px-2 text-white">
                      {year && (
                        <div className="text-sm font-medium">{year}</div>
                      )}
                      <h1
                        className="whitespace-normal text-xl font-bold leading-tight"
                        style={{
                          WebkitLineClamp: 3,
                          display: '-webkit-box',
                          overflow: 'hidden',
                          WebkitBoxOrient: 'vertical',
                          wordBreak: 'break-word',
                        }}
                      >
                        {title}
                      </h1>
                      <div
                        className="mb-5 whitespace-normal text-xs"
                        style={{
                          WebkitLineClamp:
                            currentStatus &&
                            currentStatus !== MediaStatus.UNKNOWN
                              ? 5
                              : 3,
                          display: '-webkit-box',
                          overflow: 'hidden',
                          WebkitBoxOrient: 'vertical',
                          wordBreak: 'break-word',
                        }}
                      >
                        {summary}
                      </div>
                      <div
                        className="absolute bottom-0 right-0 rounded-tl-lg px-2 text-sm font-bold tracking-tighter"
                        style={{
                          background: 'rgba(0,0,0,.8)',
                        }}
                      >
                        {availableEpisodes}/{episodeCount}
                      </div>
                    </div>
                  </div>
                </a>
              </Link>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  );
};

export default withProperties(SeasonCard, { Placeholder });
