import cacheManager from '@server/lib/cache';
import ExternalAPI from './externalapi';

interface RTSearchResult {
  meterClass: 'certified_fresh' | 'fresh' | 'rotten';
  meterScore: number;
  url: string;
}

interface RTTvSearchResult extends RTSearchResult {
  title: string;
  startYear: number;
  endYear: number;
}
interface RTMovieSearchResult extends RTSearchResult {
  name: string;
  url: string;
  year: number;
}

interface RTMultiSearchResponse {
  tvCount: number;
  tvSeries: RTTvSearchResult[];
  movieCount: number;
  movies: RTMovieSearchResult[];
}

export interface RTRating {
  title: string;
  year: number;
  criticsRating: 'Certified Fresh' | 'Fresh' | 'Rotten';
  criticsScore: number;
  audienceRating?: 'Upright' | 'Spilled';
  audienceScore?: number;
  url: string;
}

/**
 * This is a best-effort API. The Rotten Tomatoes API is technically
 * private and getting access costs money/requires approval.
 *
 * They do, however, have a "public" api that they use to request the
 * data on their own site. We use this to get ratings for movies/tv shows.
 *
 * Unfortunately, we need to do it by searching for the movie name, so it's
 * not always accurate.
 */
class RottenTomatoes extends ExternalAPI {
  constructor() {
    super(
      'https://www.rottentomatoes.com/api/private',
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        nodeCache: cacheManager.getCache('rt').data,
      }
    );
  }

  /**
   * Search the 1.0 api for the movie title
   *
   * We compare the release date to make sure its the correct
   * match. But it's not guaranteed to have results.
   *
   * We use the 1.0 API here because the 2.0 search api does
   * not return audience ratings.
   *
   * @param name Movie name
   * @param year Release Year
   */
  public async getMovieRatings(
    name: string,
    year: number
  ): Promise<RTRating | null> {
    try {
      const data = await this.get<RTMultiSearchResponse>('/v2.0/search/', {
        params: { q: name, limit: 10 },
      });

      // First, attempt to match exact name and year
      let movie = data.movies.find(
        (movie) => movie.year === year && movie.name === name
      );

      // If we don't find a movie, try to match partial name and year
      if (!movie) {
        movie = data.movies.find(
          (movie) => movie.year === year && movie.name.includes(name)
        );
      }

      // If we still dont find a movie, try to match just on year
      if (!movie) {
        movie = data.movies.find((movie) => movie.year === year);
      }

      // One last try, try exact name match only
      if (!movie) {
        movie = data.movies.find((movie) => movie.name === name);
      }

      if (!movie) {
        return null;
      }

      return {
        title: movie.name,
        url: `https://www.rottentomatoes.com${movie.url}`,
        criticsRating:
          movie.meterClass === 'certified_fresh'
            ? 'Certified Fresh'
            : movie.meterClass === 'fresh'
            ? 'Fresh'
            : 'Rotten',
        criticsScore: movie.meterScore,
        year: movie.year,
      };
    } catch (e) {
      throw new Error(
        `[RT API] Failed to retrieve movie ratings: ${e.message}`
      );
    }
  }

  public async getTVRatings(
    name: string,
    year?: number
  ): Promise<RTRating | null> {
    try {
      const data = await this.get<RTMultiSearchResponse>('/v2.0/search/', {
        params: { q: name, limit: 10 },
      });

      let tvshow: RTTvSearchResult | undefined = data.tvSeries[0];

      if (year) {
        tvshow = data.tvSeries.find((series) => series.startYear === year);
      }

      if (!tvshow) {
        return null;
      }

      return {
        title: tvshow.title,
        url: `https://www.rottentomatoes.com${tvshow.url}`,
        criticsRating: tvshow.meterClass === 'fresh' ? 'Fresh' : 'Rotten',
        criticsScore: tvshow.meterScore,
        year: tvshow.startYear,
      };
    } catch (e) {
      throw new Error(`[RT API] Failed to retrieve tv ratings: ${e.message}`);
    }
  }
}

export default RottenTomatoes;
