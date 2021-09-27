import { Router } from 'express';
import { Notification } from '../../lib/notifications';
import DiscordAgent from '../../lib/notifications/agents/discord';
import EmailAgent from '../../lib/notifications/agents/email';
import LunaSeaAgent from '../../lib/notifications/agents/lunasea';
import PushbulletAgent from '../../lib/notifications/agents/pushbullet';
import PushoverAgent from '../../lib/notifications/agents/pushover';
import SlackAgent from '../../lib/notifications/agents/slack';
import TelegramAgent from '../../lib/notifications/agents/telegram';
import WebhookAgent from '../../lib/notifications/agents/webhook';
import WebPushAgent from '../../lib/notifications/agents/webpush';
import { getSettings } from '../../lib/settings';

const notificationRoutes = Router();

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

notificationRoutes.post('/discord/test', async (req, res, next) => {
  if (!req.user) {
    return next({
      status: 500,
      message: 'User information is missing from the request.',
    });
  }

  const discordAgent = new DiscordAgent(req.body);
  if (
    await discordAgent.send(Notification.TEST_NOTIFICATION, {
      notifyUser: req.user,
      subject: 'Test Notification',
      message:
        'This is a test notification! Check check, 1, 2, 3. Are we coming in clear?',
    })
  ) {
    return res.status(204).send();
  } else {
    return next({
      status: 500,
      message: 'Failed to send Discord notification.',
    });
  }
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

notificationRoutes.post('/slack/test', async (req, res, next) => {
  if (!req.user) {
    return next({
      status: 500,
      message: 'User information is missing from the request.',
    });
  }

  const slackAgent = new SlackAgent(req.body);
  if (
    await slackAgent.send(Notification.TEST_NOTIFICATION, {
      notifyUser: req.user,
      subject: 'Test Notification',
      message:
        'This is a test notification! Check check, 1, 2, 3. Are we coming in clear?',
    })
  ) {
    return res.status(204).send();
  } else {
    return next({
      status: 500,
      message: 'Failed to send Slack notification.',
    });
  }
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

notificationRoutes.post('/telegram/test', async (req, res, next) => {
  if (!req.user) {
    return next({
      status: 500,
      message: 'User information is missing from the request.',
    });
  }

  const telegramAgent = new TelegramAgent(req.body);
  if (
    await telegramAgent.send(Notification.TEST_NOTIFICATION, {
      notifyUser: req.user,
      subject: 'Test Notification',
      message:
        'This is a test notification! Check check, 1, 2, 3. Are we coming in clear?',
    })
  ) {
    return res.status(204).send();
  } else {
    return next({
      status: 500,
      message: 'Failed to send Telegram notification.',
    });
  }
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

notificationRoutes.post('/pushbullet/test', async (req, res, next) => {
  if (!req.user) {
    return next({
      status: 500,
      message: 'User information is missing from the request.',
    });
  }

  const pushbulletAgent = new PushbulletAgent(req.body);
  if (
    await pushbulletAgent.send(Notification.TEST_NOTIFICATION, {
      notifyUser: req.user,
      subject: 'Test Notification',
      message:
        'This is a test notification! Check check, 1, 2, 3. Are we coming in clear?',
    })
  ) {
    return res.status(204).send();
  } else {
    return next({
      status: 500,
      message: 'Failed to send Pushbullet notification.',
    });
  }
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

notificationRoutes.post('/pushover/test', async (req, res, next) => {
  if (!req.user) {
    return next({
      status: 500,
      message: 'User information is missing from the request.',
    });
  }

  const pushoverAgent = new PushoverAgent(req.body);
  if (
    await pushoverAgent.send(Notification.TEST_NOTIFICATION, {
      notifyUser: req.user,
      subject: 'Test Notification',
      message:
        'This is a test notification! Check check, 1, 2, 3. Are we coming in clear?',
    })
  ) {
    return res.status(204).send();
  } else {
    return next({
      status: 500,
      message: 'Failed to send Pushover notification.',
    });
  }
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

notificationRoutes.post('/email/test', async (req, res, next) => {
  if (!req.user) {
    return next({
      status: 500,
      message: 'User information is missing from the request.',
    });
  }

  const emailAgent = new EmailAgent(req.body);
  if (
    await emailAgent.send(Notification.TEST_NOTIFICATION, {
      notifyUser: req.user,
      subject: 'Test Notification',
      message:
        'This is a test notification! Check check, 1, 2, 3. Are we coming in clear?',
    })
  ) {
    return res.status(204).send();
  } else {
    return next({
      status: 500,
      message: 'Failed to send email notification.',
    });
  }
});

notificationRoutes.get('/webpush', (_req, res) => {
  const settings = getSettings();

  res.status(200).json(settings.notifications.agents.webpush);
});

notificationRoutes.post('/webpush', (req, res) => {
  const settings = getSettings();

  settings.notifications.agents.webpush = req.body;
  settings.save();

  res.status(200).json(settings.notifications.agents.webpush);
});

notificationRoutes.post('/webpush/test', async (req, res, next) => {
  if (!req.user) {
    return next({
      status: 500,
      message: 'User information missing from request',
    });
  }

  const webpushAgent = new WebPushAgent(req.body);
  if (
    await webpushAgent.send(Notification.TEST_NOTIFICATION, {
      notifyUser: req.user,
      subject: 'Test Notification',
      message:
        'This is a test notification! Check check, 1, 2, 3. Are we coming in clear?',
    })
  ) {
    return res.status(204).send();
  } else {
    return next({
      status: 500,
      message: 'Failed to send web push notification.',
    });
  }
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

notificationRoutes.post('/webhook/test', async (req, res, next) => {
  if (!req.user) {
    return next({
      status: 500,
      message: 'User information is missing from the request.',
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
    if (
      await webhookAgent.send(Notification.TEST_NOTIFICATION, {
        notifyUser: req.user,
        subject: 'Test Notification',
        message:
          'This is a test notification! Check check, 1, 2, 3. Are we coming in clear?',
      })
    ) {
      return res.status(204).send();
    } else {
      return next({
        status: 500,
        message: 'Failed to send webhook notification.',
      });
    }
  } catch (e) {
    next({ status: 500, message: e.message });
  }
});

notificationRoutes.get('/lunasea', (_req, res) => {
  const settings = getSettings();

  res.status(200).json(settings.notifications.agents.lunasea);
});

notificationRoutes.post('/lunasea', (req, res) => {
  const settings = getSettings();

  settings.notifications.agents.lunasea = req.body;
  settings.save();

  res.status(200).json(settings.notifications.agents.lunasea);
});

notificationRoutes.post('/lunasea/test', async (req, res, next) => {
  if (!req.user) {
    return next({
      status: 500,
      message: 'User information missing from request',
    });
  }

  const lunaseaAgent = new LunaSeaAgent(req.body);
  if (
    await lunaseaAgent.send(Notification.TEST_NOTIFICATION, {
      notifyUser: req.user,
      subject: 'Test Notification',
      message:
        'This is a test notification! Check check, 1, 2, 3. Are we coming in clear?',
    })
  ) {
    return res.status(204).send();
  } else {
    return next({
      status: 500,
      message: 'Failed to send web push notification.',
    });
  }
});

export default notificationRoutes;
