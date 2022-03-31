/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { SmallLoadingSpinner } from '../../Common/LoadingSpinner';
import type {
  ServiceCommonServer,
  ServiceCommonServerWithDetails,
} from '../../../../server/interfaces/api/serviceInterfaces';
import { defineMessages, useIntl } from 'react-intl';
import { formatBytes } from '../../../utils/numberHelpers';
import { Listbox, Transition } from '@headlessui/react';
import { Permission, User, useUser } from '../../../hooks/useUser';
import type { UserResultsResponse } from '../../../../server/interfaces/api/userInterfaces';

const messages = defineMessages({
  advancedoptions: 'Advanced Options',
  destinationserver: 'Destination Server',
  qualityprofile: 'Quality Profile',
  rootfolder: 'Root Folder',
  animenote: '* This series is an anime.',
  default: '(Default)',
  loadingprofiles: 'Loading profiles…',
  loadingfolders: 'Loading folders…',
  requestas: 'Request As',
  languageprofile: 'Language Profile',
  loadinglanguages: 'Loading languages…',
});

export type RequestOverrides = {
  server?: number;
  profile?: number;
  folder?: string;
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

  const {
    data: serverData,
    isValidating,
  } = useSWR<ServiceCommonServerWithDetails>(
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
      ? '/api/v1/user?take=1000'
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
    }
  }, [serverData]);

  useEffect(() => {
    if (
      defaultOverrides &&
      defaultOverrides.server !== null &&
      defaultOverrides.server !== undefined
    ) {
      setSelectedServer(defaultOverrides.server);
    }

    if (
      defaultOverrides &&
      defaultOverrides.profile !== null &&
      defaultOverrides.profile !== undefined
    ) {
      setSelectedProfile(defaultOverrides.profile);
    }

    if (
      defaultOverrides &&
      defaultOverrides.folder !== null &&
      defaultOverrides.folder !== undefined
    ) {
      setSelectedFolder(defaultOverrides.folder);
    }

    if (
      defaultOverrides &&
      defaultOverrides.language !== null &&
      defaultOverrides.language !== undefined
    ) {
      setSelectedLanguage(defaultOverrides.language);
    }
  }, [
    defaultOverrides?.server,
    defaultOverrides?.folder,
    defaultOverrides?.profile,
    defaultOverrides?.language,
  ]);

  useEffect(() => {
    if (selectedServer !== null || selectedUser) {
      onChange({
        folder: selectedFolder !== '' ? selectedFolder : undefined,
        profile: selectedProfile !== -1 ? selectedProfile : undefined,
        server: selectedServer ?? undefined,
        user: selectedUser ?? undefined,
        language: selectedLanguage ?? undefined,
      });
    }
  }, [
    selectedFolder,
    selectedServer,
    selectedProfile,
    selectedUser,
    selectedLanguage,
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
        <svg
          className="w-4 h-4 mr-1"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.707 7.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L13 8.586V5h3a2 2 0 012 2v5a2 2 0 01-2 2H8a2 2 0 01-2-2V7a2 2 0 012-2h3v3.586L9.707 7.293zM11 3a1 1 0 112 0v2h-2V3z" />
          <path d="M4 9a2 2 0 00-2 2v5a2 2 0 002 2h8a2 2 0 002-2H4V9z" />
        </svg>
        {intl.formatMessage(messages.advancedoptions)}
      </div>
      <div className="p-4 bg-gray-600 rounded-md shadow">
        {!!data && selectedServer !== null && (
          <>
            <div className="flex flex-col items-center justify-between md:flex-row">
              <div className="flex-grow flex-shrink-0 w-full mb-2 md:w-1/4 md:pr-4 md:mb-0">
                <label htmlFor="server" className="text-label">
                  {intl.formatMessage(messages.destinationserver)}
                </label>
                <select
                  id="server"
                  name="server"
                  value={selectedServer}
                  onChange={(e) => setSelectedServer(Number(e.target.value))}
                  onBlur={(e) => setSelectedServer(Number(e.target.value))}
                  className="block w-full py-2 pl-3 pr-10 mt-1 text-base leading-6 text-white transition duration-150 ease-in-out bg-gray-800 border-gray-700 rounded-md form-select focus:outline-none focus:ring-blue focus:border-blue-300 sm:text-sm sm:leading-5"
                >
                  {data.map((server) => (
                    <option key={`server-list-${server.id}`} value={server.id}>
                      {server.name}
                      {server.isDefault && server.is4k === is4k
                        ? ` ${intl.formatMessage(messages.default)}`
                        : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-grow flex-shrink-0 w-full mb-2 md:w-1/4 md:pr-4 md:mb-0">
                <label htmlFor="profile" className="text-label">
                  {intl.formatMessage(messages.qualityprofile)}
                </label>
                <select
                  id="profile"
                  name="profile"
                  value={selectedProfile}
                  onChange={(e) => setSelectedProfile(Number(e.target.value))}
                  onBlur={(e) => setSelectedProfile(Number(e.target.value))}
                  className="block w-full py-2 pl-3 pr-10 mt-1 text-base leading-6 text-white transition duration-150 ease-in-out bg-gray-800 border-gray-700 rounded-md form-select focus:outline-none focus:ring-blue focus:border-blue-300 sm:text-sm sm:leading-5"
                >
                  {isValidating && (
                    <option value="">
                      {intl.formatMessage(messages.loadingprofiles)}
                    </option>
                  )}
                  {!isValidating &&
                    serverData &&
                    serverData.profiles.map((profile) => (
                      <option
                        key={`profile-list${profile.id}`}
                        value={profile.id}
                      >
                        {profile.name}
                        {isAnime &&
                        serverData.server.activeAnimeProfileId === profile.id
                          ? ` ${intl.formatMessage(messages.default)}`
                          : !isAnime &&
                            serverData.server.activeProfileId === profile.id
                          ? ` ${intl.formatMessage(messages.default)}`
                          : ''}
                      </option>
                    ))}
                </select>
              </div>
              <div
                className={`flex-grow flex-shrink-0 w-full mb-2 md:w-1/4 md:mb-0 ${
                  type === 'tv' ? 'md:pr-4' : ''
                }`}
              >
                <label htmlFor="folder" className="text-label">
                  {intl.formatMessage(messages.rootfolder)}
                </label>
                <select
                  id="folder"
                  name="folder"
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  onBlur={(e) => setSelectedFolder(e.target.value)}
                  className="block w-full py-2 pl-3 pr-10 mt-1 text-base leading-6 text-white transition duration-150 ease-in-out bg-gray-800 border-gray-700 rounded-md form-select focus:outline-none focus:ring-blue focus:border-blue-300 sm:text-sm sm:leading-5"
                >
                  {isValidating && (
                    <option value="">
                      {intl.formatMessage(messages.loadingfolders)}
                    </option>
                  )}
                  {!isValidating &&
                    serverData &&
                    serverData.rootFolders.map((folder) => (
                      <option
                        key={`folder-list${folder.id}`}
                        value={folder.path}
                      >
                        {folder.path} ({formatBytes(folder.freeSpace ?? 0)})
                        {isAnime &&
                        serverData.server.activeAnimeDirectory === folder.path
                          ? ` ${intl.formatMessage(messages.default)}`
                          : !isAnime &&
                            serverData.server.activeDirectory === folder.path
                          ? ` ${intl.formatMessage(messages.default)}`
                          : ''}
                      </option>
                    ))}
                </select>
              </div>
              {type === 'tv' && (
                <div className="flex-grow flex-shrink-0 w-full mb-2 md:w-1/4 md:mb-0">
                  <label htmlFor="language" className="text-label">
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
                    className="block w-full py-2 pl-3 pr-10 mt-1 text-base leading-6 text-white transition duration-150 ease-in-out bg-gray-800 border-gray-700 rounded-md form-select focus:outline-none focus:ring-blue focus:border-blue-300 sm:text-sm sm:leading-5"
                  >
                    {isValidating && (
                      <option value="">
                        {intl.formatMessage(messages.loadinglanguages)}
                      </option>
                    )}
                    {!isValidating &&
                      serverData &&
                      serverData.languageProfiles?.map((language) => (
                        <option
                          key={`folder-list${language.id}`}
                          value={language.id}
                        >
                          {language.name}
                          {isAnime &&
                          serverData.server.activeAnimeLanguageProfileId ===
                            language.id
                            ? ` ${intl.formatMessage(messages.default)}`
                            : !isAnime &&
                              serverData.server.activeLanguageProfileId ===
                                language.id
                            ? ` ${intl.formatMessage(messages.default)}`
                            : ''}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          </>
        )}
        {hasPermission([Permission.MANAGE_REQUESTS, Permission.MANAGE_USERS]) &&
          selectedUser && (
            <div className="mt-0 sm:mt-2">
              <Listbox
                as="div"
                value={selectedUser}
                onChange={(value) => setSelectedUser(value)}
                className="space-y-1"
              >
                {({ open }) => (
                  <>
                    <Listbox.Label className="text-label">
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
                            <span className="ml-1 text-gray-400 truncate">
                              ({selectedUser.email})
                            </span>
                          </span>
                          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <svg
                              className="w-5 h-5 text-gray-500"
                              viewBox="0 0 20 20"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path
                                d="M7 7l3-3 3 3m0 6l-3 3-3-3"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
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
                                    <span className="ml-1 text-gray-400 truncate">
                                      ({user.email})
                                    </span>
                                  </span>
                                  {selected && (
                                    <span
                                      className={`${
                                        active
                                          ? 'text-white'
                                          : 'text-indigo-600'
                                      } absolute inset-y-0 left-0 flex items-center pl-1.5`}
                                    >
                                      <svg
                                        className="w-5 h-5"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
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
            </div>
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
