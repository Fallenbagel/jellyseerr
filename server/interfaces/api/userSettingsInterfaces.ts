export interface UserSettingsGeneralResponse {
  username?: string;
  region?: string;
  originalLanguage?: string;
}

export interface UserSettingsNotificationsResponse {
  enableNotifications: boolean;
  discordId?: string;
}
