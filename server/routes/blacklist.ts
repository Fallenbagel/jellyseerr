import { getRepository } from '@server/datasource';
import { Blacklist } from '@server/entity/Blacklist';
import Media from '@server/entity/Media';
import { NotFoundError } from '@server/entity/Watchlist';
import { blacklistAdd } from '@server/interfaces/api/blacklistAdd';
import { Permission } from '@server/lib/permissions';
import logger from '@server/logger';
import { isAuthenticated } from '@server/middleware/auth';
import { Router } from 'express';
import { QueryFailedError } from 'typeorm';

const blacklistRoutes = Router();

blacklistRoutes.post(
  '/',
  isAuthenticated([Permission.MANAGE_BLACKLIST, Permission.MEDIA_BLACKLIST], {
    type: 'or',
  }),
  async (req, res, next) => {
    try {
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
  }
);

blacklistRoutes.delete(
  '/:id',
  isAuthenticated([Permission.MANAGE_BLACKLIST, Permission.MEDIA_BLACKLIST], {
    type: 'or',
  }),
  async (req, res, next) => {
    try {
      const blacklisteRepository = getRepository(Blacklist);

      const blacklistItem = await blacklisteRepository.findOneOrFail({
        where: { tmdbId: Number(req.params.id) },
      });

      await blacklisteRepository.remove(blacklistItem);

      const mediaRepository = getRepository(Media);

      const mediaItem = await mediaRepository.findOneOrFail({
        where: { tmdbId: Number(req.params.id) },
      });

      await mediaRepository.remove(mediaItem);

      return res.status(204).send();
    } catch (e) {
      if (e instanceof NotFoundError) {
        return next({
          status: 401,
          message: e.message,
        });
      }
      return next({ status: 500, message: e.message });
    }
  }
);

export default blacklistRoutes;
