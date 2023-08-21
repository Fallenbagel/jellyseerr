import JellyfinAPI from '@server/api/jellyfin';
import PlexTvAPI from '@server/api/plextv';
import { MediaServerType } from '@server/constants/server';
import { UserType } from '@server/constants/user';
import { getRepository } from '@server/datasource';
import { User } from '@server/entity/User';
import type { IdTokenClaims } from '@server/interfaces/api/oidcInterfaces';
import { startJobs } from '@server/job/schedule';
import { Permission } from '@server/lib/permissions';
import { getSettings } from '@server/lib/settings';
import logger from '@server/logger';
import { isAuthenticated } from '@server/middleware/auth';
import {
  createIdTokenSchema,
  fetchOIDCTokenData,
  getOIDCRedirectUrl,
  getOIDCUserInfo,
  getOIDCWellknownConfiguration,
  type FullUserInfo,
} from '@server/utils/oidc';
import { randomBytes } from 'crypto';
import * as EmailValidator from 'email-validator';
import { Router } from 'express';
import gravatarUrl from 'gravatar-url';
import decodeJwt from 'jwt-decode';

const authRoutes = Router();

authRoutes.get('/me', isAuthenticated(), async (req, res) => {
  const userRepository = getRepository(User);
  if (!req.user) {
    return res.status(500).json({
      status: 500,
      error: 'Please sign in.',
    });
  }
  const user = await userRepository.findOneOrFail({
    where: { id: req.user.id },
  });

  // check if email is required in settings and if user has an valid email
  const settings = await getSettings();
  if (
    settings.notifications.agents.email.options.userEmailRequired &&
    !EmailValidator.validate(user.email)
  ) {
    user.warnings.push('userEmailRequired');
    logger.warn(`User ${user.username} has no valid email address`);
  }

  return res.status(200).json(user);
});

authRoutes.post('/plex', async (req, res, next) => {
  const settings = getSettings();
  const userRepository = getRepository(User);
  const body = req.body as { authToken?: string };

  if (!body.authToken) {
    return next({
      status: 500,
      message: 'Authentication token required.',
    });
  }

  if (
    settings.main.mediaServerType != MediaServerType.PLEX &&
    settings.main.mediaServerType != MediaServerType.NOT_CONFIGURED
  ) {
    return res.status(500).json({ error: 'Plex login is disabled' });
  }
  try {
    // First we need to use this auth token to get the user's email from plex.tv
    const plextv = new PlexTvAPI(body.authToken);
    const account = await plextv.getUser();

    // Next let's see if the user already exists
    let user = await userRepository
      .createQueryBuilder('user')
      .where('user.plexId = :id', { id: account.id })
      .orWhere('user.email = :email', {
        email: account.email.toLowerCase(),
      })
      .getOne();

    if (!user && !(await userRepository.count())) {
      user = new User({
        email: account.email,
        plexUsername: account.username,
        plexId: account.id,
        plexToken: account.authToken,
        permissions: Permission.ADMIN,
        avatar: account.thumb,
        userType: UserType.PLEX,
      });

      settings.main.mediaServerType = MediaServerType.PLEX;
      settings.save();
      startJobs();

      await userRepository.save(user);
    } else {
      const mainUser = await userRepository.findOneOrFail({
        select: { id: true, plexToken: true, plexId: true, email: true },
        where: { id: 1 },
      });
      const mainPlexTv = new PlexTvAPI(mainUser.plexToken ?? '');

      if (!account.id) {
        logger.error('Plex ID was missing from Plex.tv response', {
          label: 'API',
          ip: req.ip,
          email: account.email,
          plexUsername: account.username,
        });

        return next({
          status: 500,
          message: 'Something went wrong. Try again.',
        });
      }

      if (
        account.id === mainUser.plexId ||
        (account.email === mainUser.email && !mainUser.plexId) ||
        (await mainPlexTv.checkUserAccess(account.id))
      ) {
        if (user) {
          if (!user.plexId) {
            logger.info(
              'Found matching Plex user; updating user with Plex data',
              {
                label: 'API',
                ip: req.ip,
                email: user.email,
                userId: user.id,
                plexId: account.id,
                plexUsername: account.username,
              }
            );
          }

          user.plexToken = body.authToken;
          user.plexId = account.id;
          user.avatar = account.thumb;
          user.email = account.email;
          user.plexUsername = account.username;
          user.userType = UserType.PLEX;

          await userRepository.save(user);
        } else if (!settings.main.newPlexLogin) {
          logger.warn(
            'Failed sign-in attempt by unimported Plex user with access to the media server',
            {
              label: 'API',
              ip: req.ip,
              email: account.email,
              plexId: account.id,
              plexUsername: account.username,
            }
          );
          return next({
            status: 403,
            message: 'Access denied.',
          });
        } else {
          logger.info(
            'Sign-in attempt from Plex user with access to the media server; creating new Overseerr user',
            {
              label: 'API',
              ip: req.ip,
              email: account.email,
              plexId: account.id,
              plexUsername: account.username,
            }
          );
          user = new User({
            email: account.email,
            plexUsername: account.username,
            plexId: account.id,
            plexToken: account.authToken,
            permissions: settings.main.defaultPermissions,
            avatar: account.thumb,
            userType: UserType.PLEX,
          });

          await userRepository.save(user);
        }
      } else {
        logger.warn(
          'Failed sign-in attempt by Plex user without access to the media server',
          {
            label: 'API',
            ip: req.ip,
            email: account.email,
            plexId: account.id,
            plexUsername: account.username,
          }
        );
        return next({
          status: 403,
          message: 'Access denied.',
        });
      }
    }

    // Set logged in session
    if (req.session) {
      req.session.userId = user.id;
    }

    return res.status(200).json(user?.filter() ?? {});
  } catch (e) {
    logger.error('Something went wrong authenticating with Plex account', {
      label: 'API',
      errorMessage: e.message,
      ip: req.ip,
    });
    return next({
      status: 500,
      message: 'Unable to authenticate.',
    });
  }
});

authRoutes.post('/jellyfin', async (req, res, next) => {
  const settings = getSettings();
  const userRepository = getRepository(User);
  const body = req.body as {
    username?: string;
    password?: string;
    hostname?: string;
    email?: string;
  };

  //Make sure jellyfin login is enabled, but only if jellyfin is not already configured
  if (
    settings.main.mediaServerType !== MediaServerType.JELLYFIN &&
    settings.jellyfin.hostname !== ''
  ) {
    return res.status(500).json({ error: 'Jellyfin login is disabled' });
  } else if (!body.username) {
    return res.status(500).json({ error: 'You must provide an username' });
  } else if (settings.jellyfin.hostname !== '' && body.hostname) {
    return res
      .status(500)
      .json({ error: 'Jellyfin hostname already configured' });
  } else if (settings.jellyfin.hostname === '' && !body.hostname) {
    return res.status(500).json({ error: 'No hostname provided.' });
  }

  try {
    const hostname =
      settings.jellyfin.hostname !== ''
        ? settings.jellyfin.hostname
        : body.hostname ?? '';
    const { externalHostname } = getSettings().jellyfin;

    // Try to find deviceId that corresponds to jellyfin user, else generate a new one
    let user = await userRepository.findOne({
      where: { jellyfinUsername: body.username },
    });

    let deviceId = '';
    if (user) {
      deviceId = user.jellyfinDeviceId ?? '';
    } else {
      deviceId = Buffer.from(`BOT_overseerr_${body.username ?? ''}`).toString(
        'base64'
      );
    }
    // First we need to attempt to log the user in to jellyfin
    const jellyfinserver = new JellyfinAPI(hostname ?? '', undefined, deviceId);
    let jellyfinHost =
      externalHostname && externalHostname.length > 0
        ? externalHostname
        : hostname;

    jellyfinHost = jellyfinHost.endsWith('/')
      ? jellyfinHost.slice(0, -1)
      : jellyfinHost;

    const account = await jellyfinserver.login(body.username, body.password);
    // Next let's see if the user already exists
    user = await userRepository.findOne({
      where: { jellyfinUserId: account.User.Id },
    });

    if (user) {
      // Let's check if their authtoken is up to date
      if (user.jellyfinAuthToken !== account.AccessToken) {
        user.jellyfinAuthToken = account.AccessToken;
      }

      // Update the users avatar with their jellyfin profile pic (incase it changed)
      if (account.User.PrimaryImageTag) {
        user.avatar = `${jellyfinHost}/Users/${account.User.Id}/Images/Primary/?tag=${account.User.PrimaryImageTag}&quality=90`;
      } else {
        user.avatar = '/os_logo_square.png';
      }

      user.jellyfinUsername = account.User.Name;

      if (user.username === account.User.Name) {
        user.username = '';
      }
      await userRepository.save(user);
    } else if (!settings.main.newPlexLogin) {
      logger.warn(
        'Failed sign-in attempt by unimported Jellyfin user with access to the media server',
        {
          label: 'API',
          ip: req.ip,
          jellyfinUserId: account.User.Id,
          jellyfinUsername: account.User.Name,
        }
      );
      return next({
        status: 403,
        message: 'Access denied.',
      });
    } else {
      // Here we check if it's the first user. If it is, we create the user with no check
      // and give them admin permissions
      const totalUsers = await userRepository.count();
      if (totalUsers === 0) {
        logger.info(
          'Sign-in attempt from Jellyfin user with access to the media server; creating initial admin user for Overseerr',
          {
            label: 'API',
            ip: req.ip,
            jellyfinUsername: account.User.Name,
          }
        );
        user = new User({
          email: body.email,
          jellyfinUsername: account.User.Name,
          jellyfinUserId: account.User.Id,
          jellyfinDeviceId: deviceId,
          jellyfinAuthToken: account.AccessToken,
          permissions: Permission.ADMIN,
          avatar: account.User.PrimaryImageTag
            ? `${jellyfinHost}/Users/${account.User.Id}/Images/Primary/?tag=${account.User.PrimaryImageTag}&quality=90`
            : '/os_logo_square.png',
          userType: UserType.JELLYFIN,
        });
        await userRepository.save(user);

        //Update hostname in settings if it doesn't exist (initial configuration)
        //Also set mediaservertype to JELLYFIN
        if (settings.jellyfin.hostname === '') {
          settings.main.mediaServerType = MediaServerType.JELLYFIN;
          settings.jellyfin.hostname = body.hostname ?? '';
          settings.jellyfin.serverId = account.User.ServerId;
          settings.save();
          startJobs();
        }
      }

      if (!user) {
        if (!body.email) {
          throw new Error('add_email');
        }

        user = new User({
          email: body.email,
          jellyfinUsername: account.User.Name,
          jellyfinUserId: account.User.Id,
          jellyfinDeviceId: deviceId,
          jellyfinAuthToken: account.AccessToken,
          permissions: settings.main.defaultPermissions,
          avatar: account.User.PrimaryImageTag
            ? `${jellyfinHost}/Users/${account.User.Id}/Images/Primary/?tag=${account.User.PrimaryImageTag}&quality=90`
            : '/os_logo_square.png',
          userType: UserType.JELLYFIN,
        });
        //initialize Jellyfin/Emby users with local login
        const passedExplicitPassword =
          body.password && body.password.length > 0;
        if (passedExplicitPassword) {
          await user.setPassword(body.password ?? '');
        }
        await userRepository.save(user);
      }
    }

    // Set logged in session
    if (req.session) {
      req.session.userId = user?.id;
    }

    return res.status(200).json(user?.filter() ?? {});
  } catch (e) {
    if (e.message === 'Unauthorized') {
      logger.warn(
        'Failed login attempt from user with incorrect Jellyfin credentials',
        {
          label: 'Auth',
          account: {
            ip: req.ip,
            email: body.username,
            password: '__REDACTED__',
          },
        }
      );
      return next({
        status: 401,
        message: 'Unauthorized',
      });
    } else if (e.message === 'add_email') {
      return next({
        status: 406,
        message: 'CREDENTIAL_ERROR_ADD_EMAIL',
      });
    } else {
      logger.error(e.message, { label: 'Auth' });
      return next({
        status: 500,
        message: 'Something went wrong.',
      });
    }
  }
});

authRoutes.post('/local', async (req, res, next) => {
  const settings = getSettings();
  const userRepository = getRepository(User);
  const body = req.body as { email?: string; password?: string };

  if (!settings.main.localLogin) {
    return res.status(500).json({ error: 'Password sign-in is disabled.' });
  } else if (!body.email || !body.password) {
    return res.status(500).json({
      error: 'You must provide both an email address and a password.',
    });
  }
  try {
    const user = await userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.email', 'user.password', 'user.plexId'])
      .where('user.email = :email', { email: body.email.toLowerCase() })
      .getOne();

    if (!user || !(await user.passwordMatch(body.password))) {
      logger.warn('Failed sign-in attempt using invalid Overseerr password', {
        label: 'API',
        ip: req.ip,
        email: body.email,
        userId: user?.id,
      });
      return next({
        status: 403,
        message: 'Access denied.',
      });
    }

    const mainUser = await userRepository.findOneOrFail({
      select: { id: true, plexToken: true, plexId: true },
      where: { id: 1 },
    });
    const mainPlexTv = new PlexTvAPI(mainUser.plexToken ?? '');

    if (!user.plexId) {
      try {
        const plexUsersResponse = await mainPlexTv.getUsers();
        const account = plexUsersResponse.MediaContainer.User.find(
          (account) =>
            account.$.email &&
            account.$.email.toLowerCase() === user.email.toLowerCase()
        )?.$;

        if (
          account &&
          (await mainPlexTv.checkUserAccess(parseInt(account.id)))
        ) {
          logger.info(
            'Found matching Plex user; updating user with Plex data',
            {
              label: 'API',
              ip: req.ip,
              email: body.email,
              userId: user.id,
              plexId: account.id,
              plexUsername: account.username,
            }
          );

          user.plexId = parseInt(account.id);
          user.avatar = account.thumb;
          user.email = account.email;
          user.plexUsername = account.username;
          user.userType = UserType.PLEX;

          await userRepository.save(user);
        }
      } catch (e) {
        logger.error('Something went wrong fetching Plex users', {
          label: 'API',
          errorMessage: e.message,
        });
      }
    }

    if (
      user.plexId &&
      user.plexId !== mainUser.plexId &&
      !(await mainPlexTv.checkUserAccess(user.plexId))
    ) {
      logger.warn(
        'Failed sign-in attempt from Plex user without access to the media server',
        {
          label: 'API',
          account: {
            ip: req.ip,
            email: body.email,
            userId: user.id,
            plexId: user.plexId,
          },
        }
      );
      return next({
        status: 403,
        message: 'Access denied.',
      });
    }

    // Set logged in session
    if (user && req.session) {
      req.session.userId = user.id;
    }

    return res.status(200).json(user?.filter() ?? {});
  } catch (e) {
    logger.error(
      'Something went wrong authenticating with Overseerr password',
      {
        label: 'API',
        errorMessage: e.message,
        ip: req.ip,
        email: body.email,
      }
    );
    return next({
      status: 500,
      message: 'Unable to authenticate.',
    });
  }
});

authRoutes.post('/logout', (req, res, next) => {
  req.session?.destroy((err) => {
    if (err) {
      return next({
        status: 500,
        message: 'Something went wrong.',
      });
    }

    return res.status(200).json({ status: 'ok' });
  });
});

authRoutes.post('/reset-password', async (req, res, next) => {
  const userRepository = getRepository(User);
  const body = req.body as { email?: string };

  if (!body.email) {
    return next({
      status: 500,
      message: 'Email address required.',
    });
  }

  const user = await userRepository
    .createQueryBuilder('user')
    .where('user.email = :email', { email: body.email.toLowerCase() })
    .getOne();

  if (user) {
    await user.resetPassword();
    userRepository.save(user);
    logger.info('Successfully sent password reset link', {
      label: 'API',
      ip: req.ip,
      email: body.email,
    });
  } else {
    logger.error('Something went wrong sending password reset link', {
      label: 'API',
      ip: req.ip,
      email: body.email,
    });
  }

  return res.status(200).json({ status: 'ok' });
});

authRoutes.post('/reset-password/:guid', async (req, res, next) => {
  const userRepository = getRepository(User);

  if (!req.body.password || req.body.password?.length < 8) {
    logger.warn('Failed password reset attempt using invalid new password', {
      label: 'API',
      ip: req.ip,
      guid: req.params.guid,
    });
    return next({
      status: 500,
      message: 'Password must be at least 8 characters long.',
    });
  }

  const user = await userRepository.findOne({
    where: { resetPasswordGuid: req.params.guid },
  });

  if (!user) {
    logger.warn('Failed password reset attempt using invalid recovery link', {
      label: 'API',
      ip: req.ip,
      guid: req.params.guid,
    });
    return next({
      status: 500,
      message: 'Invalid password reset link.',
    });
  }

  if (
    !user.recoveryLinkExpirationDate ||
    user.recoveryLinkExpirationDate <= new Date()
  ) {
    logger.warn('Failed password reset attempt using expired recovery link', {
      label: 'API',
      ip: req.ip,
      guid: req.params.guid,
      email: user.email,
    });
    return next({
      status: 500,
      message: 'Invalid password reset link.',
    });
  }
  user.recoveryLinkExpirationDate = null;
  userRepository.save(user);
  logger.info('Successfully reset password', {
    label: 'API',
    ip: req.ip,
    guid: req.params.guid,
    email: user.email,
  });

  return res.status(200).json({ status: 'ok' });
});

authRoutes.get('/oidc-login', async (req, res, next) => {
  const settings = getSettings();

  if (!settings.main.oidcLogin) {
    return next({
      status: 403,
      message: 'OpenID Connect sign-in is disabled.',
    });
  }

  const state = randomBytes(32).toString('hex');
  let redirectUrl;

  try {
    redirectUrl = await getOIDCRedirectUrl(req, state);
  } catch (err) {
    logger.info('Failed OIDC login attempt', {
      cause: 'Failed to fetch OIDC redirect url',
      ip: req.ip,
      errorMessage: err.message,
    });
    return next({
      status: 500,
      message: 'Failed to fetch OpenID Connect redirect url.',
    });
  }

  res.cookie('oidc-state', state, {
    maxAge: 60000,
    httpOnly: true,
    secure: req.protocol === 'https',
  });
  return res.redirect(redirectUrl);
});

authRoutes.get('/oidc-callback', async (req, res, next) => {
  const settings = getSettings();
  const { oidcLogin, oidcDomain, oidcClientId } = settings.main;

  if (!oidcLogin) {
    return next({
      status: 403,
      message: 'OpenID Connect sign-in is disabled.',
    });
  }

  const cookieState = req.cookies['oidc-state'];
  const url = new URL(req.url, `${req.protocol}://${req.hostname}`);
  const state = url.searchParams.get('state');

  try {
    // Check that the request belongs to the correct state
    if (state && cookieState === state) {
      res.clearCookie('oidc-state');
    } else {
      logger.info('Failed OIDC login attempt', {
        cause: 'Invalid state',
        ip: req.ip,
        state: state,
        cookieState: cookieState,
      });
      return next({
        status: 400,
        message: 'Invalid state.',
      });
    }

    // Check that a code has been issued
    const code = url.searchParams.get('code');
    if (!code) {
      logger.info('Failed OIDC login attempt', {
        cause: 'Invalid code',
        ip: req.ip,
        code: code,
      });
      return next({
        status: 400,
        message: 'Invalid code.',
      });
    }

    const wellKnownInfo = await getOIDCWellknownConfiguration(oidcDomain);

    // Fetch the token data
    const body = (await fetchOIDCTokenData(req, wellKnownInfo, code)) as
      | { id_token: string; access_token: string; error: never }
      | { error: string };

    // Validate that the token response is valid and not manipulated
    if (body.error) {
      logger.info('Failed OIDC login attempt', {
        cause: 'Invalid token response',
        ip: req.ip,
        body: body,
      });
      return next({
        status: 403,
        message: 'Invalid token response.',
      });
    }

    // Extract the ID token and access token
    const { id_token: idToken, access_token: accessToken } = body as Extract<
      typeof body,
      { id_token: string; access_token: string }
    >;

    // Attempt to decode ID token jwt, catch and return any errors
    const tryDecodeJwt = (): [IdTokenClaims | null, unknown] => {
      try {
        const decoded: IdTokenClaims = decodeJwt(idToken);
        return [decoded, null];
      } catch (error) {
        return [null, error];
      }
    };
    const [decoded, err] = tryDecodeJwt();

    if (err != null) {
      logger.info('Failed OIDC login attempt', {
        cause: 'Invalid jwt',
        ip: req.ip,
        idToken: idToken,
      });
      return next({
        status: 403,
        message: 'Invalid jwt.',
      });
    }

    // Merge claims from JWT with data from userinfo endpoint
    const userInfo = await getOIDCUserInfo(wellKnownInfo, accessToken);
    const fullUserInfo: FullUserInfo = { ...decoded, ...userInfo };

    // Validate ID token jwt and user info
    try {
      const idTokenSchema = createIdTokenSchema({
        oidcClientId: oidcClientId,
        oidcDomain: oidcDomain,
      });
      await idTokenSchema.validate(fullUserInfo);
    } catch (err) {
      logger.info('Failed OIDC login attempt', {
        cause: 'Invalid jwt or missing claims',
        ip: req.ip,
        idToken: idToken,
        errorMessage: err.message,
      });
      return next({
        status: 403,
        message: `Validation failed: ${err.message}.`,
      });
    }

    // Check that email is verified
    if (!fullUserInfo.email_verified) {
      logger.info('Failed OIDC login attempt', {
        cause: 'Email not verified',
        ip: req.ip,
        email: fullUserInfo.email,
      });
      return next({
        status: 403,
        message: 'Email not verified.',
      });
    }

    // Map email to user
    const userRepository = getRepository(User);
    let user = await userRepository.findOne({
      where: { email: fullUserInfo.email },
    });

    // Map username to media server username
    if (settings.main.oidcMatchUsername && !user) {
      user = await userRepository.findOne({
        where: [
          { plexUsername: fullUserInfo.preferred_username },
          { jellyfinUsername: fullUserInfo.preferred_username },
        ],
      });
    }

    // Create user if one doesn't already exist
    if (!user) {
      logger.info(`Creating user for ${fullUserInfo.email}`, {
        ip: req.ip,
        email: fullUserInfo.email,
      });
      const avatar =
        fullUserInfo.picture ??
        gravatarUrl(fullUserInfo.email, { default: 'mm', size: 200 });
      user = new User({
        avatar: avatar,
        username: fullUserInfo.preferred_username,
        email: fullUserInfo.email,
        permissions: settings.main.defaultPermissions,
        plexToken: '',
        userType: UserType.LOCAL,
      });
      await userRepository.save(user);
    }

    // Set logged in session and return
    if (req.session) {
      req.session.userId = user.id;
    }

    // Success!
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    logger.error('Failed OIDC login attempt', {
      cause: 'Unknown error',
      ip: req.ip,
      errorMessage: error.message,
    });
    return next({
      status: 500,
      message: 'An unknown error occurred.',
    });
  }
});

export default authRoutes;
