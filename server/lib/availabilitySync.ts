import type { PlexMetadata } from '@server/api/plexapi';
import PlexAPI from '@server/api/plexapi';
import type { RadarrMovie } from '@server/api/servarr/radarr';
import RadarrAPI from '@server/api/servarr/radarr';
import type { SonarrSeason, SonarrSeries } from '@server/api/servarr/sonarr';
import SonarrAPI from '@server/api/servarr/sonarr';
import { MediaStatus } from '@server/constants/media';
import { getRepository } from '@server/datasource';
import Media from '@server/entity/Media';
import MediaRequest from '@server/entity/MediaRequest';
import Season from '@server/entity/Season';
import SeasonRequest from '@server/entity/SeasonRequest';
import { User } from '@server/entity/User';
import type { RadarrSettings, SonarrSettings } from '@server/lib/settings';
import { getSettings } from '@server/lib/settings';
import logger from '@server/logger';

class AvailabilitySync {
  public running = false;
  private plexClient: PlexAPI;
  private plexSeasonsCache: Record<string, PlexMetadata[]> = {};
  private sonarrSeasonsCache: Record<string, SonarrSeason[]> = {};
  private radarrServers: RadarrSettings[];
  private sonarrServers: SonarrSettings[];

  async run() {
    const settings = getSettings();
    this.running = true;
    this.plexSeasonsCache = {};
    this.sonarrSeasonsCache = {};
    this.radarrServers = settings.radarr.filter((server) => server.syncEnabled);
    this.sonarrServers = settings.sonarr.filter((server) => server.syncEnabled);
    await this.initPlexClient();

    if (!this.plexClient) {
      return;
    }

    logger.info(`Starting availability sync...`, {
      label: 'AvailabilitySync',
    });
    const mediaRepository = getRepository(Media);
    const requestRepository = getRepository(MediaRequest);
    const seasonRepository = getRepository(Season);
    const seasonRequestRepository = getRepository(SeasonRequest);

    const pageSize = 50;

    try {
      for await (const media of this.loadAvailableMediaPaginated(pageSize)) {
        if (!this.running) {
          throw new Error('Job aborted');
        }

        const mediaExists = await this.mediaExists(media);

        // We can not delete media so if both versions do not exist, we will change both columns to unknown or null
        if (!mediaExists) {
          if (
            media.status !== MediaStatus.UNKNOWN ||
            media.status4k !== MediaStatus.UNKNOWN
          ) {
            const request = await requestRepository.find({
              relations: {
                media: true,
              },
              where: { media: { id: media.id } },
            });

            logger.info(
              `Media ID ${media.id} does not exist in any of your media instances. Status will be changed to unknown.`,
              { label: 'AvailabilitySync' }
            );

            await mediaRepository.update(media.id, {
              status: MediaStatus.UNKNOWN,
              status4k: MediaStatus.UNKNOWN,
              serviceId: null,
              serviceId4k: null,
              externalServiceId: null,
              externalServiceId4k: null,
              externalServiceSlug: null,
              externalServiceSlug4k: null,
              ratingKey: null,
              ratingKey4k: null,
            });

            await requestRepository.remove(request);
          }
        }

        if (media.mediaType === 'tv') {
          // ok, the show itself exists, but do all it's seasons?
          const seasons = await seasonRepository.find({
            where: [
              { status: MediaStatus.AVAILABLE, media: { id: media.id } },
              {
                status: MediaStatus.PARTIALLY_AVAILABLE,
                media: { id: media.id },
              },
              { status4k: MediaStatus.AVAILABLE, media: { id: media.id } },
              {
                status4k: MediaStatus.PARTIALLY_AVAILABLE,
                media: { id: media.id },
              },
            ],
          });

          let didDeleteSeasons = false;
          for (const season of seasons) {
            if (
              !mediaExists &&
              (season.status !== MediaStatus.UNKNOWN ||
                season.status4k !== MediaStatus.UNKNOWN)
            ) {
              await seasonRepository.update(
                { id: season.id },
                {
                  status: MediaStatus.UNKNOWN,
                  status4k: MediaStatus.UNKNOWN,
                }
              );
            } else {
              const seasonExists = await this.seasonExists(media, season);

              if (!seasonExists) {
                logger.info(
                  `Removing season ${season.seasonNumber}, media ID ${media.id} because it does not exist in any of your media instances.`,
                  { label: 'AvailabilitySync' }
                );

                if (
                  season.status !== MediaStatus.UNKNOWN ||
                  season.status4k !== MediaStatus.UNKNOWN
                ) {
                  await seasonRepository.update(
                    { id: season.id },
                    {
                      status: MediaStatus.UNKNOWN,
                      status4k: MediaStatus.UNKNOWN,
                    }
                  );
                }

                const seasonToBeDeleted = await seasonRequestRepository.findOne(
                  {
                    relations: {
                      request: {
                        media: true,
                      },
                    },
                    where: {
                      request: {
                        media: {
                          id: media.id,
                        },
                      },
                      seasonNumber: season.seasonNumber,
                    },
                  }
                );

                if (seasonToBeDeleted) {
                  await seasonRequestRepository.remove(seasonToBeDeleted);
                }

                didDeleteSeasons = true;
              }
            }

            if (didDeleteSeasons) {
              if (
                media.status === MediaStatus.AVAILABLE ||
                media.status4k === MediaStatus.AVAILABLE
              ) {
                logger.info(
                  `Marking media ID ${media.id} as PARTIALLY_AVAILABLE because season removal has occurred.`,
                  { label: 'AvailabilitySync' }
                );

                if (media.status === MediaStatus.AVAILABLE) {
                  await mediaRepository.update(media.id, {
                    status: MediaStatus.PARTIALLY_AVAILABLE,
                  });
                }

                if (media.status4k === MediaStatus.AVAILABLE) {
                  await mediaRepository.update(media.id, {
                    status4k: MediaStatus.PARTIALLY_AVAILABLE,
                  });
                }
              }
            }
          }
        }
      }
    } catch (ex) {
      logger.error('Failed to complete availability sync.', {
        errorMessage: ex.message,
        label: 'AvailabilitySync',
      });
    } finally {
      logger.info(`Availability sync complete.`, {
        label: 'AvailabilitySync',
      });
      this.running = false;
    }
  }

  public cancel() {
    this.running = false;
  }

  private async *loadAvailableMediaPaginated(pageSize: number) {
    let offset = 0;
    const mediaRepository = getRepository(Media);
    const whereOptions = [
      { status: MediaStatus.AVAILABLE },
      { status: MediaStatus.PARTIALLY_AVAILABLE },
      { status4k: MediaStatus.AVAILABLE },
      { status4k: MediaStatus.PARTIALLY_AVAILABLE },
    ];

    let mediaPage: Media[];

    do {
      yield* (mediaPage = await mediaRepository.find({
        where: whereOptions,
        skip: offset,
        take: pageSize,
      }));
      offset += pageSize;
    } while (mediaPage.length > 0);
  }

  private async mediaUpdater(media: Media, is4k: boolean): Promise<void> {
    const mediaRepository = getRepository(Media);
    const requestRepository = getRepository(MediaRequest);

    const isTVType = media.mediaType === 'tv';

    const request = await requestRepository.findOne({
      relations: {
        media: true,
      },
      where: { media: { id: media.id }, is4k: is4k ? true : false },
    });

    logger.info(
      `Media ID ${media.id} does not exist in your ${is4k ? '4k' : 'non-4k'} ${
        isTVType ? 'Sonarr' : 'Radarr'
      } and Plex instance. Status will be changed to unknown.`,
      { label: 'AvailabilitySync' }
    );

    await mediaRepository.update(
      media.id,
      is4k
        ? {
            status4k: MediaStatus.UNKNOWN,
            serviceId4k: null,
            externalServiceId4k: null,
            externalServiceSlug4k: null,
            ratingKey4k: null,
          }
        : {
            status: MediaStatus.UNKNOWN,
            serviceId: null,
            externalServiceId: null,
            externalServiceSlug: null,
            ratingKey: null,
          }
    );

    if (isTVType) {
      const seasonRepository = getRepository(Season);

      await seasonRepository?.update(
        { media: { id: media.id } },
        is4k
          ? { status4k: MediaStatus.UNKNOWN }
          : { status: MediaStatus.UNKNOWN }
      );
    }

    await requestRepository.delete({ id: request?.id });
  }

  private async mediaExistsInRadarr(
    media: Media,
    existsInPlex: boolean,
    existsInPlex4k: boolean
  ): Promise<boolean> {
    let existsInRadarr = true;
    let existsInRadarr4k = true;

    for (const server of this.radarrServers) {
      const api = new RadarrAPI({
        apiKey: server.apiKey,
        url: RadarrAPI.buildUrl(server, '/api/v3'),
      });
      try {
        // Check if both exist or if a single non-4k or 4k exists
        // If both do not exist we will return false

        let meta: RadarrMovie | undefined;

        if (!server.is4k && media.externalServiceId) {
          meta = await api.getMovie({ id: media.externalServiceId });
        }

        if (server.is4k && media.externalServiceId4k) {
          meta = await api.getMovie({ id: media.externalServiceId4k });
        }

        if (!server.is4k && (!meta || !meta.hasFile)) {
          existsInRadarr = false;
        }

        if (server.is4k && (!meta || !meta.hasFile)) {
          existsInRadarr4k = false;
        }
      } catch (ex) {
        logger.debug(
          `Failure retrieving media ID ${media.id} from your ${
            !server.is4k ? 'non-4K' : '4K'
          } Radarr.`,
          {
            errorMessage: ex.message,
            label: 'AvailabilitySync',
          }
        );
        if (!server.is4k) {
          existsInRadarr = false;
        }

        if (server.is4k) {
          existsInRadarr4k = false;
        }
      }
    }

    // If only a single non-4k or 4k exists, then change entity columns accordingly
    // Related media request will then be deleted
    if (
      !existsInRadarr &&
      (existsInRadarr4k || existsInPlex4k) &&
      !existsInPlex
    ) {
      if (media.status !== MediaStatus.UNKNOWN) {
        this.mediaUpdater(media, false);
      }
    }

    if (
      (existsInRadarr || existsInPlex) &&
      !existsInRadarr4k &&
      !existsInPlex4k
    ) {
      if (media.status4k !== MediaStatus.UNKNOWN) {
        this.mediaUpdater(media, true);
      }
    }

    if (existsInRadarr || existsInRadarr4k || existsInPlex || existsInPlex4k) {
      return true;
    }

    return false;
  }

  private async mediaExistsInSonarr(
    media: Media,
    existsInPlex: boolean,
    existsInPlex4k: boolean
  ): Promise<boolean> {
    let existsInSonarr = true;
    let existsInSonarr4k = true;

    for (const server of this.sonarrServers) {
      const api = new SonarrAPI({
        apiKey: server.apiKey,
        url: SonarrAPI.buildUrl(server, '/api/v3'),
      });
      try {
        // Check if both exist or if a single non-4k or 4k exists
        // If both do not exist we will return false

        let meta: SonarrSeries | undefined;

        if (!server.is4k && media.externalServiceId) {
          meta = await api.getSeriesById(media.externalServiceId);
          this.sonarrSeasonsCache[`${server.id}-${media.externalServiceId}`] =
            meta.seasons;
        }

        if (server.is4k && media.externalServiceId4k) {
          meta = await api.getSeriesById(media.externalServiceId4k);
          this.sonarrSeasonsCache[`${server.id}-${media.externalServiceId4k}`] =
            meta.seasons;
        }

        if (!server.is4k && (!meta || meta.statistics.episodeFileCount === 0)) {
          existsInSonarr = false;
        }

        if (server.is4k && (!meta || meta.statistics.episodeFileCount === 0)) {
          existsInSonarr4k = false;
        }
      } catch (ex) {
        logger.debug(
          `Failure retrieving media ID ${media.id} from your ${
            !server.is4k ? 'non-4K' : '4K'
          } Sonarr.`,
          {
            errorMessage: ex.message,
            label: 'AvailabilitySync',
          }
        );

        if (!server.is4k) {
          existsInSonarr = false;
        }

        if (server.is4k) {
          existsInSonarr4k = false;
        }
      }
    }

    // If only a single non-4k or 4k exists, then change entity columns accordingly
    // Related media request will then be deleted
    if (
      !existsInSonarr &&
      (existsInSonarr4k || existsInPlex4k) &&
      !existsInPlex
    ) {
      if (media.status !== MediaStatus.UNKNOWN) {
        this.mediaUpdater(media, false);
      }
    }

    if (
      (existsInSonarr || existsInPlex) &&
      !existsInSonarr4k &&
      !existsInPlex4k
    ) {
      if (media.status4k !== MediaStatus.UNKNOWN) {
        this.mediaUpdater(media, true);
      }
    }

    if (existsInSonarr || existsInSonarr4k || existsInPlex || existsInPlex4k) {
      return true;
    }

    return false;
  }

  private async seasonExistsInSonarr(
    media: Media,
    season: Season,
    seasonExistsInPlex: boolean,
    seasonExistsInPlex4k: boolean
  ): Promise<boolean> {
    let seasonExistsInSonarr = true;
    let seasonExistsInSonarr4k = true;

    const mediaRepository = getRepository(Media);
    const seasonRepository = getRepository(Season);
    const seasonRequestRepository = getRepository(SeasonRequest);

    for (const server of this.sonarrServers) {
      const api = new SonarrAPI({
        apiKey: server.apiKey,
        url: SonarrAPI.buildUrl(server, '/api/v3'),
      });

      try {
        // Here we can use the cache we built when we fetched the series with mediaExistsInSonarr
        // If the cache does not have data, we will fetch with the api route

        let seasons: SonarrSeason[] =
          this.sonarrSeasonsCache[
            `${server.id}-${
              !server.is4k ? media.externalServiceId : media.externalServiceId4k
            }`
          ];

        if (!server.is4k && media.externalServiceId) {
          seasons =
            this.sonarrSeasonsCache[
              `${server.id}-${media.externalServiceId}`
            ] ?? (await api.getSeriesById(media.externalServiceId)).seasons;
          this.sonarrSeasonsCache[`${server.id}-${media.externalServiceId}`] =
            seasons;
        }

        if (server.is4k && media.externalServiceId4k) {
          seasons =
            this.sonarrSeasonsCache[
              `${server.id}-${media.externalServiceId4k}`
            ] ?? (await api.getSeriesById(media.externalServiceId4k)).seasons;
          this.sonarrSeasonsCache[`${server.id}-${media.externalServiceId4k}`] =
            seasons;
        }

        const seasonIsUnavailable = seasons?.find(
          ({ seasonNumber, statistics }) =>
            season.seasonNumber === seasonNumber &&
            statistics?.episodeFileCount === 0
        );

        if (!server.is4k && seasonIsUnavailable) {
          seasonExistsInSonarr = false;
        }

        if (server.is4k && seasonIsUnavailable) {
          seasonExistsInSonarr4k = false;
        }
      } catch (ex) {
        logger.debug(
          `Failure retrieving media ID ${media.id} from your ${
            !server.is4k ? 'non-4K' : '4K'
          } Sonarr.`,
          {
            errorMessage: ex.message,
            label: 'AvailabilitySync',
          }
        );

        if (!server.is4k) {
          seasonExistsInSonarr = false;
        }

        if (server.is4k) {
          seasonExistsInSonarr4k = false;
        }
      }
    }

    const seasonToBeDeleted = await seasonRequestRepository.findOne({
      relations: {
        request: {
          media: true,
        },
      },
      where: {
        request: {
          is4k: seasonExistsInSonarr ? true : false,
          media: {
            id: media.id,
          },
        },
        seasonNumber: season.seasonNumber,
      },
    });

    // If season does not exist, we will change status to unknown and delete related season request
    // If parent media request is empty(all related seasons have been removed), parent is automatically deleted
    if (
      !seasonExistsInSonarr &&
      (seasonExistsInSonarr4k || seasonExistsInPlex4k) &&
      !seasonExistsInPlex
    ) {
      if (season.status !== MediaStatus.UNKNOWN) {
        logger.info(
          `Season ${season.seasonNumber}, media ID ${media.id} does not exist in your non-4k Sonarr and Plex instance. Status will be changed to unknown.`,
          { label: 'AvailabilitySync' }
        );
        await seasonRepository.update(season.id, {
          status: MediaStatus.UNKNOWN,
        });

        if (seasonToBeDeleted) {
          await seasonRequestRepository.remove(seasonToBeDeleted);
        }

        if (media.status === MediaStatus.AVAILABLE) {
          logger.info(
            `Marking media ID ${media.id} as PARTIALLY_AVAILABLE because season removal has occurred.`,
            { label: 'AvailabilitySync' }
          );
          await mediaRepository.update(media.id, {
            status: MediaStatus.PARTIALLY_AVAILABLE,
          });
        }
      }
    }

    if (
      (seasonExistsInSonarr || seasonExistsInPlex) &&
      !seasonExistsInSonarr4k &&
      !seasonExistsInPlex4k
    ) {
      if (season.status4k !== MediaStatus.UNKNOWN) {
        logger.info(
          `Season ${season.seasonNumber}, media ID ${media.id} does not exist in your 4k Sonarr and Plex instance. Status will be changed to unknown.`,
          { label: 'AvailabilitySync' }
        );
        await seasonRepository.update(season.id, {
          status4k: MediaStatus.UNKNOWN,
        });

        if (seasonToBeDeleted) {
          await seasonRequestRepository.remove(seasonToBeDeleted);
        }

        if (media.status4k === MediaStatus.AVAILABLE) {
          logger.info(
            `Marking media ID ${media.id} as PARTIALLY_AVAILABLE because season removal has occurred.`,
            { label: 'AvailabilitySync' }
          );
          await mediaRepository.update(media.id, {
            status4k: MediaStatus.PARTIALLY_AVAILABLE,
          });
        }
      }
    }

    if (
      seasonExistsInSonarr ||
      seasonExistsInSonarr4k ||
      seasonExistsInPlex ||
      seasonExistsInPlex4k
    ) {
      return true;
    }

    return false;
  }

  private async mediaExists(media: Media): Promise<boolean> {
    const ratingKey = media.ratingKey;
    const ratingKey4k = media.ratingKey4k;

    let existsInPlex = false;
    let existsInPlex4k = false;

    // Check each plex instance to see if media exists
    try {
      if (ratingKey) {
        const meta = await this.plexClient?.getMetadata(ratingKey);
        if (meta) {
          existsInPlex = true;
        }
      }

      if (ratingKey4k) {
        const meta4k = await this.plexClient?.getMetadata(ratingKey4k);
        if (meta4k) {
          existsInPlex4k = true;
        }
      }
    } catch (ex) {
      if (!ex.message.includes('response code: 404')) {
        throw ex;
      }
    }
    // Base case if both media versions exist in plex
    if (existsInPlex && existsInPlex4k) {
      return true;
    }

    // We then check radarr or sonarr has that specific media. If not, then we will move to delete
    // If a non-4k or 4k version exists in at least one of the instances, we will only update that specific version
    if (media.mediaType === 'movie') {
      const existsInRadarr = await this.mediaExistsInRadarr(
        media,
        existsInPlex,
        existsInPlex4k
      );

      // If true, media exists in at least one radarr or plex instance.
      if (existsInRadarr) {
        logger.warn(
          `${media.id} exists in at least one Radarr or Plex instance. Media will be updated if set to available.`,
          {
            label: 'AvailabilitySync',
          }
        );

        return true;
      }
    }

    if (media.mediaType === 'tv') {
      const existsInSonarr = await this.mediaExistsInSonarr(
        media,
        existsInPlex,
        existsInPlex4k
      );

      // If true, media exists in at least one sonarr or plex instance.
      if (existsInSonarr) {
        logger.warn(
          `${media.id} exists in at least one Sonarr or Plex instance. Media will be updated if set to available.`,
          {
            label: 'AvailabilitySync',
          }
        );

        return true;
      }
    }

    return false;
  }

  private async seasonExists(media: Media, season: Season) {
    const ratingKey = media.ratingKey;
    const ratingKey4k = media.ratingKey4k;

    let seasonExistsInPlex = false;
    let seasonExistsInPlex4k = false;

    if (ratingKey) {
      const children =
        this.plexSeasonsCache[ratingKey] ??
        (await this.plexClient?.getChildrenMetadata(ratingKey)) ??
        [];
      this.plexSeasonsCache[ratingKey] = children;
      const seasonMeta = children?.find(
        (child) => child.index === season.seasonNumber
      );

      if (seasonMeta) {
        seasonExistsInPlex = true;
      }
    }

    if (ratingKey4k) {
      const children4k =
        this.plexSeasonsCache[ratingKey4k] ??
        (await this.plexClient?.getChildrenMetadata(ratingKey4k)) ??
        [];
      this.plexSeasonsCache[ratingKey4k] = children4k;
      const seasonMeta4k = children4k?.find(
        (child) => child.index === season.seasonNumber
      );

      if (seasonMeta4k) {
        seasonExistsInPlex4k = true;
      }
    }

    // Base case if both season versions exist in plex
    if (seasonExistsInPlex && seasonExistsInPlex4k) {
      return true;
    }

    const existsInSonarr = await this.seasonExistsInSonarr(
      media,
      season,
      seasonExistsInPlex,
      seasonExistsInPlex4k
    );

    if (existsInSonarr) {
      logger.warn(
        `Season ${season.seasonNumber}, media ID ${media.id} exists in at least one Sonarr or Plex instance. Media will be updated if set to available.`,
        {
          label: 'AvailabilitySync',
        }
      );

      return true;
    }

    return false;
  }

  private async initPlexClient() {
    const userRepository = getRepository(User);
    const admin = await userRepository.findOne({
      select: { id: true, plexToken: true },
      where: { id: 1 },
    });

    if (!admin) {
      logger.warning('No admin configured. Availability sync skipped.');
      return;
    }

    this.plexClient = new PlexAPI({ plexToken: admin.plexToken });
  }
}

const availabilitySync = new AvailabilitySync();
export default availabilitySync;
