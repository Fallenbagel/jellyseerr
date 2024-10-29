import Tvdb from '@server/api/indexer/tvdb';
import { getSettings } from '@server/lib/settings';
import logger from '@server/logger';
import { Router } from 'express';

const tvdbRoutes = Router();

export interface TvdbSettings {
  tvdb: boolean;
}

tvdbRoutes.get('/', (_req, res) => {
  const settings = getSettings();

  res.status(200).json({
    tvdb: settings.tvdb,
  });
});

tvdbRoutes.put('/', (req, res) => {
  const settings = getSettings();

  const body = req.body as TvdbSettings;

  settings.tvdb = body.tvdb ?? settings.tvdb ?? false;
  settings.save();

  return res.status(200).json({
    tvdb: settings.tvdb,
  });
});

tvdbRoutes.post('/test', async (req, res, next) => {
  try {
    const tvdb = new Tvdb();
    await tvdb.test();
    return res.status(200).json({ message: 'Successfully connected to Tvdb' });
  } catch (e) {
    logger.error('Failed to test Tvdb', {
      label: 'Tvdb',
      message: e.message,
    });

    return next({ status: 500, message: 'Failed to connect to Tvdb' });
  }
});

export default tvdbRoutes;