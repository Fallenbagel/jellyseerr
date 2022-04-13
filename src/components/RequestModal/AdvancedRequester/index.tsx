/* eslint-disable react-hooks/exhaustive-deps */
import { Listbox, Transition } from '@headlessui/react';
import { AdjustmentsIcon } from '@heroicons/react/outline';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/solid';
import { isEqual } from 'lodash';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import type { OptionsType, OptionTypeBase } from 'react-select';
import useSWR from 'swr';
import type {
  ServiceCommonServer,
  ServiceCommonServerWithDetails,
} from '../../../../server/interfaces/api/serviceInterfaces';
import type { UserResultsResponse } from '../../../../server/interfaces/api/userInterfaces';
import { Permission, User, useUser } from '../../../hooks/useUser';
import globalMessages from '../../../i18n/globalMessages';
import { formatBytes } from '../../../utils/numberHelpers';
import { SmallLoadingSpinner } from '../../Common/LoadingSpinner';

type OptionType = {
  value: string;
  label: string;
};

const Select = dynamic(() => import('react-select'), { ssr: false });

const messages = defineMessages({
  advancedoptions: 'Advanced',
  destinationserver: 'Destination Server',
  qualityprofile: 'Quality Profile',
  rootfolder: 'Root Folder',
  animenote: '* This series is an anime.',
  default: '{name} (Default)',
  folder: '{path} ({space})',
  requestas: 'Request As',
  languageprofile: 'Language Profile',
  tags: 'Tags',
  selecttags: 'Select tags',
  notagoptions: 'No tags.',
});

export type RequestOverrides = {
  server?: number;
  profile?: number;
  folder?: string;
  tags?: number[];
  language?: number;
  user?: User;
};

interface AdvancedRequesterProps {
  type: 'movie' | 'tv';
  is4k: boolean;
  isAnime?: boolean;
  defaultOverrides?: RequestOverrides;
  requestUser?: User;
  onChange: (overrides: RequestOverrides) => void;
}

const AdvancedRequester: React.FC<AdvancedRequesterProps> = ({
  type,
  is4k = false,
  isAnime = false,
  defaultOverrides,
  requestUser,
  onChange,
}) => {
  const intl = useIntl();
  const { user, hasPermission } = useUser();
  const { data, error } = useSWR<ServiceCommonServer[]>(
    `/api/v1/service/${type === 'movie' ? 'radarr' : 'sonarr'}`,
    {
      refreshInterval: 0,
      refreshWhenHidden: false,
      revalidateOnFocus: false,
      revalidateOnMount: true,
    }
  );
  const [selectedServer, setSelectedServer] = useState<number | null>(
    defaultOverrides?.server !== undefined && defaultOverrides?.server >= 0
      ? defaultOverrides?.server
      : null
  );
  const [selectedProfile, setSelectedProfile] = useState<number>(
    defaultOverrides?.profile ?? -1
  );
  const [selectedFolder, setSelectedFolder] = useState<string>(
    defaultOverrides?.folder ?? ''
  );

  const [selectedLanguage, setSelectedLanguage] = useState<number>(
    defaultOverrides?.language ?? -1
  );

  const [selectedTags, setSelectedTags] = useState<number[]>(
    defaultOverrides?.tags ?? []
  );

  const { data: serverData, isValidating } =
    useSWR<ServiceCommonServerWithDetails>(
      selectedServer !== null
        ? `/api/v1/service/${
            type === 'movie' ? 'radarr' : 'sonarr'
          }/${selectedServer}`
        : null,
      {
        refreshInterval: 0,
        refreshWhenHidden: false,
        revalidateOnFocus: false,
      }
    );

  const [selectedUser, setSelectedUser] = useState<User | null>(
    requestUser ?? null
  );

  const { data: userData } = useSWR<UserResultsResponse>(
    hasPermission([Permission.MANAGE_REQUESTS, Permission.MANAGE_USERS])
      ? '/api/v1/user?take=1000&sort=displayname'
      : null
  );

  useEffect(() => {
    if (userData?.results && !requestUser) {
      setSelectedUser(userData.results.find((u) => u.id === user?.id) ?? null);
    }
  }, [userData?.results]);

  useEffect(() => {
    let defaultServer = data?.find(
      (server) => server.isDefault && is4k === server.is4k
    );

    if (!defaultServer && (data ?? []).length > 0) {
      defaultServer = data?.[0];
    }

    if (
      defaultServer &&
      defaultServer.id !== selectedServer &&
      (!defaultOverrides || defaultOverrides.server === null)
    ) {
      setSelectedServer(defaultServer.id);
    }
  }, [data]);

  useEffect(() => {
    if (serverData) {
      const defaultProfile = serverData.profiles.find(
        (profile) =>
          profile.id ===
          (isAnime
            ? serverData.server.activeAnimeProfileId
            : serverData.server.activeProfileId)
      );
      const defaultFolder = serverData.rootFolders.find(
        (folder) =>
          folder.path ===
          (isAnime
            ? serverData.server.activeAnimeDirectory
            : serverData.server.activeDirectory)
      );
      const defaultLanguage = serverData.languageProfiles?.find(
        (language) =>
          language.id ===
          (isAnime
            ? serverData.server.activeAnimeLanguageProfileId
            : serverData.server.activeLanguageProfileId)
      );
      const defaultTags = isAnime
        ? serverData.server.activeAnimeTags
        : serverData.server.activeTags;

      if (
        defaultProfile &&
        defaultProfile.id !== selectedProfile &&
        (!defaultOverrides || defaultOverrides.profile === null)
      ) {
        setSelectedProfile(defaultProfile.id);
      }

      if (
        defaultFolder &&
        defaultFolder.path !== selectedFolder &&
        (!defaultOverrides || defaultOverrides.folder === null)
      ) {
        setSelectedFolder(defaultFolder.path ?? '');
      }

      if (
        defaultLanguage &&
        defaultLanguage.id !== selectedLanguage &&
        (!defaultOverrides || defaultOverrides.language === null)
      ) {
        setSelectedLanguage(defaultLanguage.id);
      }

      if (
        defaultTags &&
        !isEqual(defaultTags, selectedTags) &&
        (!defaultOverrides || defaultOverrides.tags === null)
      ) {
        setSelectedTags(defaultTags);
      }
    }
  }, [serverData]);

  useEffect(() => {
    if (defaultOverrides && defaultOverrides.server != null) {
      setSelectedServer(defaultOverrides.server);
    }

    if (defaultOverrides && defaultOverrides.profile != null) {
      setSelectedProfile(defaultOverrides.profile);
    }

    if (defaultOverrides && defaultOverrides.folder != null) {
      setSelectedFolder(defaultOverrides.folder);
    }

    if (defaultOverrides && defaultOverrides.language != null) {
      setSelectedLanguage(defaultOverrides.language);
    }

    if (defaultOverrides && defaultOverrides.tags != null) {
      setSelectedTags(defaultOverrides.tags);
    }
  }, [
    defaultOverrides?.server,
    defaultOverrides?.folder,
    defaultOverrides?.profile,
    defaultOverrides?.language,
    defaultOverrides?.tags,
  ]);

  useEffect(() => {
    if (selectedServer !== null || selectedUser) {
      onChange({
        folder: selectedFolder !== '' ? selectedFolder : undefined,
        profile: selectedProfile !== -1 ? selectedProfile : undefined,
        server: selectedServer ?? undefined,
        user: selectedUser ?? undefined,
        language: selectedLanguage ?? undefined,
        tags: selectedTags,
      });
    }
  }, [
    selectedFolder,
    selectedServer,
    selectedProfile,
    selectedUser,
    selectedLanguage,
    selectedTags,
  ]);

  if (!data && !error) {
    return (
      <div className="w-full mb-2">
        <SmallLoadingSpinner />
      </div>
    );
  }

  if ((!data || selectedServer === null) && !selectedUser) {
    return null;
  }

  return (
    <>
      <div className="flex items-center mb-2 font-bold tracking-wider">
        <AdjustmentsIcon className="w-5 h-5 mr-1.5" />
        {intl.formatMessage(messages.advancedoptions)}
      </div>
      <div className="p-4 bg-gray-600 rounded-md shadow">
        {!!data && selectedServer !== null && (
          <div className="flex flex-col md:flex-row">
            {data.filter((server) => server.is4k === is4k).length > 1 && (
              <div className="flex-grow flex-shrink-0 w-full mb-3 md:w-1/4 md:pr-4 last:pr-0">
                <label htmlFor="server">
                  {intl.formatMessage(messages.destinationserver)}
                </label>
                <select
                  id="server"
                  name="server"
                  value={selectedServer}
                  onChange={(e) => setSelectedServer(Number(e.target.value))}
                  onBlur={(e) => setSelectedServer(Number(e.target.value))}
                  className="bg-gray-800 border-gray-700"
                >
                  {data
                    .filter((server) => server.is4k === is4k)
                    .map((server) => (
                      <option
                        key={`server-list-${server.id}`}
                        value={server.id}
                      >
                        {server.isDefault
                          ? intl.formatMessage(messages.default, {
                              name: server.name,
                            })
                          : server.name}
                      </option>
                    ))}
                </select>
              </div>
            )}
            {(isValidating ||
              !serverData ||
              serverData.profiles.length > 1) && (
              <div className="flex-grow flex-shrink-0 w-full mb-3 md:w-1/4 md:pr-4 last:pr-0">
                <label htmlFor="profile">
                  {intl.formatMessage(messages.qualityprofile)}
                </label>
                <select
                  id="profile"
                  name="profile"
                  value={selectedProfile}
                  onChange={(e) => setSelectedProfile(Number(e.target.value))}
                  onBlur={(e) => setSelectedProfile(Number(e.target.value))}
                  className="bg-gray-800 border-gray-700"
                  disabled={isValidating || !serverData}
                >
                  {(isValidating || !serverData) && (
                    <option value="">
                      {intl.formatMessage(globalMessages.loading)}
                    </option>
                  )}
                  {!isValidating &&
                    serverData &&
                    serverData.profiles.map((profile) => (
                      <option
                        key={`profile-list${profile.id}`}
                        value={profile.id}
                      >
                        {isAnime &&
                        serverData.server.activeAnimeProfileId === profile.id
                          ? intl.formatMessage(messages.default, {
                              name: profile.name,
                            })
                          : !isAnime &&
                            serverData.server.activeProfileId === profile.id
                          ? intl.formatMessage(messages.default, {
                              name: profile.name,
                            })
                          : profile.name}
                      </option>
                    ))}
                </select>
              </div>
            )}
            {(isValidating ||
              !serverData ||
              serverData.rootFolders.length > 1) && (
              <div className="flex-grow flex-shrink-0 w-full mb-3 md:w-1/4 md:pr-4 last:pr-0">
                <label htmlFor="folder">
                  {intl.formatMessage(messages.rootfolder)}
                </label>
                <select
                  id="folder"
                  name="folder"
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  onBlur={(e) => setSelectedFolder(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                  disabled={isValidating || !serverData}
                >
                  {(isValidating || !serverData) && (
                    <option value="">
                      {intl.formatMessage(globalMessages.loading)}
                    </option>
                  )}
                  {!isValidating &&
                    serverData &&
                    serverData.rootFolders.map((folder) => (
                      <option
                        key={`folder-list${folder.id}`}
                        value={folder.path}
                      >
                        {isAnime &&
                        serverData.server.activeAnimeDirectory === folder.path
                          ? intl.formatMessage(messages.default, {
                              name: intl.formatMessage(messages.folder, {
                                path: folder.path,
                                space: formatBytes(folder.freeSpace ?? 0),
                              }),
                            })
                          : !isAnime &&
                            serverData.server.activeDirectory === folder.path
                          ? intl.formatMessage(messages.default, {
                              name: intl.formatMessage(messages.folder, {
                                path: folder.path,
                                space: formatBytes(folder.freeSpace ?? 0),
                              }),
                            })
                          : intl.formatMessage(messages.folder, {
                              path: folder.path,
                              space: formatBytes(folder.freeSpace ?? 0),
                            })}
                      </option>
                    ))}
                </select>
              </div>
            )}
            {type === 'tv' &&
              (isValidating ||
                !serverData ||
                (serverData.languageProfiles ?? []).length > 1) && (
                <div className="flex-grow flex-shrink-0 w-full mb-3 md:w-1/4 md:pr-4 last:pr-0">
                  <label htmlFor="language">
                    {intl.formatMessage(messages.languageprofile)}
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={selectedLanguage}
                    onChange={(e) =>
                      setSelectedLanguage(parseInt(e.target.value))
                    }
                    onBlur={(e) =>
                      setSelectedLanguage(parseInt(e.target.value))
                    }
                    className="bg-gray-800 border-gray-700"
                    disabled={isValidating || !serverData}
                  >
                    {(isValidating || !serverData) && (
                      <option value="">
                        {intl.formatMessage(globalMessages.loading)}
                      </option>
                    )}
                    {!isValidating &&
                      serverData &&
                      serverData.languageProfiles?.map((language) => (
                        <option
                          key={`folder-list${language.id}`}
                          value={language.id}
                        >
                          {isAnime &&
                          serverData.server.activeAnimeLanguageProfileId ===
                            language.id
                            ? intl.formatMessage(messages.default, {
                                name: language.name,
                              })
                            : !isAnime &&
                              serverData.server.activeLanguageProfileId ===
                                language.id
                            ? intl.formatMessage(messages.default, {
                                name: language.name,
                              })
                            : language.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}
          </div>
        )}
        {selectedServer !== null &&
          (isValidating || !serverData || !!serverData?.tags?.length) && (
            <div className="mb-2">
              <label htmlFor="tags">{intl.formatMessage(messages.tags)}</label>
              <Select
                name="tags"
                options={(serverData?.tags ?? []).map((tag) => ({
                  label: tag.label,
                  value: tag.id,
                }))}
                isMulti
                isDisabled={isValidating || !serverData}
                placeholder={
                  isValidating || !serverData
                    ? intl.formatMessage(globalMessages.loading)
                    : intl.formatMessage(messages.selecttags)
                }
                className="react-select-container react-select-container-dark"
                classNamePrefix="react-select"
                value={selectedTags.map((tagId) => {
                  const foundTag = serverData?.tags.find(
                    (tag) => tag.id === tagId
                  );
                  return {
                    value: foundTag?.id,
                    label: foundTag?.label,
                  };
                })}
                onChange={(
                  value: OptionTypeBase | OptionsType<OptionType> | null
                ) => {
                  if (!Array.isArray(value)) {
                    return;
                  }
                  setSelectedTags(value?.map((option) => option.value));
                }}
                noOptionsMessage={() =>
                  intl.formatMessage(messages.notagoptions)
                }
              />
            </div>
          )}
        {hasPermission([Permission.MANAGE_REQUESTS, Permission.MANAGE_USERS]) &&
          selectedUser && (
            <Listbox
              as="div"
              value={selectedUser}
              onChange={(value) => setSelectedUser(value)}
              className="space-y-1"
            >
              {({ open }) => (
                <>
                  <Listbox.Label>
                    {intl.formatMessage(messages.requestas)}
                  </Listbox.Label>
                  <div className="relative">
                    <span className="inline-block w-full rounded-md shadow-sm">
                      <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left text-white transition duration-150 ease-in-out bg-gray-800 border border-gray-700 rounded-md cursor-default focus:outline-none focus:shadow-outline-blue focus:border-blue-300 sm:text-sm sm:leading-5">
                        <span className="flex items-center">
                          <img
                            src={selectedUser.avatar}
                            alt=""
                            className="flex-shrink-0 w-6 h-6 rounded-full"
                          />
                          <span className="block ml-3">
                            {selectedUser.displayName}
                          </span>
                          {selectedUser.displayName.toLowerCase() !==
                            selectedUser.email && (
                            <span className="ml-1 text-gray-400 truncate">
                              ({selectedUser.email})
                            </span>
                          )}
                        </span>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500 pointer-events-none">
                          <ChevronDownIcon className="w-5 h-5" />
                        </span>
                      </Listbox.Button>
                    </span>

                    <Transition
                      show={open}
                      enter="transition ease-in duration-300"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                      className="w-full mt-1 bg-gray-800 rounded-md shadow-lg"
                    >
                      <Listbox.Options
                        static
                        className="py-1 overflow-auto text-base leading-6 rounded-md shadow-xs max-h-60 focus:outline-none sm:text-sm sm:leading-5"
                      >
                        {userData?.results.map((user) => (
                          <Listbox.Option key={user.id} value={user}>
                            {({ selected, active }) => (
                              <div
                                className={`${
                                  active
                                    ? 'text-white bg-indigo-600'
                                    : 'text-gray-300'
                                } cursor-default select-none relative py-2 pl-8 pr-4`}
                              >
                                <span
                                  className={`${
                                    selected ? 'font-semibold' : 'font-normal'
                                  } flex items-center`}
                                >
                                  <img
                                    src={user.avatar}
                                    alt=""
                                    className="flex-shrink-0 w-6 h-6 rounded-full"
                                  />
                                  <span className="flex-shrink-0 block ml-3">
                                    {user.displayName}
                                  </span>
                                  {user.displayName.toLowerCase() !==
                                    user.email && (
                                    <span className="ml-1 text-gray-400 truncate">
                                      ({user.email})
                                    </span>
                                  )}
                                </span>
                                {selected && (
                                  <span
                                    className={`${
                                      active ? 'text-white' : 'text-indigo-600'
                                    } absolute inset-y-0 left-0 flex items-center pl-1.5`}
                                  >
                                    <CheckIcon className="w-5 h-5" />
                                  </span>
                                )}
                              </div>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </>
              )}
            </Listbox>
          )}
        {isAnime && (
          <div className="mt-4 italic">
            {intl.formatMessage(messages.animenote)}
          </div>
        )}
      </div>
    </>
  );
};

export default AdvancedRequester;
