import type {
  IdTokenClaims,
  OidcProviderMetadata,
  OidcStandardClaims,
  OidcTokenResponse,
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

  const wellKnownInfo: OidcProviderMetadata = await axios
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

/** Exchange authorization code for token data */
export async function fetchOIDCTokenData(
  req: Request,
  wellKnownInfo: OidcProviderMetadata,
  code: string
): Promise<OidcTokenResponse> {
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
    .post<OidcTokenResponse>(wellKnownInfo.token_endpoint, formData)
    .then((r) => r.data);
}

export async function getOIDCUserInfo(
  wellKnownInfo: OidcProviderMetadata,
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

export function validateUserClaims(
  userInfo: FullUserInfo,
  requiredClaims: string[]
) {
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
  identifierClaims,
  requiredClaims,
}: {
  oidcDomain: string;
  oidcClientId: string;
  identifierClaims: string[];
  requiredClaims: string[];
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
    // ensure all identifier claims are present and are strings
    ...identifierClaims.reduce(
      (a, v) => ({ ...a, [v]: yup.string().required() }),
      {}
    ),
    // ensure all required claims are present and are booleans
    ...requiredClaims.reduce(
      (a, v) => ({ ...a, [v]: yup.boolean().required() }),
      {}
    ),
  });
};

export type FullUserInfo = IdTokenClaims & OidcStandardClaims;
