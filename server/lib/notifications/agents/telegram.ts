import axios from 'axios';
import { getRepository } from 'typeorm';
import { hasNotificationType, Notification } from '..';
import { MediaType } from '../../../constants/media';
import { User } from '../../../entity/User';
import logger from '../../../logger';
import { Permission } from '../../permissions';
import {
  getSettings,
  NotificationAgentKey,
  NotificationAgentTelegram,
} from '../../settings';
import { BaseAgent, NotificationAgent, NotificationPayload } from './agent';

interface TelegramMessagePayload {
  text: string;
  parse_mode: string;
  chat_id: string;
  disable_notification: boolean;
}

interface TelegramPhotoPayload {
  photo: string;
  caption: string;
  parse_mode: string;
  chat_id: string;
  disable_notification: boolean;
}

class TelegramAgent
  extends BaseAgent<NotificationAgentTelegram>
  implements NotificationAgent {
  private baseUrl = 'https://api.telegram.org/';

  protected getSettings(): NotificationAgentTelegram {
    if (this.settings) {
      return this.settings;
    }

    const settings = getSettings();

    return settings.notifications.agents.telegram;
  }

  public shouldSend(): boolean {
    const settings = this.getSettings();

    if (
      settings.enabled &&
      settings.options.botAPI &&
      settings.options.chatId
    ) {
      return true;
    }

    return false;
  }

  private escapeText(text: string | undefined): string {
    return text ? text.replace(/[_*[\]()~>#+=|{}.!-]/gi, (x) => '\\' + x) : '';
  }

  private buildMessage(
    type: Notification,
    payload: NotificationPayload,
    chatId: string,
    sendSilently: boolean
  ): TelegramMessagePayload | TelegramPhotoPayload {
    const settings = getSettings();
    let message = '';

    const title = this.escapeText(payload.subject);
    const plot = this.escapeText(payload.message);
    const user = this.escapeText(payload.request?.requestedBy.displayName);
    const applicationTitle = this.escapeText(settings.main.applicationTitle);

    /* eslint-disable no-useless-escape */
    switch (type) {
      case Notification.MEDIA_PENDING:
        message += `\*New ${
          payload.media?.mediaType === MediaType.TV ? 'Series' : 'Movie'
        } Request\*`;
        message += `\n\n\*${title}\*`;
        if (plot) {
          message += `\n${plot}`;
        }
        message += `\n\n\*Requested By\*\n${user}`;
        message += `\n\n\*Status\*\nPending Approval`;
        break;
      case Notification.MEDIA_APPROVED:
        message += `\*${
          payload.media?.mediaType === MediaType.TV ? 'Series' : 'Movie'
        } Request Approved\*`;
        message += `\n\n\*${title}\*`;
        if (plot) {
          message += `\n${plot}`;
        }
        message += `\n\n\*Requested By\*\n${user}`;
        message += `\n\n\*Status\*\nProcessing`;
        break;
      case Notification.MEDIA_AUTO_APPROVED:
        message += `\*${
          payload.media?.mediaType === MediaType.TV ? 'Series' : 'Movie'
        } Request Automatically Approved\*`;
        message += `\n\n\*${title}\*`;
        if (plot) {
          message += `\n${plot}`;
        }
        message += `\n\n\*Requested By\*\n${user}`;
        message += `\n\n\*Status\*\nProcessing`;
        break;
      case Notification.MEDIA_AVAILABLE:
        message += `\*${
          payload.media?.mediaType === MediaType.TV ? 'Series' : 'Movie'
        } Now Available\*`;
        message += `\n\n\*${title}\*`;
        if (plot) {
          message += `\n${plot}`;
        }
        message += `\n\n\*Requested By\*\n${user}`;
        message += `\n\n\*Status\*\nAvailable`;
        break;
      case Notification.MEDIA_DECLINED:
        message += `\*${
          payload.media?.mediaType === MediaType.TV ? 'Series' : 'Movie'
        } Request Declined\*`;
        message += `\n\n\*${title}\*`;
        if (plot) {
          message += `\n${plot}`;
        }
        message += `\n\n\*Requested By\*\n${user}`;
        message += `\n\n\*Status\*\nDeclined`;
        break;
      case Notification.MEDIA_FAILED:
        message += `\*Failed ${
          payload.media?.mediaType === MediaType.TV ? 'Series' : 'Movie'
        } Request\*`;
        message += `\n\n\*${title}\*`;
        if (plot) {
          message += `\n${plot}`;
        }
        message += `\n\n\*Requested By\*\n${user}`;
        message += `\n\n\*Status\*\nFailed`;
        break;
      case Notification.TEST_NOTIFICATION:
        message += `\*Test Notification\*`;
        message += `\n\n${plot}`;
        break;
    }

    for (const extra of payload.extra ?? []) {
      message += `\n\n\*${extra.name}\*\n${extra.value}`;
    }

    if (settings.main.applicationUrl && payload.media) {
      const actionUrl = `${settings.main.applicationUrl}/${payload.media.mediaType}/${payload.media.tmdbId}`;
      message += `\n\n\[Open in ${applicationTitle}\]\(${actionUrl}\)`;
    }
    /* eslint-enable */

    return payload.image
      ? ({
          photo: payload.image,
          caption: message,
          parse_mode: 'MarkdownV2',
          chat_id: chatId,
          disable_notification: !!sendSilently,
        } as TelegramPhotoPayload)
      : ({
          text: message,
          parse_mode: 'MarkdownV2',
          chat_id: chatId,
          disable_notification: !!sendSilently,
        } as TelegramMessagePayload);
  }

  public async send(
    type: Notification,
    payload: NotificationPayload
  ): Promise<boolean> {
    const settings = this.getSettings();

    const endpoint = `${this.baseUrl}bot${settings.options.botAPI}/${
      payload.image ? 'sendPhoto' : 'sendMessage'
    }`;

    // Send system notification
    if (hasNotificationType(type, settings.types ?? 0)) {
      logger.debug('Sending Telegram notification', {
        label: 'Notifications',
        type: Notification[type],
        subject: payload.subject,
      });

      try {
        await axios.post(
          endpoint,
          this.buildMessage(
            type,
            payload,
            settings.options.chatId,
            settings.options.sendSilently
          )
        );
      } catch (e) {
        logger.error('Error sending Telegram notification', {
          label: 'Notifications',
          type: Notification[type],
          subject: payload.subject,
          errorMessage: e.message,
          response: e.response?.data,
        });

        return false;
      }
    }

    if (payload.notifyUser) {
      // Send notification to the user who submitted the request
      if (
        payload.notifyUser.settings?.hasNotificationType(
          NotificationAgentKey.TELEGRAM,
          type
        ) &&
        payload.notifyUser.settings?.telegramChatId &&
        payload.notifyUser.settings?.telegramChatId !== settings.options.chatId
      ) {
        logger.debug('Sending Telegram notification', {
          label: 'Notifications',
          recipient: payload.notifyUser.displayName,
          type: Notification[type],
          subject: payload.subject,
        });

        try {
          await axios.post(
            endpoint,
            this.buildMessage(
              type,
              payload,
              payload.notifyUser.settings.telegramChatId,
              !!payload.notifyUser.settings.telegramSendSilently
            )
          );
        } catch (e) {
          logger.error('Error sending Telegram notification', {
            label: 'Notifications',
            recipient: payload.notifyUser.displayName,
            type: Notification[type],
            subject: payload.subject,
            errorMessage: e.message,
            response: e.response?.data,
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
              user.settings?.hasNotificationType(
                NotificationAgentKey.TELEGRAM,
                type
              ) &&
              // Check if it's the user's own auto-approved request
              (type !== Notification.MEDIA_AUTO_APPROVED ||
                user.id !== payload.request?.requestedBy.id)
          )
          .map(async (user) => {
            if (
              user.settings?.telegramChatId &&
              user.settings.telegramChatId !== settings.options.chatId
            ) {
              logger.debug('Sending Telegram notification', {
                label: 'Notifications',
                recipient: user.displayName,
                type: Notification[type],
                subject: payload.subject,
              });

              try {
                await axios.post(
                  endpoint,
                  this.buildMessage(
                    type,
                    payload,
                    user.settings.telegramChatId,
                    !!user.settings?.telegramSendSilently
                  )
                );
              } catch (e) {
                logger.error('Error sending Telegram notification', {
                  label: 'Notifications',
                  recipient: user.displayName,
                  type: Notification[type],
                  subject: payload.subject,
                  errorMessage: e.message,
                  response: e.response?.data,
                });

                return false;
              }
            }
          })
      );
    }

    return true;
  }
}

export default TelegramAgent;
