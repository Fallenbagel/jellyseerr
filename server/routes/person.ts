import TheMovieDb from '@server/api/themoviedb';
import Media from '@server/entity/Media';
import logger from '@server/logger';
import {
  mapCastCredits,
  mapCrewCredits,
  mapPersonDetails,
} from '@server/models/Person';
import MusicBrainz from '@server/api/musicbrainz';
import CoverArtArchive from '@server/api/coverartarchive';
import { Router } from 'express';

const personRoutes = Router();

personRoutes.get('/:id', async (req, res, next) => {
  const tmdb = new TheMovieDb();
  const musicBrainz = new MusicBrainz();

  try {
    const person = await tmdb.getPerson({
      personId: Number(req.params.id),
      language: (req.query.language as string) ?? req.locale,
    });

    let mbArtistId = null;
    try {
      const artists = await musicBrainz.searchArtist({
        query: person.name,
      });

      const matchedArtist = artists.find((artist) => {
        const nameMatches = artist.artistname.toLowerCase() === person.name.toLowerCase();
        const aliasMatches = artist.artistaliases?.some(
          alias => alias.toLowerCase() === person.name.toLowerCase()
        );
        return nameMatches || aliasMatches;
      });

      if (matchedArtist) {
        mbArtistId = matchedArtist.id;
      }
    } catch (e) {
      logger.debug('Failed to fetch music artist data', {
        label: 'API',
        errorMessage: e.message,
        personName: person.name
      });
    }

    return res.status(200).json({
      ...mapPersonDetails(person),
      mbArtistId
    });

  } catch (e) {
    logger.debug('Something went wrong retrieving person', {
      label: 'API',
      errorMessage: e.message,
      personId: req.params.id,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve person.',
    });
  }
});

personRoutes.get('/:id/discography', async (req, res, next) => {
  const musicBrainz = new MusicBrainz();
  const coverArtArchive = new CoverArtArchive();
  const artistId = req.query.artistId as string;
  const type = req.query.type as string;
  const page = Number(req.query.page) || 1;
  const pageSize = 20;

  if (!artistId) {
    return next({
      status: 400,
      message: 'Artist ID is required'
    });
  }

  try {
    const artistDetails = await musicBrainz.getArtist({
      artistId: artistId,
    });

    const { mapArtistDetails } = await import('@server/models/Artist');
    const mappedDetails = await mapArtistDetails(artistDetails);

    if (!mappedDetails.Albums?.length) {
      return res.status(200).json({
        page: 1,
        pageInfo: {
          total: 0,
          totalPages: 0,
        },
        results: []
      });
    }

    let filteredAlbums = mappedDetails.Albums;
    if (type) {
      if (type === 'Other') {
        filteredAlbums = mappedDetails.Albums.filter(
          album => !['Album', 'Single', 'EP'].includes(album.type)
        );
      } else {
        filteredAlbums = mappedDetails.Albums.filter(
          album => album.type === type
        );
      }
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const totalResults = filteredAlbums.length;
    const totalPages = Math.ceil(totalResults / pageSize);
    const paginatedAlbums = filteredAlbums.slice(start, end);

    const albumPromises = paginatedAlbums.map(async (album) => {
      try {
        const albumDetails = await musicBrainz.getAlbum({
          albumId: album.id,
        });

        let images = albumDetails.images;

        if (!images || images.length === 0) {
          try {
            const coverArtData = await coverArtArchive.getCoverArt(album.id);
            if (coverArtData.images?.length > 0) {
              images = coverArtData.images.map(img => ({
                CoverType: img.front ? 'Cover' : 'Poster',
                Url: img.image
              }));
            }
          } catch (coverArtError) {
            // Silently handle cover art fetch errors
          }
        }

        return {
          ...album,
          images: images || [],
          releasedate: albumDetails.releasedate || ''
        };
      } catch (e) {
        return album;
      }
    });

    const albumsWithDetails = await Promise.all(albumPromises);

    const media = await Media.getRelatedMedia(
      req.user,
      albumsWithDetails.map(album => album.id)
    );

    const results = albumsWithDetails.map(album => ({
      ...album,
      mediaInfo: media?.find(med => med.mbId === album.id)
    }));

    return res.status(200).json({
      page,
      pageInfo: {
        total: totalResults,
        totalPages
      },
      results
    });

  } catch (e) {
    logger.error('Something went wrong retrieving discography', {
      label: 'Person API',
      errorMessage: e.message,
      personId: req.params.id,
      artistId
    });
    return next({
      status: 500,
      message: 'Unable to retrieve discography.'
    });
  }
});

personRoutes.get('/:id/combined_credits', async (req, res, next) => {
  const tmdb = new TheMovieDb();

  try {
    const combinedCredits = await tmdb.getPersonCombinedCredits({
      personId: Number(req.params.id),
      language: (req.query.language as string) ?? req.locale,
    });

    const castMedia = await Media.getRelatedMedia(
      req.user,
      combinedCredits.cast.map((result) => result.id)
    );

    const crewMedia = await Media.getRelatedMedia(
      req.user,
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
  } catch (e) {
    logger.debug('Something went wrong retrieving combined credits', {
      label: 'API',
      errorMessage: e.message,
      personId: req.params.id,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve combined credits.',
    });
  }
});

export default personRoutes;
