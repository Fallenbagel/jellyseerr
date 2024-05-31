import type { AllSettings } from '@server/lib/settings';
import fs from 'fs';
import path from 'path';

export class SettingsMigrator {
  static async migrateSettings(settings: AllSettings): Promise<AllSettings> {
    const migrations = await this.loadMigrations();
    for (const migration of Object.values(migrations)) {
      settings = await migration(settings);
    }
    return settings;
  }

  private static async loadMigrations(): Promise<
    ((settings: AllSettings) => AllSettings)[]
  > {
    const migrationDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationDir);
    const migrationScripts: ((settings: AllSettings) => AllSettings)[] = [];

    for (const file of migrationFiles) {
      if (file.endsWith('.js') || file.endsWith('.ts')) {
        const scriptPath = path.join(migrationDir, file);
        const migrationScript = (await import(scriptPath)).default;
        if (typeof migrationScript === 'function') {
          migrationScripts.push(migrationScript);
        }
      }
    }

    return migrationScripts;
  }
}
