import React, { useState, useCallback, useEffect } from 'react';
import type { MediaType } from '../../../server/models/Search';
import { withProperties } from '../../utils/typeHelpers';
import Transition from '../Transition';
import Placeholder from './Placeholder';
import Link from 'next/link';
import { MediaStatus } from '../../../server/constants/media';
import RequestModal from '../RequestModal';
import { defineMessages, useIntl } from 'react-intl';
import { useIsTouch } from '../../hooks/useIsTouch';
import globalMessages from '../../i18n/globalMessages';
import Spinner from '../../assets/spinner.svg';
import { useUser, Permission } from '../../hooks/useUser';

const messages = defineMessages({
  movie: 'Movie',
  tvshow: 'Series',
});

interface TitleCardProps {
  id: number;
  image?: string;
  summary?: string;
  year?: string;
  title: string;
  userScore: number;
  mediaType: MediaType;
  status?: MediaStatus;
  canExpand?: boolean;
  inProgress?: boolean;
}

const TitleCard: React.FC<TitleCardProps> = ({
  id,
  image,
  summary,
  year,
  title,
  status,
  mediaType,
  inProgress = false,
  canExpand = false,
}) => {
  const isTouch = useIsTouch();
  const intl = useIntl();
  const { hasPermission } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [showDetail, setShowDetail] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Just to get the year from the date
  if (year) {
    year = year.slice(0, 4);
  }

  useEffect(() => {
    setCurrentStatus(status);
  }, [status]);

  const requestComplete = useCallback((newStatus: MediaStatus) => {
    setCurrentStatus(newStatus);
    setShowRequestModal(false);
  }, []);

  const requestUpdating = useCallback(
    (status: boolean) => setIsUpdating(status),
    []
  );

  const closeModal = useCallback(() => setShowRequestModal(false), []);

  return (
    <div className={canExpand ? 'w-full' : 'w-36 sm:w-36 md:w-44'}>
      <RequestModal
        tmdbId={id}
        show={showRequestModal}
        type={mediaType === 'movie' ? 'movie' : 'tv'}
        onComplete={requestComplete}
        onUpdating={requestUpdating}
        onCancel={closeModal}
      />
      <div
        className={`transition duration-300 transform-gpu scale-100 outline-none cursor-default titleCard ${
          showDetail ? 'scale-105' : ''
        }`}
        style={{
          backgroundImage: image
            ? `url(//image.tmdb.org/t/p/w300_and_h450_face${image})`
            : `url('/images/overseerr_poster_not_found_logo_top.png')`,
        }}
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
        <div className="absolute top-0 bottom-0 left-0 right-0 w-full h-full overflow-hidden shadow">
          <div className="absolute left-0 right-0 flex items-center justify-between p-2">
            <div
              className={`rounded-full z-40 pointer-events-none shadow ${
                mediaType === 'movie' ? 'bg-blue-500' : 'bg-purple-600'
              }`}
            >
              <div className="flex items-center h-4 px-2 py-2 text-xs font-normal tracking-wider text-center text-white uppercase sm:h-5">
                {mediaType === 'movie'
                  ? intl.formatMessage(messages.movie)
                  : intl.formatMessage(messages.tvshow)}
              </div>
            </div>
            <div className="z-40 pointer-events-none">
              {(currentStatus === MediaStatus.AVAILABLE ||
                currentStatus === MediaStatus.PARTIALLY_AVAILABLE) && (
                <div className="flex items-center justify-center w-4 h-4 text-white bg-green-400 rounded-full shadow sm:w-5 sm:h-5">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
              {currentStatus === MediaStatus.PENDING && (
                <div className="flex items-center justify-center w-4 h-4 text-white bg-yellow-500 rounded-full shadow sm:w-5 sm:h-5">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                </div>
              )}
              {currentStatus === MediaStatus.PROCESSING && (
                <div className="flex items-center justify-center w-4 h-4 text-white bg-indigo-500 rounded-full shadow sm:w-5 sm:h-5">
                  {inProgress ? (
                    <Spinner className="w-3 h-3" />
                  ) : (
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
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
            <div className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center text-white bg-gray-800 bg-opacity-75 rounded-lg">
              <Spinner className="w-10 h-10" />
            </div>
          </Transition>

          <Transition
            show={!image || showDetail || showRequestModal}
            enter="transition transform opacity-0"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition transform opacity-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute top-0 bottom-0 left-0 right-0">
              <Link href={mediaType === 'movie' ? `/movie/${id}` : `/tv/${id}`}>
                <a
                  className="absolute top-0 bottom-0 left-0 right-0 w-full h-full overflow-hidden text-left rounded-lg cursor-pointer"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(45, 55, 72, 0.4) 0%, rgba(45, 55, 72, 0.9) 100%)',
                  }}
                >
                  <div className="flex items-end w-full h-full">
                    <div
                      className={`px-2 text-white ${
                        !hasPermission(Permission.REQUEST) ||
                        (currentStatus && currentStatus !== MediaStatus.UNKNOWN)
                          ? 'pb-2'
                          : 'pb-11'
                      }`}
                    >
                      {year && <div className="text-sm">{year}</div>}

                      <h1 className="text-xl leading-tight whitespace-normal">
                        {title}
                      </h1>
                      <div
                        className="text-xs whitespace-normal"
                        style={{
                          WebkitLineClamp:
                            !hasPermission(Permission.REQUEST) ||
                            (currentStatus &&
                              currentStatus !== MediaStatus.UNKNOWN)
                              ? 5
                              : 3,
                          display: '-webkit-box',
                          overflow: 'hidden',
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {summary}
                      </div>
                    </div>
                  </div>
                </a>
              </Link>

              <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 py-2">
                {hasPermission(Permission.REQUEST) &&
                  (!currentStatus || currentStatus === MediaStatus.UNKNOWN) && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setShowRequestModal(true);
                      }}
                      className="flex items-center justify-center w-full text-white transition duration-150 ease-in-out bg-indigo-600 rounded-md h-7 hover:bg-indigo-500 focus:border-indigo-700 focus:ring-indigo active:bg-indigo-700"
                    >
                      <svg
                        className="w-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      <span className="text-xs">
                        {intl.formatMessage(globalMessages.request)}
                      </span>
                    </button>
                  )}
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  );
};

export default withProperties(TitleCard, { Placeholder });
