import { Blacklist } from '@server/entity/Blacklist';
import { blacklistAdd } from '@server/interfaces/api/blacklistAdd';
import logger from '@server/logger';
import { Router } from 'express';
import { QueryFailedError } from 'typeorm';

const blacklistRoutes = Router();

blacklistRoutes.post('/', async (req, res, next) => {
  try {
    if (!req.user) {
      return next({
        status: 401,
        message: 'You must be logged in to blacklist an item.',
      });
    }

    const values = blacklistAdd.parse(req.body);

    await Blacklist.addToBlacklist({
      blacklistRequest: values,
    });

    return res.status(201).send();
  } catch (error) {
    if (!(error instanceof Error)) {
      return;
    }

    if (error instanceof QueryFailedError) {
      switch (error.driverError.errno) {
        case 19:
          return next({ status: 412, message: 'Item already blacklisted' });
        default:
          logger.warn('Something wrong with data blacklist', {
            tmdbId: req.body.tmdbId,
            mediaType: req.body.mediaType,
            label: 'Blacklist',
          });
          return next({ status: 409, message: 'Something wrong' });
      }
    }

    return next({ status: 500, message: error.message });
  }
});

export default blacklistRoutes;
