import { Router } from 'express';
import TheMovieDb from '../api/themoviedb';
import { mapMovieDetails } from '../models/Movie';
import { mapMovieResult } from '../models/Search';
import Media from '../entity/Media';
import RottenTomatoes from '../api/rottentomatoes';
import logger from '../logger';
import { MediaType } from '../constants/media';

const movieRoutes = Router();

movieRoutes.get('/:id', async (req, res, next) => {
  const tmdb = new TheMovieDb();

  try {
    const tmdbMovie = await tmdb.getMovie({
      movieId: Number(req.params.id),
      language: req.query.language as string,
    });

    const media = await Media.getMedia(tmdbMovie.id, MediaType.MOVIE);

    return res.status(200).json(mapMovieDetails(tmdbMovie, media));
  } catch (e) {
    logger.error('Something went wrong getting movie', {
      label: 'Movie',
      message: e.message,
    });
    return next({ status: 404, message: 'Movie does not exist' });
  }
});

movieRoutes.get('/:id/recommendations', async (req, res) => {
  const tmdb = new TheMovieDb();

  const results = await tmdb.getMovieRecommendations({
    movieId: Number(req.params.id),
    page: Number(req.query.page),
    language: req.query.language as string,
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
          (req) => req.tmdbId === result.id && req.mediaType === MediaType.MOVIE
        )
      )
    ),
  });
});

movieRoutes.get('/:id/similar', async (req, res) => {
  const tmdb = new TheMovieDb();

  const results = await tmdb.getMovieSimilar({
    movieId: Number(req.params.id),
    page: Number(req.query.page),
    language: req.query.language as string,
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
          (req) => req.tmdbId === result.id && req.mediaType === MediaType.MOVIE
        )
      )
    ),
  });
});

movieRoutes.get('/:id/ratings', async (req, res, next) => {
  try {
    const tmdb = new TheMovieDb();
    const rtapi = new RottenTomatoes();

    const movie = await tmdb.getMovie({
      movieId: Number(req.params.id),
    });

    const rtratings = await rtapi.getMovieRatings(
      movie.title,
      Number(movie.release_date.slice(0, 4))
    );

    if (!rtratings) {
      return next({ status: 404, message: 'Unable to retrieve ratings' });
    }

    return res.status(200).json(rtratings);
  } catch (e) {
    return next({ status: 404, message: 'Movie does not exist' });
  }
});

export default movieRoutes;
