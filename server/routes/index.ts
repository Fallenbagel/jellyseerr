import { Router } from 'express';
import user from './user';
import authRoutes from './auth';
import { checkUser, isAuthenticated } from '../middleware/auth';
import settingsRoutes from './settings';
import { Permission } from '../lib/permissions';
import { getSettings } from '../lib/settings';
import searchRoutes from './search';
import discoverRoutes from './discover';
import requestRoutes from './request';
import movieRoutes from './movie';
import tvRoutes from './tv';
import mediaRoutes from './media';
import personRoutes from './person';
import collectionRoutes from './collection';
import { getAppVersion, getCommitTag } from '../utils/appVersion';
import serviceRoutes from './service';
import { appDataStatus, appDataPath } from '../utils/appDataVolume';
import TheMovieDb from '../api/themoviedb';

const router = Router();

router.use(checkUser);

router.get('/status', (req, res) => {
  return res.status(200).json({
    version: getAppVersion(),
    commitTag: getCommitTag(),
  });
});

router.get('/status/appdata', (_req, res) => {
  return res.status(200).json({
    appData: appDataStatus(),
    appDataPath: appDataPath(),
  });
});

router.use('/user', isAuthenticated(), user);
router.get('/settings/public', (_req, res) => {
  const settings = getSettings();

  return res.status(200).json(settings.fullPublicSettings);
});
router.use(
  '/settings',
  isAuthenticated(Permission.MANAGE_SETTINGS),
  settingsRoutes
);
router.use('/search', isAuthenticated(), searchRoutes);
router.use('/discover', isAuthenticated(), discoverRoutes);
router.use('/request', isAuthenticated(), requestRoutes);
router.use('/movie', isAuthenticated(), movieRoutes);
router.use('/tv', isAuthenticated(), tvRoutes);
router.use('/media', isAuthenticated(), mediaRoutes);
router.use('/person', isAuthenticated(), personRoutes);
router.use('/collection', isAuthenticated(), collectionRoutes);
router.use('/service', isAuthenticated(), serviceRoutes);
router.use('/auth', authRoutes);

router.get('/regions', isAuthenticated(), async (req, res) => {
  const tmdb = new TheMovieDb();

  const regions = await tmdb.getRegions();

  return res.status(200).json(regions);
});

router.get('/languages', isAuthenticated(), async (req, res) => {
  const tmdb = new TheMovieDb();

  const languages = await tmdb.getLanguages();

  return res.status(200).json(languages);
});

router.get('/', (_req, res) => {
  return res.status(200).json({
    api: 'Overseerr API',
    version: '1.0',
  });
});

export default router;
