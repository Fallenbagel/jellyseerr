import axios from 'axios';
import { hasNotificationType, Notification } from '..';
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

  public shouldSend(type: Notification): boolean {
    if (
      this.getSettings().enabled &&
      this.getSettings().options.accessToken &&
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
    body: string;
  } {
    let messageTitle = '';
    let message = '';

    const title = payload.subject;
    const plot = payload.message;
    const username = payload.notifyUser.displayName;

    switch (type) {
      case Notification.MEDIA_PENDING:
        messageTitle = 'New Request';
        message += `${title}`;
        if (plot) {
          message += `\n\n${plot}`;
        }
        message += `\n\nRequested By: ${username}`;
        message += `\nStatus: Pending Approval`;
        break;
      case Notification.MEDIA_APPROVED:
        messageTitle = 'Request Approved';
        message += `${title}`;
        if (plot) {
          message += `\n\n${plot}`;
        }
        message += `\n\nRequested By: ${username}`;
        message += `\nStatus: Processing`;
        break;
      case Notification.MEDIA_AVAILABLE:
        messageTitle = 'Now Available';
        message += `${title}`;
        if (plot) {
          message += `\n\n${plot}`;
        }
        message += `\n\nRequested By: ${username}`;
        message += `\nStatus: Available`;
        break;
      case Notification.MEDIA_DECLINED:
        messageTitle = 'Request Declined';
        message += `${title}`;
        if (plot) {
          message += `\n\n${plot}`;
        }
        message += `\n\nRequested By: ${username}`;
        message += `\nStatus: Declined`;
        break;
      case Notification.MEDIA_FAILED:
        messageTitle = 'Failed Request';
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

    return {
      title: messageTitle,
      body: message,
    };
  }

  public async send(
    type: Notification,
    payload: NotificationPayload
  ): Promise<boolean> {
    logger.debug('Sending Pushbullet notification', { label: 'Notifications' });
    try {
      const endpoint = 'https://api.pushbullet.com/v2/pushes';

      const { accessToken } = this.getSettings().options;

      const { title, body } = this.constructMessageDetails(type, payload);

      await axios.post(
        endpoint,
        {
          type: 'note',
          title: title,
          body: body,
        } as PushbulletPayload,
        {
          headers: {
            'Access-Token': accessToken,
          },
        }
      );

      return true;
    } catch (e) {
      logger.error('Error sending Pushbullet notification', {
        label: 'Notifications',
        message: e.message,
      });
      return false;
    }
  }
}

export default PushbulletAgent;
