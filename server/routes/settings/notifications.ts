import { Router } from 'express';
import { getSettings } from '../../lib/settings';
import { Notification } from '../../lib/notifications';
import DiscordAgent from '../../lib/notifications/agents/discord';
import EmailAgent from '../../lib/notifications/agents/email';
import SlackAgent from '../../lib/notifications/agents/slack';
import TelegramAgent from '../../lib/notifications/agents/telegram';
import PushoverAgent from '../../lib/notifications/agents/pushover';
import WebhookAgent from '../../lib/notifications/agents/webhook';
import PushbulletAgent from '../../lib/notifications/agents/pushbullet';

const notificationRoutes = Router();

notificationRoutes.get('/', (_req, res) => {
  const settings = getSettings().notifications;
  return res.status(200).json({
    enabled: settings.enabled,
    autoapprovalEnabled: settings.autoapprovalEnabled,
  });
});

notificationRoutes.post('/', (req, res) => {
  const settings = getSettings();

  Object.assign(settings.notifications, {
    enabled: req.body.enabled,
    autoapprovalEnabled: req.body.autoapprovalEnabled,
  });
  settings.save();

  return res.status(200).json({
    enabled: settings.notifications.enabled,
    autoapprovalEnabled: settings.notifications.autoapprovalEnabled,
  });
});

notificationRoutes.get('/discord', (_req, res) => {
  const settings = getSettings();

  res.status(200).json(settings.notifications.agents.discord);
});

notificationRoutes.post('/discord', (req, res) => {
  const settings = getSettings();

  settings.notifications.agents.discord = req.body;
  settings.save();

  res.status(200).json(settings.notifications.agents.discord);
});

notificationRoutes.post('/discord/test', (req, res, next) => {
  if (!req.user) {
    return next({
      status: 500,
      message: 'User information missing from request',
    });
  }

  const discordAgent = new DiscordAgent(req.body);
  discordAgent.send(Notification.TEST_NOTIFICATION, {
    notifyUser: req.user,
    subject: 'Test Notification',
    message:
      'This is a test notification! Check check, 1, 2, 3. Are we coming in clear?',
  });

  return res.status(204).send();
});

notificationRoutes.get('/slack', (_req, res) => {
  const settings = getSettings();

  res.status(200).json(settings.notifications.agents.slack);
});

notificationRoutes.post('/slack', (req, res) => {
  const settings = getSettings();

  settings.notifications.agents.slack = req.body;
  settings.save();

  res.status(200).json(settings.notifications.agents.slack);
});

notificationRoutes.post('/slack/test', (req, res, next) => {
  if (!req.user) {
    return next({
      status: 500,
      message: 'User information missing from request',
    });
  }

  const slackAgent = new SlackAgent(req.body);
  slackAgent.send(Notification.TEST_NOTIFICATION, {
    notifyUser: req.user,
    subject: 'Test Notification',
    message:
      'This is a test notification! Check check, 1, 2, 3. Are we coming in clear?',
  });

  return res.status(204).send();
});

notificationRoutes.get('/telegram', (_req, res) => {
  const settings = getSettings();

  res.status(200).json(settings.notifications.agents.telegram);
});

notificationRoutes.post('/telegram', (req, res) => {
  const settings = getSettings();

  settings.notifications.agents.telegram = req.body;
  settings.save();

  res.status(200).json(settings.notifications.agents.telegram);
});

notificationRoutes.post('/telegram/test', (req, res, next) => {
  if (!req.user) {
    return next({
      status: 500,
      message: 'User information missing from request',
    });
  }

  const telegramAgent = new TelegramAgent(req.body);
  telegramAgent.send(Notification.TEST_NOTIFICATION, {
    notifyUser: req.user,
    subject: 'Test Notification',
    message:
      'This is a test notification! Check check, 1, 2, 3. Are we coming in clear?',
  });

  return res.status(204).send();
});

notificationRoutes.get('/pushbullet', (_req, res) => {
  const settings = getSettings();

  res.status(200).json(settings.notifications.agents.pushbullet);
});

notificationRoutes.post('/pushbullet', (req, res) => {
  const settings = getSettings();

  settings.notifications.agents.pushbullet = req.body;
  settings.save();

  res.status(200).json(settings.notifications.agents.pushbullet);
});

notificationRoutes.post('/pushbullet/test', (req, res, next) => {
  if (!req.user) {
    return next({
      status: 500,
      message: 'User information missing from request',
    });
  }

  const pushbulletAgent = new PushbulletAgent(req.body);
  pushbulletAgent.send(Notification.TEST_NOTIFICATION, {
    notifyUser: req.user,
    subject: 'Test Notification',
    message:
      'This is a test notification! Check check, 1, 2, 3. Are we coming in clear?',
  });

  return res.status(204).send();
});

notificationRoutes.get('/pushover', (_req, res) => {
  const settings = getSettings();

  res.status(200).json(settings.notifications.agents.pushover);
});

notificationRoutes.post('/pushover', (req, res) => {
  const settings = getSettings();

  settings.notifications.agents.pushover = req.body;
  settings.save();

  res.status(200).json(settings.notifications.agents.pushover);
});

notificationRoutes.post('/pushover/test', (req, res, next) => {
  if (!req.user) {
    return next({
      status: 500,
      message: 'User information missing from request',
    });
  }

  const pushoverAgent = new PushoverAgent(req.body);
  pushoverAgent.send(Notification.TEST_NOTIFICATION, {
    notifyUser: req.user,
    subject: 'Test Notification',
    message:
      'This is a test notification! Check check, 1, 2, 3. Are we coming in clear?',
  });

  return res.status(204).send();
});

notificationRoutes.get('/email', (_req, res) => {
  const settings = getSettings();

  res.status(200).json(settings.notifications.agents.email);
});

notificationRoutes.post('/email', (req, res) => {
  const settings = getSettings();

  settings.notifications.agents.email = req.body;
  settings.save();

  res.status(200).json(settings.notifications.agents.email);
});

notificationRoutes.post('/email/test', (req, res, next) => {
  if (!req.user) {
    return next({
      status: 500,
      message: 'User information missing from request',
    });
  }

  const emailAgent = new EmailAgent(req.body);
  emailAgent.send(Notification.TEST_NOTIFICATION, {
    notifyUser: req.user,
    subject: 'Test Notification',
    message:
      'This is a test notification! Check check, 1, 2, 3. Are we coming in clear?',
  });

  return res.status(204).send();
});

notificationRoutes.get('/webhook', (_req, res) => {
  const settings = getSettings();

  const webhookSettings = settings.notifications.agents.webhook;

  const response: typeof webhookSettings = {
    enabled: webhookSettings.enabled,
    types: webhookSettings.types,
    options: {
      ...webhookSettings.options,
      jsonPayload: JSON.parse(
        Buffer.from(webhookSettings.options.jsonPayload, 'base64').toString(
          'ascii'
        )
      ),
    },
  };

  res.status(200).json(response);
});

notificationRoutes.post('/webhook', (req, res, next) => {
  const settings = getSettings();
  try {
    JSON.parse(req.body.options.jsonPayload);

    settings.notifications.agents.webhook = {
      enabled: req.body.enabled,
      types: req.body.types,
      options: {
        jsonPayload: Buffer.from(req.body.options.jsonPayload).toString(
          'base64'
        ),
        webhookUrl: req.body.options.webhookUrl,
        authHeader: req.body.options.authHeader,
      },
    };
    settings.save();

    res.status(200).json(settings.notifications.agents.webhook);
  } catch (e) {
    next({ status: 500, message: e.message });
  }
});

notificationRoutes.post('/webhook/test', (req, res, next) => {
  if (!req.user) {
    return next({
      status: 500,
      message: 'User information missing from request',
    });
  }

  try {
    JSON.parse(req.body.options.jsonPayload);

    const testBody = {
      enabled: req.body.enabled,
      types: req.body.types,
      options: {
        jsonPayload: Buffer.from(req.body.options.jsonPayload).toString(
          'base64'
        ),
        webhookUrl: req.body.options.webhookUrl,
        authHeader: req.body.options.authHeader,
      },
    };

    const webhookAgent = new WebhookAgent(testBody);
    webhookAgent.send(Notification.TEST_NOTIFICATION, {
      notifyUser: req.user,
      subject: 'Test Notification',
      message:
        'This is a test notification! Check check, 1, 2, 3. Are we coming in clear?',
    });

    return res.status(204).send();
  } catch (e) {
    next({ status: 500, message: e.message });
  }
});

export default notificationRoutes;
