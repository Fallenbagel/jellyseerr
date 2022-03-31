import { uniqWith } from 'lodash';
import { getRepository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import RadarrAPI, { RadarrMovie } from '../../api/radarr';
import { MediaStatus, MediaType } from '../../constants/media';
import Media from '../../entity/Media';
import { getSettings, RadarrSettings } from '../../lib/settings';
import logger from '../../logger';

const BUNDLE_SIZE = 50;
const UPDATE_RATE = 4 * 1000;

interface SyncStatus {
  running: boolean;
  progress: number;
  total: number;
  currentServer: RadarrSettings;
  servers: RadarrSettings[];
}

class JobRadarrSync {
  private running = false;
  private progress = 0;
  private enable4k = false;
  private sessionId: string;
  private servers: RadarrSettings[];
  private currentServer: RadarrSettings;
  private radarrApi: RadarrAPI;
  private items: RadarrMovie[] = [];

  public async run() {
    const settings = getSettings();
    const sessionId = uuid();
    this.sessionId = sessionId;
    this.log('Radarr sync starting', 'info', { sessionId });

    try {
      this.running = true;

      // Remove any duplicate Radarr servers and assign them to the servers field
      this.servers = uniqWith(settings.radarr, (radarrA, radarrB) => {
        return (
          radarrA.hostname === radarrB.hostname &&
          radarrA.port === radarrB.port &&
          radarrA.baseUrl === radarrB.baseUrl
        );
      });

      this.enable4k = settings.radarr.some((radarr) => radarr.is4k);
      if (this.enable4k) {
        this.log(
          'At least one 4K Radarr server was detected. 4K movie detection is now enabled.',
          'info'
        );
      }

      for (const server of this.servers) {
        this.currentServer = server;
        if (server.syncEnabled) {
          this.log(
            `Beginning to process Radarr server: ${server.name}`,
            'info'
          );

          this.radarrApi = new RadarrAPI({
            apiKey: server.apiKey,
            url: RadarrAPI.buildRadarrUrl(server, '/api/v3'),
          });

          this.items = await this.radarrApi.getMovies();

          await this.loop({ sessionId });
        } else {
          this.log(`Sync not enabled. Skipping Radarr server: ${server.name}`);
        }
      }

      this.log('Radarr sync complete', 'info');
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

  private async processRadarrMovie(radarrMovie: RadarrMovie) {
    const mediaRepository = getRepository(Media);
    const server4k = this.enable4k && this.currentServer.is4k;

    const media = await mediaRepository.findOne({
      where: { tmdbId: radarrMovie.tmdbId },
    });

    if (media) {
      let isChanged = false;
      if (media.status === MediaStatus.AVAILABLE) {
        this.log(`Movie already available: ${radarrMovie.title}`);
      } else {
        media[server4k ? 'status4k' : 'status'] = radarrMovie.downloaded
          ? MediaStatus.AVAILABLE
          : MediaStatus.PROCESSING;
        this.log(
          `Updated existing ${server4k ? '4K ' : ''}movie ${
            radarrMovie.title
          } to status ${MediaStatus[media[server4k ? 'status4k' : 'status']]}`
        );
        isChanged = true;
      }

      if (
        media[server4k ? 'serviceId4k' : 'serviceId'] !== this.currentServer.id
      ) {
        media[server4k ? 'serviceId4k' : 'serviceId'] = this.currentServer.id;
        this.log(`Updated service ID for media entity: ${radarrMovie.title}`);
        isChanged = true;
      }

      if (
        media[server4k ? 'externalServiceId4k' : 'externalServiceId'] !==
        radarrMovie.id
      ) {
        media[server4k ? 'externalServiceId4k' : 'externalServiceId'] =
          radarrMovie.id;
        this.log(
          `Updated external service ID for media entity: ${radarrMovie.title}`
        );
        isChanged = true;
      }

      if (
        media[server4k ? 'externalServiceSlug4k' : 'externalServiceSlug'] !==
        radarrMovie.titleSlug
      ) {
        media[server4k ? 'externalServiceSlug4k' : 'externalServiceSlug'] =
          radarrMovie.titleSlug;
        this.log(
          `Updated external service slug for media entity: ${radarrMovie.title}`
        );
        isChanged = true;
      }

      if (isChanged) {
        await mediaRepository.save(media);
      }
    } else {
      const newMedia = new Media({
        tmdbId: radarrMovie.tmdbId,
        imdbId: radarrMovie.imdbId,
        mediaType: MediaType.MOVIE,
        serviceId: !server4k ? this.currentServer.id : undefined,
        serviceId4k: server4k ? this.currentServer.id : undefined,
        externalServiceId: !server4k ? radarrMovie.id : undefined,
        externalServiceId4k: server4k ? radarrMovie.id : undefined,
        status:
          !server4k && radarrMovie.downloaded
            ? MediaStatus.AVAILABLE
            : !server4k
            ? MediaStatus.PROCESSING
            : MediaStatus.UNKNOWN,
        status4k:
          server4k && radarrMovie.downloaded
            ? MediaStatus.AVAILABLE
            : server4k
            ? MediaStatus.PROCESSING
            : MediaStatus.UNKNOWN,
      });

      this.log(
        `Added media for movie ${radarrMovie.title} and set status to ${
          MediaStatus[newMedia[server4k ? 'status4k' : 'status']]
        }`
      );
      await mediaRepository.save(newMedia);
    }
  }

  private async processItems(items: RadarrMovie[]) {
    await Promise.all(
      items.map(async (radarrMovie) => {
        await this.processRadarrMovie(radarrMovie);
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
    logger[level](message, { label: 'Radarr Sync', ...optional });
  }
}

export const jobRadarrSync = new JobRadarrSync();
