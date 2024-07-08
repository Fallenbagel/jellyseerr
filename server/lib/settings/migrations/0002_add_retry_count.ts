import type { AllSettings } from '@server/lib/settings';

const migrateRetryCount = (settings: any): AllSettings => {
  return {
    ...settings,
    main: {
      ...settings.main,
      retryCount: settings.main.retryCount ?? 0,
    },
  };
};

export default migrateRetryCount;
