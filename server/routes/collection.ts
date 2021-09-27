import { Router } from 'express';
import TheMovieDb from '../api/themoviedb';
import Media from '../entity/Media';
import { mapCollection } from '../models/Collection';

const collectionRoutes = Router();

collectionRoutes.get<{ id: string }>('/:id', async (req, res, next) => {
  const tmdb = new TheMovieDb();

  try {
    const collection = await tmdb.getCollection({
      collectionId: Number(req.params.id),
      language: req.locale ?? (req.query.language as string),
    });

    const media = await Media.getRelatedMedia(
      collection.parts.map((part) => part.id)
    );

    return res.status(200).json(mapCollection(collection, media));
  } catch (e) {
    return next({ status: 404, message: 'Collection does not exist' });
  }
});

export default collectionRoutes;
