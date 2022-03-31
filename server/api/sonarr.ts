import cacheManager from '../lib/cache';
import { SonarrSettings } from '../lib/settings';
import logger from '../logger';
import ExternalAPI from './externalapi';

interface SonarrSeason {
  seasonNumber: number;
  monitored: boolean;
  statistics?: {
    previousAiring?: string;
    episodeFileCount: number;
    episodeCount: number;
    totalEpisodeCount: number;
    sizeOnDisk: number;
    percentOfEpisodes: number;
  };
}

export interface SonarrSeries {
  title: string;
  sortTitle: string;
  seasonCount: number;
  status: string;
  overview: string;
  network: string;
  airTime: string;
  images: {
    coverType: string;
    url: string;
  }[];
  remotePoster: string;
  seasons: SonarrSeason[];
  year: number;
  path: string;
  profileId: number;
  languageProfileId: number;
  seasonFolder: boolean;
  monitored: boolean;
  useSceneNumbering: boolean;
  runtime: number;
  tvdbId: number;
  tvRageId: number;
  tvMazeId: number;
  firstAired: string;
  lastInfoSync?: string;
  seriesType: 'standard' | 'daily' | 'anime';
  cleanTitle: string;
  imdbId: string;
  titleSlug: string;
  certification: string;
  genres: string[];
  tags: string[];
  added: string;
  ratings: {
    votes: number;
    value: number;
  };
  qualityProfileId: number;
  id?: number;
  rootFolderPath?: string;
  addOptions?: {
    ignoreEpisodesWithFiles?: boolean;
    ignoreEpisodesWithoutFiles?: boolean;
    searchForMissingEpisodes?: boolean;
  };
}

interface QueueItem {
  seriesId: number;
  episodeId: number;
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

interface SonarrProfile {
  id: number;
  name: string;
}

interface SonarrRootFolder {
  id: number;
  path: string;
  freeSpace: number;
  totalSpace: number;
  unmappedFolders: {
    name: string;
    path: string;
  }[];
}

interface AddSeriesOptions {
  tvdbid: number;
  title: string;
  profileId: number;
  languageProfileId?: number;
  seasons: number[];
  seasonFolder: boolean;
  rootFolderPath: string;
  seriesType: SonarrSeries['seriesType'];
  monitored?: boolean;
  searchNow?: boolean;
}

export interface LanguageProfile {
  id: number;
  name: string;
}

class SonarrAPI extends ExternalAPI {
  static buildSonarrUrl(sonarrSettings: SonarrSettings, path?: string): string {
    return `${sonarrSettings.useSsl ? 'https' : 'http'}://${
      sonarrSettings.hostname
    }:${sonarrSettings.port}${sonarrSettings.baseUrl ?? ''}${path}`;
  }

  constructor({ url, apiKey }: { url: string; apiKey: string }) {
    super(
      url,
      {
        apikey: apiKey,
      },
      {
        nodeCache: cacheManager.getCache('sonarr').data,
      }
    );
  }

  public async getSeries(): Promise<SonarrSeries[]> {
    try {
      const response = await this.axios.get<SonarrSeries[]>('/series');

      return response.data;
    } catch (e) {
      throw new Error(`[Radarr] Failed to retrieve series: ${e.message}`);
    }
  }

  public async getSeriesByTitle(title: string): Promise<SonarrSeries[]> {
    try {
      const response = await this.axios.get<SonarrSeries[]>('/series/lookup', {
        params: {
          term: title,
        },
      });

      if (!response.data[0]) {
        throw new Error('No series found');
      }

      return response.data;
    } catch (e) {
      logger.error('Error retrieving series by series title', {
        label: 'Sonarr API',
        message: e.message,
      });
      throw new Error('No series found');
    }
  }

  public async getSeriesByTvdbId(id: number): Promise<SonarrSeries> {
    try {
      const response = await this.axios.get<SonarrSeries[]>('/series/lookup', {
        params: {
          term: `tvdb:${id}`,
        },
      });

      if (!response.data[0]) {
        throw new Error('Series not found');
      }

      return response.data[0];
    } catch (e) {
      logger.error('Error retrieving series by tvdb ID', {
        label: 'Sonarr API',
        message: e.message,
      });
      throw new Error('Series not found');
    }
  }

  public async addSeries(options: AddSeriesOptions): Promise<SonarrSeries> {
    try {
      const series = await this.getSeriesByTvdbId(options.tvdbid);

      // If the series already exists, we will simply just update it
      if (series.id) {
        series.seasons = this.buildSeasonList(options.seasons, series.seasons);

        series.addOptions = {
          ignoreEpisodesWithFiles: true,
          searchForMissingEpisodes: options.searchNow,
        };

        const newSeriesResponse = await this.axios.put<SonarrSeries>(
          '/series',
          series
        );

        if (newSeriesResponse.data.id) {
          logger.info('Sonarr accepted request. Updated existing series', {
            label: 'Sonarr',
          });
          logger.debug('Sonarr update details', {
            label: 'Sonarr',
            movie: newSeriesResponse.data,
          });
        } else {
          logger.error('Failed to update series in Sonarr', {
            label: 'Sonarr',
            options,
          });
          throw new Error('Failed to update series in Sonarr');
        }

        return newSeriesResponse.data;
      }

      const createdSeriesResponse = await this.axios.post<SonarrSeries>(
        '/series',
        {
          tvdbId: options.tvdbid,
          title: options.title,
          qualityProfileId: options.profileId,
          languageProfileId: options.languageProfileId,
          seasons: this.buildSeasonList(
            options.seasons,
            series.seasons.map((season) => ({
              seasonNumber: season.seasonNumber,
              // We force all seasons to false if its the first request
              monitored: false,
            }))
          ),
          seasonFolder: options.seasonFolder,
          monitored: options.monitored,
          rootFolderPath: options.rootFolderPath,
          seriesType: options.seriesType,
          addOptions: {
            ignoreEpisodesWithFiles: true,
            searchForMissingEpisodes: options.searchNow,
          },
        } as Partial<SonarrSeries>
      );

      if (createdSeriesResponse.data.id) {
        logger.info('Sonarr accepted request', { label: 'Sonarr' });
        logger.debug('Sonarr add details', {
          label: 'Sonarr',
          movie: createdSeriesResponse.data,
        });
      } else {
        logger.error('Failed to add movie to Sonarr', {
          label: 'Sonarr',
          options,
        });
        throw new Error('Failed to add series to Sonarr');
      }

      return createdSeriesResponse.data;
    } catch (e) {
      logger.error('Something went wrong while adding a series to Sonarr.', {
        label: 'Sonarr API',
        errorMessage: e.message,
        error: e,
        response: e?.response?.data,
      });
      throw new Error('Failed to add series');
    }
  }

  public async getProfiles(): Promise<SonarrProfile[]> {
    try {
      const data = await this.getRolling<SonarrProfile[]>(
        '/qualityProfile',
        undefined,
        3600
      );

      return data;
    } catch (e) {
      logger.error('Something went wrong while retrieving Sonarr profiles.', {
        label: 'Sonarr API',
        message: e.message,
      });
      throw new Error('Failed to get profiles');
    }
  }

  public async getRootFolders(): Promise<SonarrRootFolder[]> {
    try {
      const data = await this.getRolling<SonarrRootFolder[]>(
        '/rootfolder',
        undefined,
        3600
      );

      return data;
    } catch (e) {
      logger.error(
        'Something went wrong while retrieving Sonarr root folders.',
        {
          label: 'Sonarr API',
          message: e.message,
        }
      );

      throw new Error('Failed to get root folders');
    }
  }

  public async getLanguageProfiles(): Promise<LanguageProfile[]> {
    try {
      const data = await this.getRolling<LanguageProfile[]>(
        '/languageprofile',
        undefined,
        3600
      );

      return data;
    } catch (e) {
      logger.error(
        'Something went wrong while retrieving Sonarr language profiles.',
        {
          label: 'Sonarr API',
          message: e.message,
        }
      );

      throw new Error('Failed to get language profiles');
    }
  }

  private buildSeasonList(
    seasons: number[],
    existingSeasons?: SonarrSeason[]
  ): SonarrSeason[] {
    if (existingSeasons) {
      const newSeasons = existingSeasons.map((season) => {
        if (seasons.includes(season.seasonNumber)) {
          season.monitored = true;
        }
        return season;
      });

      return newSeasons;
    }

    const newSeasons = seasons.map(
      (seasonNumber): SonarrSeason => ({
        seasonNumber,
        monitored: true,
      })
    );

    return newSeasons;
  }

  public getQueue = async (): Promise<QueueItem[]> => {
    try {
      const response = await this.axios.get<QueueResponse>(`/queue`);

      return response.data.records;
    } catch (e) {
      throw new Error(`[Radarr] Failed to retrieve queue: ${e.message}`);
    }
  };
}

export default SonarrAPI;
