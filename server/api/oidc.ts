import ExternalAPI from '@server/api/externalapi';
import cacheManager from '@server/lib/cache';
import logger from '@server/logger';

interface OidcInfo {
  issuer: string;
  jwks_uri: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  introspection_endpoint: string;
  revocation_endpoint: string;
}

class OidcAPI extends ExternalAPI {
  constructor(oidcIssuerUrl: string) {
    super(
      oidcIssuerUrl,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        nodeCache: cacheManager.getCache('oidc').data,
      }
    );
  }

  public async getOidcInfo(): Promise<OidcInfo> {
    try {
      const data = await this.get<OidcInfo>(
        '/.well-known/openid-configuration'
      );

      return data;
    } catch (e) {
      // put an error in the log
      logger.warn(
        'Failed to retrieve data from OIDC discovery endpoint. The OpenID Connect issuer configuration may be invalid.',
        { label: 'OIDC', errorMessage: e.message }
      );

      throw e;
    }
  }
}

export default OidcAPI;
