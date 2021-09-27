import { EmailOptions } from 'email-templates';
import path from 'path';
import { getRepository } from 'typeorm';
import { Notification } from '..';
import { MediaType } from '../../../constants/media';
import { User } from '../../../entity/User';
import logger from '../../../logger';
import PreparedEmail from '../../email';
import { Permission } from '../../permissions';
import {
  getSettings,
  NotificationAgentEmail,
  NotificationAgentKey,
} from '../../settings';
import { BaseAgent, NotificationAgent, NotificationPayload } from './agent';

class EmailAgent
  extends BaseAgent<NotificationAgentEmail>
  implements NotificationAgent {
  protected getSettings(): NotificationAgentEmail {
    if (this.settings) {
      return this.settings;
    }

    const settings = getSettings();

    return settings.notifications.agents.email;
  }

  public shouldSend(): boolean {
    const settings = this.getSettings();

    if (
      settings.enabled &&
      settings.options.emailFrom &&
      settings.options.smtpHost &&
      settings.options.smtpPort
    ) {
      return true;
    }

    return false;
  }

  private buildMessage(
    type: Notification,
    payload: NotificationPayload,
    toEmail: string
  ): EmailOptions | undefined {
    const { applicationUrl, applicationTitle } = getSettings().main;

    if (type === Notification.TEST_NOTIFICATION) {
      return {
        template: path.join(__dirname, '../../../templates/email/test-email'),
        message: {
          to: toEmail,
        },
        locals: {
          body: payload.message,
          applicationUrl,
          applicationTitle,
        },
      };
    }

    if (payload.media) {
      let requestType = '';
      let body = '';

      switch (type) {
        case Notification.MEDIA_PENDING:
          requestType = `New ${
            payload.media?.mediaType === MediaType.TV ? 'Series' : 'Movie'
          } Request`;
          body = `A user has requested a new ${
            payload.media?.mediaType === MediaType.TV ? 'series' : 'movie'
          }!`;
          break;
        case Notification.MEDIA_APPROVED:
          requestType = `${
            payload.media?.mediaType === MediaType.TV ? 'Series' : 'Movie'
          } Request Approved`;
          body = `Your request for the following ${
            payload.media?.mediaType === MediaType.TV ? 'series' : 'movie'
          } has been approved:`;
          break;
        case Notification.MEDIA_AUTO_APPROVED:
          requestType = `${
            payload.media?.mediaType === MediaType.TV ? 'Series' : 'Movie'
          } Request Automatically Approved`;
          body = `A new request for the following ${
            payload.media?.mediaType === MediaType.TV ? 'series' : 'movie'
          } has been automatically approved:`;
          break;
        case Notification.MEDIA_AVAILABLE:
          requestType = `${
            payload.media?.mediaType === MediaType.TV ? 'Series' : 'Movie'
          } Now Available`;
          body = `The following ${
            payload.media?.mediaType === MediaType.TV ? 'series' : 'movie'
          } you requested is now available!`;
          break;
        case Notification.MEDIA_DECLINED:
          requestType = `${
            payload.media?.mediaType === MediaType.TV ? 'Series' : 'Movie'
          } Request Declined`;
          body = `Your request for the following ${
            payload.media?.mediaType === MediaType.TV ? 'series' : 'movie'
          } was declined:`;
          break;
        case Notification.MEDIA_FAILED:
          requestType = `Failed ${
            payload.media?.mediaType === MediaType.TV ? 'Series' : 'Movie'
          } Request`;
          body = `A new request for the following ${
            payload.media?.mediaType === MediaType.TV ? 'series' : 'movie'
          } could not be added to ${
            payload.media?.mediaType === MediaType.TV ? 'Sonarr' : 'Radarr'
          }:`;
          break;
      }

      return {
        template: path.join(
          __dirname,
          '../../../templates/email/media-request'
        ),
        message: {
          to: toEmail,
        },
        locals: {
          requestType,
          body,
          mediaName: payload.subject,
          mediaPlot: payload.message,
          mediaExtra: payload.extra ?? [],
          imageUrl: payload.image,
          timestamp: new Date().toTimeString(),
          requestedBy: payload.request?.requestedBy.displayName,
          actionUrl: applicationUrl
            ? `${applicationUrl}/${payload.media?.mediaType}/${payload.media?.tmdbId}`
            : undefined,
          applicationUrl,
          applicationTitle,
        },
      };
    }

    return undefined;
  }

  public async send(
    type: Notification,
    payload: NotificationPayload
  ): Promise<boolean> {
    if (payload.notifyUser) {
      // Send notification to the user who submitted the request
      if (
        !payload.notifyUser.settings ||
        // Check if user has email notifications enabled and fallback to true if undefined
        // since email should default to true
        (payload.notifyUser.settings.hasNotificationType(
          NotificationAgentKey.EMAIL,
          type
        ) ??
          true)
      ) {
        logger.debug('Sending email notification', {
          label: 'Notifications',
          recipient: payload.notifyUser.displayName,
          type: Notification[type],
          subject: payload.subject,
        });

        try {
          const email = new PreparedEmail(
            this.getSettings(),
            payload.notifyUser.settings?.pgpKey
          );
          await email.send(
            this.buildMessage(type, payload, payload.notifyUser.email)
          );
        } catch (e) {
          logger.error('Error sending email notification', {
            label: 'Notifications',
            recipient: payload.notifyUser.displayName,
            type: Notification[type],
            subject: payload.subject,
            errorMessage: e.message,
          });

          return false;
        }
      }
    } else {
      // Send notifications to all users with the Manage Requests permission
      const userRepository = getRepository(User);
      const users = await userRepository.find();

      await Promise.all(
        users
          .filter(
            (user) =>
              user.hasPermission(Permission.MANAGE_REQUESTS) &&
              (!user.settings ||
                // Check if user has email notifications enabled and fallback to true if undefined
                // since email should default to true
                (user.settings.hasNotificationType(
                  NotificationAgentKey.EMAIL,
                  type
                ) ??
                  true)) &&
              // Check if it's the user's own auto-approved request
              (type !== Notification.MEDIA_AUTO_APPROVED ||
                user.id !== payload.request?.requestedBy.id)
          )
          .map(async (user) => {
            logger.debug('Sending email notification', {
              label: 'Notifications',
              recipient: user.displayName,
              type: Notification[type],
              subject: payload.subject,
            });

            try {
              const email = new PreparedEmail(
                this.getSettings(),
                user.settings?.pgpKey
              );
              await email.send(this.buildMessage(type, payload, user.email));
            } catch (e) {
              logger.error('Error sending email notification', {
                label: 'Notifications',
                recipient: user.displayName,
                type: Notification[type],
                subject: payload.subject,
                errorMessage: e.message,
              });

              return false;
            }
          })
      );
    }

    return true;
  }
}

export default EmailAgent;
