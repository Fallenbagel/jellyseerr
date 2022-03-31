import { uniqWith } from 'lodash';
import { getRepository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import SonarrAPI, { SonarrSeries } from '../../api/sonarr';
import TheMovieDb from '../../api/themoviedb';
import { TmdbTvDetails } from '../../api/themoviedb/interfaces';
import { MediaStatus, MediaType } from '../../constants/media';
import Media from '../../entity/Media';
import Season from '../../entity/Season';
import { getSettings, SonarrSettings } from '../../lib/settings';
import logger from '../../logger';

const BUNDLE_SIZE = 50;
const UPDATE_RATE = 4 * 1000;

interface SyncStatus {
  running: boolean;
  progress: number;
  total: number;
  currentServer: SonarrSettings;
  servers: SonarrSettings[];
}

class JobSonarrSync {
  private running = false;
  private progress = 0;
  private enable4k = false;
  private sessionId: string;
  private servers: SonarrSettings[];
  private currentServer: SonarrSettings;
  private sonarrApi: SonarrAPI;
  private items: SonarrSeries[] = [];

  public async run() {
    const settings = getSettings();
    const sessionId = uuid();
    this.sessionId = sessionId;
    this.log('Sonarr sync starting', 'info', { sessionId });

    try {
      this.running = true;

      // Remove any duplicate Sonarr servers and assign them to the servers field
      this.servers = uniqWith(settings.sonarr, (sonarrA, sonarrB) => {
        return (
          sonarrA.hostname === sonarrB.hostname &&
          sonarrA.port === sonarrB.port &&
          sonarrA.baseUrl === sonarrB.baseUrl
        );
      });

      this.enable4k = settings.sonarr.some((sonarr) => sonarr.is4k);
      if (this.enable4k) {
        this.log(
          'At least one 4K Sonarr server was detected. 4K movie detection is now enabled.',
          'info'
        );
      }

      for (const server of this.servers) {
        this.currentServer = server;
        if (server.syncEnabled) {
          this.log(
            `Beginning to process Sonarr server: ${server.name}`,
            'info'
          );

          this.sonarrApi = new SonarrAPI({
            apiKey: server.apiKey,
            url: SonarrAPI.buildSonarrUrl(server, '/api/v3'),
          });

          this.items = await this.sonarrApi.getSeries();

          await this.loop({ sessionId });
        } else {
          this.log(`Sync not enabled. Skipping Sonarr server: ${server.name}`);
        }
      }

      this.log('Sonarr sync complete', 'info');
    } catch (e) {
      this.log('Something went wrong.', 'error', { errorMessage: e.message });
    } finally {
      // If a new scanning session hasnt started, set running back to false
      if (this.sessionId === sessionId) {
        this.running = false;
      }
    }
  }

  public status(): SyncStatus {
    return {
      running: this.running,
      progress: this.progress,
      total: this.items.length,
      currentServer: this.currentServer,
      servers: this.servers,
    };
  }

  public cancel(): void {
    this.running = false;
  }

  private async processSonarrSeries(sonarrSeries: SonarrSeries) {
    const mediaRepository = getRepository(Media);
    const server4k = this.enable4k && this.currentServer.is4k;

    const media = await mediaRepository.findOne({
      where: { tvdbId: sonarrSeries.tvdbId },
    });

    const currentSeasonsAvailable = (media?.seasons ?? []).filter(
      (season) =>
        season[server4k ? 'status4k' : 'status'] === MediaStatus.AVAILABLE
    ).length;

    const newSeasons: Season[] = [];

    for (const season of sonarrSeries.seasons) {
      const existingSeason = media?.seasons.find(
        (es) => es.seasonNumber === season.seasonNumber
      );

      // We are already tracking this season so we can work on it directly
      if (existingSeason) {
        if (
          existingSeason[server4k ? 'status4k' : 'status'] !==
            MediaStatus.AVAILABLE &&
          season.statistics
        ) {
          existingSeason[server4k ? 'status4k' : 'status'] =
            season.statistics.episodeFileCount ===
            season.statistics.totalEpisodeCount
              ? MediaStatus.AVAILABLE
              : season.statistics.episodeFileCount > 0
              ? MediaStatus.PARTIALLY_AVAILABLE
              : season.monitored
              ? MediaStatus.PROCESSING
              : existingSeason[server4k ? 'status4k' : 'status'];
        }
      } else {
        if (season.statistics && season.seasonNumber !== 0) {
          const allEpisodes =
            season.statistics.episodeFileCount ===
            season.statistics.totalEpisodeCount;
          newSeasons.push(
            new Season({
              seasonNumber: season.seasonNumber,
              status:
                !server4k && allEpisodes
                  ? MediaStatus.AVAILABLE
                  : !server4k && season.statistics.episodeFileCount > 0
                  ? MediaStatus.PARTIALLY_AVAILABLE
                  : !server4k && season.monitored
                  ? MediaStatus.PROCESSING
                  : MediaStatus.UNKNOWN,
              status4k:
                server4k && allEpisodes
                  ? MediaStatus.AVAILABLE
                  : server4k && season.statistics.episodeFileCount > 0
                  ? MediaStatus.PARTIALLY_AVAILABLE
                  : !server4k && season.monitored
                  ? MediaStatus.PROCESSING
                  : MediaStatus.UNKNOWN,
            })
          );
        }
      }
    }

    const filteredSeasons = sonarrSeries.seasons.filter(
      (s) => s.seasonNumber !== 0
    );

    const isAllSeasons =
      (media?.seasons ?? []).filter(
        (s) => s[server4k ? 'status4k' : 'status'] === MediaStatus.AVAILABLE
      ).length +
        newSeasons.filter(
          (s) => s[server4k ? 'status4k' : 'status'] === MediaStatus.AVAILABLE
        ).length >=
        filteredSeasons.length && filteredSeasons.length > 0;

    if (media) {
      media.seasons = [...media.seasons, ...newSeasons];

      const newSeasonsAvailable = (media?.seasons ?? []).filter(
        (season) =>
          season[server4k ? 'status4k' : 'status'] === MediaStatus.AVAILABLE
      ).length;

      if (newSeasonsAvailable > currentSeasonsAvailable) {
        this.log(
          `Detected ${newSeasonsAvailable - currentSeasonsAvailable} new ${
            server4k ? '4K ' : ''
          }season(s) for ${sonarrSeries.title}`,
          'debug'
        );
        media.lastSeasonChange = new Date();
      }

      if (
        media[server4k ? 'serviceId4k' : 'serviceId'] !== this.currentServer.id
      ) {
        media[server4k ? 'serviceId4k' : 'serviceId'] = this.currentServer.id;
        this.log(`Updated service ID for media entity: ${sonarrSeries.title}`);
      }

      if (
        media[server4k ? 'externalServiceId4k' : 'externalServiceId'] !==
        sonarrSeries.id
      ) {
        media[server4k ? 'externalServiceId4k' : 'externalServiceId'] =
          sonarrSeries.id;
        this.log(
          `Updated external service ID for media entity: ${sonarrSeries.title}`
        );
      }

      if (
        media[server4k ? 'externalServiceSlug4k' : 'externalServiceSlug'] !==
        sonarrSeries.titleSlug
      ) {
        media[server4k ? 'externalServiceSlug4k' : 'externalServiceSlug'] =
          sonarrSeries.titleSlug;
        this.log(
          `Updated external service slug for media entity: ${sonarrSeries.title}`
        );
      }

      // If the show is already available, and there are no new seasons, dont adjust
      // the status
      const shouldStayAvailable =
        media.status === MediaStatus.AVAILABLE &&
        newSeasons.filter(
          (season) =>
            season[server4k ? 'status4k' : 'status'] !== MediaStatus.UNKNOWN
        ).length === 0;

      media[server4k ? 'status4k' : 'status'] =
        isAllSeasons || shouldStayAvailable
          ? MediaStatus.AVAILABLE
          : media.seasons.some(
              (season) =>
                season[server4k ? 'status4k' : 'status'] ===
                  MediaStatus.AVAILABLE ||
                season[server4k ? 'status4k' : 'status'] ===
                  MediaStatus.PARTIALLY_AVAILABLE
            )
          ? MediaStatus.PARTIALLY_AVAILABLE
          : media.seasons.some(
              (season) =>
                season[server4k ? 'status4k' : 'status'] ===
                MediaStatus.PROCESSING
            )
          ? MediaStatus.PROCESSING
          : MediaStatus.UNKNOWN;

      await mediaRepository.save(media);
    } else {
      const tmdb = new TheMovieDb();
      let tvShow: TmdbTvDetails;

      try {
        tvShow = await tmdb.getShowByTvdbId({
          tvdbId: sonarrSeries.tvdbId,
        });
      } catch (e) {
        this.log(
          'Failed to create new media item during sync. TVDB ID is missing from TMDB?',
          'warn',
          { sonarrSeries, errorMessage: e.message }
        );
        return;
      }

      const newMedia = new Media({
        tmdbId: tvShow.id,
        tvdbId: sonarrSeries.tvdbId,
        mediaType: MediaType.TV,
        serviceId: !server4k ? this.currentServer.id : undefined,
        serviceId4k: server4k ? this.currentServer.id : undefined,
        externalServiceId: !server4k ? sonarrSeries.id : undefined,
        externalServiceId4k: server4k ? sonarrSeries.id : undefined,
        externalServiceSlug: !server4k ? sonarrSeries.titleSlug : undefined,
        externalServiceSlug4k: server4k ? sonarrSeries.titleSlug : undefined,
        seasons: newSeasons,
        status:
          !server4k && isAllSeasons
            ? MediaStatus.AVAILABLE
            : !server4k &&
              newSeasons.some(
                (s) =>
                  s.status === MediaStatus.PARTIALLY_AVAILABLE ||
                  s.status === MediaStatus.AVAILABLE
              )
            ? MediaStatus.PARTIALLY_AVAILABLE
            : !server4k
            ? MediaStatus.PROCESSING
            : MediaStatus.UNKNOWN,
        status4k:
          server4k && isAllSeasons
            ? MediaStatus.AVAILABLE
            : server4k &&
              newSeasons.some(
                (s) =>
                  s.status4k === MediaStatus.PARTIALLY_AVAILABLE ||
                  s.status4k === MediaStatus.AVAILABLE
              )
            ? MediaStatus.PARTIALLY_AVAILABLE
            : server4k
            ? MediaStatus.PROCESSING
            : MediaStatus.UNKNOWN,
      });

      this.log(
        `Added media for series ${sonarrSeries.title} and set status to ${
          MediaStatus[newMedia[server4k ? 'status4k' : 'status']]
        }`
      );
      await mediaRepository.save(newMedia);
    }
  }

  private async processItems(items: SonarrSeries[]) {
    await Promise.all(
      items.map(async (sonarrSeries) => {
        await this.processSonarrSeries(sonarrSeries);
      })
    );
  }

  private async loop({
    start = 0,
    end = BUNDLE_SIZE,
    sessionId,
  }: {
    start?: number;
    end?: number;
    sessionId?: string;
  } = {}) {
    const slicedItems = this.items.slice(start, end);

    if (!this.running) {
      throw new Error('Sync was aborted.');
    }

    if (this.sessionId !== sessionId) {
      throw new Error('New session was started. Old session aborted.');
    }

    if (start < this.items.length) {
      this.progress = start;
      await this.processItems(slicedItems);

      await new Promise<void>((resolve, reject) =>
        setTimeout(() => {
          this.loop({
            start: start + BUNDLE_SIZE,
            end: end + BUNDLE_SIZE,
            sessionId,
          })
            .then(() => resolve())
            .catch((e) => reject(new Error(e.message)));
        }, UPDATE_RATE)
      );
    }
  }

  private log(
    message: string,
    level: 'info' | 'error' | 'debug' | 'warn' = 'debug',
    optional?: Record<string, unknown>
  ): void {
    logger[level](message, { label: 'Sonarr Sync', ...optional });
  }
}

export const jobSonarrSync = new JobSonarrSync();
