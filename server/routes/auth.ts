import { Router } from 'express';
import { getRepository } from 'typeorm';
import JellyfinAPI from '../api/jellyfin';
import PlexTvAPI from '../api/plextv';
import { MediaServerType } from '../constants/server';
import { UserType } from '../constants/user';
import { User } from '../entity/User';
import { Permission } from '../lib/permissions';
import { getSettings } from '../lib/settings';
import logger from '../logger';
import { isAuthenticated } from '../middleware/auth';

const authRoutes = Router();

authRoutes.get('/me', isAuthenticated(), async (req, res) => {
  const userRepository = getRepository(User);
  if (!req.user) {
    return res.status(500).json({
      status: 500,
      error:
        'Requested user endpoint without valid authenticated user in session',
    });
  }
  const user = await userRepository.findOneOrFail({
    where: { id: req.user.id },
  });

  return res.status(200).json(user);
});

authRoutes.post('/plex', async (req, res, next) => {
  const settings = getSettings();
  const userRepository = getRepository(User);
  const body = req.body as {
    authToken?: string;
  };

  if (!body.authToken) {
    return res.status(500).json({ error: 'You must provide an auth token' });
  }

  if (
    settings.main.mediaServerType != MediaServerType.PLEX &&
    settings.main.mediaServerType != MediaServerType.NOT_CONFIGURED
  ) {
    return res.status(500).json({ error: 'Plex login is disabled' });
  }
  try {
    // First we need to use this auth token to get the users email from plex.tv
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

    if (user) {
      // Let's check if their Plex token is up-to-date
      if (user.plexToken !== body.authToken) {
        user.plexToken = body.authToken;
      }

      // Update the user's avatar with their Plex thumbnail, in case it changed
      user.avatar = account.thumb;
      user.email = account.email;
      user.plexUsername = account.username;

      // In case the user was previously a local account
      if (user.userType === UserType.LOCAL) {
        user.userType = UserType.PLEX;
        user.plexId = account.id;
      }

      await userRepository.save(user);
    } else {
      // Here we check if it's the first user. If it is, we create the user with no check
      // and give them admin permissions
      const totalUsers = await userRepository.count();

      if (totalUsers === 0) {
        user = new User({
          email: account.email,
          plexUsername: account.username,
          plexId: account.id,
          plexToken: account.authToken,
          permissions: Permission.ADMIN,
          avatar: account.thumb,
          userType: UserType.PLEX,
        });
        await userRepository.save(user);

        //Since we created the admin user, go ahead and set the mediaservertype to PLEX
        settings.main.mediaServerType = MediaServerType.PLEX;
      }

      // Double check that we didn't create the first admin user before running this
      if (!user) {
        if (!settings.main.newPlexLogin) {
          logger.info(
            'Failed sign-in attempt from user who has not been imported to Overseerr.',
            {
              label: 'Auth',
              account: {
                ...account,
                authentication_token: '__REDACTED__',
                authToken: '__REDACTED__',
              },
            }
          );
          return next({
            status: 403,
            message: 'Access denied.',
          });
        }

        // If we get to this point, the user does not already exist so we need to create the
        // user _assuming_ they have access to the Plex server
        const mainUser = await userRepository.findOneOrFail({
          select: ['id', 'plexToken'],
          order: { id: 'ASC' },
        });
        const mainPlexTv = new PlexTvAPI(mainUser.plexToken ?? '');

        if (await mainPlexTv.checkUserAccess(account.id)) {
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
        } else {
          logger.info(
            'Failed sign-in attempt from user without access to the Plex server.',
            {
              label: 'Auth',
              account: {
                ...account,
                authentication_token: '__REDACTED__',
                authToken: '__REDACTED__',
              },
            }
          );
          return next({
            status: 403,
            message: 'Access denied.',
          });
        }
      }
    }

    // Set logged in session
    if (req.session) {
      req.session.userId = user.id;
    }

    return res.status(200).json(user?.filter() ?? {});
  } catch (e) {
    logger.error(e.message, { label: 'Auth' });
    return next({
      status: 500,
      message: 'Something went wrong.',
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
  } else if (!body.username || !body.password) {
    return res
      .status(500)
      .json({ error: 'You must provide an username and a password' });
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
        : body.hostname;
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
        user.avatar = `${hostname}/Users/${account.User.Id}/Images/Primary/?tag=${account.User.PrimaryImageTag}&quality=90`;
      } else {
        user.avatar = '/os_logo_square.png';
      }

      user.jellyfinUsername = account.User.Name;

      if (user.username === account.User.Name) {
        user.username = '';
      }
      await userRepository.save(user);
    } else {
      // Here we check if it's the first user. If it is, we create the user with no check
      // and give them admin permissions
      const totalUsers = await userRepository.count();
      if (totalUsers === 0) {
        user = new User({
          email: body.email,
          jellyfinUsername: account.User.Name,
          jellyfinUserId: account.User.Id,
          jellyfinDeviceId: deviceId,
          jellyfinAuthToken: account.AccessToken,
          permissions: Permission.ADMIN,
          avatar: account.User.PrimaryImageTag
            ? `${hostname}/Users/${account.User.Id}/Images/Primary/?tag=${account.User.PrimaryImageTag}&quality=90`
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
            ? `${hostname}/Users/${account.User.Id}/Images/Primary/?tag=${account.User.PrimaryImageTag}&quality=90`
            : '/os_logo_square.png',
          userType: UserType.JELLYFIN,
        });
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
      logger.info(
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
    return res.status(500).json({ error: 'Local user sign-in is disabled.' });
  } else if (!body.email || !body.password) {
    return res.status(500).json({
      error: 'You must provide both an email address and a password.',
    });
  }
  try {
    const user = await userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.password'])
      .where('user.email = :email', { email: body.email.toLowerCase() })
      .getOne();

    const isCorrectCredentials = await user?.passwordMatch(body.password);

    // User doesn't exist or credentials are incorrect
    if (!isCorrectCredentials) {
      logger.info(
        'Failed sign-in attempt from user with incorrect credentials.',
        {
          label: 'Auth',
          account: {
            ip: req.ip,
            email: body.email,
            password: '__REDACTED__',
          },
        }
      );
      return next({
        status: 403,
        message: 'Your sign-in credentials are incorrect.',
      });
    }

    // Set logged in session
    if (user && req.session) {
      req.session.userId = user.id;
    }

    return res.status(200).json(user?.filter() ?? {});
  } catch (e) {
    logger.error('Something went wrong while attempting to authenticate.', {
      label: 'Auth',
      error: e.message,
    });
    return next({
      status: 500,
      message: 'Something went wrong.',
    });
  }
});

authRoutes.post('/logout', (req, res, next) => {
  req.session?.destroy((err) => {
    if (err) {
      return next({
        status: 500,
        message: 'Something went wrong while attempting to sign out.',
      });
    }

    return res.status(200).json({ status: 'ok' });
  });
});

authRoutes.post('/reset-password', async (req, res) => {
  const userRepository = getRepository(User);
  const body = req.body as { email?: string };

  if (!body.email) {
    return res
      .status(500)
      .json({ error: 'You must provide an email address.' });
  }

  const user = await userRepository
    .createQueryBuilder('user')
    .where('user.email = :email', { email: body.email.toLowerCase() })
    .getOne();

  if (user) {
    await user.resetPassword();
    userRepository.save(user);
    logger.info('Successful request made for recovery link.', {
      label: 'User Management',
      context: { ip: req.ip, email: body.email },
    });
  } else {
    logger.info('Failed request made to reset a password.', {
      label: 'User Management',
      context: { ip: req.ip, email: body.email },
    });
  }

  return res.status(200).json({ status: 'ok' });
});

authRoutes.post('/reset-password/:guid', async (req, res, next) => {
  const userRepository = getRepository(User);

  try {
    if (!req.body.password || req.body.password?.length < 8) {
      const message =
        'Failed to reset password. Password must be at least 8 characters long.';
      logger.info(message, {
        label: 'User Management',
        context: { ip: req.ip, guid: req.params.guid },
      });
      return next({ status: 500, message: message });
    }

    const user = await userRepository.findOne({
      where: { resetPasswordGuid: req.params.guid },
    });

    if (!user) {
      throw new Error('Guid invalid.');
    }

    if (
      !user.recoveryLinkExpirationDate ||
      user.recoveryLinkExpirationDate <= new Date()
    ) {
      throw new Error('Recovery link expired.');
    }

    await user.setPassword(req.body.password);
    user.recoveryLinkExpirationDate = null;
    userRepository.save(user);
    logger.info(`Successfully reset password`, {
      label: 'User Management',
      context: { ip: req.ip, guid: req.params.guid, email: user.email },
    });

    return res.status(200).json({ status: 'ok' });
  } catch (e) {
    logger.info(`Failed to reset password. ${e.message}`, {
      label: 'User Management',
      context: { ip: req.ip, guid: req.params.guid },
    });
    return res.status(200).json({ status: 'ok' });
  }
});

export default authRoutes;
