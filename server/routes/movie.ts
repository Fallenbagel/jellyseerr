import { Router } from 'express';
import RottenTomatoes from '../api/rottentomatoes';
import TheMovieDb from '../api/themoviedb';
import { MediaType } from '../constants/media';
import Media from '../entity/Media';
import logger from '../logger';
import { mapMovieDetails } from '../models/Movie';
import { mapMovieResult } from '../models/Search';

const movieRoutes = Router();

movieRoutes.get('/:id', async (req, res, next) => {
  const tmdb = new TheMovieDb();

  try {
    const tmdbMovie = await tmdb.getMovie({
      movieId: Number(req.params.id),
      language: req.locale ?? (req.query.language as string),
    });

    const media = await Media.getMedia(tmdbMovie.id, MediaType.MOVIE);

    return res.status(200).json(mapMovieDetails(tmdbMovie, media));
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
      language: req.locale ?? (req.query.language as string),
    });

    const media = await Media.getRelatedMedia(
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
      language: req.locale ?? (req.query.language as string),
    });

    const media = await Media.getRelatedMedia(
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

export default movieRoutes;
