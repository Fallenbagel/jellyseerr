import { DownloadIcon } from '@heroicons/react/outline';
import axios from 'axios';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useToasts } from 'react-toast-notifications';
import useSWR from 'swr';
import { ANIME_KEYWORD_ID } from '../../../server/api/themoviedb/constants';
import {
  MediaRequestStatus,
  MediaStatus,
} from '../../../server/constants/media';
import { MediaRequest } from '../../../server/entity/MediaRequest';
import SeasonRequest from '../../../server/entity/SeasonRequest';
import { QuotaResponse } from '../../../server/interfaces/api/userInterfaces';
import { Permission } from '../../../server/lib/permissions';
import { TvDetails } from '../../../server/models/Tv';
import useSettings from '../../hooks/useSettings';
import { useUser } from '../../hooks/useUser';
import globalMessages from '../../i18n/globalMessages';
import Alert from '../Common/Alert';
import Badge from '../Common/Badge';
import Modal from '../Common/Modal';
import AdvancedRequester, { RequestOverrides } from './AdvancedRequester';
import QuotaDisplay from './QuotaDisplay';
import SearchByNameModal from './SearchByNameModal';

const messages = defineMessages({
  requestadmin: 'This request will be approved automatically.',
  requestSuccess: '<strong>{title}</strong> requested successfully!',
  requesttitle: 'Request {title}',
  request4ktitle: 'Request {title} in 4K',
  edit: 'Edit Request',
  cancel: 'Cancel Request',
  pendingrequest: 'Pending Request for {title}',
  pending4krequest: 'Pending 4K Request for {title}',
  requestfrom: "{username}'s request is pending approval.",
  requestseasons:
    'Request {seasonCount} {seasonCount, plural, one {Season} other {Seasons}}',
  requestall: 'Request All Seasons',
  alreadyrequested: 'Already Requested',
  selectseason: 'Select Season(s)',
  season: 'Season',
  numberofepisodes: '# of Episodes',
  seasonnumber: 'Season {number}',
  extras: 'Extras',
  errorediting: 'Something went wrong while editing the request.',
  requestedited: 'Request for <strong>{title}</strong> edited successfully!',
  requestcancelled: 'Request for <strong>{title}</strong> canceled.',
  autoapproval: 'Automatic Approval',
  requesterror: 'Something went wrong while submitting the request.',
  pendingapproval: 'Your request is pending approval.',
});

interface RequestModalProps extends React.HTMLAttributes<HTMLDivElement> {
  tmdbId: number;
  onCancel?: () => void;
  onComplete?: (newStatus: MediaStatus) => void;
  onUpdating?: (isUpdating: boolean) => void;
  is4k?: boolean;
  editRequest?: MediaRequest;
}

const TvRequestModal: React.FC<RequestModalProps> = ({
  onCancel,
  onComplete,
  tmdbId,
  onUpdating,
  editRequest,
  is4k = false,
}) => {
  const settings = useSettings();
  const { addToast } = useToasts();
  const editingSeasons: number[] = (editRequest?.seasons ?? []).map(
    (season) => season.seasonNumber
  );
  const { data, error } = useSWR<TvDetails>(`/api/v1/tv/${tmdbId}`);
  const [requestOverrides, setRequestOverrides] =
    useState<RequestOverrides | null>(null);
  const [selectedSeasons, setSelectedSeasons] = useState<number[]>(
    editRequest ? editingSeasons : []
  );
  const intl = useIntl();
  const { user, hasPermission } = useUser();
  const [searchModal, setSearchModal] = useState<{
    show: boolean;
  }>({
    show: true,
  });
  const [tvdbId, setTvdbId] = useState<number | undefined>(undefined);
  const { data: quota } = useSWR<QuotaResponse>(
    user ? `/api/v1/user/${requestOverrides?.user?.id ?? user.id}/quota` : null
  );

  const currentlyRemaining =
    (quota?.tv.remaining ?? 0) -
    selectedSeasons.length +
    (editRequest?.seasons ?? []).length;

  const updateRequest = async () => {
    if (!editRequest) {
      return;
    }

    if (onUpdating) {
      onUpdating(true);
    }

    try {
      if (selectedSeasons.length > 0) {
        await axios.put(`/api/v1/request/${editRequest.id}`, {
          mediaType: 'tv',
          serverId: requestOverrides?.server,
          profileId: requestOverrides?.profile,
          rootFolder: requestOverrides?.folder,
          languageProfileId: requestOverrides?.language,
          userId: requestOverrides?.user?.id,
          tags: requestOverrides?.tags,
          seasons: selectedSeasons,
        });
      } else {
        await axios.delete(`/api/v1/request/${editRequest.id}`);
      }

      addToast(
        <span>
          {selectedSeasons.length > 0
            ? intl.formatMessage(messages.requestedited, {
                title: data?.name,
                strong: function strong(msg) {
                  return <strong>{msg}</strong>;
                },
              })
            : intl.formatMessage(messages.requestcancelled, {
                title: data?.name,
                strong: function strong(msg) {
                  return <strong>{msg}</strong>;
                },
              })}
        </span>,
        {
          appearance: 'success',
          autoDismiss: true,
        }
      );
      if (onComplete) {
        onComplete(MediaStatus.PENDING);
      }
    } catch (e) {
      addToast(<span>{intl.formatMessage(messages.errorediting)}</span>, {
        appearance: 'error',
        autoDismiss: true,
      });
    } finally {
      if (onUpdating) {
        onUpdating(false);
      }
    }
  };

  const sendRequest = async () => {
    if (
      settings.currentSettings.partialRequestsEnabled &&
      selectedSeasons.length === 0
    ) {
      return;
    }

    if (onUpdating) {
      onUpdating(true);
    }

    try {
      let overrideParams = {};
      if (requestOverrides) {
        overrideParams = {
          serverId: requestOverrides.server,
          profileId: requestOverrides.profile,
          rootFolder: requestOverrides.folder,
          languageProfileId: requestOverrides.language,
          userId: requestOverrides?.user?.id,
          tags: requestOverrides.tags,
        };
      }
      const response = await axios.post<MediaRequest>('/api/v1/request', {
        mediaId: data?.id,
        tvdbId: tvdbId ?? data?.externalIds.tvdbId,
        mediaType: 'tv',
        is4k,
        seasons: settings.currentSettings.partialRequestsEnabled
          ? selectedSeasons
          : getAllSeasons().filter(
              (season) => !getAllRequestedSeasons().includes(season)
            ),
        ...overrideParams,
      });

      if (response.data) {
        if (onComplete) {
          onComplete(response.data.media.status);
        }
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
      }
    } catch (e) {
      addToast(intl.formatMessage(messages.requesterror), {
        appearance: 'error',
        autoDismiss: true,
      });
    } finally {
      if (onUpdating) {
        onUpdating(false);
      }
    }
  };

  const getAllSeasons = (): number[] => {
    return (data?.seasons ?? [])
      .filter((season) => season.seasonNumber !== 0)
      .map((season) => season.seasonNumber);
  };

  const getAllRequestedSeasons = (): number[] => {
    const requestedSeasons = (data?.mediaInfo?.requests ?? [])
      .filter(
        (request) =>
          request.is4k === is4k &&
          request.status !== MediaRequestStatus.DECLINED
      )
      .reduce((requestedSeasons, request) => {
        return [
          ...requestedSeasons,
          ...request.seasons
            .filter((season) => !editingSeasons.includes(season.seasonNumber))
            .map((sr) => sr.seasonNumber),
        ];
      }, [] as number[]);

    const availableSeasons = (data?.mediaInfo?.seasons ?? [])
      .filter(
        (season) =>
          (season[is4k ? 'status4k' : 'status'] === MediaStatus.AVAILABLE ||
            season[is4k ? 'status4k' : 'status'] ===
              MediaStatus.PARTIALLY_AVAILABLE ||
            season[is4k ? 'status4k' : 'status'] === MediaStatus.PROCESSING) &&
          !requestedSeasons.includes(season.seasonNumber)
      )
      .map((season) => season.seasonNumber);

    return [...requestedSeasons, ...availableSeasons];
  };

  const isSelectedSeason = (seasonNumber: number): boolean =>
    selectedSeasons.includes(seasonNumber);

  const toggleSeason = (seasonNumber: number): void => {
    // If this season already has a pending request, don't allow it to be toggled
    if (getAllRequestedSeasons().includes(seasonNumber)) {
      return;
    }

    // If there are no more remaining requests available, block toggle
    if (
      quota?.tv.limit &&
      currentlyRemaining <= 0 &&
      !isSelectedSeason(seasonNumber)
    ) {
      return;
    }

    if (selectedSeasons.includes(seasonNumber)) {
      setSelectedSeasons((seasons) =>
        seasons.filter((sn) => sn !== seasonNumber)
      );
    } else {
      setSelectedSeasons((seasons) => [...seasons, seasonNumber]);
    }
  };

  const unrequestedSeasons = getAllSeasons().filter(
    (season) => !getAllRequestedSeasons().includes(season)
  );

  const toggleAllSeasons = (): void => {
    // If the user has a quota and not enough requests for all seasons, block toggleAllSeasons
    if (
      quota?.tv.limit &&
      (quota?.tv.remaining ?? 0) < unrequestedSeasons.length
    ) {
      return;
    }

    if (
      data &&
      selectedSeasons.length >= 0 &&
      selectedSeasons.length < unrequestedSeasons.length
    ) {
      setSelectedSeasons(unrequestedSeasons);
    } else {
      setSelectedSeasons([]);
    }
  };

  const isAllSeasons = (): boolean => {
    if (!data) {
      return false;
    }
    return (
      selectedSeasons.length ===
      getAllSeasons().filter(
        (season) => !getAllRequestedSeasons().includes(season)
      ).length
    );
  };

  const getSeasonRequest = (
    seasonNumber: number
  ): SeasonRequest | undefined => {
    let seasonRequest: SeasonRequest | undefined;

    if (
      data?.mediaInfo &&
      (data.mediaInfo.requests || []).filter(
        (request) =>
          request.is4k === is4k &&
          request.status !== MediaRequestStatus.DECLINED
      ).length > 0
    ) {
      data.mediaInfo.requests
        .filter((request) => request.is4k === is4k)
        .forEach((request) => {
          if (!seasonRequest) {
            seasonRequest = request.seasons.find(
              (season) => season.seasonNumber === seasonNumber
            );
          }
        });
    }

    return seasonRequest;
  };

  const isOwner = editRequest && editRequest.requestedBy.id === user?.id;

  return !data?.externalIds.tvdbId && searchModal.show ? (
    <SearchByNameModal
      tvdbId={tvdbId}
      setTvdbId={setTvdbId}
      closeModal={() => setSearchModal({ show: false })}
      loading={!data && !error}
      onCancel={onCancel}
      modalTitle={intl.formatMessage(
        is4k ? messages.request4ktitle : messages.requesttitle,
        { title: data?.name }
      )}
      tmdbId={tmdbId}
    />
  ) : (
    <Modal
      loading={!data && !error}
      backgroundClickable
      onCancel={tvdbId ? () => setSearchModal({ show: true }) : onCancel}
      onOk={() => (editRequest ? updateRequest() : sendRequest())}
      title={intl.formatMessage(
        editRequest
          ? is4k
            ? messages.pending4krequest
            : messages.pendingrequest
          : is4k
          ? messages.request4ktitle
          : messages.requesttitle,
        { title: data?.name }
      )}
      okText={
        editRequest
          ? selectedSeasons.length === 0
            ? intl.formatMessage(messages.cancel)
            : intl.formatMessage(messages.edit)
          : getAllRequestedSeasons().length >= getAllSeasons().length
          ? intl.formatMessage(messages.alreadyrequested)
          : !settings.currentSettings.partialRequestsEnabled
          ? intl.formatMessage(messages.requestall)
          : selectedSeasons.length === 0
          ? intl.formatMessage(messages.selectseason)
          : intl.formatMessage(messages.requestseasons, {
              seasonCount: selectedSeasons.length,
            })
      }
      okDisabled={
        editRequest
          ? false
          : !settings.currentSettings.partialRequestsEnabled &&
            quota?.tv.limit &&
            unrequestedSeasons.length > quota.tv.limit
          ? true
          : getAllRequestedSeasons().length >= getAllSeasons().length ||
            (settings.currentSettings.partialRequestsEnabled &&
              selectedSeasons.length === 0)
      }
      okButtonType={
        editRequest &&
        settings.currentSettings.partialRequestsEnabled &&
        selectedSeasons.length === 0
          ? 'danger'
          : `primary`
      }
      cancelText={
        editRequest
          ? intl.formatMessage(globalMessages.close)
          : tvdbId
          ? intl.formatMessage(globalMessages.back)
          : intl.formatMessage(globalMessages.cancel)
      }
      iconSvg={<DownloadIcon />}
      backdrop={`https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/${data?.backdropPath}`}
    >
      {editRequest
        ? isOwner
          ? intl.formatMessage(messages.pendingapproval)
          : intl.formatMessage(messages.requestfrom, {
              username: editRequest?.requestedBy.displayName,
            })
        : null}
      {hasPermission(
        [
          Permission.MANAGE_REQUESTS,
          is4k ? Permission.AUTO_APPROVE_4K : Permission.AUTO_APPROVE,
          is4k ? Permission.AUTO_APPROVE_4K_TV : Permission.AUTO_APPROVE_TV,
        ],
        { type: 'or' }
      ) &&
        !(
          quota?.tv.limit &&
          !settings.currentSettings.partialRequestsEnabled &&
          unrequestedSeasons.length > (quota?.tv.limit ?? 0)
        ) &&
        getAllRequestedSeasons().length < getAllSeasons().length &&
        !editRequest && (
          <p className="mt-6">
            <Alert
              title={intl.formatMessage(messages.requestadmin)}
              type="info"
            />
          </p>
        )}
      {(quota?.tv.limit ?? 0) > 0 && (
        <QuotaDisplay
          mediaType="tv"
          quota={quota?.tv}
          remaining={
            !settings.currentSettings.partialRequestsEnabled &&
            unrequestedSeasons.length > (quota?.tv.limit ?? 0)
              ? 0
              : currentlyRemaining
          }
          userOverride={
            requestOverrides?.user && requestOverrides.user.id !== user?.id
              ? requestOverrides?.user?.id
              : undefined
          }
          overLimit={
            !settings.currentSettings.partialRequestsEnabled &&
            unrequestedSeasons.length > (quota?.tv.limit ?? 0)
              ? unrequestedSeasons.length
              : undefined
          }
        />
      )}
      <div className="flex flex-col">
        <div className="-mx-4 sm:mx-0">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden shadow sm:rounded-lg">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th
                      className={`w-16 px-4 py-3 bg-gray-500 ${
                        !settings.currentSettings.partialRequestsEnabled &&
                        'hidden'
                      }`}
                    >
                      <span
                        role="checkbox"
                        tabIndex={0}
                        aria-checked={isAllSeasons()}
                        onClick={() => toggleAllSeasons()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === 'Space') {
                            toggleAllSeasons();
                          }
                        }}
                        className={`relative inline-flex items-center justify-center flex-shrink-0 w-10 h-5 pt-2 cursor-pointer focus:outline-none ${
                          quota?.tv.remaining &&
                          quota.tv.limit &&
                          quota.tv.remaining < unrequestedSeasons.length
                            ? 'opacity-50'
                            : ''
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`${
                            isAllSeasons() ? 'bg-indigo-500' : 'bg-gray-800'
                          } absolute h-4 w-9 mx-auto rounded-full transition-colors ease-in-out duration-200`}
                        ></span>
                        <span
                          aria-hidden="true"
                          className={`${
                            isAllSeasons() ? 'translate-x-5' : 'translate-x-0'
                          } absolute left-0 inline-block h-5 w-5 border border-gray-200 rounded-full bg-white shadow transform group-focus:ring group-focus:border-blue-300 transition-transform ease-in-out duration-200`}
                        ></span>
                      </span>
                    </th>
                    <th className="px-1 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-200 uppercase bg-gray-500 md:px-6">
                      {intl.formatMessage(messages.season)}
                    </th>
                    <th className="px-5 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-200 uppercase bg-gray-500 md:px-6">
                      {intl.formatMessage(messages.numberofepisodes)}
                    </th>
                    <th className="px-2 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-200 uppercase bg-gray-500 md:px-6">
                      {intl.formatMessage(globalMessages.status)}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-600 divide-y divide-gray-700">
                  {data?.seasons
                    .filter((season) => season.seasonNumber !== 0)
                    .map((season) => {
                      const seasonRequest = getSeasonRequest(
                        season.seasonNumber
                      );
                      const mediaSeason = data?.mediaInfo?.seasons.find(
                        (sn) =>
                          sn.seasonNumber === season.seasonNumber &&
                          sn[is4k ? 'status4k' : 'status'] !==
                            MediaStatus.UNKNOWN
                      );
                      return (
                        <tr key={`season-${season.id}`}>
                          <td
                            className={`px-4 py-4 text-sm font-medium leading-5 text-gray-100 whitespace-nowrap ${
                              !settings.currentSettings
                                .partialRequestsEnabled && 'hidden'
                            }`}
                          >
                            <span
                              role="checkbox"
                              tabIndex={0}
                              aria-checked={
                                !!mediaSeason ||
                                (!!seasonRequest &&
                                  !editingSeasons.includes(
                                    season.seasonNumber
                                  )) ||
                                isSelectedSeason(season.seasonNumber)
                              }
                              onClick={() => toggleSeason(season.seasonNumber)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === 'Space') {
                                  toggleSeason(season.seasonNumber);
                                }
                              }}
                              className={`pt-2 relative inline-flex items-center justify-center flex-shrink-0 h-5 w-10 cursor-pointer focus:outline-none ${
                                mediaSeason ||
                                (quota?.tv.limit &&
                                  currentlyRemaining <= 0 &&
                                  !isSelectedSeason(season.seasonNumber)) ||
                                (!!seasonRequest &&
                                  !editingSeasons.includes(season.seasonNumber))
                                  ? 'opacity-50'
                                  : ''
                              }`}
                            >
                              <span
                                aria-hidden="true"
                                className={`${
                                  !!mediaSeason ||
                                  (!!seasonRequest &&
                                    !editingSeasons.includes(
                                      season.seasonNumber
                                    )) ||
                                  isSelectedSeason(season.seasonNumber)
                                    ? 'bg-indigo-500'
                                    : 'bg-gray-800'
                                } absolute h-4 w-9 mx-auto rounded-full transition-colors ease-in-out duration-200`}
                              ></span>
                              <span
                                aria-hidden="true"
                                className={`${
                                  !!mediaSeason ||
                                  (!!seasonRequest &&
                                    !editingSeasons.includes(
                                      season.seasonNumber
                                    )) ||
                                  isSelectedSeason(season.seasonNumber)
                                    ? 'translate-x-5'
                                    : 'translate-x-0'
                                } absolute left-0 inline-block h-5 w-5 border border-gray-200 rounded-full bg-white shadow transform group-focus:ring group-focus:border-blue-300 transition-transform ease-in-out duration-200`}
                              ></span>
                            </span>
                          </td>
                          <td className="px-1 py-4 text-sm font-medium leading-5 text-gray-100 md:px-6 whitespace-nowrap">
                            {season.seasonNumber === 0
                              ? intl.formatMessage(messages.extras)
                              : intl.formatMessage(messages.seasonnumber, {
                                  number: season.seasonNumber,
                                })}
                          </td>
                          <td className="px-5 py-4 text-sm leading-5 text-gray-200 md:px-6 whitespace-nowrap">
                            {season.episodeCount}
                          </td>
                          <td className="py-4 pr-2 text-sm leading-5 text-gray-200 md:px-6 whitespace-nowrap">
                            {!seasonRequest && !mediaSeason && (
                              <Badge>
                                {intl.formatMessage(
                                  globalMessages.notrequested
                                )}
                              </Badge>
                            )}
                            {!mediaSeason &&
                              seasonRequest?.status ===
                                MediaRequestStatus.PENDING && (
                                <Badge badgeType="warning">
                                  {intl.formatMessage(globalMessages.pending)}
                                </Badge>
                              )}
                            {((!mediaSeason &&
                              seasonRequest?.status ===
                                MediaRequestStatus.APPROVED) ||
                              mediaSeason?.[is4k ? 'status4k' : 'status'] ===
                                MediaStatus.PROCESSING) && (
                              <Badge badgeType="primary">
                                {intl.formatMessage(globalMessages.requested)}
                              </Badge>
                            )}
                            {mediaSeason?.[is4k ? 'status4k' : 'status'] ===
                              MediaStatus.PARTIALLY_AVAILABLE && (
                              <Badge badgeType="success">
                                {intl.formatMessage(
                                  globalMessages.partiallyavailable
                                )}
                              </Badge>
                            )}
                            {mediaSeason?.[is4k ? 'status4k' : 'status'] ===
                              MediaStatus.AVAILABLE && (
                              <Badge badgeType="success">
                                {intl.formatMessage(globalMessages.available)}
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {(hasPermission(Permission.REQUEST_ADVANCED) ||
        hasPermission(Permission.MANAGE_REQUESTS)) && (
        <div className="mt-4">
          <AdvancedRequester
            type="tv"
            is4k={is4k}
            isAnime={data?.keywords.some(
              (keyword) => keyword.id === ANIME_KEYWORD_ID
            )}
            onChange={(overrides) => setRequestOverrides(overrides)}
            requestUser={editRequest?.requestedBy}
            defaultOverrides={
              editRequest
                ? {
                    folder: editRequest.rootFolder,
                    profile: editRequest.profileId,
                    server: editRequest.serverId,
                    language: editRequest.languageProfileId,
                    tags: editRequest.tags,
                  }
                : undefined
            }
          />
        </div>
      )}
    </Modal>
  );
};

export default TvRequestModal;
