import schedule from 'node-schedule';
import downloadTracker from '../lib/downloadtracker';
import { plexFullScanner, plexRecentScanner } from '../lib/scanners/plex';
import { radarrScanner } from '../lib/scanners/radarr';
import { sonarrScanner } from '../lib/scanners/sonarr';
import logger from '../logger';
import { jobJellyfinFullSync, jobJellyfinRecentSync } from './jellyfinsync';

interface ScheduledJob {
  id: string;
  job: schedule.Job;
  name: string;
  type: 'process' | 'command';
  running?: () => boolean;
  cancelFn?: () => void;
}

export const scheduledJobs: ScheduledJob[] = [];

export const startJobs = (): void => {
  // Run recently added plex scan every 5 minutes
  scheduledJobs.push({
    id: 'plex-recently-added-scan',
    name: 'Plex Recently Added Scan',
    type: 'process',
    job: schedule.scheduleJob('0 */5 * * * *', () => {
      logger.info('Starting scheduled job: Plex Recently Added Scan', {
        label: 'Jobs',
      });
      plexRecentScanner.run();
    }),
    running: () => plexRecentScanner.status().running,
    cancelFn: () => plexRecentScanner.cancel(),
  });

  // Run full plex scan every 24 hours
  scheduledJobs.push({
    id: 'plex-full-scan',
    name: 'Plex Full Library Scan',
    type: 'process',
    job: schedule.scheduleJob('0 0 3 * * *', () => {
      logger.info('Starting scheduled job: Plex Full Library Scan', {
        label: 'Jobs',
      });
      plexFullScanner.run();
    }),
    running: () => plexFullScanner.status().running,
    cancelFn: () => plexFullScanner.cancel(),
  });

  // Run recently added jellyfin sync every 5 minutes
  scheduledJobs.push({
    id: 'jellyfin-recently-added-sync',
    name: 'Jellyfin Recently Added Sync',
    type: 'process',
    job: schedule.scheduleJob('0 */5 * * * *', () => {
      logger.info('Starting scheduled job: Jellyfin Recently Added Sync', {
        label: 'Jobs',
      });
      jobJellyfinRecentSync.run();
    }),
    running: () => jobJellyfinRecentSync.status().running,
    cancelFn: () => jobJellyfinRecentSync.cancel(),
  });

  // Run full jellyfin sync every 24 hours
  scheduledJobs.push({
    id: 'jellyfin-full-sync',
    name: 'Jellyfin Full Library Sync',
    type: 'process',
    job: schedule.scheduleJob('0 0 3 * * *', () => {
      logger.info('Starting scheduled job: Jellyfin Full Sync', {
        label: 'Jobs',
      });
      jobJellyfinFullSync.run();
    }),
    running: () => jobJellyfinFullSync.status().running,
    cancelFn: () => jobJellyfinFullSync.cancel(),
  });

  // Run full radarr scan every 24 hours
  scheduledJobs.push({
    id: 'radarr-scan',
    name: 'Radarr Scan',
    type: 'process',
    job: schedule.scheduleJob('0 0 4 * * *', () => {
      logger.info('Starting scheduled job: Radarr Scan', { label: 'Jobs' });
      radarrScanner.run();
    }),
    running: () => radarrScanner.status().running,
    cancelFn: () => radarrScanner.cancel(),
  });

  // Run full sonarr scan every 24 hours
  scheduledJobs.push({
    id: 'sonarr-scan',
    name: 'Sonarr Scan',
    type: 'process',
    job: schedule.scheduleJob('0 30 4 * * *', () => {
      logger.info('Starting scheduled job: Sonarr Scan', { label: 'Jobs' });
      sonarrScanner.run();
    }),
    running: () => sonarrScanner.status().running,
    cancelFn: () => sonarrScanner.cancel(),
  });

  // Run download sync
  scheduledJobs.push({
    id: 'download-sync',
    name: 'Download Sync',
    type: 'command',
    job: schedule.scheduleJob('0 * * * * *', () => {
      logger.debug('Starting scheduled job: Download Sync', { label: 'Jobs' });
      downloadTracker.updateDownloads();
    }),
  });

  // Reset download sync
  scheduledJobs.push({
    id: 'download-sync-reset',
    name: 'Download Sync Reset',
    type: 'command',
    job: schedule.scheduleJob('0 0 1 * * *', () => {
      logger.info('Starting scheduled job: Download Sync Reset', {
        label: 'Jobs',
      });
      downloadTracker.resetDownloadTracker();
    }),
  });

  logger.info('Scheduled jobs loaded', { label: 'Jobs' });
};
