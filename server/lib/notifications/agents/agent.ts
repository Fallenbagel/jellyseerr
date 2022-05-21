import { Notification } from '..';
import type Issue from '../../../entity/Issue';
import IssueComment from '../../../entity/IssueComment';
import Media from '../../../entity/Media';
import { MediaRequest } from '../../../entity/MediaRequest';
import { User } from '../../../entity/User';
import { NotificationAgentConfig } from '../../settings';

export interface NotificationPayload {
  event?: string;
  subject: string;
  notifyAdmin: boolean;
  notifyUser?: User;
  media?: Media;
  image?: string;
  message?: string;
  extra?: { name: string; value: string }[];
  request?: MediaRequest;
  issue?: Issue;
  comment?: IssueComment;
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
