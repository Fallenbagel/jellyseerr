import axios from 'axios';
import { hasNotificationType, Notification } from '..';
import { MediaType } from '../../../constants/media';
import logger from '../../../logger';
import { getSettings, NotificationAgentSlack } from '../../settings';
import { BaseAgent, NotificationAgent, NotificationPayload } from './agent';

interface EmbedField {
  type: 'plain_text' | 'mrkdwn';
  text: string;
}

interface TextItem {
  type: 'plain_text' | 'mrkdwn';
  text: string;
  emoji?: boolean;
}

interface Element {
  type: 'button';
  text?: TextItem;
  value: string;
  url: string;
  action_id: 'button-action';
}

interface EmbedBlock {
  type: 'header' | 'actions' | 'section' | 'context';
  block_id?: 'section789';
  text?: TextItem;
  fields?: EmbedField[];
  accessory?: {
    type: 'image';
    image_url: string;
    alt_text: string;
  };
  elements?: Element[];
}

interface SlackBlockEmbed {
  blocks: EmbedBlock[];
}

class SlackAgent
  extends BaseAgent<NotificationAgentSlack>
  implements NotificationAgent
{
  protected getSettings(): NotificationAgentSlack {
    if (this.settings) {
      return this.settings;
    }

    const settings = getSettings();

    return settings.notifications.agents.slack;
  }

  public buildEmbed(
    type: Notification,
    payload: NotificationPayload
  ): SlackBlockEmbed {
    const settings = getSettings();
    let header = '';
    let actionUrl: string | undefined;

    const fields: EmbedField[] = [];

    if (payload.request) {
      fields.push({
        type: 'mrkdwn',
        text: `*Requested By*\n${payload.request.requestedBy.displayName}`,
      });
    }

    switch (type) {
      case Notification.MEDIA_PENDING:
        header = `New ${
          payload.media?.mediaType === MediaType.TV ? 'Series' : 'Movie'
        } Request`;
        fields.push({
          type: 'mrkdwn',
          text: '*Status*\nPending Approval',
        });
        break;
      case Notification.MEDIA_APPROVED:
        header = `${
          payload.media?.mediaType === MediaType.TV ? 'Series' : 'Movie'
        } Request Approved`;
        fields.push({
          type: 'mrkdwn',
          text: '*Status*\nProcessing',
        });
        break;
      case Notification.MEDIA_AUTO_APPROVED:
        header = `${
          payload.media?.mediaType === MediaType.TV ? 'Series' : 'Movie'
        } Request Automatically Approved`;
        fields.push({
          type: 'mrkdwn',
          text: '*Status*\nProcessing',
        });
        break;
      case Notification.MEDIA_AVAILABLE:
        header = `${
          payload.media?.mediaType === MediaType.TV ? 'Series' : 'Movie'
        } Now Available`;
        fields.push({
          type: 'mrkdwn',
          text: '*Status*\nAvailable',
        });
        break;
      case Notification.MEDIA_DECLINED:
        header = `${
          payload.media?.mediaType === MediaType.TV ? 'Series' : 'Movie'
        } Request Declined`;
        fields.push({
          type: 'mrkdwn',
          text: '*Status*\nDeclined',
        });
        break;
      case Notification.MEDIA_FAILED:
        header = `Failed ${
          payload.media?.mediaType === MediaType.TV ? 'Series' : 'Movie'
        } Request`;
        fields.push({
          type: 'mrkdwn',
          text: '*Status*\nFailed',
        });
        break;
      case Notification.TEST_NOTIFICATION:
        header = 'Test Notification';
        break;
    }

    for (const extra of payload.extra ?? []) {
      fields.push({
        type: 'mrkdwn',
        text: `*${extra.name}*\n${extra.value}`,
      });
    }

    if (settings.main.applicationUrl && payload.media) {
      actionUrl = `${settings.main.applicationUrl}/${payload.media?.mediaType}/${payload.media?.tmdbId}`;
    }

    const blocks: EmbedBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: header,
        },
      },
    ];

    if (type !== Notification.TEST_NOTIFICATION) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${payload.subject}*`,
        },
      });
    }

    if (payload.message) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: payload.message,
        },
        accessory: payload.image
          ? {
              type: 'image',
              image_url: payload.image,
              alt_text: payload.subject,
            }
          : undefined,
      });
    }

    if (fields.length > 0) {
      blocks.push({
        type: 'section',
        fields: [
          ...fields,
          ...(payload.extra ?? []).map(
            (extra): EmbedField => ({
              type: 'mrkdwn',
              text: `*${extra.name}*\n${extra.value}`,
            })
          ),
        ],
      });
    }

    if (actionUrl) {
      blocks.push({
        type: 'actions',
        elements: [
          {
            action_id: 'button-action',
            type: 'button',
            url: actionUrl,
            value: 'open_jellyseerr',
            text: {
              type: 'plain_text',
              text: `Open in ${settings.main.applicationTitle}`,
            },
          },
        ],
      });
    }

    return {
      blocks,
    };
  }

  public shouldSend(): boolean {
    const settings = this.getSettings();

    if (settings.enabled && settings.options.webhookUrl) {
      return true;
    }

    return false;
  }

  public async send(
    type: Notification,
    payload: NotificationPayload
  ): Promise<boolean> {
    const settings = this.getSettings();

    if (!hasNotificationType(type, settings.types ?? 0)) {
      return true;
    }

    logger.debug('Sending Slack notification', {
      label: 'Notifications',
      type: Notification[type],
      subject: payload.subject,
    });
    try {
      await axios.post(
        settings.options.webhookUrl,
        this.buildEmbed(type, payload)
      );

      return true;
    } catch (e) {
      logger.error('Error sending Slack notification', {
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

export default SlackAgent;
