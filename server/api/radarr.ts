import cacheManager from '../lib/cache';
import { RadarrSettings } from '../lib/settings';
import logger from '../logger';
import ExternalAPI from './externalapi';

interface RadarrMovieOptions {
  title: string;
  qualityProfileId: number;
  minimumAvailability: string;
  profileId: number;
  year: number;
  rootFolderPath: string;
  tmdbId: number;
  monitored?: boolean;
  searchNow?: boolean;
}

export interface RadarrMovie {
  id: number;
  title: string;
  isAvailable: boolean;
  monitored: boolean;
  tmdbId: number;
  imdbId: string;
  titleSlug: string;
  folderName: string;
  path: string;
  profileId: number;
  qualityProfileId: number;
  added: string;
  downloaded: boolean;
  hasFile: boolean;
}

export interface RadarrRootFolder {
  id: number;
  path: string;
  freeSpace: number;
  totalSpace: number;
  unmappedFolders: {
    name: string;
    path: string;
  }[];
}

export interface RadarrProfile {
  id: number;
  name: string;
}

interface QueueItem {
  movieId: number;
  size: number;
  title: string;
  sizeleft: number;
  timeleft: string;
  estimatedCompletionTime: string;
  status: string;
  trackedDownloadStatus: string;
  trackedDownloadState: string;
  downloadId: string;
  protocol: string;
  downloadClient: string;
  indexer: string;
  id: number;
}

interface QueueResponse {
  page: number;
  pageSize: number;
  sortKey: string;
  sortDirection: string;
  totalRecords: number;
  records: QueueItem[];
}

class RadarrAPI extends ExternalAPI {
  static buildRadarrUrl(radarrSettings: RadarrSettings, path?: string): string {
    return `${radarrSettings.useSsl ? 'https' : 'http'}://${
      radarrSettings.hostname
    }:${radarrSettings.port}${radarrSettings.baseUrl ?? ''}${path}`;
  }

  constructor({ url, apiKey }: { url: string; apiKey: string }) {
    super(
      url,
      {
        apikey: apiKey,
      },
      {
        nodeCache: cacheManager.getCache('radarr').data,
      }
    );
  }

  public getMovies = async (): Promise<RadarrMovie[]> => {
    try {
      const response = await this.axios.get<RadarrMovie[]>('/movie');

      return response.data;
    } catch (e) {
      throw new Error(`[Radarr] Failed to retrieve movies: ${e.message}`);
    }
  };

  public getMovie = async ({ id }: { id: number }): Promise<RadarrMovie> => {
    try {
      const response = await this.axios.get<RadarrMovie>(`/movie/${id}`);

      return response.data;
    } catch (e) {
      throw new Error(`[Radarr] Failed to retrieve movie: ${e.message}`);
    }
  };

  public async getMovieByTmdbId(id: number): Promise<RadarrMovie> {
    try {
      const response = await this.axios.get<RadarrMovie[]>('/movie/lookup', {
        params: {
          term: `tmdb:${id}`,
        },
      });

      if (!response.data[0]) {
        throw new Error('Movie not found');
      }

      return response.data[0];
    } catch (e) {
      logger.error('Error retrieving movie by TMDb ID', {
        label: 'Radarr API',
        message: e.message,
      });
      throw new Error('Movie not found');
    }
  }

  public addMovie = async (
    options: RadarrMovieOptions
  ): Promise<RadarrMovie> => {
    try {
      const movie = await this.getMovieByTmdbId(options.tmdbId);

      if (movie.downloaded) {
        logger.info(
          'Title already exists and is available. Skipping add and returning success',
          {
            label: 'Radarr',
          }
        );
        return movie;
      }

      // movie exists in radarr but is neither downloaded nor monitored
      if (movie.id && !movie.monitored) {
        const response = await this.axios.put<RadarrMovie>(`/movie`, {
          ...movie,
          title: options.title,
          qualityProfileId: options.qualityProfileId,
          profileId: options.profileId,
          titleSlug: options.tmdbId.toString(),
          minimumAvailability: options.minimumAvailability,
          tmdbId: options.tmdbId,
          year: options.year,
          rootFolderPath: options.rootFolderPath,
          monitored: options.monitored,
          addOptions: {
            searchForMovie: options.searchNow,
          },
        });

        if (response.data.monitored) {
          logger.info(
            'Found existing title in Radarr and set it to monitored. Returning success',
            { label: 'Radarr' }
          );
          logger.debug('Radarr update details', {
            label: 'Radarr',
            movie: response.data,
          });
          return response.data;
        } else {
          logger.error('Failed to update existing movie in Radarr', {
            label: 'Radarr',
            options,
          });
          throw new Error('Failed to update existing movie in Radarr');
        }
      }

      if (movie.id) {
        logger.info(
          'Movie is already monitored in Radarr. Skipping add and returning success',
          { label: 'Radarr' }
        );
        return movie;
      }

      const response = await this.axios.post<RadarrMovie>(`/movie`, {
        title: options.title,
        qualityProfileId: options.qualityProfileId,
        profileId: options.profileId,
        titleSlug: options.tmdbId.toString(),
        minimumAvailability: options.minimumAvailability,
        tmdbId: options.tmdbId,
        year: options.year,
        rootFolderPath: options.rootFolderPath,
        monitored: options.monitored,
        addOptions: {
          searchForMovie: options.searchNow,
        },
      });

      if (response.data.id) {
        logger.info('Radarr accepted request', { label: 'Radarr' });
        logger.debug('Radarr add details', {
          label: 'Radarr',
          movie: response.data,
        });
      } else {
        logger.error('Failed to add movie to Radarr', {
          label: 'Radarr',
          options,
        });
        throw new Error('Failed to add movie to Radarr');
      }
      return response.data;
    } catch (e) {
      logger.error(
        'Failed to add movie to Radarr. This might happen if the movie already exists, in which case you can safely ignore this error.',
        {
          label: 'Radarr',
          errorMessage: e.message,
          options,
          response: e?.response?.data,
        }
      );
      throw new Error('Failed to add movie to Radarr');
    }
  };

  public getProfiles = async (): Promise<RadarrProfile[]> => {
    try {
      const data = await this.getRolling<RadarrProfile[]>(
        `/qualityProfile`,
        undefined,
        3600
      );

      return data;
    } catch (e) {
      throw new Error(`[Radarr] Failed to retrieve profiles: ${e.message}`);
    }
  };

  public getRootFolders = async (): Promise<RadarrRootFolder[]> => {
    try {
      const data = await this.getRolling<RadarrRootFolder[]>(
        `/rootfolder`,
        undefined,
        3600
      );

      return data;
    } catch (e) {
      throw new Error(`[Radarr] Failed to retrieve root folders: ${e.message}`);
    }
  };

  public getQueue = async (): Promise<QueueItem[]> => {
    try {
      const response = await this.axios.get<QueueResponse>(`/queue`);

      return response.data.records;
    } catch (e) {
      throw new Error(`[Radarr] Failed to retrieve queue: ${e.message}`);
    }
  };
}

export default RadarrAPI;
