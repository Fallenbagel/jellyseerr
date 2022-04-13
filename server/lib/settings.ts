import { randomUUID } from 'crypto';
import fs from 'fs';
import { merge } from 'lodash';
import path from 'path';
import webpush from 'web-push';
import { MediaServerType } from '../constants/server';
import { Permission } from './permissions';

export interface Library {
  id: string;
  name: string;
  enabled: boolean;
  type: 'show' | 'movie';
  lastScan?: number;
}

export interface Region {
  iso_3166_1: string;
  english_name: string;
  name?: string;
}

export interface Language {
  iso_639_1: string;
  english_name: string;
  name: string;
}

export interface PlexSettings {
  name: string;
  machineId?: string;
  ip: string;
  port: number;
  useSsl?: boolean;
  libraries: Library[];
  webAppUrl?: string;
}

export interface JellyfinSettings {
  name: string;
  hostname?: string;
  libraries: Library[];
  serverId: string;
}

export interface DVRSettings {
  id: number;
  name: string;
  hostname: string;
  port: number;
  apiKey: string;
  useSsl: boolean;
  baseUrl?: string;
  activeProfileId: number;
  activeProfileName: string;
  activeDirectory: string;
  tags: number[];
  is4k: boolean;
  isDefault: boolean;
  externalUrl?: string;
  syncEnabled: boolean;
  preventSearch: boolean;
}

export interface RadarrSettings extends DVRSettings {
  minimumAvailability: string;
}

export interface SonarrSettings extends DVRSettings {
  activeAnimeProfileId?: number;
  activeAnimeProfileName?: string;
  activeAnimeDirectory?: string;
  activeAnimeLanguageProfileId?: number;
  activeLanguageProfileId?: number;
  animeTags?: number[];
  enableSeasonFolders: boolean;
}

interface Quota {
  quotaLimit?: number;
  quotaDays?: number;
}

export interface MainSettings {
  apiKey: string;
  applicationTitle: string;
  applicationUrl: string;
  csrfProtection: boolean;
  cacheImages: boolean;
  defaultPermissions: number;
  defaultQuotas: {
    movie: Quota;
    tv: Quota;
  };
  hideAvailable: boolean;
  localLogin: boolean;
  newPlexLogin: boolean;
  region: string;
  originalLanguage: string;
  trustProxy: boolean;
  mediaServerType: number;
  partialRequestsEnabled: boolean;
  locale: string;
}

interface PublicSettings {
  initialized: boolean;
}

interface FullPublicSettings extends PublicSettings {
  applicationTitle: string;
  applicationUrl: string;
  hideAvailable: boolean;
  localLogin: boolean;
  movie4kEnabled: boolean;
  series4kEnabled: boolean;
  region: string;
  originalLanguage: string;
  mediaServerType: number;
  jellyfinHost?: string;
  jellyfinServerName?: string;
  partialRequestsEnabled: boolean;
  cacheImages: boolean;
  vapidPublic: string;
  enablePushRegistration: boolean;
  locale: string;
  emailEnabled: boolean;
}

export interface NotificationAgentConfig {
  enabled: boolean;
  types?: number;
  options: Record<string, unknown>;
}
export interface NotificationAgentDiscord extends NotificationAgentConfig {
  options: {
    botUsername?: string;
    botAvatarUrl?: string;
    webhookUrl: string;
  };
}

export interface NotificationAgentSlack extends NotificationAgentConfig {
  options: {
    webhookUrl: string;
  };
}

export interface NotificationAgentEmail extends NotificationAgentConfig {
  options: {
    emailFrom: string;
    smtpHost: string;
    smtpPort: number;
    secure: boolean;
    ignoreTls: boolean;
    requireTls: boolean;
    authUser?: string;
    authPass?: string;
    allowSelfSigned: boolean;
    senderName: string;
    pgpPrivateKey?: string;
    pgpPassword?: string;
  };
}

export interface NotificationAgentLunaSea extends NotificationAgentConfig {
  options: {
    webhookUrl: string;
    profileName?: string;
  };
}

export interface NotificationAgentTelegram extends NotificationAgentConfig {
  options: {
    botUsername?: string;
    botAPI: string;
    chatId: string;
    sendSilently: boolean;
  };
}

export interface NotificationAgentPushbullet extends NotificationAgentConfig {
  options: {
    accessToken: string;
  };
}

export interface NotificationAgentPushover extends NotificationAgentConfig {
  options: {
    accessToken: string;
    userToken: string;
  };
}

export interface NotificationAgentWebhook extends NotificationAgentConfig {
  options: {
    webhookUrl: string;
    jsonPayload: string;
    authHeader?: string;
  };
}

export enum NotificationAgentKey {
  DISCORD = 'discord',
  EMAIL = 'email',
  PUSHBULLET = 'pushbullet',
  PUSHOVER = 'pushover',
  SLACK = 'slack',
  TELEGRAM = 'telegram',
  WEBHOOK = 'webhook',
  WEBPUSH = 'webpush',
}

interface NotificationAgents {
  discord: NotificationAgentDiscord;
  email: NotificationAgentEmail;
  lunasea: NotificationAgentLunaSea;
  pushbullet: NotificationAgentPushbullet;
  pushover: NotificationAgentPushover;
  slack: NotificationAgentSlack;
  telegram: NotificationAgentTelegram;
  webhook: NotificationAgentWebhook;
  webpush: NotificationAgentConfig;
}

interface NotificationSettings {
  agents: NotificationAgents;
}

interface AllSettings {
  clientId: string;
  vapidPublic: string;
  vapidPrivate: string;
  main: MainSettings;
  plex: PlexSettings;
  jellyfin: JellyfinSettings;
  radarr: RadarrSettings[];
  sonarr: SonarrSettings[];
  public: PublicSettings;
  notifications: NotificationSettings;
}

const SETTINGS_PATH = process.env.CONFIG_DIRECTORY
  ? `${process.env.CONFIG_DIRECTORY}/settings.json`
  : path.join(__dirname, '../../config/settings.json');

class Settings {
  private data: AllSettings;

  constructor(initialSettings?: AllSettings) {
    this.data = {
      clientId: randomUUID(),
      vapidPrivate: '',
      vapidPublic: '',
      main: {
        apiKey: '',
        applicationTitle: 'Jellyseerr',
        applicationUrl: '',
        csrfProtection: false,
        cacheImages: false,
        defaultPermissions: Permission.REQUEST,
        defaultQuotas: {
          movie: {},
          tv: {},
        },
        hideAvailable: false,
        localLogin: true,
        newPlexLogin: true,
        region: '',
        originalLanguage: '',
        trustProxy: false,
        mediaServerType: MediaServerType.NOT_CONFIGURED,
        partialRequestsEnabled: true,
        locale: 'en',
      },
      plex: {
        name: '',
        ip: '',
        port: 32400,
        useSsl: false,
        libraries: [],
      },
      jellyfin: {
        name: '',
        hostname: '',
        libraries: [],
        serverId: '',
      },
      radarr: [],
      sonarr: [],
      public: {
        initialized: false,
      },
      notifications: {
        agents: {
          email: {
            enabled: false,
            options: {
              emailFrom: '',
              smtpHost: '',
              smtpPort: 587,
              secure: false,
              ignoreTls: false,
              requireTls: false,
              allowSelfSigned: false,
              senderName: 'Jellyseerr',
            },
          },
          discord: {
            enabled: false,
            types: 0,
            options: {
              webhookUrl: '',
            },
          },
          lunasea: {
            enabled: false,
            types: 0,
            options: {
              webhookUrl: '',
            },
          },
          slack: {
            enabled: false,
            types: 0,
            options: {
              webhookUrl: '',
            },
          },
          telegram: {
            enabled: false,
            types: 0,
            options: {
              botAPI: '',
              chatId: '',
              sendSilently: false,
            },
          },
          pushbullet: {
            enabled: false,
            types: 0,
            options: {
              accessToken: '',
            },
          },
          pushover: {
            enabled: false,
            types: 0,
            options: {
              accessToken: '',
              userToken: '',
            },
          },
          webhook: {
            enabled: false,
            types: 0,
            options: {
              webhookUrl: '',
              jsonPayload:
                'IntcbiAgICBcIm5vdGlmaWNhdGlvbl90eXBlXCI6IFwie3tub3RpZmljYXRpb25fdHlwZX19XCIsXG4gICAgXCJzdWJqZWN0XCI6IFwie3tzdWJqZWN0fX1cIixcbiAgICBcIm1lc3NhZ2VcIjogXCJ7e21lc3NhZ2V9fVwiLFxuICAgIFwiaW1hZ2VcIjogXCJ7e2ltYWdlfX1cIixcbiAgICBcImVtYWlsXCI6IFwie3tub3RpZnl1c2VyX2VtYWlsfX1cIixcbiAgICBcInVzZXJuYW1lXCI6IFwie3tub3RpZnl1c2VyX3VzZXJuYW1lfX1cIixcbiAgICBcImF2YXRhclwiOiBcInt7bm90aWZ5dXNlcl9hdmF0YXJ9fVwiLFxuICAgIFwie3ttZWRpYX19XCI6IHtcbiAgICAgICAgXCJtZWRpYV90eXBlXCI6IFwie3ttZWRpYV90eXBlfX1cIixcbiAgICAgICAgXCJ0bWRiSWRcIjogXCJ7e21lZGlhX3RtZGJpZH19XCIsXG4gICAgICAgIFwiaW1kYklkXCI6IFwie3ttZWRpYV9pbWRiaWR9fVwiLFxuICAgICAgICBcInR2ZGJJZFwiOiBcInt7bWVkaWFfdHZkYmlkfX1cIixcbiAgICAgICAgXCJzdGF0dXNcIjogXCJ7e21lZGlhX3N0YXR1c319XCIsXG4gICAgICAgIFwic3RhdHVzNGtcIjogXCJ7e21lZGlhX3N0YXR1czRrfX1cIlxuICAgIH0sXG4gICAgXCJ7e2V4dHJhfX1cIjogW10sXG4gICAgXCJ7e3JlcXVlc3R9fVwiOiB7XG4gICAgICAgIFwicmVxdWVzdF9pZFwiOiBcInt7cmVxdWVzdF9pZH19XCIsXG4gICAgICAgIFwicmVxdWVzdGVkQnlfZW1haWxcIjogXCJ7e3JlcXVlc3RlZEJ5X2VtYWlsfX1cIixcbiAgICAgICAgXCJyZXF1ZXN0ZWRCeV91c2VybmFtZVwiOiBcInt7cmVxdWVzdGVkQnlfdXNlcm5hbWV9fVwiLFxuICAgICAgICBcInJlcXVlc3RlZEJ5X2F2YXRhclwiOiBcInt7cmVxdWVzdGVkQnlfYXZhdGFyfX1cIlxuICAgIH1cbn0i',
            },
          },
          webpush: {
            enabled: false,
            options: {},
          },
        },
      },
    };
    if (initialSettings) {
      this.data = merge(this.data, initialSettings);
    }
  }

  get main(): MainSettings {
    if (!this.data.main.apiKey) {
      this.data.main.apiKey = this.generateApiKey();
      this.save();
    }
    return this.data.main;
  }

  set main(data: MainSettings) {
    this.data.main = data;
  }

  get plex(): PlexSettings {
    return this.data.plex;
  }

  set plex(data: PlexSettings) {
    this.data.plex = data;
  }

  get jellyfin(): JellyfinSettings {
    return this.data.jellyfin;
  }

  set jellyfin(data: JellyfinSettings) {
    this.data.jellyfin = data;
  }

  get radarr(): RadarrSettings[] {
    return this.data.radarr;
  }

  set radarr(data: RadarrSettings[]) {
    this.data.radarr = data;
  }

  get sonarr(): SonarrSettings[] {
    return this.data.sonarr;
  }

  set sonarr(data: SonarrSettings[]) {
    this.data.sonarr = data;
  }

  get public(): PublicSettings {
    return this.data.public;
  }

  set public(data: PublicSettings) {
    this.data.public = data;
  }

  get fullPublicSettings(): FullPublicSettings {
    return {
      ...this.data.public,
      applicationTitle: this.data.main.applicationTitle,
      applicationUrl: this.data.main.applicationUrl,
      hideAvailable: this.data.main.hideAvailable,
      localLogin: this.data.main.localLogin,
      movie4kEnabled: this.data.radarr.some(
        (radarr) => radarr.is4k && radarr.isDefault
      ),
      series4kEnabled: this.data.sonarr.some(
        (sonarr) => sonarr.is4k && sonarr.isDefault
      ),
      region: this.data.main.region,
      originalLanguage: this.data.main.originalLanguage,
      mediaServerType: this.main.mediaServerType,
      jellyfinHost: this.jellyfin.hostname,
      partialRequestsEnabled: this.data.main.partialRequestsEnabled,
      cacheImages: this.data.main.cacheImages,
      vapidPublic: this.vapidPublic,
      enablePushRegistration: this.data.notifications.agents.webpush.enabled,
      locale: this.data.main.locale,
      emailEnabled: this.data.notifications.agents.email.enabled,
    };
  }

  get notifications(): NotificationSettings {
    return this.data.notifications;
  }

  set notifications(data: NotificationSettings) {
    this.data.notifications = data;
  }

  get clientId(): string {
    if (!this.data.clientId) {
      this.data.clientId = randomUUID();
      this.save();
    }

    return this.data.clientId;
  }

  get vapidPublic(): string {
    this.generateVapidKeys();

    return this.data.vapidPublic;
  }

  get vapidPrivate(): string {
    this.generateVapidKeys();

    return this.data.vapidPrivate;
  }

  public regenerateApiKey(): MainSettings {
    this.main.apiKey = this.generateApiKey();
    this.save();
    return this.main;
  }

  private generateApiKey(): string {
    return Buffer.from(`${Date.now()}${randomUUID()})`).toString('base64');
  }

  private generateVapidKeys(force = false): void {
    if (!this.data.vapidPublic || !this.data.vapidPrivate || force) {
      const vapidKeys = webpush.generateVAPIDKeys();
      this.data.vapidPrivate = vapidKeys.privateKey;
      this.data.vapidPublic = vapidKeys.publicKey;
      this.save();
    }
  }

  /**
   * Settings Load
   *
   * This will load settings from file unless an optional argument of the object structure
   * is passed in.
   * @param overrideSettings If passed in, will override all existing settings with these
   * values
   */
  public load(overrideSettings?: AllSettings): Settings {
    if (overrideSettings) {
      this.data = overrideSettings;
      return this;
    }

    if (!fs.existsSync(SETTINGS_PATH)) {
      this.save();
    }
    const data = fs.readFileSync(SETTINGS_PATH, 'utf-8');

    if (data) {
      this.data = merge(this.data, JSON.parse(data));
      this.save();
    }
    return this;
  }

  public save(): void {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(this.data, undefined, ' '));
  }
}

let settings: Settings | undefined;

export const getSettings = (initialSettings?: AllSettings): Settings => {
  if (!settings) {
    settings = new Settings(initialSettings);
  }

  return settings;
};

export default Settings;
