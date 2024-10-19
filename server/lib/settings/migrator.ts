/* eslint-disable no-console */
import type { AllSettings } from '@server/lib/settings';
import logger from '@server/logger';
import fs from 'fs';
import path from 'path';

const migrationsDir = path.join(__dirname, 'migrations');

export const runMigrations = async (
  settings: AllSettings,
  SETTINGS_PATH: string
): Promise<AllSettings> => {
  let migrated = settings;

  try {
    // let's create a backup of the settings
    fs.writeFileSync(
      SETTINGS_PATH.replace('.json', '.old.json'),
      JSON.stringify(settings, undefined, ' ')
    );

    const migrations = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.js') || file.endsWith('.ts'));

    const settingsBefore = JSON.stringify(migrated);

    for (const migration of migrations) {
      try {
        logger.debug(`Checking migration '${migration}'...`, {
          label: 'Settings Migrator',
        });
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fn = require(path.join(migrationsDir, migration)).default;
        const newSettings = await fn(migrated);
        if (JSON.stringify(migrated) !== JSON.stringify(migrated)) {
          logger.debug(`Migration '${migration}' has been applied.`, {
            label: 'Settings Migrator',
          });
        }
        migrated = newSettings;
      } catch (e) {
        logger.error(`Error while running migration '${migration}'`, {
          label: 'Settings Migrator',
        });
        throw e;
      }
    }

    const settingsAfter = JSON.stringify(migrated);

    if (settingsBefore !== settingsAfter) {
      // a migration occured
      // we check that the new config will be saved
      fs.writeFileSync(SETTINGS_PATH, JSON.stringify(migrated, undefined, ' '));
      const fileSaved = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
      if (JSON.stringify(fileSaved) !== settingsAfter) {
        // something went wrong while saving file
        throw new Error('Unable to save settings after migration.');
      }
    }
  } catch (e) {
    logger.error(
      `Something went wrong while running settings migrations: ${e.message}`,
      { label: 'Settings Migrator' }
    );
    // we stop jellyseerr if the migration failed
    console.log(
      '===================================================================='
    );
    console.log(
      '       SOMETHING WENT WRONG WHILE RUNNING SETTINGS MIGRATIONS       '
    );
    console.log(
      '   Please check that your configuration folder is properly set up   '
    );
    console.log(
      '===================================================================='
    );
    process.exit();
  }

  return migrated;
};
