import { getRepository } from 'typeorm';
import { User } from '../../entity/User';
import PlexAPI, { PlexLibraryItem, PlexMetadata } from '../../api/plexapi';
import TheMovieDb from '../../api/themoviedb';
import {
  TmdbMovieDetails,
  TmdbTvDetails,
} from '../../api/themoviedb/interfaces';
import Media from '../../entity/Media';
import { MediaStatus, MediaType } from '../../constants/media';
import logger from '../../logger';
import { getSettings, Library } from '../../lib/settings';
import Season from '../../entity/Season';
import { uniqWith } from 'lodash';
import { v4 as uuid } from 'uuid';
import animeList from '../../api/animelist';
import AsyncLock from '../../utils/asyncLock';
import { MediaServerType } from '../../constants/server';

const BUNDLE_SIZE = 20;
const UPDATE_RATE = 4 * 1000;

const imdbRegex = new RegExp(/imdb:\/\/(tt[0-9]+)/);
const tmdbRegex = new RegExp(/tmdb:\/\/([0-9]+)/);
const tvdbRegex = new RegExp(/tvdb:\/\/([0-9]+)/);
const tmdbShowRegex = new RegExp(/themoviedb:\/\/([0-9]+)/);
const plexRegex = new RegExp(/plex:\/\//);
// Hama agent uses ASS naming, see details here:
// https://github.com/ZeroQI/Absolute-Series-Scanner/blob/master/README.md#forcing-the-movieseries-id
const hamaTvdbRegex = new RegExp(/hama:\/\/tvdb[0-9]?-([0-9]+)/);
const hamaAnidbRegex = new RegExp(/hama:\/\/anidb[0-9]?-([0-9]+)/);
const HAMA_AGENT = 'com.plexapp.agents.hama';

interface SyncStatus {
  running: boolean;
  progress: number;
  total: number;
  currentLibrary: Library;
  libraries: Library[];
}

class JobPlexSync {
  private sessionId: string;
  private tmdb: TheMovieDb;
  private plexClient: PlexAPI;
  private items: PlexLibraryItem[] = [];
  private progress = 0;
  private libraries: Library[];
  private currentLibrary: Library;
  private running = false;
  private isRecentOnly = false;
  private enable4kMovie = false;
  private enable4kShow = false;
  private asyncLock = new AsyncLock();

  constructor({ isRecentOnly }: { isRecentOnly?: boolean } = {}) {
    this.tmdb = new TheMovieDb();
    this.isRecentOnly = isRecentOnly ?? false;
  }

  private async getExisting(tmdbId: number, mediaType: MediaType) {
    const mediaRepository = getRepository(Media);

    const existing = await mediaRepository.findOne({
      where: { tmdbId: tmdbId, mediaType },
    });

    return existing;
  }

  private async processMovie(plexitem: PlexLibraryItem) {
    const mediaRepository = getRepository(Media);

    try {
      if (plexitem.guid.match(plexRegex)) {
        const metadata = await this.plexClient.getMetadata(plexitem.ratingKey);
        const newMedia = new Media();

        if (!metadata.Guid) {
          logger.debug('No Guid metadata for this title. Skipping', {
            label: 'Plex Sync',
            ratingKey: plexitem.ratingKey,
          });
          return;
        }

        metadata.Guid.forEach((ref) => {
          if (ref.id.match(imdbRegex)) {
            newMedia.imdbId = ref.id.match(imdbRegex)?.[1] ?? undefined;
          } else if (ref.id.match(tmdbRegex)) {
            const tmdbMatch = ref.id.match(tmdbRegex)?.[1];
            newMedia.tmdbId = Number(tmdbMatch);
          }
        });
        if (newMedia.imdbId && !newMedia.tmdbId) {
          const tmdbMovie = await this.tmdb.getMovieByImdbId({
            imdbId: newMedia.imdbId,
          });
          newMedia.tmdbId = tmdbMovie.id;
        }
        if (!newMedia.tmdbId) {
          throw new Error('Unable to find TMDb ID');
        }

        const has4k = metadata.Media.some(
          (media) => media.videoResolution === '4k'
        );
        const hasOtherResolution = metadata.Media.some(
          (media) => media.videoResolution !== '4k'
        );

        await this.asyncLock.dispatch(newMedia.tmdbId, async () => {
          const existing = await this.getExisting(
            newMedia.tmdbId,
            MediaType.MOVIE
          );

          if (existing) {
            let changedExisting = false;

            if (
              (hasOtherResolution || (!this.enable4kMovie && has4k)) &&
              existing.status !== MediaStatus.AVAILABLE
            ) {
              existing.status = MediaStatus.AVAILABLE;
              existing.mediaAddedAt = new Date(plexitem.addedAt * 1000);
              changedExisting = true;
            }

            if (
              has4k &&
              this.enable4kMovie &&
              existing.status4k !== MediaStatus.AVAILABLE
            ) {
              existing.status4k = MediaStatus.AVAILABLE;
              changedExisting = true;
            }

            if (!existing.mediaAddedAt && !changedExisting) {
              existing.mediaAddedAt = new Date(plexitem.addedAt * 1000);
              changedExisting = true;
            }

            if (
              (hasOtherResolution || (has4k && !this.enable4kMovie)) &&
              existing.ratingKey !== plexitem.ratingKey
            ) {
              existing.ratingKey = plexitem.ratingKey;
              changedExisting = true;
            }

            if (
              has4k &&
              this.enable4kMovie &&
              existing.ratingKey4k !== plexitem.ratingKey
            ) {
              existing.ratingKey4k = plexitem.ratingKey;
              changedExisting = true;
            }

            if (changedExisting) {
              await mediaRepository.save(existing);
              this.log(
                `Request for ${metadata.title} exists. New media types set to AVAILABLE`,
                'info'
              );
            } else {
              this.log(
                `Title already exists and no new media types found ${metadata.title}`
              );
            }
          } else {
            newMedia.status =
              hasOtherResolution || (!this.enable4kMovie && has4k)
                ? MediaStatus.AVAILABLE
                : MediaStatus.UNKNOWN;
            newMedia.status4k =
              has4k && this.enable4kMovie
                ? MediaStatus.AVAILABLE
                : MediaStatus.UNKNOWN;
            newMedia.mediaType = MediaType.MOVIE;
            newMedia.mediaAddedAt = new Date(plexitem.addedAt * 1000);
            newMedia.ratingKey =
              hasOtherResolution || (!this.enable4kMovie && has4k)
                ? plexitem.ratingKey
                : undefined;
            newMedia.ratingKey4k =
              has4k && this.enable4kMovie ? plexitem.ratingKey : undefined;
            await mediaRepository.save(newMedia);
            this.log(`Saved ${plexitem.title}`);
          }
        });
      } else {
        let tmdbMovieId: number | undefined;
        let tmdbMovie: TmdbMovieDetails | undefined;

        const imdbMatch = plexitem.guid.match(imdbRegex);
        const tmdbMatch = plexitem.guid.match(tmdbShowRegex);

        if (imdbMatch) {
          tmdbMovie = await this.tmdb.getMovieByImdbId({
            imdbId: imdbMatch[1],
          });
          tmdbMovieId = tmdbMovie.id;
        } else if (tmdbMatch) {
          tmdbMovieId = Number(tmdbMatch[1]);
        }

        if (!tmdbMovieId) {
          throw new Error('Unable to find TMDb ID');
        }

        await this.processMovieWithId(plexitem, tmdbMovie, tmdbMovieId);
      }
    } catch (e) {
      this.log(
        `Failed to process Plex item. ratingKey: ${plexitem.ratingKey}`,
        'error',
        {
          errorMessage: e.message,
          plexitem,
        }
      );
    }
  }

  private async processMovieWithId(
    plexitem: PlexLibraryItem,
    tmdbMovie: TmdbMovieDetails | undefined,
    tmdbMovieId: number
  ) {
    const mediaRepository = getRepository(Media);

    await this.asyncLock.dispatch(tmdbMovieId, async () => {
      const metadata = await this.plexClient.getMetadata(plexitem.ratingKey);
      const existing = await this.getExisting(tmdbMovieId, MediaType.MOVIE);

      const has4k = metadata.Media.some(
        (media) => media.videoResolution === '4k'
      );
      const hasOtherResolution = metadata.Media.some(
        (media) => media.videoResolution !== '4k'
      );

      if (existing) {
        let changedExisting = false;

        if (
          (hasOtherResolution || (!this.enable4kMovie && has4k)) &&
          existing.status !== MediaStatus.AVAILABLE
        ) {
          existing.status = MediaStatus.AVAILABLE;
          existing.mediaAddedAt = new Date(plexitem.addedAt * 1000);
          changedExisting = true;
        }

        if (
          has4k &&
          this.enable4kMovie &&
          existing.status4k !== MediaStatus.AVAILABLE
        ) {
          existing.status4k = MediaStatus.AVAILABLE;
          changedExisting = true;
        }

        if (!existing.mediaAddedAt && !changedExisting) {
          existing.mediaAddedAt = new Date(plexitem.addedAt * 1000);
          changedExisting = true;
        }

        if (
          (hasOtherResolution || (has4k && !this.enable4kMovie)) &&
          existing.ratingKey !== plexitem.ratingKey
        ) {
          existing.ratingKey = plexitem.ratingKey;
          changedExisting = true;
        }

        if (
          has4k &&
          this.enable4kMovie &&
          existing.ratingKey4k !== plexitem.ratingKey
        ) {
          existing.ratingKey4k = plexitem.ratingKey;
          changedExisting = true;
        }

        if (changedExisting) {
          await mediaRepository.save(existing);
          this.log(
            `Request for ${metadata.title} exists. New media types set to AVAILABLE`,
            'info'
          );
        } else {
          this.log(
            `Title already exists and no new media types found ${metadata.title}`
          );
        }
      } else {
        // If we have a tmdb movie guid but it didn't already exist, only then
        // do we request the movie from tmdb (to reduce api requests)
        if (!tmdbMovie) {
          tmdbMovie = await this.tmdb.getMovie({ movieId: tmdbMovieId });
        }
        const newMedia = new Media();
        newMedia.imdbId = tmdbMovie.external_ids.imdb_id;
        newMedia.tmdbId = tmdbMovie.id;
        newMedia.mediaAddedAt = new Date(plexitem.addedAt * 1000);
        newMedia.status =
          hasOtherResolution || (!this.enable4kMovie && has4k)
            ? MediaStatus.AVAILABLE
            : MediaStatus.UNKNOWN;
        newMedia.status4k =
          has4k && this.enable4kMovie
            ? MediaStatus.AVAILABLE
            : MediaStatus.UNKNOWN;
        newMedia.mediaType = MediaType.MOVIE;
        newMedia.ratingKey =
          hasOtherResolution || (!this.enable4kMovie && has4k)
            ? plexitem.ratingKey
            : undefined;
        newMedia.ratingKey4k =
          has4k && this.enable4kMovie ? plexitem.ratingKey : undefined;
        await mediaRepository.save(newMedia);
        this.log(`Saved ${tmdbMovie.title}`);
      }
    });
  }

  // this adds all movie episodes from specials season for Hama agent
  private async processHamaSpecials(metadata: PlexMetadata, tvdbId: number) {
    const specials = metadata.Children?.Metadata.find(
      (md) => Number(md.index) === 0
    );
    if (specials) {
      const episodes = await this.plexClient.getChildrenMetadata(
        specials.ratingKey
      );
      if (episodes) {
        for (const episode of episodes) {
          const special = animeList.getSpecialEpisode(tvdbId, episode.index);
          if (special) {
            if (special.tmdbId) {
              await this.processMovieWithId(episode, undefined, special.tmdbId);
            } else if (special.imdbId) {
              const tmdbMovie = await this.tmdb.getMovieByImdbId({
                imdbId: special.imdbId,
              });
              await this.processMovieWithId(episode, tmdbMovie, tmdbMovie.id);
            }
          }
        }
      }
    }
  }

  // movies with hama agent actually are tv shows with at least one episode in it
  // try to get first episode of any season - cannot hardcode season or episode number
  // because sometimes user can have it in other season/ep than s01e01
  private async processHamaMovie(
    metadata: PlexMetadata,
    tmdbMovie: TmdbMovieDetails | undefined,
    tmdbMovieId: number
  ) {
    const season = metadata.Children?.Metadata[0];
    if (season) {
      const episodes = await this.plexClient.getChildrenMetadata(
        season.ratingKey
      );
      if (episodes) {
        await this.processMovieWithId(episodes[0], tmdbMovie, tmdbMovieId);
      }
    }
  }

  private async processShow(plexitem: PlexLibraryItem) {
    const mediaRepository = getRepository(Media);

    let tvShow: TmdbTvDetails | null = null;

    try {
      const ratingKey =
        plexitem.grandparentRatingKey ??
        plexitem.parentRatingKey ??
        plexitem.ratingKey;
      const metadata = await this.plexClient.getMetadata(ratingKey, {
        includeChildren: true,
      });

      if (metadata.guid.match(tvdbRegex)) {
        const matchedtvdb = metadata.guid.match(tvdbRegex);

        // If we can find a tvdb Id, use it to get the full tmdb show details
        if (matchedtvdb?.[1]) {
          tvShow = await this.tmdb.getShowByTvdbId({
            tvdbId: Number(matchedtvdb[1]),
          });
        }
      } else if (metadata.guid.match(tmdbShowRegex)) {
        const matchedtmdb = metadata.guid.match(tmdbShowRegex);

        if (matchedtmdb?.[1]) {
          tvShow = await this.tmdb.getTvShow({ tvId: Number(matchedtmdb[1]) });
        }
      } else if (metadata.guid.match(hamaTvdbRegex)) {
        const matched = metadata.guid.match(hamaTvdbRegex);
        const tvdbId = matched?.[1];

        if (tvdbId) {
          tvShow = await this.tmdb.getShowByTvdbId({ tvdbId: Number(tvdbId) });
          if (animeList.isLoaded()) {
            await this.processHamaSpecials(metadata, Number(tvdbId));
          } else {
            this.log(
              `Hama ID ${plexitem.guid} detected, but library agent is not set to Hama`,
              'warn'
            );
          }
        }
      } else if (metadata.guid.match(hamaAnidbRegex)) {
        const matched = metadata.guid.match(hamaAnidbRegex);

        if (!animeList.isLoaded()) {
          this.log(
            `Hama ID ${plexitem.guid} detected, but library agent is not set to Hama`,
            'warn'
          );
        } else if (matched?.[1]) {
          const anidbId = Number(matched[1]);
          const result = animeList.getFromAnidbId(anidbId);

          // first try to lookup tvshow by tvdbid
          if (result?.tvdbId) {
            const extResponse = await this.tmdb.getByExternalId({
              externalId: result.tvdbId,
              type: 'tvdb',
            });
            if (extResponse.tv_results[0]) {
              tvShow = await this.tmdb.getTvShow({
                tvId: extResponse.tv_results[0].id,
              });
            } else {
              this.log(
                `Missing TVDB ${result.tvdbId} entry in TMDB for AniDB ${anidbId}`
              );
            }
            await this.processHamaSpecials(metadata, result.tvdbId);
          }

          if (!tvShow) {
            // if lookup of tvshow above failed, then try movie with tmdbid/imdbid
            // note - some tv shows have imdbid set too, that's why this need to go second
            if (result?.tmdbId) {
              return await this.processHamaMovie(
                metadata,
                undefined,
                result.tmdbId
              );
            } else if (result?.imdbId) {
              const tmdbMovie = await this.tmdb.getMovieByImdbId({
                imdbId: result.imdbId,
              });
              return await this.processHamaMovie(
                metadata,
                tmdbMovie,
                tmdbMovie.id
              );
            }
          }
        }
      }

      if (tvShow) {
        await this.asyncLock.dispatch(tvShow.id, async () => {
          if (!tvShow) {
            // this will never execute, but typescript thinks somebody could reset tvShow from
            // outer scope back to null before this async gets called
            return;
          }

          // Lets get the available seasons from Plex
          const seasons = tvShow.seasons;
          const media = await this.getExisting(tvShow.id, MediaType.TV);

          const newSeasons: Season[] = [];

          const currentStandardSeasonAvailable = (
            media?.seasons.filter(
              (season) => season.status === MediaStatus.AVAILABLE
            ) ?? []
          ).length;
          const current4kSeasonAvailable = (
            media?.seasons.filter(
              (season) => season.status4k === MediaStatus.AVAILABLE
            ) ?? []
          ).length;

          for (const season of seasons) {
            const matchedPlexSeason = metadata.Children?.Metadata.find(
              (md) => Number(md.index) === season.season_number
            );

            const existingSeason = media?.seasons.find(
              (es) => es.seasonNumber === season.season_number
            );

            // Check if we found the matching season and it has all the available episodes
            if (matchedPlexSeason) {
              // If we have a matched Plex season, get its children metadata so we can check details
              const episodes = await this.plexClient.getChildrenMetadata(
                matchedPlexSeason.ratingKey
              );
              // Total episodes that are in standard definition (not 4k)
              const totalStandard = episodes.filter((episode) =>
                !this.enable4kShow
                  ? true
                  : episode.Media.some(
                      (media) => media.videoResolution !== '4k'
                    )
              ).length;

              // Total episodes that are in 4k
              const total4k = episodes.filter((episode) =>
                episode.Media.some((media) => media.videoResolution === '4k')
              ).length;

              if (
                media &&
                (totalStandard > 0 || (total4k > 0 && !this.enable4kShow)) &&
                media.ratingKey !== ratingKey
              ) {
                media.ratingKey = ratingKey;
              }

              if (
                media &&
                total4k > 0 &&
                this.enable4kShow &&
                media.ratingKey4k !== ratingKey
              ) {
                media.ratingKey4k = ratingKey;
              }

              if (existingSeason) {
                // These ternary statements look super confusing, but they are simply
                // setting the status to AVAILABLE if all of a type is there, partially if some,
                // and then not modifying the status if there are 0 items.
                // If the season was already available, we don't modify it as well.
                existingSeason.status =
                  totalStandard === season.episode_count ||
                  existingSeason.status === MediaStatus.AVAILABLE
                    ? MediaStatus.AVAILABLE
                    : totalStandard > 0
                    ? MediaStatus.PARTIALLY_AVAILABLE
                    : existingSeason.status;
                existingSeason.status4k =
                  (this.enable4kShow && total4k === season.episode_count) ||
                  existingSeason.status4k === MediaStatus.AVAILABLE
                    ? MediaStatus.AVAILABLE
                    : this.enable4kShow && total4k > 0
                    ? MediaStatus.PARTIALLY_AVAILABLE
                    : existingSeason.status4k;
              } else {
                newSeasons.push(
                  new Season({
                    seasonNumber: season.season_number,
                    // This ternary is the same as the ones above, but it just falls back to "UNKNOWN"
                    // if we dont have any items for the season
                    status:
                      totalStandard === season.episode_count
                        ? MediaStatus.AVAILABLE
                        : totalStandard > 0
                        ? MediaStatus.PARTIALLY_AVAILABLE
                        : MediaStatus.UNKNOWN,
                    status4k:
                      this.enable4kShow && total4k === season.episode_count
                        ? MediaStatus.AVAILABLE
                        : this.enable4kShow && total4k > 0
                        ? MediaStatus.PARTIALLY_AVAILABLE
                        : MediaStatus.UNKNOWN,
                  })
                );
              }
            }
          }

          // Remove extras season. We dont count it for determining availability
          const filteredSeasons = tvShow.seasons.filter(
            (season) => season.season_number !== 0
          );

          const isAllStandardSeasons =
            newSeasons.filter(
              (season) => season.status === MediaStatus.AVAILABLE
            ).length +
              (media?.seasons.filter(
                (season) => season.status === MediaStatus.AVAILABLE
              ).length ?? 0) >=
            filteredSeasons.length;

          const isAll4kSeasons =
            newSeasons.filter(
              (season) => season.status4k === MediaStatus.AVAILABLE
            ).length +
              (media?.seasons.filter(
                (season) => season.status4k === MediaStatus.AVAILABLE
              ).length ?? 0) >=
            filteredSeasons.length;

          if (media) {
            // Update existing
            media.seasons = [...media.seasons, ...newSeasons];

            const newStandardSeasonAvailable = (
              media.seasons.filter(
                (season) => season.status === MediaStatus.AVAILABLE
              ) ?? []
            ).length;

            const new4kSeasonAvailable = (
              media.seasons.filter(
                (season) => season.status4k === MediaStatus.AVAILABLE
              ) ?? []
            ).length;

            // If at least one new season has become available, update
            // the lastSeasonChange field so we can trigger notifications
            if (newStandardSeasonAvailable > currentStandardSeasonAvailable) {
              this.log(
                `Detected ${
                  newStandardSeasonAvailable - currentStandardSeasonAvailable
                } new standard season(s) for ${tvShow.name}`,
                'debug'
              );
              media.lastSeasonChange = new Date();
              media.mediaAddedAt = new Date(plexitem.addedAt * 1000);
            }

            if (new4kSeasonAvailable > current4kSeasonAvailable) {
              this.log(
                `Detected ${
                  new4kSeasonAvailable - current4kSeasonAvailable
                } new 4K season(s) for ${tvShow.name}`,
                'debug'
              );
              media.lastSeasonChange = new Date();
            }

            if (!media.mediaAddedAt) {
              media.mediaAddedAt = new Date(plexitem.addedAt * 1000);
            }

            // If the show is already available, and there are no new seasons, dont adjust
            // the status
            const shouldStayAvailable =
              media.status === MediaStatus.AVAILABLE &&
              newSeasons.filter(
                (season) => season.status !== MediaStatus.UNKNOWN
              ).length === 0;
            const shouldStayAvailable4k =
              media.status4k === MediaStatus.AVAILABLE &&
              newSeasons.filter(
                (season) => season.status4k !== MediaStatus.UNKNOWN
              ).length === 0;

            media.status =
              isAllStandardSeasons || shouldStayAvailable
                ? MediaStatus.AVAILABLE
                : media.seasons.some(
                    (season) => season.status !== MediaStatus.UNKNOWN
                  )
                ? MediaStatus.PARTIALLY_AVAILABLE
                : MediaStatus.UNKNOWN;
            media.status4k =
              (isAll4kSeasons || shouldStayAvailable4k) && this.enable4kShow
                ? MediaStatus.AVAILABLE
                : this.enable4kShow &&
                  media.seasons.some(
                    (season) => season.status4k !== MediaStatus.UNKNOWN
                  )
                ? MediaStatus.PARTIALLY_AVAILABLE
                : MediaStatus.UNKNOWN;
            await mediaRepository.save(media);
            this.log(`Updating existing title: ${tvShow.name}`);
          } else {
            const newMedia = new Media({
              mediaType: MediaType.TV,
              seasons: newSeasons,
              tmdbId: tvShow.id,
              tvdbId: tvShow.external_ids.tvdb_id,
              mediaAddedAt: new Date(plexitem.addedAt * 1000),
              status: isAllStandardSeasons
                ? MediaStatus.AVAILABLE
                : newSeasons.some(
                    (season) => season.status !== MediaStatus.UNKNOWN
                  )
                ? MediaStatus.PARTIALLY_AVAILABLE
                : MediaStatus.UNKNOWN,
              status4k:
                isAll4kSeasons && this.enable4kShow
                  ? MediaStatus.AVAILABLE
                  : this.enable4kShow &&
                    newSeasons.some(
                      (season) => season.status4k !== MediaStatus.UNKNOWN
                    )
                  ? MediaStatus.PARTIALLY_AVAILABLE
                  : MediaStatus.UNKNOWN,
            });
            await mediaRepository.save(newMedia);
            this.log(`Saved ${tvShow.name}`);
          }
        });
      } else {
        this.log(`failed show: ${plexitem.guid}`);
      }
    } catch (e) {
      this.log(
        `Failed to process Plex item. ratingKey: ${
          plexitem.grandparentRatingKey ??
          plexitem.parentRatingKey ??
          plexitem.ratingKey
        }`,
        'error',
        {
          errorMessage: e.message,
          plexitem,
        }
      );
    }
  }

  private async processItems(slicedItems: PlexLibraryItem[]) {
    await Promise.all(
      slicedItems.map(async (plexitem) => {
        if (plexitem.type === 'movie') {
          await this.processMovie(plexitem);
        } else if (
          plexitem.type === 'show' ||
          plexitem.type === 'episode' ||
          plexitem.type === 'season'
        ) {
          await this.processShow(plexitem);
        }
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
    logger[level](message, { label: 'Plex Sync', ...optional });
  }

  // checks if any of this.libraries has Hama agent set in Plex
  private async hasHamaAgent() {
    const plexLibraries = await this.plexClient.getLibraries();
    return this.libraries.some((library) =>
      plexLibraries.some(
        (plexLibrary) =>
          plexLibrary.agent === HAMA_AGENT && library.id === plexLibrary.key
      )
    );
  }

  public async run(): Promise<void> {
    const settings = getSettings();

    if (settings.main.mediaServerType != MediaServerType.PLEX) {
      return;
    }

    const sessionId = uuid();
    this.sessionId = sessionId;
    logger.info('Plex Sync Starting', { sessionId, label: 'Plex Sync' });
    try {
      this.running = true;
      const userRepository = getRepository(User);
      const admin = await userRepository.findOne({
        select: ['id', 'plexToken'],
        order: { id: 'ASC' },
      });

      if (!admin) {
        return this.log('No admin configured. Plex sync skipped.', 'warn');
      }

      this.plexClient = new PlexAPI({ plexToken: admin.plexToken });

      this.libraries = settings.plex.libraries.filter(
        (library) => library.enabled
      );

      this.enable4kMovie = settings.radarr.some((radarr) => radarr.is4k);
      if (this.enable4kMovie) {
        this.log(
          'At least one 4K Radarr server was detected. 4K movie detection is now enabled',
          'info'
        );
      }

      this.enable4kShow = settings.sonarr.some((sonarr) => sonarr.is4k);
      if (this.enable4kShow) {
        this.log(
          'At least one 4K Sonarr server was detected. 4K series detection is now enabled',
          'info'
        );
      }

      const hasHama = await this.hasHamaAgent();
      if (hasHama) {
        await animeList.sync();
      }

      if (this.isRecentOnly) {
        for (const library of this.libraries) {
          this.currentLibrary = library;
          this.log(
            `Beginning to process recently added for library: ${library.name}`,
            'info'
          );
          const libraryItems = await this.plexClient.getRecentlyAdded(
            library.id
          );

          // Bundle items up by rating keys
          this.items = uniqWith(libraryItems, (mediaA, mediaB) => {
            if (mediaA.grandparentRatingKey && mediaB.grandparentRatingKey) {
              return (
                mediaA.grandparentRatingKey === mediaB.grandparentRatingKey
              );
            }

            if (mediaA.parentRatingKey && mediaB.parentRatingKey) {
              return mediaA.parentRatingKey === mediaB.parentRatingKey;
            }

            return mediaA.ratingKey === mediaB.ratingKey;
          });

          await this.loop({ sessionId });
        }
      } else {
        for (const library of this.libraries) {
          this.currentLibrary = library;
          this.log(`Beginning to process library: ${library.name}`, 'info');
          this.items = await this.plexClient.getLibraryContents(library.id);
          await this.loop({ sessionId });
        }
      }
      this.log(
        this.isRecentOnly
          ? 'Recently Added Scan Complete'
          : 'Full Scan Complete',
        'info'
      );
    } catch (e) {
      logger.error('Sync interrupted', {
        label: 'Plex Sync',
        errorMessage: e.message,
      });
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
      currentLibrary: this.currentLibrary,
      libraries: this.libraries,
    };
  }

  public cancel(): void {
    this.running = false;
  }
}

export const jobPlexFullSync = new JobPlexSync();
export const jobPlexRecentSync = new JobPlexSync({ isRecentOnly: true });
