import type { AllSettings } from '@server/lib/settings';

const migrateHostname = (settings: any): AllSettings => {
  const oldMediaServerType = settings.mediaServerType;
  if (oldMediaServerType === 2 && process.env.JELLYFIN_TYPE === 'emby') {
    settings.mediaServerType = 3;
  }

  return settings;
};

export default migrateHostname;
