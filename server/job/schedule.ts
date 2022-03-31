import schedule from 'node-schedule';
import { jobPlexFullSync, jobPlexRecentSync } from './plexsync';
import { jobJellyfinFullSync, jobJellyfinRecentSync } from './jellyfinsync';
import logger from '../logger';
import { jobRadarrSync } from './radarrsync';
import { jobSonarrSync } from './sonarrsync';
import downloadTracker from '../lib/downloadtracker';

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
  // Run recently added plex sync every 5 minutes
  scheduledJobs.push({
    id: 'plex-recently-added-sync',
    name: 'Plex Recently Added Sync',
    type: 'process',
    job: schedule.scheduleJob('0 */5 * * * *', () => {
      logger.info('Starting scheduled job: Plex Recently Added Sync', {
        label: 'Jobs',
      });
      jobPlexRecentSync.run();
    }),
    running: () => jobPlexRecentSync.status().running,
    cancelFn: () => jobPlexRecentSync.cancel(),
  });

  // Run full plex sync every 24 hours
  scheduledJobs.push({
    id: 'plex-full-sync',
    name: 'Plex Full Library Sync',
    type: 'process',
    job: schedule.scheduleJob('0 0 3 * * *', () => {
      logger.info('Starting scheduled job: Plex Full Sync', { label: 'Jobs' });
      jobPlexFullSync.run();
    }),
    running: () => jobPlexFullSync.status().running,
    cancelFn: () => jobPlexFullSync.cancel(),
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

  // Run full radarr sync every 24 hours
  scheduledJobs.push({
    id: 'radarr-sync',
    name: 'Radarr Sync',
    type: 'process',
    job: schedule.scheduleJob('0 0 4 * * *', () => {
      logger.info('Starting scheduled job: Radarr Sync', { label: 'Jobs' });
      jobRadarrSync.run();
    }),
    running: () => jobRadarrSync.status().running,
    cancelFn: () => jobRadarrSync.cancel(),
  });

  // Run full sonarr sync every 24 hours
  scheduledJobs.push({
    id: 'sonarr-sync',
    name: 'Sonarr Sync',
    type: 'process',
    job: schedule.scheduleJob('0 30 4 * * *', () => {
      logger.info('Starting scheduled job: Sonarr Sync', { label: 'Jobs' });
      jobSonarrSync.run();
    }),
    running: () => jobSonarrSync.status().running,
    cancelFn: () => jobSonarrSync.cancel(),
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
