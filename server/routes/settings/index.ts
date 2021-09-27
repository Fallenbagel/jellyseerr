import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import { merge, omit } from 'lodash';
import path from 'path';
import { getRepository } from 'typeorm';
import { URL } from 'url';
import JellyfinAPI from '../../api/jellyfin';
import PlexAPI from '../../api/plexapi';
import PlexTvAPI from '../../api/plextv';
import Media from '../../entity/Media';
import { MediaRequest } from '../../entity/MediaRequest';
import { User } from '../../entity/User';
import { PlexConnection } from '../../interfaces/api/plexInterfaces';
import {
  LogMessage,
  LogsResultsResponse,
  SettingsAboutResponse,
} from '../../interfaces/api/settingsInterfaces';
import { jobJellyfinFullSync } from '../../job/jellyfinsync';
import { scheduledJobs } from '../../job/schedule';
import cacheManager, { AvailableCacheIds } from '../../lib/cache';
import { Permission } from '../../lib/permissions';
import { plexFullScanner } from '../../lib/scanners/plex';
import { getSettings, Library, MainSettings } from '../../lib/settings';
import logger from '../../logger';
import { isAuthenticated } from '../../middleware/auth';
import { getAppVersion } from '../../utils/appVersion';
import notificationRoutes from './notifications';
import radarrRoutes from './radarr';
import sonarrRoutes from './sonarr';

const settingsRoutes = Router();

settingsRoutes.use('/notifications', notificationRoutes);
settingsRoutes.use('/radarr', radarrRoutes);
settingsRoutes.use('/sonarr', sonarrRoutes);

const filteredMainSettings = (
  user: User,
  main: MainSettings
): Partial<MainSettings> => {
  if (!user?.hasPermission(Permission.ADMIN)) {
    return omit(main, 'apiKey');
  }

  return main;
};

settingsRoutes.get('/main', (req, res, next) => {
  const settings = getSettings();

  if (!req.user) {
    return next({ status: 500, message: 'User missing from request' });
  }

  res.status(200).json(filteredMainSettings(req.user, settings.main));
});

settingsRoutes.post('/main', (req, res) => {
  const settings = getSettings();

  settings.main = merge(settings.main, req.body);
  settings.save();

  return res.status(200).json(settings.main);
});

settingsRoutes.post('/main/regenerate', (req, res, next) => {
  const settings = getSettings();

  const main = settings.regenerateApiKey();

  if (!req.user) {
    return next({ status: 500, message: 'User missing from request' });
  }

  return res.status(200).json(filteredMainSettings(req.user, main));
});

settingsRoutes.get('/plex', (_req, res) => {
  const settings = getSettings();

  res.status(200).json(settings.plex);
});

settingsRoutes.post('/plex', async (req, res, next) => {
  const userRepository = getRepository(User);
  const settings = getSettings();
  try {
    const admin = await userRepository.findOneOrFail({
      select: ['id', 'plexToken'],
      order: { id: 'ASC' },
    });

    Object.assign(settings.plex, req.body);

    const plexClient = new PlexAPI({ plexToken: admin.plexToken });

    const result = await plexClient.getStatus();

    if (result?.MediaContainer?.machineIdentifier) {
      settings.plex.machineId = result.MediaContainer.machineIdentifier;
      settings.plex.name = result.MediaContainer.friendlyName;

      settings.save();
    }
  } catch (e) {
    return next({
      status: 500,
      message: `Failed to connect to Plex: ${e.message}`,
    });
  }

  return res.status(200).json(settings.plex);
});

settingsRoutes.get('/plex/devices/servers', async (req, res, next) => {
  const userRepository = getRepository(User);
  try {
    const admin = await userRepository.findOneOrFail({
      select: ['id', 'plexToken'],
      order: { id: 'ASC' },
    });
    const plexTvClient = admin.plexToken
      ? new PlexTvAPI(admin.plexToken)
      : null;
    const devices = (await plexTvClient?.getDevices())?.filter((device) => {
      return device.provides.includes('server') && device.owned;
    });
    const settings = getSettings();

    if (devices) {
      await Promise.all(
        devices.map(async (device) => {
          const plexDirectConnections: PlexConnection[] = [];

          device.connection.forEach((connection) => {
            const url = new URL(connection.uri);

            if (url.hostname !== connection.address) {
              const plexDirectConnection = { ...connection };
              plexDirectConnection.address = url.hostname;
              plexDirectConnections.push(plexDirectConnection);

              // Connect to IP addresses over HTTP
              connection.protocol = 'http';
            }
          });

          plexDirectConnections.forEach((plexDirectConnection) => {
            device.connection.push(plexDirectConnection);
          });

          await Promise.all(
            device.connection.map(async (connection) => {
              const plexDeviceSettings = {
                ...settings.plex,
                ip: connection.address,
                port: connection.port,
                useSsl: connection.protocol === 'https',
              };
              const plexClient = new PlexAPI({
                plexToken: admin.plexToken,
                plexSettings: plexDeviceSettings,
                timeout: 5000,
              });

              try {
                await plexClient.getStatus();
                connection.status = 200;
                connection.message = 'OK';
              } catch (e) {
                connection.status = 500;
                connection.message = e.message.split(':')[0];
              }
            })
          );
        })
      );
    }
    return res.status(200).json(devices);
  } catch (e) {
    return next({
      status: 500,
      message: `Failed to connect to Plex: ${e.message}`,
    });
  }
});

settingsRoutes.get('/plex/library', async (req, res) => {
  const settings = getSettings();

  if (req.query.sync) {
    const userRepository = getRepository(User);
    const admin = await userRepository.findOneOrFail({
      select: ['id', 'plexToken'],
      order: { id: 'ASC' },
    });
    const plexapi = new PlexAPI({ plexToken: admin.plexToken });

    await plexapi.syncLibraries();
  }

  const enabledLibraries = req.query.enable
    ? (req.query.enable as string).split(',')
    : [];
  settings.plex.libraries = settings.plex.libraries.map((library) => ({
    ...library,
    enabled: enabledLibraries.includes(library.id),
  }));
  settings.save();
  return res.status(200).json(settings.plex.libraries);
});

settingsRoutes.get('/plex/sync', (_req, res) => {
  return res.status(200).json(plexFullScanner.status());
});

settingsRoutes.post('/plex/sync', (req, res) => {
  if (req.body.cancel) {
    plexFullScanner.cancel();
  } else if (req.body.start) {
    plexFullScanner.run();
  }
  return res.status(200).json(plexFullScanner.status());
});

settingsRoutes.get('/jellyfin', (_req, res) => {
  const settings = getSettings();

  res.status(200).json(settings.jellyfin);
});

settingsRoutes.post('/jellyfin', (req, res) => {
  const settings = getSettings();

  settings.jellyfin = merge(settings.jellyfin, req.body);
  settings.save();

  return res.status(200).json(settings.jellyfin);
});

settingsRoutes.get('/jellyfin/library', async (req, res) => {
  const settings = getSettings();

  if (req.query.sync) {
    const userRepository = getRepository(User);
    const admin = await userRepository.findOneOrFail({
      select: ['id', 'jellyfinAuthToken', 'jellyfinDeviceId', 'jellyfinUserId'],
      order: { id: 'ASC' },
    });
    const jellyfinClient = new JellyfinAPI(
      settings.jellyfin.hostname ?? '',
      admin.jellyfinAuthToken ?? '',
      admin.jellyfinDeviceId ?? ''
    );

    jellyfinClient.setUserId(admin.jellyfinUserId ?? '');

    const libraries = await jellyfinClient.getLibraries();

    const newLibraries: Library[] = libraries.map((library) => {
      const existing = settings.jellyfin.libraries.find(
        (l) => l.id === library.key && l.name === library.title
      );

      return {
        id: library.key,
        name: library.title,
        enabled: existing?.enabled ?? false,
        type: library.type,
      };
    });

    settings.jellyfin.libraries = newLibraries;
  }

  const enabledLibraries = req.query.enable
    ? (req.query.enable as string).split(',')
    : [];
  settings.jellyfin.libraries = settings.jellyfin.libraries.map((library) => ({
    ...library,
    enabled: enabledLibraries.includes(library.id),
  }));
  settings.save();
  return res.status(200).json(settings.jellyfin.libraries);
});

settingsRoutes.get('/jellyfin/sync', (_req, res) => {
  return res.status(200).json(jobJellyfinFullSync.status());
});

settingsRoutes.post('/jellyfin/sync', (req, res) => {
  if (req.body.cancel) {
    jobJellyfinFullSync.cancel();
  } else if (req.body.start) {
    jobJellyfinFullSync.run();
  }
  return res.status(200).json(jobJellyfinFullSync.status());
});
settingsRoutes.get(
  '/logs',
  rateLimit({ windowMs: 60 * 1000, max: 50 }),
  (req, res, next) => {
    const pageSize = req.query.take ? Number(req.query.take) : 25;
    const skip = req.query.skip ? Number(req.query.skip) : 0;

    let filter: string[] = [];
    switch (req.query.filter) {
      case 'debug':
        filter.push('debug');
      // falls through
      case 'info':
        filter.push('info');
      // falls through
      case 'warn':
        filter.push('warn');
      // falls through
      case 'error':
        filter.push('error');
        break;
      default:
        filter = ['debug', 'info', 'warn', 'error'];
    }

    const logFile = process.env.CONFIG_DIRECTORY
      ? `${process.env.CONFIG_DIRECTORY}/logs/overseerr.log`
      : path.join(__dirname, '../../../config/logs/overseerr.log');
    const logs: LogMessage[] = [];

    try {
      fs.readFileSync(logFile)
        .toString()
        .split('\n')
        .forEach((line) => {
          if (!line.length) return;

          const timestamp = line.match(new RegExp(/^.{24}/)) || [];
          const level = line.match(new RegExp(/\s\[\w+\]/)) || [];
          const label = line.match(new RegExp(/\]\[.+?\]/)) || [];
          const message = line.match(new RegExp(/:\s([^{}]+)({.*})?/)) || [];

          if (level.length && filter.includes(level[0].slice(2, -1))) {
            logs.push({
              timestamp: timestamp[0],
              level: level.length ? level[0].slice(2, -1) : '',
              label: label.length ? label[0].slice(2, -1) : '',
              message: message.length && message[1] ? message[1] : '',
              data:
                message.length && message[2]
                  ? JSON.parse(message[2])
                  : undefined,
            });
          }
        });

      const displayedLogs = logs.reverse().slice(skip, skip + pageSize);

      return res.status(200).json({
        pageInfo: {
          pages: Math.ceil(logs.length / pageSize),
          pageSize,
          results: logs.length,
          page: Math.ceil(skip / pageSize) + 1,
        },
        results: displayedLogs,
      } as LogsResultsResponse);
    } catch (error) {
      logger.error('Something went wrong while fetching the logs', {
        label: 'Logs',
        errorMessage: error.message,
      });
      return next({
        status: 500,
        message: 'Something went wrong while fetching the logs',
      });
    }
  }
);

settingsRoutes.get('/jobs', (_req, res) => {
  return res.status(200).json(
    scheduledJobs.map((job) => ({
      id: job.id,
      name: job.name,
      type: job.type,
      nextExecutionTime: job.job.nextInvocation(),
      running: job.running ? job.running() : false,
    }))
  );
});

settingsRoutes.post<{ jobId: string }>('/jobs/:jobId/run', (req, res, next) => {
  const scheduledJob = scheduledJobs.find((job) => job.id === req.params.jobId);

  if (!scheduledJob) {
    return next({ status: 404, message: 'Job not found' });
  }

  scheduledJob.job.invoke();

  return res.status(200).json({
    id: scheduledJob.id,
    name: scheduledJob.name,
    type: scheduledJob.type,
    nextExecutionTime: scheduledJob.job.nextInvocation(),
    running: scheduledJob.running ? scheduledJob.running() : false,
  });
});

settingsRoutes.post<{ jobId: string }>(
  '/jobs/:jobId/cancel',
  (req, res, next) => {
    const scheduledJob = scheduledJobs.find(
      (job) => job.id === req.params.jobId
    );

    if (!scheduledJob) {
      return next({ status: 404, message: 'Job not found' });
    }

    if (scheduledJob.cancelFn) {
      scheduledJob.cancelFn();
    }

    return res.status(200).json({
      id: scheduledJob.id,
      name: scheduledJob.name,
      type: scheduledJob.type,
      nextExecutionTime: scheduledJob.job.nextInvocation(),
      running: scheduledJob.running ? scheduledJob.running() : false,
    });
  }
);

settingsRoutes.get('/cache', (req, res) => {
  const caches = cacheManager.getAllCaches();

  return res.status(200).json(
    Object.values(caches).map((cache) => ({
      id: cache.id,
      name: cache.name,
      stats: cache.getStats(),
    }))
  );
});

settingsRoutes.post<{ cacheId: AvailableCacheIds }>(
  '/cache/:cacheId/flush',
  (req, res, next) => {
    const cache = cacheManager.getCache(req.params.cacheId);

    if (cache) {
      cache.flush();
      return res.status(204).send();
    }

    next({ status: 404, message: 'Cache does not exist.' });
  }
);

settingsRoutes.post(
  '/initialize',
  isAuthenticated(Permission.ADMIN),
  (_req, res) => {
    const settings = getSettings();

    settings.public.initialized = true;
    settings.save();

    return res.status(200).json(settings.public);
  }
);

settingsRoutes.get('/about', async (req, res) => {
  const mediaRepository = getRepository(Media);
  const mediaRequestRepository = getRepository(MediaRequest);

  const totalMediaItems = await mediaRepository.count();
  const totalRequests = await mediaRequestRepository.count();

  return res.status(200).json({
    version: getAppVersion(),
    totalMediaItems,
    totalRequests,
    tz: process.env.TZ,
  } as SettingsAboutResponse);
});

export default settingsRoutes;
