import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useContext, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useToasts } from 'react-toast-notifications';
import useSWR from 'swr';
import { MediaStatus } from '../../../server/constants/media';
import type { MediaRequest } from '../../../server/entity/MediaRequest';
import type { Collection } from '../../../server/models/Collection';
import { LanguageContext } from '../../context/LanguageContext';
import Error from '../../pages/_error';
import StatusBadge from '../StatusBadge';
import ButtonWithDropdown from '../Common/ButtonWithDropdown';
import LoadingSpinner from '../Common/LoadingSpinner';
import Modal from '../Common/Modal';
import Slider from '../Slider';
import TitleCard from '../TitleCard';
import Transition from '../Transition';
import PageTitle from '../Common/PageTitle';
import { useUser, Permission } from '../../hooks/useUser';
import useSettings from '../../hooks/useSettings';

const messages = defineMessages({
  overviewunavailable: 'Overview unavailable.',
  overview: 'Overview',
  movies: 'Movies',
  numberofmovies: 'Number of Movies: {count}',
  requesting: 'Requesting…',
  request: 'Request',
  requestcollection: 'Request Collection',
  requestswillbecreated:
    'The following titles will have requests created for them:',
  request4k: 'Request 4K',
  requestcollection4k: 'Request Collection in 4K',
  requestswillbecreated4k:
    'The following titles will have 4K requests created for them:',
  requestSuccess: '<strong>{title}</strong> successfully requested!',
});

interface CollectionDetailsProps {
  collection?: Collection;
}

const CollectionDetails: React.FC<CollectionDetailsProps> = ({
  collection,
}) => {
  const intl = useIntl();
  const router = useRouter();
  const settings = useSettings();
  const { addToast } = useToasts();
  const { locale } = useContext(LanguageContext);
  const { hasPermission } = useUser();
  const [requestModal, setRequestModal] = useState(false);
  const [isRequesting, setRequesting] = useState(false);
  const [is4k, setIs4k] = useState(false);

  const { data, error, revalidate } = useSWR<Collection>(
    `/api/v1/collection/${router.query.collectionId}?language=${locale}`,
    {
      initialData: collection,
      revalidateOnMount: true,
    }
  );

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <Error statusCode={404} />;
  }

  let collectionStatus = MediaStatus.UNKNOWN;
  let collectionStatus4k = MediaStatus.UNKNOWN;

  if (
    data.parts.every(
      (part) =>
        part.mediaInfo && part.mediaInfo.status === MediaStatus.AVAILABLE
    )
  ) {
    collectionStatus = MediaStatus.AVAILABLE;
  } else if (
    data.parts.some(
      (part) =>
        part.mediaInfo && part.mediaInfo.status === MediaStatus.AVAILABLE
    )
  ) {
    collectionStatus = MediaStatus.PARTIALLY_AVAILABLE;
  }

  if (
    data.parts.every(
      (part) =>
        part.mediaInfo && part.mediaInfo.status4k === MediaStatus.AVAILABLE
    )
  ) {
    collectionStatus4k = MediaStatus.AVAILABLE;
  } else if (
    data.parts.some(
      (part) =>
        part.mediaInfo && part.mediaInfo.status4k === MediaStatus.AVAILABLE
    )
  ) {
    collectionStatus4k = MediaStatus.PARTIALLY_AVAILABLE;
  }

  const requestableParts = data.parts.filter(
    (part) =>
      !part.mediaInfo ||
      part.mediaInfo[is4k ? 'status4k' : 'status'] === MediaStatus.UNKNOWN
  );

  const requestBundle = async () => {
    try {
      setRequesting(true);
      await Promise.all(
        requestableParts.map(async (part) => {
          await axios.post<MediaRequest>('/api/v1/request', {
            mediaId: part.id,
            mediaType: 'movie',
            is4k,
          });
        })
      );

      addToast(
        <span>
          {intl.formatMessage(messages.requestSuccess, {
            title: data?.name,
            strong: function strong(msg) {
              return <strong>{msg}</strong>;
            },
          })}
        </span>,
        { appearance: 'success', autoDismiss: true }
      );
    } catch (e) {
      addToast('Something went wrong requesting the collection.', {
        appearance: 'error',
        autoDismiss: true,
      });
    } finally {
      setRequesting(false);
      setRequestModal(false);
      revalidate();
    }
  };

  return (
    <div
      className="px-4 pt-16 -mx-4 -mt-16 bg-center bg-cover"
      style={{
        height: 493,
        backgroundImage: `linear-gradient(180deg, rgba(17, 24, 39, 0.47) 0%, rgba(17, 24, 39, 1) 100%), url(//image.tmdb.org/t/p/w1920_and_h800_multi_faces/${data.backdropPath})`,
      }}
    >
      <PageTitle title={data.name} />
      <Transition
        enter="opacity-0 transition duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="opacity-100 transition duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        show={requestModal}
      >
        <Modal
          onOk={() => requestBundle()}
          okText={
            isRequesting
              ? intl.formatMessage(messages.requesting)
              : intl.formatMessage(is4k ? messages.request4k : messages.request)
          }
          okDisabled={isRequesting}
          okButtonType="primary"
          onCancel={() => setRequestModal(false)}
          title={intl.formatMessage(
            is4k ? messages.requestcollection4k : messages.requestcollection
          )}
          iconSvg={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          }
        >
          <p>
            {intl.formatMessage(
              is4k
                ? messages.requestswillbecreated4k
                : messages.requestswillbecreated
            )}
          </p>
          <ul className="py-4 pl-8 list-disc">
            {data.parts
              .filter(
                (part) =>
                  !part.mediaInfo ||
                  part.mediaInfo[is4k ? 'status4k' : 'status'] ===
                    MediaStatus.UNKNOWN
              )
              .map((part) => (
                <li key={`request-part-${part.id}`}>{part.title}</li>
              ))}
          </ul>
        </Modal>
      </Transition>
      <div className="flex flex-col items-center pt-4 lg:flex-row lg:items-end">
        <div className="lg:mr-4">
          <img
            src={`//image.tmdb.org/t/p/w600_and_h900_bestv2${data.posterPath}`}
            alt=""
            className="w-32 rounded shadow md:rounded-lg md:shadow-2xl md:w-44 lg:w-52"
          />
        </div>
        <div className="flex flex-col flex-1 mt-4 text-center text-white lg:mr-4 lg:mt-0 lg:text-left">
          <div className="mb-2 space-x-2">
            <span className="ml-2 lg:ml-0">
              <StatusBadge
                status={collectionStatus}
                inProgress={data.parts.some(
                  (part) => (part.mediaInfo?.downloadStatus ?? []).length > 0
                )}
              />
            </span>
            {settings.currentSettings.movie4kEnabled &&
              hasPermission(
                [Permission.REQUEST_4K, Permission.REQUEST_4K_MOVIE],
                {
                  type: 'or',
                }
              ) && (
                <span>
                  <StatusBadge
                    status={collectionStatus4k}
                    is4k
                    inProgress={data.parts.some(
                      (part) =>
                        (part.mediaInfo?.downloadStatus4k ?? []).length > 0
                    )}
                  />
                </span>
              )}
          </div>
          <h1 className="text-2xl md:text-4xl">{data.name}</h1>
          <span className="mt-1 text-xs lg:text-base lg:mt-0">
            {intl.formatMessage(messages.numberofmovies, {
              count: data.parts.length,
            })}
          </span>
        </div>
        <div className="relative z-10 flex flex-wrap justify-center flex-shrink-0 mt-4 sm:justify-end sm:flex-nowrap lg:mt-0">
          {hasPermission(Permission.REQUEST) &&
            (collectionStatus !== MediaStatus.AVAILABLE ||
              (settings.currentSettings.movie4kEnabled &&
                hasPermission(
                  [Permission.REQUEST_4K, Permission.REQUEST_4K_MOVIE],
                  { type: 'or' }
                ) &&
                collectionStatus4k !== MediaStatus.AVAILABLE)) && (
              <div className="mb-3 sm:mb-0">
                <ButtonWithDropdown
                  buttonType="primary"
                  onClick={() => {
                    setRequestModal(true);
                    setIs4k(collectionStatus === MediaStatus.AVAILABLE);
                  }}
                  text={
                    <>
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
                      <span>
                        {intl.formatMessage(
                          collectionStatus === MediaStatus.AVAILABLE
                            ? messages.requestcollection4k
                            : messages.requestcollection
                        )}
                      </span>
                    </>
                  }
                >
                  {settings.currentSettings.movie4kEnabled &&
                    hasPermission(
                      [Permission.REQUEST_4K, Permission.REQUEST_4K_MOVIE],
                      { type: 'or' }
                    ) &&
                    collectionStatus !== MediaStatus.AVAILABLE &&
                    collectionStatus4k !== MediaStatus.AVAILABLE && (
                      <ButtonWithDropdown.Item
                        buttonType="primary"
                        onClick={() => {
                          setRequestModal(true);
                          setIs4k(true);
                        }}
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
                        <span>
                          {intl.formatMessage(messages.requestcollection4k)}
                        </span>
                      </ButtonWithDropdown.Item>
                    )}
                </ButtonWithDropdown>
              </div>
            )}
        </div>
      </div>
      <div className="flex flex-col pt-8 pb-4 text-white md:flex-row">
        <div className="flex-1 md:mr-8">
          <h2 className="text-xl md:text-2xl">
            {intl.formatMessage(messages.overview)}
          </h2>
          <p className="pt-2 text-sm md:text-base">
            {data.overview
              ? data.overview
              : intl.formatMessage(messages.overviewunavailable)}
          </p>
        </div>
      </div>
      <div className="mt-6 mb-4 md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center text-xl leading-7 text-white sm:text-2xl sm:leading-9 sm:truncate">
            <span>{intl.formatMessage(messages.movies)}</span>
          </div>
        </div>
      </div>
      <Slider
        sliderKey="collection-movies"
        isLoading={false}
        isEmpty={data.parts.length === 0}
        items={data.parts.map((title) => (
          <TitleCard
            key={`collection-movie-${title.id}`}
            id={title.id}
            image={title.posterPath}
            status={title.mediaInfo?.status}
            summary={title.overview}
            title={title.title}
            userScore={title.voteAverage}
            year={title.releaseDate}
            mediaType={title.mediaType}
          />
        ))}
      />
      <div className="pb-8" />
    </div>
  );
};

export default CollectionDetails;
