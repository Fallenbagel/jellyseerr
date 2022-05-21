import { NotificationAgentKey } from '../../lib/settings';

export interface UserSettingsGeneralResponse {
  username?: string;
  discordId?: string;
  locale?: string;
  region?: string;
  originalLanguage?: string;
  movieQuotaLimit?: number;
  movieQuotaDays?: number;
  tvQuotaLimit?: number;
  tvQuotaDays?: number;
  globalMovieQuotaDays?: number;
  globalMovieQuotaLimit?: number;
  globalTvQuotaLimit?: number;
  globalTvQuotaDays?: number;
}

export type NotificationAgentTypes = Record<NotificationAgentKey, number>;
export interface UserSettingsNotificationsResponse {
  emailEnabled?: boolean;
  pgpKey?: string;
  discordEnabled?: boolean;
  discordEnabledTypes?: number;
  discordId?: string;
  pushbulletAccessToken?: string;
  pushoverApplicationToken?: string;
  pushoverUserKey?: string;
  telegramEnabled?: boolean;
  telegramBotUsername?: string;
  telegramChatId?: string;
  telegramSendSilently?: boolean;
  webPushEnabled?: boolean;
  notificationTypes: Partial<NotificationAgentTypes>;
}
