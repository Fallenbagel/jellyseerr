import { Router } from 'express';
import { getSettings, Library, MainSettings } from '../../lib/settings';
import { getRepository } from 'typeorm';
import { User } from '../../entity/User';
import PlexAPI from '../../api/plexapi';
import PlexTvAPI from '../../api/plextv';
import JellyfinAPI from '../../api/jellyfin';
import { jobPlexFullSync } from '../../job/plexsync';
import { jobJellyfinFullSync } from '../../job/jellyfinsync';
import { scheduledJobs } from '../../job/schedule';
import { Permission } from '../../lib/permissions';
import { isAuthenticated } from '../../middleware/auth';
import { merge, omit } from 'lodash';
import Media from '../../entity/Media';
import { MediaRequest } from '../../entity/MediaRequest';
import { getAppVersion } from '../../utils/appVersion';
import { SettingsAboutResponse } from '../../interfaces/api/settingsInterfaces';
import notificationRoutes from './notifications';
import sonarrRoutes from './sonarr';
import radarrRoutes from './radarr';
import cacheManager, { AvailableCacheIds } from '../../lib/cache';

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
  const regexp = /(http(s?):\/\/)(.*)(:[0-9]*)/;
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
          await Promise.all(
            device.connection.map(async (connection) => {
              connection.host = connection.uri.replace(regexp, '$3');
              let msg:
                | { status: number; message: string }
                | undefined = undefined;
              const plexDeviceSettings = {
                ...settings.plex,
                ip: connection.host,
                port: connection.port,
                useSsl: connection.protocol === 'https' ? true : false,
              };
              const plexClient = new PlexAPI({
                plexToken: admin.plexToken,
                plexSettings: plexDeviceSettings,
                timeout: 5000,
              });
              try {
                await plexClient.getStatus();
                msg = {
                  status: 200,
                  message: 'OK',
                };
              } catch (e) {
                msg = {
                  status: 500,
                  message: e.message,
                };
              }
              connection.status = msg?.status;
              connection.message = msg?.message;
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

    const libraries = await plexapi.getLibraries();

    const newLibraries: Library[] = libraries
      // Remove libraries that are not movie or show
      .filter((library) => library.type === 'movie' || library.type === 'show')
      // Remove libraries that do not have a metadata agent set (usually personal video libraries)
      .filter((library) => library.agent !== 'com.plexapp.agents.none')
      .map((library) => {
        const existing = settings.plex.libraries.find(
          (l) => l.id === library.key && l.name === library.title
        );

        return {
          id: library.key,
          name: library.title,
          enabled: existing?.enabled ?? false,
        };
      });

    settings.plex.libraries = newLibraries;
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
  return res.status(200).json(jobPlexFullSync.status());
});

settingsRoutes.post('/plex/sync', (req, res) => {
  if (req.body.cancel) {
    jobPlexFullSync.cancel();
  } else if (req.body.start) {
    jobPlexFullSync.run();
  }
  return res.status(200).json(jobPlexFullSync.status());
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
