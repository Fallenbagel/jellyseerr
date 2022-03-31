import axios from 'axios';
import { hasNotificationType, Notification } from '..';
import logger from '../../../logger';
import { getSettings, NotificationAgentPushover } from '../../settings';
import { BaseAgent, NotificationAgent, NotificationPayload } from './agent';

interface PushoverPayload {
  token: string;
  user: string;
  title: string;
  message: string;
  url: string;
  url_title: string;
  priority: number;
  html: number;
}

class PushoverAgent
  extends BaseAgent<NotificationAgentPushover>
  implements NotificationAgent {
  protected getSettings(): NotificationAgentPushover {
    if (this.settings) {
      return this.settings;
    }

    const settings = getSettings();

    return settings.notifications.agents.pushover;
  }

  public shouldSend(type: Notification): boolean {
    if (
      this.getSettings().enabled &&
      this.getSettings().options.accessToken &&
      this.getSettings().options.userToken &&
      hasNotificationType(type, this.getSettings().types)
    ) {
      return true;
    }

    return false;
  }

  private constructMessageDetails(
    type: Notification,
    payload: NotificationPayload
  ): {
    title: string;
    message: string;
    url: string | undefined;
    url_title: string | undefined;
    priority: number;
  } {
    const settings = getSettings();
    let messageTitle = '';
    let message = '';
    let url: string | undefined;
    let url_title: string | undefined;
    let priority = 0;

    const title = payload.subject;
    const plot = payload.message;
    const username = payload.notifyUser.displayName;

    switch (type) {
      case Notification.MEDIA_PENDING:
        messageTitle = 'New Request';
        message += `<b>${title}</b>`;
        if (plot) {
          message += `\n${plot}`;
        }
        message += `\n\n<b>Requested By</b>\n${username}`;
        message += `\n\n<b>Status</b>\nPending Approval`;
        break;
      case Notification.MEDIA_APPROVED:
        messageTitle = 'Request Approved';
        message += `<b>${title}</b>`;
        if (plot) {
          message += `\n${plot}`;
        }
        message += `\n\n<b>Requested By</b>\n${username}`;
        message += `\n\n<b>Status</b>\nProcessing`;
        break;
      case Notification.MEDIA_AVAILABLE:
        messageTitle = 'Now Available';
        message += `<b>${title}</b>`;
        if (plot) {
          message += `\n${plot}`;
        }
        message += `\n\n<b>Requested By</b>\n${username}`;
        message += `\n\n<b>Status</b>\nAvailable`;
        break;
      case Notification.MEDIA_DECLINED:
        messageTitle = 'Request Declined';
        message += `<b>${title}</b>`;
        if (plot) {
          message += `\n${plot}`;
        }
        message += `\n\n<b>Requested By</b>\n${username}`;
        message += `\n\n<b>Status</b>\nDeclined`;
        priority = 1;
        break;
      case Notification.MEDIA_FAILED:
        messageTitle = 'Failed Request';
        message += `<b>${title}</b>`;
        if (plot) {
          message += `\n${plot}`;
        }
        message += `\n\n<b>Requested By</b>\n${username}`;
        message += `\n\n<b>Status</b>\nFailed`;
        priority = 1;
        break;
      case Notification.TEST_NOTIFICATION:
        messageTitle = 'Test Notification';
        message += `${plot}`;
        break;
    }

    if (settings.main.applicationUrl && payload.media) {
      url = `${settings.main.applicationUrl}/${payload.media.mediaType}/${payload.media.tmdbId}`;
      url_title = `Open in ${settings.main.applicationTitle}`;
    }

    return {
      title: messageTitle,
      message,
      url,
      url_title,
      priority,
    };
  }

  public async send(
    type: Notification,
    payload: NotificationPayload
  ): Promise<boolean> {
    logger.debug('Sending Pushover notification', { label: 'Notifications' });
    try {
      const endpoint = 'https://api.pushover.net/1/messages.json';

      const { accessToken, userToken } = this.getSettings().options;

      const {
        title,
        message,
        url,
        url_title,
        priority,
      } = this.constructMessageDetails(type, payload);

      await axios.post(endpoint, {
        token: accessToken,
        user: userToken,
        title: title,
        message: message,
        url: url,
        url_title: url_title,
        priority: priority,
        html: 1,
      } as PushoverPayload);

      return true;
    } catch (e) {
      logger.error('Error sending Pushover notification', {
        label: 'Notifications',
        message: e.message,
      });
      return false;
    }
  }
}

export default PushoverAgent;
