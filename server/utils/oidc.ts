import type {
  IdTokenClaims,
  Mandatory,
  OidcStandardClaims,
} from '@server/interfaces/api/oidcInterfaces';
import { getSettings } from '@server/lib/settings';
import axios from 'axios';
import type { Request } from 'express';
import * as yup from 'yup';

/** Fetch the oidc configuration blob */
export async function getOIDCWellknownConfiguration(domain: string) {
  // remove trailing slash from url if it exists and add /.well-known/openid-configuration path
  const wellKnownUrl = new URL(
    domain.replace(/\/$/, '') + '/.well-known/openid-configuration'
  ).toString();

  const wellKnownInfo: WellKnownConfiguration = await axios
    .get(wellKnownUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((r) => r.data);

  return wellKnownInfo;
}

/** Generate authentication request url */
export async function getOIDCRedirectUrl(req: Request, state: string) {
  const settings = getSettings();
  const { oidc } = settings.main;

  const wellKnownInfo = await getOIDCWellknownConfiguration(oidc.providerUrl);
  const url = new URL(wellKnownInfo.authorization_endpoint);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', oidc.clientId);

  const callbackUrl = new URL(
    '/login/oidc/callback',
    `${req.protocol}://${req.headers.host}`
  ).toString();
  url.searchParams.set('redirect_uri', callbackUrl);
  url.searchParams.set('scope', 'openid profile email');
  url.searchParams.set('state', state);
  return url.toString();
}

type OIDCTokenResponse =
  | { id_token: string; access_token: string }
  | { error: string };

/** Exchange authorization code for token data */
export async function fetchOIDCTokenData(
  req: Request,
  wellKnownInfo: WellKnownConfiguration,
  code: string
): Promise<OIDCTokenResponse> {
  const settings = getSettings();
  const { oidc } = settings.main;

  const callbackUrl = new URL(
    '/login/oidc/callback',
    `${req.protocol}://${req.headers.host}`
  );

  const formData = new URLSearchParams();
  formData.append('client_secret', oidc.clientSecret);
  formData.append('grant_type', 'authorization_code');
  formData.append('redirect_uri', callbackUrl.toString());
  formData.append('client_id', oidc.clientId);
  formData.append('code', code);

  return await axios
    .post<OIDCTokenResponse>(wellKnownInfo.token_endpoint, formData)
    .then((r) => r.data);
}

export async function getOIDCUserInfo(
  wellKnownInfo: WellKnownConfiguration,
  authToken: string
) {
  const userInfo = await axios
    .get(wellKnownInfo.userinfo_endpoint, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: 'application/json',
      },
    })
    .then((r) => r.data);

  return userInfo;
}

class OidcAuthorizationError extends Error {}

class OidcMissingKeyError extends OidcAuthorizationError {
  constructor(public userInfo: FullUserInfo, public key: string) {
    super(`Key ${key} was missing on OIDC userinfo but was expected.`);
  }
}

export function tryGetUserIdentifiers(
  userInfo: FullUserInfo,
  identifierKeys: string[]
): string[] {
  return identifierKeys.map((userIdentifier) => {
    if (
      !Object.hasOwn(userInfo, userIdentifier) ||
      typeof userInfo[userIdentifier] !== 'string'
    ) {
      throw new OidcMissingKeyError(userInfo, userIdentifier);
    }

    return userInfo[userIdentifier] as string;
  });
}

type PrimitiveString = 'string' | 'boolean';
type TypeFromName<T extends PrimitiveString> = T extends 'string'
  ? string
  : T extends 'boolean'
  ? boolean
  : unknown;

export function tryGetUserInfoKey<T extends PrimitiveString>(
  userInfo: FullUserInfo,
  key: string,
  expectedType: T
): TypeFromName<T> {
  if (!Object.hasOwn(userInfo, key) || typeof userInfo[key] !== expectedType) {
    throw new OidcMissingKeyError(userInfo, key);
  }

  return userInfo[key] as TypeFromName<T>;
}

export function validateUserClaims(userInfo: FullUserInfo) {
  const settings = getSettings();
  const { requiredClaims: requiredClaimsString } = settings.main.oidc;
  const requiredClaims = requiredClaimsString.split(' ');

  requiredClaims.some((claim) => {
    const value = tryGetUserInfoKey(userInfo, claim, 'boolean');
    if (!value)
      throw new OidcAuthorizationError('User was missing a required claim.');
  });
}

/** Generates a schema to validate ID token JWT and userinfo claims */
export const createIdTokenSchema = ({
  oidcDomain,
  oidcClientId,
}: {
  oidcDomain: string;
  oidcClientId: string;
}) => {
  return yup.object().shape({
    iss: yup
      .string()
      .oneOf(
        [oidcDomain, `${oidcDomain}/`],
        `The token iss value doesn't match the oidc_DOMAIN (${oidcDomain})`
      )
      .required("The token didn't come with an iss value."),
    aud: yup.lazy((val) => {
      // single audience
      if (typeof val === 'string')
        return yup
          .string()
          .oneOf(
            [oidcClientId],
            `The token aud value doesn't match the oidc_CLIENT_ID (${oidcClientId})`
          )
          .required("The token didn't come with an aud value.");
      // several audiences
      if (typeof val === 'object' && Array.isArray(val))
        return yup
          .array()
          .of(yup.string())
          .test(
            'contains-client-id',
            `The token aud value doesn't contain the oidc_CLIENT_ID (${oidcClientId})`,
            (value) => !!(value && value.includes(oidcClientId))
          );
      // invalid type
      return yup
        .mixed()
        .typeError('The token aud value is not a string or array.');
    }),
    exp: yup
      .number()
      .required()
      .test(
        'is_before_date',
        'Token exp value is before current time.',
        (value) => {
          if (!value) return false;
          if (value < Math.ceil(Date.now() / 1000)) return false;
          return true;
        }
      ),
    iat: yup
      .number()
      .required()
      .test(
        'is_before_one_day',
        'Token was issued before one day ago and is now invalid.',
        (value) => {
          if (!value) return false;
          const date = new Date();
          date.setDate(date.getDate() - 1);
          if (value < Math.ceil(Number(date) / 1000)) return false;
          return true;
        }
      ),
    // these should exist because we set the scope to `openid profile email`
    name: yup.string().required(),
    email: yup.string().email().required(),
    email_verified: yup.boolean().required(),
  });
};

export type FullUserInfo = IdTokenClaims &
  Mandatory<OidcStandardClaims, 'name' | 'email' | 'email_verified'>;

export interface WellKnownConfiguration {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  device_authorization_endpoint: string;
  userinfo_endpoint: string;
  mfa_challenge_endpoint: string;
  jwks_uri: string;
  registration_endpoint: string;
  revocation_endpoint: string;
  scopes_supported: string[];
  response_types_supported: string[];
  code_challenge_methods_supported: string[];
  response_modes_supported: string[];
  subject_types_supported: string[];
  id_token_signing_alg_values_supported: string[];
  token_endpoint_auth_methods_supported: string[];
  claims_supported: string[];
  request_uri_parameter_supported: boolean;
}
