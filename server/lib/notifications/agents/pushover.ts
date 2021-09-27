import axios from 'axios';
import { hasNotificationType, Notification } from '..';
import { MediaType } from '../../../constants/media';
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

  public shouldSend(): boolean {
    const settings = this.getSettings();

    if (
      settings.enabled &&
      settings.options.accessToken &&
      settings.options.userToken
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
    const username = payload.request?.requestedBy.displayName;

    switch (type) {
      case Notification.MEDIA_PENDING:
        messageTitle = `New ${
          payload.media?.mediaType === MediaType.TV ? 'Series' : 'Movie'
        } Request`;
        message += `<b>${title}</b>`;
        if (plot) {
          message += `<small>\n${plot}</small>`;
        }
        message += `<small>\n\n<b>Requested By</b>\n${username}</small>`;
        message += `<small>\n\n<b>Status</b>\nPending Approval</small>`;
        break;
      case Notification.MEDIA_APPROVED:
        messageTitle = `${
          payload.media?.mediaType === MediaType.TV ? 'Series' : 'Movie'
        } Request Approved`;
        message += `<b>${title}</b>`;
        if (plot) {
          message += `<small>\n${plot}</small>`;
        }
        message += `<small>\n\n<b>Requested By</b>\n${username}</small>`;
        message += `<small>\n\n<b>Status</b>\nProcessing</small>`;
        break;
      case Notification.MEDIA_AUTO_APPROVED:
        messageTitle = `${
          payload.media?.mediaType === MediaType.TV ? 'Series' : 'Movie'
        } Request Automatically Approved`;
        message += `<b>${title}</b>`;
        if (plot) {
          message += `<small>\n${plot}</small>`;
        }
        message += `<small>\n\n<b>Requested By</b>\n${username}</small>`;
        message += `<small>\n\n<b>Status</b>\nProcessing</small>`;
        break;
      case Notification.MEDIA_AVAILABLE:
        messageTitle = `${
          payload.media?.mediaType === MediaType.TV ? 'Series' : 'Movie'
        } Now Available`;
        message += `<b>${title}</b>`;
        if (plot) {
          message += `<small>\n${plot}</small>`;
        }
        message += `<small>\n\n<b>Requested By</b>\n${username}</small>`;
        message += `<small>\n\n<b>Status</b>\nAvailable</small>`;
        break;
      case Notification.MEDIA_DECLINED:
        messageTitle = `${
          payload.media?.mediaType === MediaType.TV ? 'Series' : 'Movie'
        } Request Declined`;
        message += `<b>${title}</b>`;
        if (plot) {
          message += `<small>\n${plot}</small>`;
        }
        message += `<small>\n\n<b>Requested By</b>\n${username}</small>`;
        message += `<small>\n\n<b>Status</b>\nDeclined</small>`;
        priority = 1;
        break;
      case Notification.MEDIA_FAILED:
        messageTitle = `Failed ${
          payload.media?.mediaType === MediaType.TV ? 'Series' : 'Movie'
        } Request`;
        message += `<b>${title}</b>`;
        if (plot) {
          message += `<small>\n${plot}</small>`;
        }
        message += `<small>\n\n<b>Requested By</b>\n${username}</small>`;
        message += `<small>\n\n<b>Status</b>\nFailed</small>`;
        priority = 1;
        break;
      case Notification.TEST_NOTIFICATION:
        messageTitle = 'Test Notification';
        message += `<small>${plot}</small>`;
        break;
    }

    for (const extra of payload.extra ?? []) {
      message += `<small>\n\n<b>${extra.name}</b>\n${extra.value}</small>`;
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
    const settings = this.getSettings();

    if (!hasNotificationType(type, settings.types ?? 0)) {
      return true;
    }

    logger.debug('Sending Pushover notification', {
      label: 'Notifications',
      type: Notification[type],
      subject: payload.subject,
    });
    try {
      const endpoint = 'https://api.pushover.net/1/messages.json';

      const {
        title,
        message,
        url,
        url_title,
        priority,
      } = this.constructMessageDetails(type, payload);

      await axios.post(endpoint, {
        token: settings.options.accessToken,
        user: settings.options.userToken,
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
        type: Notification[type],
        subject: payload.subject,
        errorMessage: e.message,
        response: e.response?.data,
      });

      return false;
    }
  }
}

export default PushoverAgent;
