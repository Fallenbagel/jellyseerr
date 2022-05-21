import { getClientIp } from '@supercharge/request-ip';
import { TypeormStore } from 'connect-typeorm/out';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import express, { NextFunction, Request, Response } from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import session, { Store } from 'express-session';
import next from 'next';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { createConnection, getRepository } from 'typeorm';
import YAML from 'yamljs';
import PlexAPI from './api/plexapi';
import { Session } from './entity/Session';
import { User } from './entity/User';
import { startJobs } from './job/schedule';
import notificationManager from './lib/notifications';
import DiscordAgent from './lib/notifications/agents/discord';
import EmailAgent from './lib/notifications/agents/email';
import GotifyAgent from './lib/notifications/agents/gotify';
import LunaSeaAgent from './lib/notifications/agents/lunasea';
import PushbulletAgent from './lib/notifications/agents/pushbullet';
import PushoverAgent from './lib/notifications/agents/pushover';
import SlackAgent from './lib/notifications/agents/slack';
import TelegramAgent from './lib/notifications/agents/telegram';
import WebhookAgent from './lib/notifications/agents/webhook';
import WebPushAgent from './lib/notifications/agents/webpush';
import { getSettings } from './lib/settings';
import logger from './logger';
import routes from './routes';
import { getAppVersion } from './utils/appVersion';

const API_SPEC_PATH = path.join(__dirname, '../overseerr-api.yml');

logger.info(`Starting Overseerr version ${getAppVersion()}`);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(async () => {
    const dbConnection = await createConnection();

    // Run migrations in production
    if (process.env.NODE_ENV === 'production') {
      await dbConnection.query('PRAGMA foreign_keys=OFF');
      await dbConnection.runMigrations();
      await dbConnection.query('PRAGMA foreign_keys=ON');
    }

    // Load Settings
    const settings = getSettings().load();

    // Migrate library types
    if (
      settings.plex.libraries.length > 1 &&
      !settings.plex.libraries[0].type
    ) {
      const userRepository = getRepository(User);
      const admin = await userRepository.findOne({
        select: ['id', 'plexToken'],
        order: { id: 'ASC' },
      });

      if (admin) {
        logger.info('Migrating Plex libraries to include media type', {
          label: 'Settings',
        });

        const plexapi = new PlexAPI({ plexToken: admin.plexToken });
        await plexapi.syncLibraries();
      }
    }

    // Register Notification Agents
    notificationManager.registerAgents([
      new DiscordAgent(),
      new EmailAgent(),
      new GotifyAgent(),
      new LunaSeaAgent(),
      new PushbulletAgent(),
      new PushoverAgent(),
      new SlackAgent(),
      new TelegramAgent(),
      new WebhookAgent(),
      new WebPushAgent(),
    ]);

    // Start Jobs
    startJobs();

    const server = express();
    if (settings.main.trustProxy) {
      server.enable('trust proxy');
    }
    server.use(cookieParser());
    server.use(express.json());
    server.use(express.urlencoded({ extended: true }));
    server.use((req, _res, next) => {
      try {
        const descriptor = Object.getOwnPropertyDescriptor(req, 'ip');
        if (descriptor?.writable === true) {
          req.ip = getClientIp(req) ?? '';
        }
      } catch (e) {
        logger.error('Failed to attach the ip to the request', {
          label: 'Middleware',
          message: e.message,
        });
      } finally {
        next();
      }
    });
    if (settings.main.csrfProtection) {
      server.use(
        csurf({
          cookie: {
            httpOnly: true,
            sameSite: true,
            secure: !dev,
          },
        })
      );
      server.use((req, res, next) => {
        res.cookie('XSRF-TOKEN', req.csrfToken(), {
          sameSite: true,
          secure: !dev,
        });
        next();
      });
    }

    // Set up sessions
    const sessionRespository = getRepository(Session);
    server.use(
      '/api',
      session({
        secret: settings.clientId,
        resave: false,
        saveUninitialized: false,
        cookie: {
          maxAge: 1000 * 60 * 60 * 24 * 30,
          httpOnly: true,
          sameSite: true,
          secure: 'auto',
        },
        store: new TypeormStore({
          cleanupLimit: 2,
          ttl: 1000 * 60 * 60 * 24 * 30,
        }).connect(sessionRespository) as Store,
      })
    );
    const apiDocs = YAML.load(API_SPEC_PATH);
    server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(apiDocs));
    server.use(
      OpenApiValidator.middleware({
        apiSpec: API_SPEC_PATH,
        validateRequests: true,
      })
    );
    /**
     * This is a workaround to convert dates to strings before they are validated by
     * OpenAPI validator. Otherwise, they are treated as objects instead of strings
     * and response validation will fail
     */
    server.use((_req, res, next) => {
      const original = res.json;
      res.json = function jsonp(json) {
        return original.call(this, JSON.parse(JSON.stringify(json)));
      };
      next();
    });
    server.use('/api/v1', routes);
    server.get('*', (req, res) => handle(req, res));
    server.use(
      (
        err: { status: number; message: string; errors: string[] },
        _req: Request,
        res: Response,
        // We must provide a next function for the function signature here even though its not used
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _next: NextFunction
      ) => {
        // format error
        res.status(err.status || 500).json({
          message: err.message,
          errors: err.errors,
        });
      }
    );

    const port = Number(process.env.PORT) || 5055;
    const host = process.env.HOST;
    if (host) {
      server.listen(port, host, () => {
        logger.info(`Server ready on ${host} port ${port}`, {
          label: 'Server',
        });
      });
    } else {
      server.listen(port, () => {
        logger.info(`Server ready on port ${port}`, {
          label: 'Server',
        });
      });
    }
  })
  .catch((err) => {
    logger.error(err.stack);
    process.exit(1);
  });
