import { BaseAgent, NotificationAgent, NotificationPayload } from './agent';
import { hasNotificationType, Notification } from '..';
import path from 'path';
import { getSettings, NotificationAgentEmail } from '../../settings';
import logger from '../../../logger';
import { getRepository } from 'typeorm';
import { User } from '../../../entity/User';
import { Permission } from '../../permissions';
import PreparedEmail from '../../email';

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

  public shouldSend(type: Notification, payload: NotificationPayload): boolean {
    const settings = this.getSettings();

    if (
      settings.enabled &&
      hasNotificationType(type, this.getSettings().types) &&
      (payload.notifyUser.settings?.enableNotifications ?? true)
    ) {
      return true;
    }

    return false;
  }

  private async sendMediaRequestEmail(payload: NotificationPayload) {
    // This is getting main settings for the whole app
    const { applicationUrl, applicationTitle } = getSettings().main;
    try {
      const userRepository = getRepository(User);
      const users = await userRepository.find();

      // Send to all users with the manage requests permission (or admins)
      users
        .filter((user) => user.hasPermission(Permission.MANAGE_REQUESTS))
        .forEach((user) => {
          const email = new PreparedEmail();

          email.send({
            template: path.join(
              __dirname,
              '../../../templates/email/media-request'
            ),
            message: {
              to: user.email,
            },
            locals: {
              body: 'A user has requested new media!',
              mediaName: payload.subject,
              imageUrl: payload.image,
              timestamp: new Date().toTimeString(),
              requestedBy: payload.notifyUser.displayName,
              actionUrl: applicationUrl
                ? `${applicationUrl}/${payload.media?.mediaType}/${payload.media?.tmdbId}`
                : undefined,
              applicationUrl,
              applicationTitle,
              requestType: 'New Request',
            },
          });
        });
      return true;
    } catch (e) {
      logger.error('Mail notification failed to send', {
        label: 'Notifications',
        message: e.message,
      });
      return false;
    }
  }

  private async sendMediaFailedEmail(payload: NotificationPayload) {
    // This is getting main settings for the whole app
    const { applicationUrl, applicationTitle } = getSettings().main;
    try {
      const userRepository = getRepository(User);
      const users = await userRepository.find();

      // Send to all users with the manage requests permission (or admins)
      users
        .filter((user) => user.hasPermission(Permission.MANAGE_REQUESTS))
        .forEach((user) => {
          const email = new PreparedEmail();

          email.send({
            template: path.join(
              __dirname,
              '../../../templates/email/media-request'
            ),
            message: {
              to: user.email,
            },
            locals: {
              body:
                "A user's new request has failed to add to Sonarr or Radarr",
              mediaName: payload.subject,
              imageUrl: payload.image,
              timestamp: new Date().toTimeString(),
              requestedBy: payload.notifyUser.displayName,
              actionUrl: applicationUrl
                ? `${applicationUrl}/${payload.media?.mediaType}/${payload.media?.tmdbId}`
                : undefined,
              applicationUrl,
              applicationTitle,
              requestType: 'Failed Request',
            },
          });
        });
      return true;
    } catch (e) {
      logger.error('Mail notification failed to send', {
        label: 'Notifications',
        message: e.message,
      });
      return false;
    }
  }

  private async sendMediaApprovedEmail(payload: NotificationPayload) {
    // This is getting main settings for the whole app
    const { applicationUrl, applicationTitle } = getSettings().main;
    try {
      const email = new PreparedEmail();

      await email.send({
        template: path.join(
          __dirname,
          '../../../templates/email/media-request'
        ),
        message: {
          to: payload.notifyUser.email,
        },
        locals: {
          body: 'Your request for the following media has been approved:',
          mediaName: payload.subject,
          imageUrl: payload.image,
          timestamp: new Date().toTimeString(),
          requestedBy: payload.notifyUser.displayName,
          actionUrl: applicationUrl
            ? `${applicationUrl}/${payload.media?.mediaType}/${payload.media?.tmdbId}`
            : undefined,
          applicationUrl,
          applicationTitle,
          requestType: 'Request Approved',
        },
      });
      return true;
    } catch (e) {
      logger.error('Mail notification failed to send', {
        label: 'Notifications',
        message: e.message,
      });
      return false;
    }
  }

  private async sendMediaDeclinedEmail(payload: NotificationPayload) {
    // This is getting main settings for the whole app
    const { applicationUrl, applicationTitle } = getSettings().main;
    try {
      const email = new PreparedEmail();

      await email.send({
        template: path.join(
          __dirname,
          '../../../templates/email/media-request'
        ),
        message: {
          to: payload.notifyUser.email,
        },
        locals: {
          body: 'Your request for the following media was declined:',
          mediaName: payload.subject,
          imageUrl: payload.image,
          timestamp: new Date().toTimeString(),
          requestedBy: payload.notifyUser.displayName,
          actionUrl: applicationUrl
            ? `${applicationUrl}/${payload.media?.mediaType}/${payload.media?.tmdbId}`
            : undefined,
          applicationUrl,
          applicationTitle,
          requestType: 'Request Declined',
        },
      });
      return true;
    } catch (e) {
      logger.error('Mail notification failed to send', {
        label: 'Notifications',
        message: e.message,
      });
      return false;
    }
  }

  private async sendMediaAvailableEmail(payload: NotificationPayload) {
    // This is getting main settings for the whole app
    const { applicationUrl, applicationTitle } = getSettings().main;
    try {
      const email = new PreparedEmail();

      await email.send({
        template: path.join(
          __dirname,
          '../../../templates/email/media-request'
        ),
        message: {
          to: payload.notifyUser.email,
        },
        locals: {
          body: 'Your requested media is now available!',
          mediaName: payload.subject,
          imageUrl: payload.image,
          timestamp: new Date().toTimeString(),
          requestedBy: payload.notifyUser.displayName,
          actionUrl: applicationUrl
            ? `${applicationUrl}/${payload.media?.mediaType}/${payload.media?.tmdbId}`
            : undefined,
          applicationUrl,
          applicationTitle,
          requestType: 'Now Available',
        },
      });
      return true;
    } catch (e) {
      logger.error('Mail notification failed to send', {
        label: 'Notifications',
        message: e.message,
      });
      return false;
    }
  }

  private async sendTestEmail(payload: NotificationPayload) {
    // This is getting main settings for the whole app
    const { applicationUrl, applicationTitle } = getSettings().main;
    try {
      const email = new PreparedEmail();

      await email.send({
        template: path.join(__dirname, '../../../templates/email/test-email'),
        message: {
          to: payload.notifyUser.email,
        },
        locals: {
          body: payload.message,
          applicationUrl,
          applicationTitle,
        },
      });
      return true;
    } catch (e) {
      logger.error('Mail notification failed to send', {
        label: 'Notifications',
        message: e.message,
      });
      return false;
    }
  }

  public async send(
    type: Notification,
    payload: NotificationPayload
  ): Promise<boolean> {
    logger.debug('Sending email notification', { label: 'Notifications' });

    switch (type) {
      case Notification.MEDIA_PENDING:
        this.sendMediaRequestEmail(payload);
        break;
      case Notification.MEDIA_APPROVED:
        this.sendMediaApprovedEmail(payload);
        break;
      case Notification.MEDIA_DECLINED:
        this.sendMediaDeclinedEmail(payload);
        break;
      case Notification.MEDIA_AVAILABLE:
        this.sendMediaAvailableEmail(payload);
        break;
      case Notification.MEDIA_FAILED:
        this.sendMediaFailedEmail(payload);
        break;
      case Notification.TEST_NOTIFICATION:
        this.sendTestEmail(payload);
        break;
    }

    return true;
  }
}

export default EmailAgent;
