import axios, { AxiosInstance } from 'axios';
import xml2js from 'xml2js';
import { PlexDevice } from '../interfaces/api/plexInterfaces';
import { getSettings } from '../lib/settings';
import logger from '../logger';

interface PlexAccountResponse {
  user: PlexUser;
}

interface PlexUser {
  id: number;
  uuid: string;
  email: string;
  joined_at: string;
  username: string;
  title: string;
  thumb: string;
  hasPassword: boolean;
  authToken: string;
  subscription: {
    active: boolean;
    status: string;
    plan: string;
    features: string[];
  };
  roles: {
    roles: string[];
  };
  entitlements: string[];
}

interface ConnectionResponse {
  $: {
    protocol: string;
    address: string;
    port: string;
    uri: string;
    local: string;
  };
}

interface DeviceResponse {
  $: {
    name: string;
    product: string;
    productVersion: string;
    platform: string;
    platformVersion: string;
    device: string;
    clientIdentifier: string;
    createdAt: string;
    lastSeenAt: string;
    provides: string;
    owned: string;
    accessToken?: string;
    publicAddress?: string;
    httpsRequired?: string;
    synced?: string;
    relay?: string;
    dnsRebindingProtection?: string;
    natLoopbackSupported?: string;
    publicAddressMatches?: string;
    presence?: string;
    ownerID?: string;
    home?: string;
    sourceTitle?: string;
  };
  Connection: ConnectionResponse[];
}

interface ServerResponse {
  $: {
    id: string;
    serverId: string;
    machineIdentifier: string;
    name: string;
    lastSeenAt: string;
    numLibraries: string;
    owned: string;
  };
}

interface FriendResponse {
  MediaContainer: {
    User: {
      $: {
        id: string;
        title: string;
        username: string;
        email: string;
        thumb: string;
      };
      Server?: ServerResponse[];
    }[];
  };
}

interface UsersResponse {
  MediaContainer: {
    User: {
      $: {
        id: string;
        title: string;
        username: string;
        email: string;
        thumb: string;
      };
      Server: ServerResponse[];
    }[];
  };
}

class PlexTvAPI {
  private authToken: string;
  private axios: AxiosInstance;

  constructor(authToken: string) {
    this.authToken = authToken;
    this.axios = axios.create({
      baseURL: 'https://plex.tv',
      headers: {
        'X-Plex-Token': this.authToken,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  public async getDevices(): Promise<PlexDevice[]> {
    try {
      const devicesResp = await this.axios.get(
        '/api/resources?includeHttps=1',
        {
          transformResponse: [],
          responseType: 'text',
        }
      );
      const parsedXml = await xml2js.parseStringPromise(
        devicesResp.data as DeviceResponse
      );
      return parsedXml?.MediaContainer?.Device?.map((pxml: DeviceResponse) => ({
        name: pxml.$.name,
        product: pxml.$.product,
        productVersion: pxml.$.productVersion,
        platform: pxml.$?.platform,
        platformVersion: pxml.$?.platformVersion,
        device: pxml.$?.device,
        clientIdentifier: pxml.$.clientIdentifier,
        createdAt: new Date(parseInt(pxml.$?.createdAt, 10) * 1000),
        lastSeenAt: new Date(parseInt(pxml.$?.lastSeenAt, 10) * 1000),
        provides: pxml.$.provides.split(','),
        owned: pxml.$.owned == '1' ? true : false,
        accessToken: pxml.$?.accessToken,
        publicAddress: pxml.$?.publicAddress,
        publicAddressMatches:
          pxml.$?.publicAddressMatches == '1' ? true : false,
        httpsRequired: pxml.$?.httpsRequired == '1' ? true : false,
        synced: pxml.$?.synced == '1' ? true : false,
        relay: pxml.$?.relay == '1' ? true : false,
        dnsRebindingProtection:
          pxml.$?.dnsRebindingProtection == '1' ? true : false,
        natLoopbackSupported:
          pxml.$?.natLoopbackSupported == '1' ? true : false,
        presence: pxml.$?.presence == '1' ? true : false,
        ownerID: pxml.$?.ownerID,
        home: pxml.$?.home == '1' ? true : false,
        sourceTitle: pxml.$?.sourceTitle,
        connection: pxml?.Connection?.map((conn: ConnectionResponse) => ({
          protocol: conn.$.protocol,
          address: conn.$.address,
          port: parseInt(conn.$.port, 10),
          uri: conn.$.uri,
          local: conn.$.local == '1' ? true : false,
        })),
      }));
    } catch (e) {
      logger.error('Something went wrong getting the devices from plex.tv', {
        label: 'Plex.tv API',
        errorMessage: e.message,
      });
      throw new Error('Invalid auth token');
    }
  }

  public async getUser(): Promise<PlexUser> {
    try {
      const account = await this.axios.get<PlexAccountResponse>(
        '/users/account.json'
      );

      return account.data.user;
    } catch (e) {
      logger.error(
        `Something went wrong while getting the account from plex.tv: ${e.message}`,
        { label: 'Plex.tv API' }
      );
      throw new Error('Invalid auth token');
    }
  }

  public async getFriends(): Promise<FriendResponse> {
    const response = await this.axios.get('/pms/friends/all', {
      transformResponse: [],
      responseType: 'text',
    });

    const parsedXml = (await xml2js.parseStringPromise(
      response.data
    )) as FriendResponse;

    return parsedXml;
  }

  public async checkUserAccess(userId: number): Promise<boolean> {
    const settings = getSettings();

    try {
      if (!settings.plex.machineId) {
        throw new Error('Plex is not configured!');
      }

      const friends = await this.getFriends();

      const users = friends.MediaContainer.User;

      const user = users.find((u) => parseInt(u.$.id) === userId);

      if (!user) {
        throw new Error(
          "This user does not exist on the main Plex account's shared list"
        );
      }

      return !!user.Server?.find(
        (server) => server.$.machineIdentifier === settings.plex.machineId
      );
    } catch (e) {
      logger.error(`Error checking user access: ${e.message}`);
      return false;
    }
  }

  public async getUsers(): Promise<UsersResponse> {
    const response = await this.axios.get('/api/users', {
      transformResponse: [],
      responseType: 'text',
    });

    const parsedXml = (await xml2js.parseStringPromise(
      response.data
    )) as UsersResponse;
    return parsedXml;
  }
}

export default PlexTvAPI;
