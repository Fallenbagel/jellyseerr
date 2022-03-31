import { sortBy } from 'lodash';
import cacheManager from '../../lib/cache';
import ExternalAPI from '../externalapi';
import {
  TmdbCollection,
  TmdbExternalIdResponse,
  TmdbLanguage,
  TmdbMovieDetails,
  TmdbPersonCombinedCredits,
  TmdbPersonDetail,
  TmdbRegion,
  TmdbSearchMovieResponse,
  TmdbSearchMultiResponse,
  TmdbSearchTvResponse,
  TmdbSeasonWithEpisodes,
  TmdbTvDetails,
  TmdbUpcomingMoviesResponse,
} from './interfaces';

interface SearchOptions {
  query: string;
  page?: number;
  includeAdult?: boolean;
  language?: string;
}

interface DiscoverMovieOptions {
  page?: number;
  includeAdult?: boolean;
  language?: string;
  primaryReleaseDateGte?: string;
  primaryReleaseDateLte?: string;
  sortBy?:
    | 'popularity.asc'
    | 'popularity.desc'
    | 'release_date.asc'
    | 'release_date.desc'
    | 'revenue.asc'
    | 'revenue.desc'
    | 'primary_release_date.asc'
    | 'primary_release_date.desc'
    | 'original_title.asc'
    | 'original_title.desc'
    | 'vote_average.asc'
    | 'vote_average.desc'
    | 'vote_count.asc'
    | 'vote_count.desc';
}

interface DiscoverTvOptions {
  page?: number;
  language?: string;
  firstAirDateGte?: string;
  firstAirDateLte?: string;
  includeEmptyReleaseDate?: boolean;
  sortBy?:
    | 'popularity.asc'
    | 'popularity.desc'
    | 'vote_average.asc'
    | 'vote_average.desc'
    | 'vote_count.asc'
    | 'vote_count.desc'
    | 'first_air_date.asc'
    | 'first_air_date.desc';
}

class TheMovieDb extends ExternalAPI {
  private region?: string;
  private originalLanguage?: string;
  constructor({
    region,
    originalLanguage,
  }: { region?: string; originalLanguage?: string } = {}) {
    super(
      'https://api.themoviedb.org/3',
      {
        api_key: 'db55323b8d3e4154498498a75642b381',
      },
      {
        nodeCache: cacheManager.getCache('tmdb').data,
      }
    );
    this.region = region;
    this.originalLanguage = originalLanguage;
  }

  public searchMulti = async ({
    query,
    page = 1,
    includeAdult = false,
    language = 'en',
  }: SearchOptions): Promise<TmdbSearchMultiResponse> => {
    try {
      const data = await this.get<TmdbSearchMultiResponse>('/search/multi', {
        params: { query, page, include_adult: includeAdult, language },
      });

      return data;
    } catch (e) {
      return {
        page: 1,
        results: [],
        total_pages: 1,
        total_results: 0,
      };
    }
  };

  public getPerson = async ({
    personId,
    language = 'en',
  }: {
    personId: number;
    language?: string;
  }): Promise<TmdbPersonDetail> => {
    try {
      const data = await this.get<TmdbPersonDetail>(`/person/${personId}`, {
        params: { language },
      });

      return data;
    } catch (e) {
      throw new Error(`[TMDB] Failed to fetch person details: ${e.message}`);
    }
  };

  public getPersonCombinedCredits = async ({
    personId,
    language = 'en',
  }: {
    personId: number;
    language?: string;
  }): Promise<TmdbPersonCombinedCredits> => {
    try {
      const data = await this.get<TmdbPersonCombinedCredits>(
        `/person/${personId}/combined_credits`,
        {
          params: { language },
        }
      );

      return data;
    } catch (e) {
      throw new Error(
        `[TMDB] Failed to fetch person combined credits: ${e.message}`
      );
    }
  };

  public getMovie = async ({
    movieId,
    language = 'en',
  }: {
    movieId: number;
    language?: string;
  }): Promise<TmdbMovieDetails> => {
    try {
      const data = await this.get<TmdbMovieDetails>(
        `/movie/${movieId}`,
        {
          params: {
            language,
            append_to_response: 'credits,external_ids,videos,release_dates',
          },
        },
        43200
      );

      return data;
    } catch (e) {
      throw new Error(`[TMDB] Failed to fetch movie details: ${e.message}`);
    }
  };

  public getTvShow = async ({
    tvId,
    language = 'en',
  }: {
    tvId: number;
    language?: string;
  }): Promise<TmdbTvDetails> => {
    try {
      const data = await this.get<TmdbTvDetails>(
        `/tv/${tvId}`,
        {
          params: {
            language,
            append_to_response:
              'aggregate_credits,credits,external_ids,keywords,videos,content_ratings',
          },
        },
        43200
      );

      return data;
    } catch (e) {
      throw new Error(`[TMDB] Failed to fetch tv show details: ${e.message}`);
    }
  };

  public getTvSeason = async ({
    tvId,
    seasonNumber,
    language,
  }: {
    tvId: number;
    seasonNumber: number;
    language?: string;
  }): Promise<TmdbSeasonWithEpisodes> => {
    try {
      const data = await this.get<TmdbSeasonWithEpisodes>(
        `/tv/${tvId}/season/${seasonNumber}`,
        {
          params: {
            language,
            append_to_response: 'external_ids',
          },
        }
      );

      return data;
    } catch (e) {
      throw new Error(`[TMDB] Failed to fetch tv show details: ${e.message}`);
    }
  };

  public async getMovieRecommendations({
    movieId,
    page = 1,
    language = 'en',
  }: {
    movieId: number;
    page?: number;
    language?: string;
  }): Promise<TmdbSearchMovieResponse> {
    try {
      const data = await this.get<TmdbSearchMovieResponse>(
        `/movie/${movieId}/recommendations`,
        {
          params: {
            page,
            language,
          },
        }
      );

      return data;
    } catch (e) {
      throw new Error(`[TMDB] Failed to fetch discover movies: ${e.message}`);
    }
  }

  public async getMovieSimilar({
    movieId,
    page = 1,
    language = 'en',
  }: {
    movieId: number;
    page?: number;
    language?: string;
  }): Promise<TmdbSearchMovieResponse> {
    try {
      const data = await this.get<TmdbSearchMovieResponse>(
        `/movie/${movieId}/similar`,
        {
          params: {
            page,
            language,
          },
        }
      );

      return data;
    } catch (e) {
      throw new Error(`[TMDB] Failed to fetch discover movies: ${e.message}`);
    }
  }

  public async getMoviesByKeyword({
    keywordId,
    page = 1,
    language = 'en',
  }: {
    keywordId: number;
    page?: number;
    language?: string;
  }): Promise<TmdbSearchMovieResponse> {
    try {
      const data = await this.get<TmdbSearchMovieResponse>(
        `/keyword/${keywordId}/movies`,
        {
          params: {
            page,
            language,
          },
        }
      );

      return data;
    } catch (e) {
      throw new Error(`[TMDB] Failed to fetch movies by keyword: ${e.message}`);
    }
  }

  public async getTvRecommendations({
    tvId,
    page = 1,
    language = 'en',
  }: {
    tvId: number;
    page?: number;
    language?: string;
  }): Promise<TmdbSearchTvResponse> {
    try {
      const data = await this.get<TmdbSearchTvResponse>(
        `/tv/${tvId}/recommendations`,
        {
          params: {
            page,
            language,
          },
        }
      );

      return data;
    } catch (e) {
      throw new Error(
        `[TMDB] Failed to fetch tv recommendations: ${e.message}`
      );
    }
  }

  public async getTvSimilar({
    tvId,
    page = 1,
    language = 'en',
  }: {
    tvId: number;
    page?: number;
    language?: string;
  }): Promise<TmdbSearchTvResponse> {
    try {
      const data = await this.get<TmdbSearchTvResponse>(`/tv/${tvId}/similar`, {
        params: {
          page,
          language,
        },
      });

      return data;
    } catch (e) {
      throw new Error(`[TMDB] Failed to fetch tv similar: ${e.message}`);
    }
  }

  public getDiscoverMovies = async ({
    sortBy = 'popularity.desc',
    page = 1,
    includeAdult = false,
    language = 'en',
    primaryReleaseDateGte,
    primaryReleaseDateLte,
  }: DiscoverMovieOptions = {}): Promise<TmdbSearchMovieResponse> => {
    try {
      const data = await this.get<TmdbSearchMovieResponse>('/discover/movie', {
        params: {
          sort_by: sortBy,
          page,
          include_adult: includeAdult,
          language,
          with_release_type: '3|2',
          region: this.region,
          with_original_language: this.originalLanguage,
          'primary_release_date.gte': primaryReleaseDateGte,
          'primary_release_date.lte': primaryReleaseDateLte,
        },
      });

      return data;
    } catch (e) {
      throw new Error(`[TMDB] Failed to fetch discover movies: ${e.message}`);
    }
  };

  public getDiscoverTv = async ({
    sortBy = 'popularity.desc',
    page = 1,
    language = 'en-US',
    firstAirDateGte,
    firstAirDateLte,
    includeEmptyReleaseDate = false,
  }: DiscoverTvOptions = {}): Promise<TmdbSearchTvResponse> => {
    try {
      const data = await this.get<TmdbSearchTvResponse>('/discover/tv', {
        params: {
          sort_by: sortBy,
          page,
          language,
          region: this.region,
          'first_air_date.gte': firstAirDateGte,
          'first_air_date.lte': firstAirDateLte,
          with_original_language: this.originalLanguage,
          include_null_first_air_dates: includeEmptyReleaseDate,
        },
      });

      return data;
    } catch (e) {
      throw new Error(`[TMDB] Failed to fetch discover tv: ${e.message}`);
    }
  };

  public getUpcomingMovies = async ({
    page = 1,
    language = 'en',
  }: {
    page: number;
    language: string;
  }): Promise<TmdbUpcomingMoviesResponse> => {
    try {
      const data = await this.get<TmdbUpcomingMoviesResponse>(
        '/movie/upcoming',
        {
          params: {
            page,
            language,
            region: this.region,
            originalLanguage: this.originalLanguage,
          },
        }
      );

      return data;
    } catch (e) {
      throw new Error(`[TMDB] Failed to fetch upcoming movies: ${e.message}`);
    }
  };

  public getAllTrending = async ({
    page = 1,
    timeWindow = 'day',
    language = 'en',
  }: {
    page?: number;
    timeWindow?: 'day' | 'week';
    language?: string;
  } = {}): Promise<TmdbSearchMultiResponse> => {
    try {
      const data = await this.get<TmdbSearchMultiResponse>(
        `/trending/all/${timeWindow}`,
        {
          params: {
            page,
            language,
            region: this.region,
          },
        }
      );

      return data;
    } catch (e) {
      throw new Error(`[TMDB] Failed to fetch all trending: ${e.message}`);
    }
  };

  public getMovieTrending = async ({
    page = 1,
    timeWindow = 'day',
  }: {
    page?: number;
    timeWindow?: 'day' | 'week';
  } = {}): Promise<TmdbSearchMovieResponse> => {
    try {
      const data = await this.get<TmdbSearchMovieResponse>(
        `/trending/movie/${timeWindow}`,
        {
          params: {
            page,
          },
        }
      );

      return data;
    } catch (e) {
      throw new Error(`[TMDB] Failed to fetch all trending: ${e.message}`);
    }
  };

  public getTvTrending = async ({
    page = 1,
    timeWindow = 'day',
  }: {
    page?: number;
    timeWindow?: 'day' | 'week';
  } = {}): Promise<TmdbSearchTvResponse> => {
    try {
      const data = await this.get<TmdbSearchTvResponse>(
        `/trending/tv/${timeWindow}`,
        {
          params: {
            page,
          },
        }
      );

      return data;
    } catch (e) {
      throw new Error(`[TMDB] Failed to fetch all trending: ${e.message}`);
    }
  };

  public async getByExternalId({
    externalId,
    type,
    language = 'en',
  }:
    | {
        externalId: string;
        type: 'imdb';
        language?: string;
      }
    | {
        externalId: number;
        type: 'tvdb';
        language?: string;
      }): Promise<TmdbExternalIdResponse> {
    try {
      const data = await this.get<TmdbExternalIdResponse>(
        `/find/${externalId}`,
        {
          params: {
            external_source: type === 'imdb' ? 'imdb_id' : 'tvdb_id',
            language,
          },
        }
      );

      return data;
    } catch (e) {
      throw new Error(`[TMDB] Failed to find by external ID: ${e.message}`);
    }
  }

  public async getMovieByImdbId({
    imdbId,
    language = 'en',
  }: {
    imdbId: string;
    language?: string;
  }): Promise<TmdbMovieDetails> {
    try {
      const extResponse = await this.getByExternalId({
        externalId: imdbId,
        type: 'imdb',
      });

      if (extResponse.movie_results[0]) {
        const movie = await this.getMovie({
          movieId: extResponse.movie_results[0].id,
          language,
        });

        return movie;
      }

      throw new Error(
        '[TMDB] Failed to find a title with the provided IMDB id'
      );
    } catch (e) {
      throw new Error(
        `[TMDB] Failed to get movie by external imdb ID: ${e.message}`
      );
    }
  }

  public async getShowByTvdbId({
    tvdbId,
    language = 'en',
  }: {
    tvdbId: number;
    language?: string;
  }): Promise<TmdbTvDetails> {
    try {
      const extResponse = await this.getByExternalId({
        externalId: tvdbId,
        type: 'tvdb',
      });

      if (extResponse.tv_results[0]) {
        const tvshow = await this.getTvShow({
          tvId: extResponse.tv_results[0].id,
          language,
        });

        return tvshow;
      }

      throw new Error(
        `[TMDB] Failed to find a TV show with the provided TVDB ID: ${tvdbId}`
      );
    } catch (e) {
      throw new Error(
        `[TMDB] Failed to get TV show using the external TVDB ID: ${e.message}`
      );
    }
  }

  public async getCollection({
    collectionId,
    language = 'en',
  }: {
    collectionId: number;
    language?: string;
  }): Promise<TmdbCollection> {
    try {
      const data = await this.get<TmdbCollection>(
        `/collection/${collectionId}`,
        {
          params: {
            language,
          },
        }
      );

      return data;
    } catch (e) {
      throw new Error(`[TMDB] Failed to fetch collection: ${e.message}`);
    }
  }

  public async getRegions(): Promise<TmdbRegion[]> {
    try {
      const data = await this.get<TmdbRegion[]>(
        '/configuration/countries',
        {},
        86400 // 24 hours
      );

      const regions = sortBy(data, 'english_name');

      return regions;
    } catch (e) {
      throw new Error(`[TMDB] Failed to fetch countries: ${e.message}`);
    }
  }

  public async getLanguages(): Promise<TmdbLanguage[]> {
    try {
      const data = await this.get<TmdbLanguage[]>(
        '/configuration/languages',
        {},
        86400 // 24 hours
      );

      const languages = sortBy(data, 'english_name');

      return languages;
    } catch (e) {
      throw new Error(`[TMDB] Failed to fetch langauges: ${e.message}`);
    }
  }
}

export default TheMovieDb;
