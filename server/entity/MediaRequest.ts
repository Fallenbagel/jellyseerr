import { isEqual, truncate } from 'lodash';
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  CreateDateColumn,
  Entity,
  getRepository,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationCount,
  UpdateDateColumn,
} from 'typeorm';
import RadarrAPI, { RadarrMovieOptions } from '../api/servarr/radarr';
import SonarrAPI, {
  AddSeriesOptions,
  SonarrSeries,
} from '../api/servarr/sonarr';
import TheMovieDb from '../api/themoviedb';
import { ANIME_KEYWORD_ID } from '../api/themoviedb/constants';
import { MediaRequestStatus, MediaStatus, MediaType } from '../constants/media';
import notificationManager, { Notification } from '../lib/notifications';
import { getSettings } from '../lib/settings';
import logger from '../logger';
import Media from './Media';
import SeasonRequest from './SeasonRequest';
import { User } from './User';

@Entity()
export class MediaRequest {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'integer' })
  public status: MediaRequestStatus;

  @ManyToOne(() => Media, (media) => media.requests, {
    eager: true,
    onDelete: 'CASCADE',
  })
  public media: Media;

  @ManyToOne(() => User, (user) => user.requests, {
    eager: true,
    onDelete: 'CASCADE',
  })
  public requestedBy: User;

  @ManyToOne(() => User, {
    nullable: true,
    cascade: true,
    eager: true,
    onDelete: 'SET NULL',
  })
  public modifiedBy?: User;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @Column({ type: 'varchar' })
  public type: MediaType;

  @RelationCount((request: MediaRequest) => request.seasons)
  public seasonCount: number;

  @OneToMany(() => SeasonRequest, (season) => season.request, {
    eager: true,
    cascade: true,
  })
  public seasons: SeasonRequest[];

  @Column({ default: false })
  public is4k: boolean;

  @Column({ nullable: true })
  public serverId: number;

  @Column({ nullable: true })
  public profileId: number;

  @Column({ nullable: true })
  public rootFolder: string;

  @Column({ nullable: true })
  public languageProfileId: number;

  @Column({
    type: 'text',
    nullable: true,
    transformer: {
      from: (value: string | null): number[] | null => {
        if (value) {
          if (value === 'none') {
            return [];
          }
          return value.split(',').map((v) => Number(v));
        }
        return null;
      },
      to: (value: number[] | null): string | null => {
        if (value) {
          const finalValue = value.join(',');

          // We want to keep the actual state of an "empty array" so we use
          // the keyword "none" to track this.
          if (!finalValue) {
            return 'none';
          }

          return finalValue;
        }
        return null;
      },
    },
  })
  public tags?: number[];

  constructor(init?: Partial<MediaRequest>) {
    Object.assign(this, init);
  }

  @AfterUpdate()
  @AfterInsert()
  public async sendMedia(): Promise<void> {
    await Promise.all([this.sendToRadarr(), this.sendToSonarr()]);
  }

  @AfterInsert()
  public async notifyNewRequest(): Promise<void> {
    if (this.status === MediaRequestStatus.PENDING) {
      const mediaRepository = getRepository(Media);
      const media = await mediaRepository.findOne({
        where: { id: this.media.id },
      });
      if (!media) {
        logger.error('Media data not found', {
          label: 'Media Request',
          requestId: this.id,
          mediaId: this.media.id,
        });
        return;
      }

      this.sendNotification(media, Notification.MEDIA_PENDING);
    }
  }

  /**
   * Notification for approval
   *
   * We only check on AfterUpdate as to not trigger this for
   * auto approved content
   */
  @AfterUpdate()
  public async notifyApprovedOrDeclined(autoApproved = false): Promise<void> {
    if (
      this.status === MediaRequestStatus.APPROVED ||
      this.status === MediaRequestStatus.DECLINED
    ) {
      const mediaRepository = getRepository(Media);
      const media = await mediaRepository.findOne({
        where: { id: this.media.id },
      });
      if (!media) {
        logger.error('Media data not found', {
          label: 'Media Request',
          requestId: this.id,
          mediaId: this.media.id,
        });
        return;
      }

      if (media[this.is4k ? 'status4k' : 'status'] === MediaStatus.AVAILABLE) {
        logger.warn(
          'Media became available before request was approved. Skipping approval notification',
          { label: 'Media Request', requestId: this.id, mediaId: this.media.id }
        );
        return;
      }

      this.sendNotification(
        media,
        this.status === MediaRequestStatus.APPROVED
          ? autoApproved
            ? Notification.MEDIA_AUTO_APPROVED
            : Notification.MEDIA_APPROVED
          : Notification.MEDIA_DECLINED
      );
    }
  }

  @AfterInsert()
  public async autoapprovalNotification(): Promise<void> {
    if (this.status === MediaRequestStatus.APPROVED) {
      this.notifyApprovedOrDeclined(true);
    }
  }

  @AfterUpdate()
  @AfterInsert()
  public async updateParentStatus(): Promise<void> {
    const mediaRepository = getRepository(Media);
    const media = await mediaRepository.findOne({
      where: { id: this.media.id },
      relations: ['requests'],
    });
    if (!media) {
      logger.error('Media data not found', {
        label: 'Media Request',
        requestId: this.id,
        mediaId: this.media.id,
      });
      return;
    }
    const seasonRequestRepository = getRepository(SeasonRequest);
    if (
      this.status === MediaRequestStatus.APPROVED &&
      // Do not update the status if the item is already partially available or available
      media[this.is4k ? 'status4k' : 'status'] !== MediaStatus.AVAILABLE &&
      media[this.is4k ? 'status4k' : 'status'] !==
        MediaStatus.PARTIALLY_AVAILABLE
    ) {
      media[this.is4k ? 'status4k' : 'status'] = MediaStatus.PROCESSING;
      mediaRepository.save(media);
    }

    if (
      media.mediaType === MediaType.MOVIE &&
      this.status === MediaRequestStatus.DECLINED
    ) {
      media[this.is4k ? 'status4k' : 'status'] = MediaStatus.UNKNOWN;
      mediaRepository.save(media);
    }

    /**
     * If the media type is TV, and we are declining a request,
     * we must check if its the only pending request and that
     * there the current media status is just pending (meaning no
     * other requests have yet to be approved)
     */
    if (
      media.mediaType === MediaType.TV &&
      this.status === MediaRequestStatus.DECLINED &&
      media.requests.filter(
        (request) => request.status === MediaRequestStatus.PENDING
      ).length === 0 &&
      media[this.is4k ? 'status4k' : 'status'] === MediaStatus.PENDING
    ) {
      media[this.is4k ? 'status4k' : 'status'] = MediaStatus.UNKNOWN;
      mediaRepository.save(media);
    }

    // Approve child seasons if parent is approved
    if (
      media.mediaType === MediaType.TV &&
      this.status === MediaRequestStatus.APPROVED
    ) {
      this.seasons.forEach((season) => {
        season.status = MediaRequestStatus.APPROVED;
        seasonRequestRepository.save(season);
      });
    }
  }

  @AfterRemove()
  public async handleRemoveParentUpdate(): Promise<void> {
    const mediaRepository = getRepository(Media);
    const fullMedia = await mediaRepository.findOneOrFail({
      where: { id: this.media.id },
      relations: ['requests'],
    });

    if (
      !fullMedia.requests.some((request) => !request.is4k) &&
      fullMedia.status !== MediaStatus.AVAILABLE
    ) {
      fullMedia.status = MediaStatus.UNKNOWN;
    }

    if (
      !fullMedia.requests.some((request) => request.is4k) &&
      fullMedia.status4k !== MediaStatus.AVAILABLE
    ) {
      fullMedia.status4k = MediaStatus.UNKNOWN;
    }

    mediaRepository.save(fullMedia);
  }

  public async sendToRadarr(): Promise<void> {
    if (
      this.status === MediaRequestStatus.APPROVED &&
      this.type === MediaType.MOVIE
    ) {
      try {
        const mediaRepository = getRepository(Media);
        const settings = getSettings();
        if (settings.radarr.length === 0 && !settings.radarr[0]) {
          logger.info(
            'No Radarr server configured, skipping request processing',
            {
              label: 'Media Request',
              requestId: this.id,
              mediaId: this.media.id,
            }
          );
          return;
        }

        let radarrSettings = settings.radarr.find(
          (radarr) => radarr.isDefault && radarr.is4k === this.is4k
        );

        if (
          this.serverId !== null &&
          this.serverId >= 0 &&
          radarrSettings?.id !== this.serverId
        ) {
          radarrSettings = settings.radarr.find(
            (radarr) => radarr.id === this.serverId
          );
          logger.info(
            `Request has an override server: ${radarrSettings?.name}`,
            {
              label: 'Media Request',
              requestId: this.id,
              mediaId: this.media.id,
            }
          );
        }

        if (!radarrSettings) {
          logger.warn(
            `There is no default ${
              this.is4k ? '4K ' : ''
            }Radarr server configured. Did you set any of your ${
              this.is4k ? '4K ' : ''
            }Radarr servers as default?`,
            {
              label: 'Media Request',
              requestId: this.id,
              mediaId: this.media.id,
            }
          );
          return;
        }

        let rootFolder = radarrSettings.activeDirectory;
        let qualityProfile = radarrSettings.activeProfileId;
        let tags = radarrSettings.tags;

        if (
          this.rootFolder &&
          this.rootFolder !== '' &&
          this.rootFolder !== radarrSettings.activeDirectory
        ) {
          rootFolder = this.rootFolder;
          logger.info(`Request has an override root folder: ${rootFolder}`, {
            label: 'Media Request',
            requestId: this.id,
            mediaId: this.media.id,
          });
        }

        if (
          this.profileId &&
          this.profileId !== radarrSettings.activeProfileId
        ) {
          qualityProfile = this.profileId;
          logger.info(
            `Request has an override quality profile ID: ${qualityProfile}`,
            {
              label: 'Media Request',
              requestId: this.id,
              mediaId: this.media.id,
            }
          );
        }

        if (this.tags && !isEqual(this.tags, radarrSettings.tags)) {
          tags = this.tags;
          logger.info(`Request has override tags`, {
            label: 'Media Request',
            requestId: this.id,
            mediaId: this.media.id,
            tagIds: tags,
          });
        }

        const tmdb = new TheMovieDb();
        const radarr = new RadarrAPI({
          apiKey: radarrSettings.apiKey,
          url: RadarrAPI.buildUrl(radarrSettings, '/api/v3'),
        });
        const movie = await tmdb.getMovie({ movieId: this.media.tmdbId });

        const media = await mediaRepository.findOne({
          where: { id: this.media.id },
        });

        if (!media) {
          logger.error('Media data not found', {
            label: 'Media Request',
            requestId: this.id,
            mediaId: this.media.id,
          });
          return;
        }

        if (
          media[this.is4k ? 'status4k' : 'status'] === MediaStatus.AVAILABLE
        ) {
          throw new Error('Media already available');
        }

        const radarrMovieOptions: RadarrMovieOptions = {
          profileId: qualityProfile,
          qualityProfileId: qualityProfile,
          rootFolderPath: rootFolder,
          minimumAvailability: radarrSettings.minimumAvailability,
          title: movie.title,
          tmdbId: movie.id,
          year: Number(movie.release_date.slice(0, 4)),
          monitored: true,
          tags,
          searchNow: !radarrSettings.preventSearch,
        };

        // Run this asynchronously so we don't wait for it on the UI side
        radarr
          .addMovie(radarrMovieOptions)
          .then(async (radarrMovie) => {
            // We grab media again here to make sure we have the latest version of it
            const media = await mediaRepository.findOne({
              where: { id: this.media.id },
            });

            if (!media) {
              throw new Error('Media data not found');
            }

            media[this.is4k ? 'externalServiceId4k' : 'externalServiceId'] =
              radarrMovie.id;
            media[this.is4k ? 'externalServiceSlug4k' : 'externalServiceSlug'] =
              radarrMovie.titleSlug;
            media[this.is4k ? 'serviceId4k' : 'serviceId'] = radarrSettings?.id;
            await mediaRepository.save(media);
          })
          .catch(async () => {
            media[this.is4k ? 'status4k' : 'status'] = MediaStatus.UNKNOWN;
            await mediaRepository.save(media);
            logger.warn(
              'Something went wrong sending movie request to Radarr, marking status as UNKNOWN',
              {
                label: 'Media Request',
                requestId: this.id,
                mediaId: this.media.id,
                radarrMovieOptions,
              }
            );

            this.sendNotification(media, Notification.MEDIA_FAILED);
          });
        logger.info('Sent request to Radarr', {
          label: 'Media Request',
          requestId: this.id,
          mediaId: this.media.id,
        });
      } catch (e) {
        logger.error('Something went wrong sending request to Radarr', {
          label: 'Media Request',
          errorMessage: e.message,
          requestId: this.id,
          mediaId: this.media.id,
        });
        throw new Error(e.message);
      }
    }
  }

  public async sendToSonarr(): Promise<void> {
    if (
      this.status === MediaRequestStatus.APPROVED &&
      this.type === MediaType.TV
    ) {
      try {
        const mediaRepository = getRepository(Media);
        const settings = getSettings();
        if (settings.sonarr.length === 0 && !settings.sonarr[0]) {
          logger.warn(
            'No Sonarr server configured, skipping request processing',
            {
              label: 'Media Request',
              requestId: this.id,
              mediaId: this.media.id,
            }
          );
          return;
        }

        let sonarrSettings = settings.sonarr.find(
          (sonarr) => sonarr.isDefault && sonarr.is4k === this.is4k
        );

        if (
          this.serverId !== null &&
          this.serverId >= 0 &&
          sonarrSettings?.id !== this.serverId
        ) {
          sonarrSettings = settings.sonarr.find(
            (sonarr) => sonarr.id === this.serverId
          );
          logger.info(
            `Request has an override server: ${sonarrSettings?.name}`,
            {
              label: 'Media Request',
              requestId: this.id,
              mediaId: this.media.id,
            }
          );
        }

        if (!sonarrSettings) {
          logger.warn(
            `There is no default ${
              this.is4k ? '4K ' : ''
            }Sonarr server configured. Did you set any of your ${
              this.is4k ? '4K ' : ''
            }Sonarr servers as default?`,
            {
              label: 'Media Request',
              requestId: this.id,
              mediaId: this.media.id,
            }
          );
          return;
        }

        const media = await mediaRepository.findOne({
          where: { id: this.media.id },
          relations: ['requests'],
        });

        if (!media) {
          throw new Error('Media data not found');
        }

        if (
          media[this.is4k ? 'status4k' : 'status'] === MediaStatus.AVAILABLE
        ) {
          throw new Error('Media already available');
        }

        const tmdb = new TheMovieDb();
        const sonarr = new SonarrAPI({
          apiKey: sonarrSettings.apiKey,
          url: SonarrAPI.buildUrl(sonarrSettings, '/api/v3'),
        });
        const series = await tmdb.getTvShow({ tvId: media.tmdbId });
        const tvdbId = series.external_ids.tvdb_id ?? media.tvdbId;

        if (!tvdbId) {
          const requestRepository = getRepository(MediaRequest);
          await mediaRepository.remove(media);
          await requestRepository.remove(this);
          throw new Error('TVDB ID not found');
        }

        let seriesType: SonarrSeries['seriesType'] = 'standard';

        // Change series type to anime if the anime keyword is present on tmdb
        if (
          series.keywords.results.some(
            (keyword) => keyword.id === ANIME_KEYWORD_ID
          )
        ) {
          seriesType = 'anime';
        }

        let rootFolder =
          seriesType === 'anime' && sonarrSettings.activeAnimeDirectory
            ? sonarrSettings.activeAnimeDirectory
            : sonarrSettings.activeDirectory;
        let qualityProfile =
          seriesType === 'anime' && sonarrSettings.activeAnimeProfileId
            ? sonarrSettings.activeAnimeProfileId
            : sonarrSettings.activeProfileId;
        let languageProfile =
          seriesType === 'anime' && sonarrSettings.activeAnimeLanguageProfileId
            ? sonarrSettings.activeAnimeLanguageProfileId
            : sonarrSettings.activeLanguageProfileId;
        let tags =
          seriesType === 'anime'
            ? sonarrSettings.animeTags
            : sonarrSettings.tags;

        if (
          this.rootFolder &&
          this.rootFolder !== '' &&
          this.rootFolder !== rootFolder
        ) {
          rootFolder = this.rootFolder;
          logger.info(`Request has an override root folder: ${rootFolder}`, {
            label: 'Media Request',
            requestId: this.id,
            mediaId: this.media.id,
          });
        }

        if (this.profileId && this.profileId !== qualityProfile) {
          qualityProfile = this.profileId;
          logger.info(
            `Request has an override quality profile ID: ${qualityProfile}`,
            {
              label: 'Media Request',
              requestId: this.id,
              mediaId: this.media.id,
            }
          );
        }

        if (
          this.languageProfileId &&
          this.languageProfileId !== languageProfile
        ) {
          languageProfile = this.languageProfileId;
          logger.info(
            `Request has an override language profile ID: ${languageProfile}`,
            {
              label: 'Media Request',
              requestId: this.id,
              mediaId: this.media.id,
            }
          );
        }

        if (this.tags && !isEqual(this.tags, tags)) {
          tags = this.tags;
          logger.info(`Request has override tags`, {
            label: 'Media Request',
            requestId: this.id,
            mediaId: this.media.id,
            tagIds: tags,
          });
        }

        const sonarrSeriesOptions: AddSeriesOptions = {
          profileId: qualityProfile,
          languageProfileId: languageProfile,
          rootFolderPath: rootFolder,
          title: series.name,
          tvdbid: tvdbId,
          seasons: this.seasons.map((season) => season.seasonNumber),
          seasonFolder: sonarrSettings.enableSeasonFolders,
          seriesType,
          tags,
          monitored: true,
          searchNow: !sonarrSettings.preventSearch,
        };

        // Run this asynchronously so we don't wait for it on the UI side
        sonarr
          .addSeries(sonarrSeriesOptions)
          .then(async (sonarrSeries) => {
            // We grab media again here to make sure we have the latest version of it
            const media = await mediaRepository.findOne({
              where: { id: this.media.id },
              relations: ['requests'],
            });

            if (!media) {
              throw new Error('Media data not found');
            }

            media[this.is4k ? 'externalServiceId4k' : 'externalServiceId'] =
              sonarrSeries.id;
            media[this.is4k ? 'externalServiceSlug4k' : 'externalServiceSlug'] =
              sonarrSeries.titleSlug;
            media[this.is4k ? 'serviceId4k' : 'serviceId'] = sonarrSettings?.id;
            await mediaRepository.save(media);
          })
          .catch(async () => {
            media[this.is4k ? 'status4k' : 'status'] = MediaStatus.UNKNOWN;
            await mediaRepository.save(media);
            logger.warn(
              'Something went wrong sending series request to Sonarr, marking status as UNKNOWN',
              {
                label: 'Media Request',
                requestId: this.id,
                mediaId: this.media.id,
                sonarrSeriesOptions,
              }
            );

            this.sendNotification(media, Notification.MEDIA_FAILED);
          });
        logger.info('Sent request to Sonarr', {
          label: 'Media Request',
          requestId: this.id,
          mediaId: this.media.id,
        });
      } catch (e) {
        logger.error('Something went wrong sending request to Sonarr', {
          label: 'Media Request',
          errorMessage: e.message,
          requestId: this.id,
          mediaId: this.media.id,
        });
        throw new Error(e.message);
      }
    }
  }

  private async sendNotification(media: Media, type: Notification) {
    const tmdb = new TheMovieDb();

    try {
      const mediaType = this.type === MediaType.MOVIE ? 'Movie' : 'Series';
      let event: string | undefined;
      let notifyAdmin = true;

      switch (type) {
        case Notification.MEDIA_APPROVED:
          event = `${this.is4k ? '4K ' : ''}${mediaType} Request Approved`;
          notifyAdmin = false;
          break;
        case Notification.MEDIA_DECLINED:
          event = `${this.is4k ? '4K ' : ''}${mediaType} Request Declined`;
          notifyAdmin = false;
          break;
        case Notification.MEDIA_PENDING:
          event = `New ${this.is4k ? '4K ' : ''}${mediaType} Request`;
          break;
        case Notification.MEDIA_AUTO_APPROVED:
          event = `${
            this.is4k ? '4K ' : ''
          }${mediaType} Request Automatically Approved`;
          break;
        case Notification.MEDIA_FAILED:
          event = `${this.is4k ? '4K ' : ''}${mediaType} Request Failed`;
          break;
      }

      if (this.type === MediaType.MOVIE) {
        const movie = await tmdb.getMovie({ movieId: media.tmdbId });
        notificationManager.sendNotification(type, {
          media,
          request: this,
          notifyAdmin,
          notifyUser: notifyAdmin ? undefined : this.requestedBy,
          event,
          subject: `${movie.title}${
            movie.release_date ? ` (${movie.release_date.slice(0, 4)})` : ''
          }`,
          message: truncate(movie.overview, {
            length: 500,
            separator: /\s/,
            omission: '…',
          }),
          image: `https://image.tmdb.org/t/p/w600_and_h900_bestv2${movie.poster_path}`,
        });
      } else if (this.type === MediaType.TV) {
        const tv = await tmdb.getTvShow({ tvId: media.tmdbId });
        notificationManager.sendNotification(type, {
          media,
          request: this,
          notifyAdmin,
          notifyUser: notifyAdmin ? undefined : this.requestedBy,
          event,
          subject: `${tv.name}${
            tv.first_air_date ? ` (${tv.first_air_date.slice(0, 4)})` : ''
          }`,
          message: truncate(tv.overview, {
            length: 500,
            separator: /\s/,
            omission: '…',
          }),
          image: `https://image.tmdb.org/t/p/w600_and_h900_bestv2${tv.poster_path}`,
          extra: [
            {
              name: 'Requested Seasons',
              value: this.seasons
                .map((season) => season.seasonNumber)
                .join(', '),
            },
          ],
        });
      }
    } catch (e) {
      logger.error('Something went wrong sending media notification(s)', {
        label: 'Notifications',
        errorMessage: e.message,
        requestId: this.id,
        mediaId: this.media.id,
      });
    }
  }
}
