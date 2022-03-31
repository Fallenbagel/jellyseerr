import { getRepository } from 'typeorm';
import { User } from '../entity/User';
import { Permission, PermissionCheckOptions } from '../lib/permissions';
import { getSettings } from '../lib/settings';

export const checkUser: Middleware = async (req, _res, next) => {
  const settings = getSettings();
  if (req.header('X-API-Key') === settings.main.apiKey) {
    const userRepository = getRepository(User);

    let userId = 1; // Work on original administrator account

    // If a User ID is provided, we will act on that users behalf
    if (req.header('X-API-User')) {
      userId = Number(req.header('X-API-User'));
    }
    const user = await userRepository.findOne({ where: { id: userId } });

    if (user) {
      req.user = user;
    }
  } else if (req.session?.userId) {
    const userRepository = getRepository(User);

    const user = await userRepository.findOne({
      where: { id: req.session.userId },
    });

    if (user) {
      req.user = user;
    }
  }
  next();
};

export const isAuthenticated = (
  permissions?: Permission | Permission[],
  options?: PermissionCheckOptions
): Middleware => {
  const authMiddleware: Middleware = (req, res, next) => {
    if (!req.user || !req.user.hasPermission(permissions ?? 0, options)) {
      res.status(403).json({
        status: 403,
        error: 'You do not have permission to access this endpoint',
      });
    } else {
      next();
    }
  };
  return authMiddleware;
};
