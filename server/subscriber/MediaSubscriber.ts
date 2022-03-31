import {
  EntitySubscriberInterface,
  EventSubscriber,
  getRepository,
  UpdateEvent,
} from 'typeorm';
import TheMovieDb from '../api/themoviedb';
import { MediaRequestStatus, MediaStatus, MediaType } from '../constants/media';
import Media from '../entity/Media';
import { MediaRequest } from '../entity/MediaRequest';
import Season from '../entity/Season';
import notificationManager, { Notification } from '../lib/notifications';

@EventSubscriber()
export class MediaSubscriber implements EntitySubscriberInterface {
  private async notifyAvailableMovie(entity: Media, dbEntity?: Media) {
    if (
      entity.status === MediaStatus.AVAILABLE &&
      dbEntity?.status !== MediaStatus.AVAILABLE
    ) {
      if (entity.mediaType === MediaType.MOVIE) {
        const requestRepository = getRepository(MediaRequest);
        const relatedRequests = await requestRepository.find({
          where: { media: entity, is4k: false },
        });

        if (relatedRequests.length > 0) {
          const tmdb = new TheMovieDb();
          const movie = await tmdb.getMovie({ movieId: entity.tmdbId });

          relatedRequests.forEach((request) => {
            notificationManager.sendNotification(Notification.MEDIA_AVAILABLE, {
              notifyUser: request.requestedBy,
              subject: movie.title,
              message: movie.overview,
              media: entity,
              image: `https://image.tmdb.org/t/p/w600_and_h900_bestv2${movie.poster_path}`,
              request: request,
            });
          });
        }
      }
    }
  }

  private async notifyAvailableSeries(entity: Media, dbEntity: Media) {
    const seasonRepository = getRepository(Season);
    const newAvailableSeasons = entity.seasons
      .filter((season) => season.status === MediaStatus.AVAILABLE)
      .map((season) => season.seasonNumber);
    const oldSeasonIds = dbEntity.seasons.map((season) => season.id);
    const oldSeasons = await seasonRepository.findByIds(oldSeasonIds);
    const oldAvailableSeasons = oldSeasons
      .filter((season) => season.status === MediaStatus.AVAILABLE)
      .map((season) => season.seasonNumber);

    const changedSeasons = newAvailableSeasons.filter(
      (seasonNumber) => !oldAvailableSeasons.includes(seasonNumber)
    );

    if (changedSeasons.length > 0) {
      const tmdb = new TheMovieDb();
      const requestRepository = getRepository(MediaRequest);
      const processedSeasons: number[] = [];

      for (const changedSeasonNumber of changedSeasons) {
        const requests = await requestRepository.find({
          where: { media: entity, is4k: false },
        });
        const request = requests.find(
          (request) =>
            // Check if the season is complete AND it contains the current season that was just marked available
            request.seasons.every((season) =>
              newAvailableSeasons.includes(season.seasonNumber)
            ) &&
            request.seasons.some(
              (season) => season.seasonNumber === changedSeasonNumber
            )
        );

        if (request && !processedSeasons.includes(changedSeasonNumber)) {
          processedSeasons.push(
            ...request.seasons.map((season) => season.seasonNumber)
          );
          const tv = await tmdb.getTvShow({ tvId: entity.tmdbId });
          notificationManager.sendNotification(Notification.MEDIA_AVAILABLE, {
            subject: tv.name,
            message: tv.overview,
            notifyUser: request.requestedBy,
            image: `https://image.tmdb.org/t/p/w600_and_h900_bestv2${tv.poster_path}`,
            media: entity,
            extra: [
              {
                name: 'Seasons',
                value: request.seasons
                  .map((season) => season.seasonNumber)
                  .join(', '),
              },
            ],
            request: request,
          });
        }
      }
    }
  }

  private async updateChildRequestStatus(event: Media, is4k: boolean) {
    const requestRepository = getRepository(MediaRequest);

    const requests = await requestRepository.find({
      where: { media: event.id },
    });

    for (const request of requests) {
      if (
        request.is4k === is4k &&
        request.status === MediaRequestStatus.PENDING
      ) {
        request.status = MediaRequestStatus.APPROVED;
        await requestRepository.save(request);
      }
    }
  }

  public beforeUpdate(event: UpdateEvent<Media>): void {
    if (!event.entity) {
      return;
    }

    if (
      event.entity.mediaType === MediaType.MOVIE &&
      event.entity.status === MediaStatus.AVAILABLE
    ) {
      this.notifyAvailableMovie(event.entity, event.databaseEntity);
    }

    if (
      event.entity.mediaType === MediaType.TV &&
      (event.entity.status === MediaStatus.AVAILABLE ||
        event.entity.status === MediaStatus.PARTIALLY_AVAILABLE)
    ) {
      this.notifyAvailableSeries(event.entity, event.databaseEntity);
    }

    if (
      event.entity.status === MediaStatus.AVAILABLE &&
      event.databaseEntity.status === MediaStatus.PENDING
    ) {
      this.updateChildRequestStatus(event.entity, false);
    }

    if (
      event.entity.status4k === MediaStatus.AVAILABLE &&
      event.databaseEntity.status4k === MediaStatus.PENDING
    ) {
      this.updateChildRequestStatus(event.entity, true);
    }
  }
}
