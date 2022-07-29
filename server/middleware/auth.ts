import { expressjwt as jwt, GetVerificationKey } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import { getRepository } from 'typeorm';
import { User } from '../entity/User';
import { getOidcInfo } from '../lib/oidc';
import { Permission, PermissionCheckOptions } from '../lib/permissions';
import { getSettings } from '../lib/settings';

export const checkUser: Middleware = async (req, _res, next) => {
  const settings = getSettings();
  let user: User | undefined;

  if (req.header('X-API-Key') === settings.main.apiKey) {
    const userRepository = getRepository(User);

    let userId = 1; // Work on original administrator account

    // If a User ID is provided, we will act on that user's behalf
    if (req.header('X-API-User')) {
      userId = Number(req.header('X-API-User'));
    }

    user = await userRepository.findOne({ where: { id: userId } });
  } else if (req.session?.userId) {
    const userRepository = getRepository(User);

    user = await userRepository.findOne({
      where: { id: req.session.userId },
    });
  }

  if (user) {
    req.user = user;
  }

  req.locale = user?.settings?.locale
    ? user.settings.locale
    : settings.main.locale;

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

// checking the JWT
export const checkJwt = (): Middleware => {
  const settings = getSettings();
  settings.load();

  const getSecret: GetVerificationKey = async function (req, token) {
    const oidcInfo = await getOidcInfo(settings.fullPublicSettings.oidcIssuer);

    const secret = (
      jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: oidcInfo.jwksUri,
      }) as GetVerificationKey
    )(req, token);

    return secret;
  };

  return jwt({
    // Dynamically provide a signing key based on the kid in the header and the signing keys provided by the JWKS endpoint
    secret: getSecret,
    issuer: settings.fullPublicSettings.oidcIssuer,
    algorithms: ['RS256'],
  });
};
