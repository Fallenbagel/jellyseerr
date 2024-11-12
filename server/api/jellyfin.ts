/* eslint-disable @typescript-eslint/no-explicit-any */
import ExternalAPI from '@server/api/externalapi';
import { ApiErrorCode } from '@server/constants/error';
import availabilitySync from '@server/lib/availabilitySync';
import logger from '@server/logger';
import { ApiError } from '@server/types/error';
import { getAppVersion } from '@server/utils/appVersion';

export interface JellyfinUserResponse {
  Name: string;
  ServerId: string;
  ServerName: string;
  Id: string;
  Configuration: {
    GroupedFolders: string[];
  };
  Policy: {
    IsAdministrator: boolean;
  };
  PrimaryImageTag?: string;
}

export interface JellyfinLoginResponse {
  User: JellyfinUserResponse;
  AccessToken: string;
}

export interface JellyfinUserListResponse {
  users: JellyfinUserResponse[];
}

interface JellyfinMediaFolder {
  Name: string;
  Id: string;
  Type: string;
  CollectionType: string;
}

export interface JellyfinLibrary {
  type: 'show' | 'movie';
  key: string;
  title: string;
  agent: string;
}

export interface JellyfinLibraryItem {
  Name: string;
  Id: string;
  HasSubtitles: boolean;
  Type: 'Movie' | 'Episode' | 'Season' | 'Series';
  LocationType: 'FileSystem' | 'Offline' | 'Remote' | 'Virtual';
  SeriesName?: string;
  SeriesId?: string;
  SeasonId?: string;
  SeasonName?: string;
  IndexNumber?: number;
  IndexNumberEnd?: number;
  ParentIndexNumber?: number;
  MediaType: string;
}

export interface JellyfinMediaStream {
  Codec: string;
  Type: 'Video' | 'Audio' | 'Subtitle';
  Height?: number;
  Width?: number;
  AverageFrameRate?: number;
  RealFrameRate?: number;
  Language?: string;
  DisplayTitle: string;
}

export interface JellyfinMediaSource {
  Protocol: string;
  Id: string;
  Path: string;
  Type: string;
  VideoType: string;
  MediaStreams: JellyfinMediaStream[];
}

export interface JellyfinLibraryItemExtended extends JellyfinLibraryItem {
  ProviderIds: {
    Tmdb?: string;
    Imdb?: string;
    Tvdb?: string;
  };
  MediaSources?: JellyfinMediaSource[];
  Width?: number;
  Height?: number;
  IsHD?: boolean;
  DateCreated?: string;
}

class JellyfinAPI extends ExternalAPI {
  private userId?: string;

  constructor(jellyfinHost: string, authToken?: string, deviceId?: string) {
    let authHeaderVal: string;
    if (authToken) {
      authHeaderVal = `MediaBrowser Client="Jellyseerr", Device="Jellyseerr", DeviceId="${deviceId}", Version="${getAppVersion()}", Token="${authToken}"`;
    } else {
      authHeaderVal = `MediaBrowser Client="Jellyseerr", Device="Jellyseerr", DeviceId="${deviceId}", Version="${getAppVersion()}"`;
    }

    super(
      jellyfinHost,
      {},
      {
        headers: {
          'X-Emby-Authorization': authHeaderVal,
        },
      }
    );
  }

  public async login(
    Username?: string,
    Password?: string,
    ClientIP?: string
  ): Promise<JellyfinLoginResponse> {
    const authenticate = async (useHeaders: boolean) => {
      const headers: { [key: string]: string } =
        useHeaders && ClientIP ? { 'X-Forwarded-For': ClientIP } : {};

      return this.post<JellyfinLoginResponse>(
        '/Users/AuthenticateByName',
        {
          Username,
          Pw: Password,
        },
        {},
        undefined,
        { headers }
      );
    };

    try {
      return await authenticate(true);
    } catch (e) {
      logger.debug('Failed to authenticate with headers', {
        label: 'Jellyfin API',
        error: e.cause.message ?? e.cause.statusText,
        ip: ClientIP,
      });

      if (!e.cause.status) {
        throw new ApiError(404, ApiErrorCode.InvalidUrl);
      }

      if (e.cause.status === 401) {
        throw new ApiError(e.cause.status, ApiErrorCode.InvalidCredentials);
      }
    }

    try {
      return await authenticate(false);
    } catch (e) {
      if (e.cause.status === 401) {
        throw new ApiError(e.cause.status, ApiErrorCode.InvalidCredentials);
      }

      logger.error(
        'Something went wrong while authenticating with the Jellyfin server',
        {
          label: 'Jellyfin API',
          error: e.cause.message ?? e.cause.statusText,
          ip: ClientIP,
        }
      );

      throw new ApiError(e.cause.status, ApiErrorCode.Unknown);
    }
  }

  public setUserId(userId: string): void {
    this.userId = userId;
    return;
  }

  public async getSystemInfo(): Promise<any> {
    try {
      const systemInfoResponse = await this.get<any>('/System/Info');

      return systemInfoResponse;
    } catch (e) {
      throw new ApiError(e.cause?.status, ApiErrorCode.InvalidAuthToken);
    }
  }

  public async getServerName(): Promise<string> {
    try {
      const serverResponse = await this.get<JellyfinUserResponse>(
        '/System/Info/Public'
      );

      return serverResponse.ServerName;
    } catch (e) {
      logger.error(
        'Something went wrong while getting the server name from the Jellyfin server',
        { label: 'Jellyfin API', error: e.cause.message ?? e.cause.statusText }
      );

      throw new ApiError(e.cause?.status, ApiErrorCode.Unknown);
    }
  }

  public async getUsers(): Promise<JellyfinUserListResponse> {
    try {
      const userReponse = await this.get<JellyfinUserResponse[]>(`/Users`);

      return { users: userReponse };
    } catch (e) {
      logger.error(
        'Something went wrong while getting the account from the Jellyfin server',
        { label: 'Jellyfin API', error: e.cause.message ?? e.cause.statusText }
      );

      throw new ApiError(e.cause?.status, ApiErrorCode.InvalidAuthToken);
    }
  }

  public async getUser(): Promise<JellyfinUserResponse> {
    try {
      const userReponse = await this.get<JellyfinUserResponse>(
        `/Users/${this.userId ?? 'Me'}`
      );
      return userReponse;
    } catch (e) {
      logger.error(
        'Something went wrong while getting the account from the Jellyfin server',
        { label: 'Jellyfin API', error: e.cause.message ?? e.cause.statusText }
      );

      throw new ApiError(e.cause?.status, ApiErrorCode.InvalidAuthToken);
    }
  }

  public async getLibraries(): Promise<JellyfinLibrary[]> {
    try {
      const mediaFolderResponse = await this.get<any>(`/Library/MediaFolders`);

      return this.mapLibraries(mediaFolderResponse.Items);
    } catch (mediaFoldersResponseError) {
      // fallback to user views to get libraries
      // this only and maybe/depending on factors affects LDAP users
      try {
        const mediaFolderResponse = await this.get<any>(
          `/Users/${this.userId ?? 'Me'}/Views`
        );

        return this.mapLibraries(mediaFolderResponse.Items);
      } catch (e) {
        logger.error(
          'Something went wrong while getting libraries from the Jellyfin server',
          {
            label: 'Jellyfin API',
            error: e.cause.message ?? e.cause.statusText,
          }
        );

        return [];
      }
    }
  }

  private mapLibraries(mediaFolders: JellyfinMediaFolder[]): JellyfinLibrary[] {
    const excludedTypes = [
      'music',
      'books',
      'musicvideos',
      'homevideos',
      'boxsets',
    ];

    return mediaFolders
      .filter((Item: JellyfinMediaFolder) => {
        return (
          Item.Type === 'CollectionFolder' &&
          !excludedTypes.includes(Item.CollectionType)
        );
      })
      .map((Item: JellyfinMediaFolder) => {
        return <JellyfinLibrary>{
          key: Item.Id,
          title: Item.Name,
          type: Item.CollectionType === 'movies' ? 'movie' : 'show',
          agent: 'jellyfin',
        };
      });
  }

  public async getLibraryContents(id: string): Promise<JellyfinLibraryItem[]> {
    try {
      const libraryItemsResponse = await this.get<any>(
        `/Users/${this.userId}/Items`,
        {
          SortBy: 'SortName',
          SortOrder: 'Ascending',
          IncludeItemTypes: 'Series,Movie,Others',
          Recursive: 'true',
          StartIndex: '0',
          ParentId: id,
          collapseBoxSetItems: 'false',
        }
      );

      return libraryItemsResponse.Items.filter(
        (item: JellyfinLibraryItem) => item.LocationType !== 'Virtual'
      );
    } catch (e) {
      logger.error(
        'Something went wrong while getting library content from the Jellyfin server',
        { label: 'Jellyfin API', error: e.cause.message ?? e.cause.statusText }
      );

      throw new ApiError(e.cause?.status, ApiErrorCode.InvalidAuthToken);
    }
  }

  public async getRecentlyAdded(id: string): Promise<JellyfinLibraryItem[]> {
    try {
      const itemResponse = await this.get<any>(
        `/Users/${this.userId}/Items/Latest`,
        {
          Limit: '12',
          ParentId: id,
        }
      );

      return itemResponse;
    } catch (e) {
      logger.error(
        'Something went wrong while getting library content from the Jellyfin server',
        { label: 'Jellyfin API', error: e.cause.message ?? e.cause.statusText }
      );

      throw new ApiError(e.cause?.status, ApiErrorCode.InvalidAuthToken);
    }
  }

  public async getItemData(
    id: string
  ): Promise<JellyfinLibraryItemExtended | undefined> {
    try {
      const itemResponse = await this.get<any>(
        `/Users/${this.userId}/Items/${id}`
      );

      return itemResponse;
    } catch (e) {
      if (availabilitySync.running) {
        if (e.cause?.status === 500) {
          return undefined;
        }
      }

      logger.error(
        'Something went wrong while getting library content from the Jellyfin server',
        { label: 'Jellyfin API', error: e.cause.message ?? e.cause.statusText }
      );
      throw new ApiError(e.cause?.status, ApiErrorCode.InvalidAuthToken);
    }
  }

  public async getSeasons(seriesID: string): Promise<JellyfinLibraryItem[]> {
    try {
      const seasonResponse = await this.get<any>(`/Shows/${seriesID}/Seasons`);

      return seasonResponse.Items;
    } catch (e) {
      logger.error(
        'Something went wrong while getting the list of seasons from the Jellyfin server',
        { label: 'Jellyfin API', error: e.cause.message ?? e.cause.statusText }
      );

      throw new ApiError(e.cause?.status, ApiErrorCode.InvalidAuthToken);
    }
  }

  public async getEpisodes(
    seriesID: string,
    seasonID: string
  ): Promise<JellyfinLibraryItem[]> {
    try {
      const episodeResponse = await this.get<any>(
        `/Shows/${seriesID}/Episodes`,
        {
          seasonId: seasonID,
        }
      );

      return episodeResponse.Items.filter(
        (item: JellyfinLibraryItem) => item.LocationType !== 'Virtual'
      );
    } catch (e) {
      logger.error(
        'Something went wrong while getting the list of episodes from the Jellyfin server',
        { label: 'Jellyfin API', error: e.cause.message ?? e.cause.statusText }
      );

      throw new ApiError(e.cause?.status, ApiErrorCode.InvalidAuthToken);
    }
  }

  public async createApiToken(appName: string): Promise<string> {
    try {
      await this.post(`/Auth/Keys?App=${appName}`);
      const apiKeys = await this.get<any>(`/Auth/Keys`);
      return apiKeys.Items.reverse().find(
        (item: any) => item.AppName === appName
      ).AccessToken;
    } catch (e) {
      logger.error(
        'Something went wrong while creating an API key from the Jellyfin server',
        { label: 'Jellyfin API', error: e.cause.message ?? e.cause.statusText }
      );

      throw new ApiError(e.response?.status, ApiErrorCode.InvalidAuthToken);
    }
  }
}

export default JellyfinAPI;
