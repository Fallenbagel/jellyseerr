import axios from 'axios';
import { hasNotificationType, Notification } from '..';
import logger from '../../../logger';
import { getSettings, NotificationAgentDiscord } from '../../settings';
import { BaseAgent, NotificationAgent, NotificationPayload } from './agent';

enum EmbedColors {
  DEFAULT = 0,
  AQUA = 1752220,
  GREEN = 3066993,
  BLUE = 3447003,
  PURPLE = 10181046,
  GOLD = 15844367,
  ORANGE = 15105570,
  RED = 15158332,
  GREY = 9807270,
  DARKER_GREY = 8359053,
  NAVY = 3426654,
  DARK_AQUA = 1146986,
  DARK_GREEN = 2067276,
  DARK_BLUE = 2123412,
  DARK_PURPLE = 7419530,
  DARK_GOLD = 12745742,
  DARK_ORANGE = 11027200,
  DARK_RED = 10038562,
  DARK_GREY = 9936031,
  LIGHT_GREY = 12370112,
  DARK_NAVY = 2899536,
  LUMINOUS_VIVID_PINK = 16580705,
  DARK_VIVID_PINK = 12320855,
}

interface DiscordImageEmbed {
  url?: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

interface Field {
  name: string;
  value: string;
  inline?: boolean;
}
interface DiscordRichEmbed {
  title?: string;
  type?: 'rich'; // Always rich for webhooks
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: {
    text: string;
    icon_url?: string;
    proxy_icon_url?: string;
  };
  image?: DiscordImageEmbed;
  thumbnail?: DiscordImageEmbed;
  provider?: {
    name?: string;
    url?: string;
  };
  author?: {
    name?: string;
    url?: string;
    icon_url?: string;
    proxy_icon_url?: string;
  };
  fields?: Field[];
}

interface DiscordWebhookPayload {
  embeds: DiscordRichEmbed[];
  username: string;
  avatar_url?: string;
  tts: boolean;
  content?: string;
  allowed_mentions?: {
    parse?: ('users' | 'roles' | 'everyone')[];
    roles?: string[];
    users?: string[];
  };
}

class DiscordAgent
  extends BaseAgent<NotificationAgentDiscord>
  implements NotificationAgent {
  protected getSettings(): NotificationAgentDiscord {
    if (this.settings) {
      return this.settings;
    }

    const settings = getSettings();

    return settings.notifications.agents.discord;
  }

  public buildEmbed(
    type: Notification,
    payload: NotificationPayload
  ): DiscordRichEmbed {
    const settings = getSettings();
    let color = EmbedColors.DARK_PURPLE;

    const fields: Field[] = [];

    if (payload.request) {
      fields.push({
        name: 'Requested By',
        value: payload.notifyUser.displayName ?? '',
        inline: true,
      });
    }

    switch (type) {
      case Notification.MEDIA_PENDING:
        color = EmbedColors.ORANGE;
        fields.push({
          name: 'Status',
          value: 'Pending Approval',
          inline: true,
        });
        break;
      case Notification.MEDIA_APPROVED:
        color = EmbedColors.PURPLE;
        fields.push({
          name: 'Status',
          value: 'Processing',
          inline: true,
        });
        break;
      case Notification.MEDIA_AVAILABLE:
        color = EmbedColors.GREEN;
        fields.push({
          name: 'Status',
          value: 'Available',
          inline: true,
        });
        break;
      case Notification.MEDIA_DECLINED:
        color = EmbedColors.RED;
        fields.push({
          name: 'Status',
          value: 'Declined',
          inline: true,
        });
        break;
      case Notification.MEDIA_FAILED:
        color = EmbedColors.RED;
        fields.push({
          name: 'Status',
          value: 'Failed',
          inline: true,
        });
        break;
    }

    if (settings.main.applicationUrl && payload.media) {
      fields.push({
        name: `Open in ${settings.main.applicationTitle}`,
        value: `${settings.main.applicationUrl}/${payload.media?.mediaType}/${payload.media?.tmdbId}`,
      });
    }

    return {
      title: payload.subject,
      description: payload.message,
      color,
      timestamp: new Date().toISOString(),
      author: {
        name: settings.main.applicationTitle,
        url: settings.main.applicationUrl,
      },
      fields: [
        ...fields,
        // If we have extra data, map it to fields for discord notifications
        ...(payload.extra ?? []).map((extra) => ({
          name: extra.name,
          value: extra.value,
        })),
      ],
      thumbnail: {
        url: payload.image,
      },
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
    logger.debug('Sending discord notification', { label: 'Notifications' });
    try {
      const settings = getSettings();
      const webhookUrl = this.getSettings().options.webhookUrl;

      if (!webhookUrl) {
        return false;
      }

      const mentionedUsers: string[] = [];
      let content = undefined;

      if (
        payload.notifyUser.settings?.enableNotifications &&
        payload.notifyUser.settings?.discordId
      ) {
        mentionedUsers.push(payload.notifyUser.settings.discordId);
        content = `<@${payload.notifyUser.settings.discordId}>`;
      }

      await axios.post(webhookUrl, {
        username: settings.main.applicationTitle,
        embeds: [this.buildEmbed(type, payload)],
        content,
        allowed_mentions: {
          users: mentionedUsers,
        },
      } as DiscordWebhookPayload);

      return true;
    } catch (e) {
      logger.error('Error sending Discord notification', {
        label: 'Notifications',
        message: e.message,
        response: e.response.data,
      });
      return false;
    }
  }
}

export default DiscordAgent;
