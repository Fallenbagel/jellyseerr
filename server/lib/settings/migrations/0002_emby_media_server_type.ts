import type { AllSettings } from '@server/lib/settings';

const migrateHostname = (settings: any): AllSettings => {
  const oldMediaServerType = settings.main.mediaServerType;
  console.log('Migrating media server type', oldMediaServerType);
  if (oldMediaServerType === 2 && process.env.JELLYFIN_TYPE === 'emby') {
    settings.main.mediaServerType = 3;
  }

  return settings;
};

export default migrateHostname;
