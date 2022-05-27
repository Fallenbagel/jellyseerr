import { getRepository } from 'typeorm';
import { MediaRequestStatus, MediaStatus } from '../constants/media';
import { MediaRequest } from '../entity/MediaRequest';
import logger from '../logger';

class requestCleanup {
  public removeAvailable() {
    this.removeAvailableRequests();
  }

  private async deleteRequest(requestId: any) {
    const requestRepository = getRepository(MediaRequest);

    try {
      const request = await requestRepository.findOneOrFail({
        where: { id: Number(requestId) },
      });

      await requestRepository.remove(request);
    } catch (e) {
      logger.error('Something went wrong deleting a request.', {
        label: 'Jobs',
        errorMessage: e.message,
      });
    }
  }

  private async removeAvailableRequests() {
    const requestRepository = getRepository(MediaRequest);

    try {
      const query = requestRepository
        .createQueryBuilder('request')
        .leftJoinAndSelect('request.media', 'media');

      const Requests = await query
        .where('request.status = :requestStatus', {
          requestStatus: MediaRequestStatus.APPROVED,
        })
        .andWhere(
          '((request.is4k = false AND media.status = :availableStatus) OR (request.is4k = true AND media.status4k = :availableStatus))',
          {
            availableStatus: MediaStatus.AVAILABLE,
          }
        )
        .andWhere("date(request.updatedAt,'+2 day') <= datetime('now')")
        .getMany();

      for (const request of Requests) {
        this.deleteRequest(request.id);
      }
    } catch (error) {
      logger.error('Something went wrong retrieving request counts', {
        label: 'requestCleanup',
        errorMessage: error.message,
      });
    }
  }
}

const requestCleanupJob = new requestCleanup();

export default requestCleanupJob;
