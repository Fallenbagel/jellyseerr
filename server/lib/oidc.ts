import axios from 'axios';

interface OidcInfo {
  issuer: string;
  jwksUri: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userinfoEndpoint: string;
  introspectionEndpoint: string;
  revocationEndpoint: string;
}

const oidcConfigurationEndpoint = '.well-known/openid-configuration';

export const getOidcInfo = async (oidcIssuerUrl: string): Promise<OidcInfo> => {
  const oidcConfigurationUrl = new URL(
    oidcConfigurationEndpoint,
    oidcIssuerUrl
  );
  const oidcConfiguration: Record<string, string> = (
    await axios.get(oidcConfigurationUrl.href)
  ).data;
  const oidcInfo: OidcInfo = {
    issuer: oidcConfiguration.issuer,
    jwksUri: oidcConfiguration.jwks_uri,
    authorizationEndpoint: oidcConfiguration.authorization_endpoint,
    tokenEndpoint: oidcConfiguration.token_endpoint,
    userinfoEndpoint: oidcConfiguration.userinfo_endpoint,
    introspectionEndpoint: oidcConfiguration.introspection_endpoint,
    revocationEndpoint: oidcConfiguration.revocation_endpoint,
  };
  return oidcInfo;
};
