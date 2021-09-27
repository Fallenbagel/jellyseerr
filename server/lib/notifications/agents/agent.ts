import { Notification } from '..';
import Media from '../../../entity/Media';
import { MediaRequest } from '../../../entity/MediaRequest';
import { User } from '../../../entity/User';
import { NotificationAgentConfig } from '../../settings';

export interface NotificationPayload {
  subject: string;
  notifyUser?: User;
  media?: Media;
  image?: string;
  message?: string;
  extra?: { name: string; value: string }[];
  request?: MediaRequest;
}

export abstract class BaseAgent<T extends NotificationAgentConfig> {
  protected settings?: T;
  public constructor(settings?: T) {
    this.settings = settings;
  }

  protected abstract getSettings(): T;
}

export interface NotificationAgent {
  shouldSend(): boolean;
  send(type: Notification, payload: NotificationPayload): Promise<boolean>;
}
