import { IssueType, IssueTypeName } from '@server/constants/issue';
import { MediaType } from '@server/constants/media';
import { getRepository } from '@server/datasource';
import { User } from '@server/entity/User';
import { UserPushSubscription } from '@server/entity/UserPushSubscription';
import type { NotificationAgentConfig } from '@server/lib/settings';
import { getSettings, NotificationAgentKey } from '@server/lib/settings';
import logger from '@server/logger';
import webpush from 'web-push';
import { Notification, shouldSendAdminNotification } from '..';
import type { NotificationAgent, NotificationPayload } from './agent';
import { BaseAgent } from './agent';

interface PushNotificationPayload {
  notificationType: string;
  subject: string;
  message?: string;
  image?: string;
  actionUrl?: string;
  actionUrlTitle?: string;
  requestId?: number;
}

class WebPushAgent
  extends BaseAgent<NotificationAgentConfig>
  implements NotificationAgent
{
  protected getSettings(): NotificationAgentConfig {
    if (this.settings) {
      return this.settings;
    }

    const settings = getSettings();

    return settings.notifications.agents.webpush;
  }

  private getNotificationPayload(
    type: Notification,
    payload: NotificationPayload
  ): PushNotificationPayload {
    const mediaType = payload.media
      ? payload.media.mediaType === MediaType.MOVIE
        ? 'movie'
        : 'series'
      : undefined;
    const is4k = payload.request?.is4k;

    const issueType = payload.issue
      ? payload.issue.issueType !== IssueType.OTHER
        ? `${IssueTypeName[payload.issue.issueType].toLowerCase()} issue`
        : 'issue'
      : undefined;

    let message: string | undefined;
    switch (type) {
      case Notification.TEST_NOTIFICATION:
        message = payload.message;
        break;
      case Notification.MEDIA_AUTO_REQUESTED:
        message = `Automatically submitted a new ${
          is4k ? '4K ' : ''
        }${mediaType} request.`;
        break;
      case Notification.MEDIA_APPROVED:
        message = `Your ${
          is4k ? '4K ' : ''
        }${mediaType} request has been approved.`;
        break;
      case Notification.MEDIA_AUTO_APPROVED:
        message = `Automatically approved a new ${
          is4k ? '4K ' : ''
        }${mediaType} request from ${
          payload.request?.requestedBy.displayName
        }.`;
        break;
      case Notification.MEDIA_AVAILABLE:
        message = `Your ${
          is4k ? '4K ' : ''
        }${mediaType} request is now available!`;
        break;
      case Notification.MEDIA_DECLINED:
        message = `Your ${is4k ? '4K ' : ''}${mediaType} request was declined.`;
        break;
      case Notification.MEDIA_FAILED:
        message = `Failed to process ${is4k ? '4K ' : ''}${mediaType} request.`;
        break;
      case Notification.MEDIA_PENDING:
        message = `Approval required for a new ${
          is4k ? '4K ' : ''
        }${mediaType} request from ${
          payload.request?.requestedBy.displayName
        }.`;
        break;
      case Notification.ISSUE_CREATED:
        message = `A new ${issueType} was reported by ${payload.issue?.createdBy.displayName}.`;
        break;
      case Notification.ISSUE_COMMENT:
        message = `${payload.comment?.user.displayName} commented on the ${issueType}.`;
        break;
      case Notification.ISSUE_RESOLVED:
        message = `The ${issueType} was marked as resolved by ${payload.issue?.modifiedBy?.displayName}!`;
        break;
      case Notification.ISSUE_REOPENED:
        message = `The ${issueType} was reopened by ${payload.issue?.modifiedBy?.displayName}.`;
        break;
      default:
        return {
          notificationType: Notification[type],
          subject: 'Unknown',
        };
    }

    const actionUrl = payload.issue
      ? `/issues/${payload.issue.id}`
      : payload.media
      ? `/${payload.media.mediaType}/${payload.media.tmdbId}`
      : undefined;

    const actionUrlTitle = actionUrl
      ? `View ${payload.issue ? 'Issue' : 'Media'}`
      : undefined;

    return {
      notificationType: Notification[type],
      subject: payload.subject,
      message,
      image: payload.image,
      requestId: payload.request?.id,
      actionUrl,
      actionUrlTitle,
    };
  }

  public shouldSend(): boolean {
    if (this.getSettings().enabled) {
      return true;
    }

    return false;
  }

  public async send(
    type: Notification,
    payload: NotificationPayload
  ): Promise<boolean> {
    const userRepository = getRepository(User);
    const userPushSubRepository = getRepository(UserPushSubscription);
    const settings = getSettings();

    const pushSubs: UserPushSubscription[] = [];

    const mainUser = await userRepository.findOne({ where: { id: 1 } });

    if (
      payload.notifyUser &&
      // Check if user has webpush notifications enabled and fallback to true if undefined
      // since web push should default to true
      (payload.notifyUser.settings?.hasNotificationType(
        NotificationAgentKey.WEBPUSH,
        type
      ) ??
        true)
    ) {
      const notifySubs = await userPushSubRepository.find({
        where: { user: { id: payload.notifyUser.id } },
      });

      pushSubs.push(...notifySubs);
    }

    if (payload.notifyAdmin) {
      const users = await userRepository.find();

      const manageUsers = users.filter(
        (user) =>
          // Check if user has webpush notifications enabled and fallback to true if undefined
          // since web push should default to true
          (user.settings?.hasNotificationType(
            NotificationAgentKey.WEBPUSH,
            type
          ) ??
            true) &&
          shouldSendAdminNotification(type, user, payload)
      );

      const allSubs = await userPushSubRepository
        .createQueryBuilder('pushSub')
        .leftJoinAndSelect('pushSub.user', 'user')
        .where('pushSub.userId IN (:users)', {
          users: manageUsers.map((user) => user.id),
        })
        .getMany();

      pushSubs.push(...allSubs);
    }

    if (mainUser && pushSubs.length > 0) {
      webpush.setVapidDetails(
        `mailto:${mainUser.email}`,
        settings.vapidPublic,
        settings.vapidPrivate
      );

      const notificationPayload = Buffer.from(
        JSON.stringify(this.getNotificationPayload(type, payload)),
        'utf-8'
      );

      await Promise.all(
        pushSubs.map(async (sub) => {
          logger.debug('Sending web push notification', {
            label: 'Notifications',
            recipient: sub.user.displayName,
            type: Notification[type],
            subject: payload.subject,
          });

          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: {
                  auth: sub.auth,
                  p256dh: sub.p256dh,
                },
              },
              notificationPayload
            );
          } catch (e) {
            logger.error(
              'Error sending web push notification; removing subscription',
              {
                label: 'Notifications',
                recipient: sub.user.displayName,
                type: Notification[type],
                subject: payload.subject,
                errorMessage: e.message,
              }
            );

            // Failed to send notification so we need to remove the subscription
            userPushSubRepository.remove(sub);
          }
        })
      );
    }

    return true;
  }
}

export default WebPushAgent;
