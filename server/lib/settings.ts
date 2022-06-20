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
  externalHostname?: string;
  libraries: Library[];
  serverId: string;
}
export interface TautulliSettings {
  hostname?: string;
  port?: number;
  useSsl?: boolean;
  urlBase?: string;
  apiKey?: string;
  externalUrl?: string;
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
  userEmailRequired: boolean;
  newPlexLogin: boolean;
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
    enableMentions: boolean;
  };
}

export interface NotificationAgentSlack extends NotificationAgentConfig {
  options: {
    webhookUrl: string;
  };
}

export interface NotificationAgentEmail extends NotificationAgentConfig {
  options: {
    userEmailRequired: boolean;
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
    channelTag?: string;
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

export interface NotificationAgentGotify extends NotificationAgentConfig {
  options: {
    url: string;
    token: string;
  };
}

export enum NotificationAgentKey {
  DISCORD = 'discord',
  EMAIL = 'email',
  GOTIFY = 'gotify',
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
  gotify: NotificationAgentGotify;
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

interface JobSettings {
  schedule: string;
}

export type JobId =
  | 'plex-recently-added-scan'
  | 'plex-full-scan'
  | 'radarr-scan'
  | 'sonarr-scan'
  | 'download-sync'
  | 'download-sync-reset'
  | 'jellyfin-recently-added-sync'
  | 'jellyfin-full-sync';

interface AllSettings {
  clientId: string;
  vapidPublic: string;
  vapidPrivate: string;
  main: MainSettings;
  plex: PlexSettings;
  jellyfin: JellyfinSettings;
  tautulli: TautulliSettings;
  radarr: RadarrSettings[];
  sonarr: SonarrSettings[];
  public: PublicSettings;
  notifications: NotificationSettings;
  jobs: Record<JobId, JobSettings>;
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
        externalHostname: '',
        libraries: [],
        serverId: '',
      },
      tautulli: {},
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
              userEmailRequired: false,
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
              enableMentions: true,
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
                'IntcbiAgICBcIm5vdGlmaWNhdGlvbl90eXBlXCI6IFwie3tub3RpZmljYXRpb25fdHlwZX19XCIsXG4gICAgXCJldmVudFwiOiBcInt7ZXZlbnR9fVwiLFxuICAgIFwic3ViamVjdFwiOiBcInt7c3ViamVjdH19XCIsXG4gICAgXCJtZXNzYWdlXCI6IFwie3ttZXNzYWdlfX1cIixcbiAgICBcImltYWdlXCI6IFwie3tpbWFnZX19XCIsXG4gICAgXCJ7e21lZGlhfX1cIjoge1xuICAgICAgICBcIm1lZGlhX3R5cGVcIjogXCJ7e21lZGlhX3R5cGV9fVwiLFxuICAgICAgICBcInRtZGJJZFwiOiBcInt7bWVkaWFfdG1kYmlkfX1cIixcbiAgICAgICAgXCJ0dmRiSWRcIjogXCJ7e21lZGlhX3R2ZGJpZH19XCIsXG4gICAgICAgIFwic3RhdHVzXCI6IFwie3ttZWRpYV9zdGF0dXN9fVwiLFxuICAgICAgICBcInN0YXR1czRrXCI6IFwie3ttZWRpYV9zdGF0dXM0a319XCJcbiAgICB9LFxuICAgIFwie3tyZXF1ZXN0fX1cIjoge1xuICAgICAgICBcInJlcXVlc3RfaWRcIjogXCJ7e3JlcXVlc3RfaWR9fVwiLFxuICAgICAgICBcInJlcXVlc3RlZEJ5X2VtYWlsXCI6IFwie3tyZXF1ZXN0ZWRCeV9lbWFpbH19XCIsXG4gICAgICAgIFwicmVxdWVzdGVkQnlfdXNlcm5hbWVcIjogXCJ7e3JlcXVlc3RlZEJ5X3VzZXJuYW1lfX1cIixcbiAgICAgICAgXCJyZXF1ZXN0ZWRCeV9hdmF0YXJcIjogXCJ7e3JlcXVlc3RlZEJ5X2F2YXRhcn19XCJcbiAgICB9LFxuICAgIFwie3tpc3N1ZX19XCI6IHtcbiAgICAgICAgXCJpc3N1ZV9pZFwiOiBcInt7aXNzdWVfaWR9fVwiLFxuICAgICAgICBcImlzc3VlX3R5cGVcIjogXCJ7e2lzc3VlX3R5cGV9fVwiLFxuICAgICAgICBcImlzc3VlX3N0YXR1c1wiOiBcInt7aXNzdWVfc3RhdHVzfX1cIixcbiAgICAgICAgXCJyZXBvcnRlZEJ5X2VtYWlsXCI6IFwie3tyZXBvcnRlZEJ5X2VtYWlsfX1cIixcbiAgICAgICAgXCJyZXBvcnRlZEJ5X3VzZXJuYW1lXCI6IFwie3tyZXBvcnRlZEJ5X3VzZXJuYW1lfX1cIixcbiAgICAgICAgXCJyZXBvcnRlZEJ5X2F2YXRhclwiOiBcInt7cmVwb3J0ZWRCeV9hdmF0YXJ9fVwiXG4gICAgfSxcbiAgICBcInt7Y29tbWVudH19XCI6IHtcbiAgICAgICAgXCJjb21tZW50X21lc3NhZ2VcIjogXCJ7e2NvbW1lbnRfbWVzc2FnZX19XCIsXG4gICAgICAgIFwiY29tbWVudGVkQnlfZW1haWxcIjogXCJ7e2NvbW1lbnRlZEJ5X2VtYWlsfX1cIixcbiAgICAgICAgXCJjb21tZW50ZWRCeV91c2VybmFtZVwiOiBcInt7Y29tbWVudGVkQnlfdXNlcm5hbWV9fVwiLFxuICAgICAgICBcImNvbW1lbnRlZEJ5X2F2YXRhclwiOiBcInt7Y29tbWVudGVkQnlfYXZhdGFyfX1cIlxuICAgIH0sXG4gICAgXCJ7e2V4dHJhfX1cIjogW11cbn0i',
            },
          },
          webpush: {
            enabled: false,
            options: {},
          },
          gotify: {
            enabled: false,
            types: 0,
            options: {
              url: '',
              token: '',
            },
          },
        },
      },
      jobs: {
        'plex-recently-added-scan': {
          schedule: '0 */5 * * * *',
        },
        'plex-full-scan': {
          schedule: '0 0 3 * * *',
        },
        'radarr-scan': {
          schedule: '0 0 4 * * *',
        },
        'sonarr-scan': {
          schedule: '0 30 4 * * *',
        },
        'download-sync': {
          schedule: '0 * * * * *',
        },
        'download-sync-reset': {
          schedule: '0 0 1 * * *',
        },
        'jellyfin-recently-added-sync': {
          schedule: '0 */5 * * * *',
        },
        'jellyfin-full-sync': {
          schedule: '0 0 3 * * *',
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

  get tautulli(): TautulliSettings {
    return this.data.tautulli;
  }

  set tautulli(data: TautulliSettings) {
    this.data.tautulli = data;
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
      userEmailRequired:
        this.data.notifications.agents.email.options.userEmailRequired,
      newPlexLogin: this.data.main.newPlexLogin,
    };
  }

  get notifications(): NotificationSettings {
    return this.data.notifications;
  }

  set notifications(data: NotificationSettings) {
    this.data.notifications = data;
  }

  get jobs(): Record<JobId, JobSettings> {
    return this.data.jobs;
  }

  set jobs(data: Record<JobId, JobSettings>) {
    this.data.jobs = data;
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
