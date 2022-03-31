import axios from 'axios';
import { hasNotificationType, Notification } from '..';
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
  implements NotificationAgent {
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
        text: `*Requested By*\n${payload.notifyUser.displayName ?? ''}`,
      });
    }

    switch (type) {
      case Notification.MEDIA_PENDING:
        header = 'New Request';
        fields.push({
          type: 'mrkdwn',
          text: '*Status*\nPending Approval',
        });
        break;
      case Notification.MEDIA_APPROVED:
        header = 'Request Approved';
        fields.push({
          type: 'mrkdwn',
          text: '*Status*\nProcessing',
        });
        break;
      case Notification.MEDIA_AVAILABLE:
        header = 'Now Available';
        fields.push({
          type: 'mrkdwn',
          text: '*Status*\nAvailable',
        });
        break;
      case Notification.MEDIA_DECLINED:
        header = 'Request Declined';
        fields.push({
          type: 'mrkdwn',
          text: '*Status*\nDeclined',
        });
        break;
      case Notification.MEDIA_FAILED:
        header = 'Failed Request';
        fields.push({
          type: 'mrkdwn',
          text: '*Status*\nFailed',
        });
        break;
      case Notification.TEST_NOTIFICATION:
        header = 'Test Notification';
        break;
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
            value: 'open_overseerr',
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

  public shouldSend(type: Notification): boolean {
    if (
      this.getSettings().enabled &&
      this.getSettings().options.webhookUrl &&
      hasNotificationType(type, this.getSettings().types)
    ) {
      return true;
    }

    return false;
  }

  public async send(
    type: Notification,
    payload: NotificationPayload
  ): Promise<boolean> {
    logger.debug('Sending slack notification', { label: 'Notifications' });
    try {
      const webhookUrl = this.getSettings().options.webhookUrl;

      if (!webhookUrl) {
        return false;
      }

      await axios.post(webhookUrl, this.buildEmbed(type, payload));

      return true;
    } catch (e) {
      logger.error('Error sending Slack notification', {
        label: 'Notifications',
        message: e.message,
      });
      return false;
    }
  }
}

export default SlackAgent;
