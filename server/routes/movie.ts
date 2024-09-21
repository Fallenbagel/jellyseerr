import JellyfinAPI from '@server/api/jellyfin';
import IMDBRadarrProxy from '@server/api/rating/imdbRadarrProxy';
import RottenTomatoes from '@server/api/rating/rottentomatoes';
import { type RatingResponse } from '@server/api/ratings';
import TheMovieDb from '@server/api/themoviedb';
import { MediaType } from '@server/constants/media';
import { getRepository } from '@server/datasource';
import Media from '@server/entity/Media';
import { User } from '@server/entity/User';
import { Watchlist } from '@server/entity/Watchlist';
import { getSettings } from '@server/lib/settings';
import logger from '@server/logger';
import { mapMovieDetails } from '@server/models/Movie';
import { mapMovieResult } from '@server/models/Search';
import { getHostname } from '@server/utils/getHostname';
import { Router } from 'express';

const movieRoutes = Router();

movieRoutes.get('/:id', async (req, res, next) => {
  const tmdb = new TheMovieDb();

  try {
    const tmdbMovie = await tmdb.getMovie({
      movieId: Number(req.params.id),
      language: (req.query.language as string) ?? req.locale,
    });

    const media = await Media.getMedia(tmdbMovie.id, MediaType.MOVIE);

    const onUserWatchlist = await getRepository(Watchlist).exist({
      where: {
        tmdbId: Number(req.params.id),
        requestedBy: {
          id: req.user?.id,
        },
      },
    });

    const data = mapMovieDetails(tmdbMovie, media, onUserWatchlist);

    // TMDB issue where it doesnt fallback to English when no overview is available in requested locale.
    if (!data.overview) {
      const tvEnglish = await tmdb.getMovie({ movieId: Number(req.params.id) });
      data.overview = tvEnglish.overview;
    }

    return res.status(200).json(data);
  } catch (e) {
    logger.debug('Something went wrong retrieving movie', {
      label: 'API',
      errorMessage: e.message,
      movieId: req.params.id,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve movie.',
    });
  }
});

movieRoutes.get('/:id/recommendations', async (req, res, next) => {
  const tmdb = new TheMovieDb();

  try {
    const results = await tmdb.getMovieRecommendations({
      movieId: Number(req.params.id),
      page: Number(req.query.page),
      language: (req.query.language as string) ?? req.locale,
    });

    const media = await Media.getRelatedMedia(
      req.user,
      results.results.map((result) => result.id)
    );

    return res.status(200).json({
      page: results.page,
      totalPages: results.total_pages,
      totalResults: results.total_results,
      results: results.results.map((result) =>
        mapMovieResult(
          result,
          media.find(
            (req) =>
              req.tmdbId === result.id && req.mediaType === MediaType.MOVIE
          )
        )
      ),
    });
  } catch (e) {
    logger.debug('Something went wrong retrieving movie recommendations', {
      label: 'API',
      errorMessage: e.message,
      movieId: req.params.id,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve movie recommendations.',
    });
  }
});

movieRoutes.get('/:id/similar', async (req, res, next) => {
  const tmdb = new TheMovieDb();

  try {
    const results = await tmdb.getMovieSimilar({
      movieId: Number(req.params.id),
      page: Number(req.query.page),
      language: (req.query.language as string) ?? req.locale,
    });

    const media = await Media.getRelatedMedia(
      req.user,
      results.results.map((result) => result.id)
    );

    return res.status(200).json({
      page: results.page,
      totalPages: results.total_pages,
      totalResults: results.total_results,
      results: results.results.map((result) =>
        mapMovieResult(
          result,
          media.find(
            (req) =>
              req.tmdbId === result.id && req.mediaType === MediaType.MOVIE
          )
        )
      ),
    });
  } catch (e) {
    logger.debug('Something went wrong retrieving similar movies', {
      label: 'API',
      errorMessage: e.message,
      movieId: req.params.id,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve similar movies.',
    });
  }
});

/**
 * Endpoint backed by RottenTomatoes
 */
movieRoutes.get('/:id/ratings', async (req, res, next) => {
  const tmdb = new TheMovieDb();
  const rtapi = new RottenTomatoes();

  try {
    const movie = await tmdb.getMovie({
      movieId: Number(req.params.id),
    });

    const rtratings = await rtapi.getMovieRatings(
      movie.title,
      Number(movie.release_date.slice(0, 4))
    );

    if (!rtratings) {
      return next({
        status: 404,
        message: 'Rotten Tomatoes ratings not found.',
      });
    }

    return res.status(200).json(rtratings);
  } catch (e) {
    logger.debug('Something went wrong retrieving movie ratings', {
      label: 'API',
      errorMessage: e.message,
      movieId: req.params.id,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve movie ratings.',
    });
  }
});

movieRoutes.get('/:id/play/:deviceName', async (req, res, next) => {
  const id = req.params.id;
  const deviceName = req.params.deviceName;
  const settings = getSettings();

  if (!deviceName || !id) {
    return res.status(400).json({ error: 'Device and media URL are required' });
  }

  try {
    const userRepository = getRepository(User);
    const admin = await userRepository.findOneOrFail({
      select: ['id', 'jellyfinDeviceId', 'jellyfinUserId'],
      where: { id: 1 },
      order: { id: 'ASC' },
    });
    const jellyfinClient = new JellyfinAPI(
      getHostname(),
      settings.jellyfin.apiKey,
      admin.jellyfinDeviceId ?? ''
    );

    const media = await Media.getMedia(Number(id), MediaType.MOVIE);

    if (media && media.jellyfinMediaId4k) {
      const result = await jellyfinClient.playOnDevice(
        deviceName,
        media.jellyfinMediaId4k
      );
      return res
        .status(200)
        .json({ message: 'Media playback initiated', result });
    } else if (media && media.jellyfinMediaId) {
      const result = await jellyfinClient.playOnDevice(
        deviceName,
        media.jellyfinMediaId
      );
      return res
        .status(200)
        .json({ message: 'Media playback initiated', result });
    } else {
      return next({
        status: 500,
        message: 'Failed to find requested media item',
      });
    }
  } catch (error) {
    logger.error(`Failed to play media: ${error.message}`, {
      label: 'Movies API',
    });
    return next({
      status: 500,
      message: error.message,
    });
  }
});

/**
 * Endpoint combining RottenTomatoes and IMDB
 */
movieRoutes.get('/:id/ratingscombined', async (req, res, next) => {
  const tmdb = new TheMovieDb();
  const rtapi = new RottenTomatoes();
  const imdbApi = new IMDBRadarrProxy();

  try {
    const movie = await tmdb.getMovie({
      movieId: Number(req.params.id),
    });

    const rtratings = await rtapi.getMovieRatings(
      movie.title,
      Number(movie.release_date.slice(0, 4))
    );

    let imdbRatings;
    if (movie.imdb_id) {
      imdbRatings = await imdbApi.getMovieRatings(movie.imdb_id);
    }

    if (!rtratings && !imdbRatings) {
      return next({
        status: 404,
        message: 'No ratings found.',
      });
    }

    const ratings: RatingResponse = {
      ...(rtratings ? { rt: rtratings } : {}),
      ...(imdbRatings ? { imdb: imdbRatings } : {}),
    };

    return res.status(200).json(ratings);
  } catch (e) {
    logger.debug('Something went wrong retrieving movie ratings', {
      label: 'API',
      errorMessage: e.message,
      movieId: req.params.id,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve movie ratings.',
    });
  }
});

export default movieRoutes;
