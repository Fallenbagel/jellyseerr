import { Router } from 'express';
import TheMovieDb from '../api/themoviedb';
import Media from '../entity/Media';
import logger from '../logger';
import {
  mapCastCredits,
  mapCrewCredits,
  mapPersonDetails,
} from '../models/Person';

const personRoutes = Router();

personRoutes.get('/:id', async (req, res, next) => {
  const tmdb = new TheMovieDb();

  try {
    const person = await tmdb.getPerson({
      personId: Number(req.params.id),
      language: req.query.language as string,
    });
    return res.status(200).json(mapPersonDetails(person));
  } catch (e) {
    logger.error(e.message);
    next({ status: 404, message: 'Person not found' });
  }
});

personRoutes.get('/:id/combined_credits', async (req, res) => {
  const tmdb = new TheMovieDb();

  const combinedCredits = await tmdb.getPersonCombinedCredits({
    personId: Number(req.params.id),
    language: req.query.language as string,
  });

  const castMedia = await Media.getRelatedMedia(
    combinedCredits.cast.map((result) => result.id)
  );

  const crewMedia = await Media.getRelatedMedia(
    combinedCredits.crew.map((result) => result.id)
  );

  return res.status(200).json({
    cast: combinedCredits.cast
      .map((result) =>
        mapCastCredits(
          result,
          castMedia.find(
            (med) =>
              med.tmdbId === result.id && med.mediaType === result.media_type
          )
        )
      )
      .filter((item) => !item.adult),
    crew: combinedCredits.crew
      .map((result) =>
        mapCrewCredits(
          result,
          crewMedia.find(
            (med) =>
              med.tmdbId === result.id && med.mediaType === result.media_type
          )
        )
      )
      .filter((item) => !item.adult),
    id: combinedCredits.id,
  });
});

export default personRoutes;
