import axios from 'axios';
import { hasNotificationType, Notification } from '..';
import { MediaType } from '../../../constants/media';
import logger from '../../../logger';
import { getSettings, NotificationAgentPushbullet } from '../../settings';
import { BaseAgent, NotificationAgent, NotificationPayload } from './agent';

interface PushbulletPayload {
  title: string;
  body: string;
}

class PushbulletAgent
  extends BaseAgent<NotificationAgentPushbullet>
  implements NotificationAgent {
  protected getSettings(): NotificationAgentPushbullet {
    if (this.settings) {
      return this.settings;
    }

    const settings = getSettings();

    return settings.notifications.agents.pushbullet;
  }

  public shouldSend(): boolean {
    const settings = this.getSettings();

    if (settings.enabled && settings.options.accessToken) {
      return true;
    }

    return false;
  }

  private constructMessageDetails(
    type: Notification,
    payload: NotificationPayload
  ): {
    title: string;
    body: string;
  } {
    let messageTitle = '';
    let message = '';

    const title = payload.subject;
    const plot = payload.message;
    const username = payload.request?.requestedBy.displayName;

    switch (type) {
      case Notification.MEDIA_PENDING:
        messageTitle = `New ${
          payload.media?.mediaType === MediaType.TV ? 'Series' : 'Movie'
        } Request`;
        message += `${title}`;
        if (plot) {
          message += `\n\n${plot}`;
        }
        message += `\n\nRequested By: ${username}`;
        message += `\nStatus: Pending Approval`;
        break;
      case Notification.MEDIA_APPROVED:
        messageTitle = `${
          payload.media?.mediaType === MediaType.TV ? 'Series' : 'Movie'
        } Request Approved`;
        message += `${title}`;
        if (plot) {
          message += `\n\n${plot}`;
        }
        message += `\n\nRequested By: ${username}`;
        message += `\nStatus: Processing`;
        break;
      case Notification.MEDIA_AUTO_APPROVED:
        messageTitle = `${
          payload.media?.mediaType === MediaType.TV ? 'Series' : 'Movie'
        } Request Automatically Approved`;
        message += `${title}`;
        if (plot) {
          message += `\n\n${plot}`;
        }
        message += `\n\nRequested By: ${username}`;
        message += `\nStatus: Processing`;
        break;
      case Notification.MEDIA_AVAILABLE:
        messageTitle = `${
          payload.media?.mediaType === MediaType.TV ? 'Series' : 'Movie'
        } Now Available`;
        message += `${title}`;
        if (plot) {
          message += `\n\n${plot}`;
        }
        message += `\n\nRequested By: ${username}`;
        message += `\nStatus: Available`;
        break;
      case Notification.MEDIA_DECLINED:
        messageTitle = `${
          payload.media?.mediaType === MediaType.TV ? 'Series' : 'Movie'
        } Request Declined`;
        message += `${title}`;
        if (plot) {
          message += `\n\n${plot}`;
        }
        message += `\n\nRequested By: ${username}`;
        message += `\nStatus: Declined`;
        break;
      case Notification.MEDIA_FAILED:
        messageTitle = `Failed ${
          payload.media?.mediaType === MediaType.TV ? 'Series' : 'Movie'
        } Request`;
        message += `${title}`;
        if (plot) {
          message += `\n\n${plot}`;
        }
        message += `\n\nRequested By: ${username}`;
        message += `\nStatus: Failed`;
        break;
      case Notification.TEST_NOTIFICATION:
        messageTitle = 'Test Notification';
        message += `${plot}`;
        break;
    }

    for (const extra of payload.extra ?? []) {
      message += `\n${extra.name}: ${extra.value}`;
    }

    return {
      title: messageTitle,
      body: message,
    };
  }

  public async send(
    type: Notification,
    payload: NotificationPayload
  ): Promise<boolean> {
    const settings = this.getSettings();

    if (!hasNotificationType(type, settings.types ?? 0)) {
      return true;
    }

    logger.debug('Sending Pushbullet notification', {
      label: 'Notifications',
      type: Notification[type],
      subject: payload.subject,
    });

    try {
      const { title, body } = this.constructMessageDetails(type, payload);

      await axios.post(
        'https://api.pushbullet.com/v2/pushes',
        {
          type: 'note',
          title: title,
          body: body,
        } as PushbulletPayload,
        {
          headers: {
            'Access-Token': settings.options.accessToken,
          },
        }
      );

      return true;
    } catch (e) {
      logger.error('Error sending Pushbullet notification', {
        label: 'Notifications',
        type: Notification[type],
        subject: payload.subject,
        errorMessage: e.message,
        response: e.response?.data,
      });

      return false;
    }
  }
}

export default PushbulletAgent;
