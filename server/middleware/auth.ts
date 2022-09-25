import { getRepository } from '@server/datasource';
import { User } from '@server/entity/User';
import { getOidcInfo } from '@server/lib/oidc';
import type {
  Permission,
  PermissionCheckOptions,
} from '@server/lib/permissions';
import { getSettings } from '@server/lib/settings';
import { expressjwt as jwt, type GetVerificationKey } from 'express-jwt';
import jwksRsa from 'jwks-rsa';

export const checkUser: Middleware = async (req, _res, next) => {
  const settings = getSettings();
  let user: User | undefined | null;

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
export const checkJwt: Middleware = (req, res, next) => {
  const settings = getSettings();
  settings.load();

  const oidcIssuer =
    settings.fullPublicSettings.oidcIssuer.slice(-1) == '/'
      ? settings.fullPublicSettings.oidcIssuer.slice(0, -1)
      : settings.fullPublicSettings.oidcIssuer;

  const getSecret: GetVerificationKey = async function (req, token) {
    const oidcInfo = await getOidcInfo(oidcIssuer);

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

  jwt({
    // Dynamically provide a signing key based on the kid in the header and the signing keys provided by the JWKS endpoint
    secret: getSecret,
    issuer: oidcIssuer,
    algorithms: ['RS256'],
  })(req, res, next);
};
