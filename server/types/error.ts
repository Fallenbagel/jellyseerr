import type { ApiErrorCode, AuthErrorCode } from '@server/constants/error';

export class ApiError extends Error {
  constructor(public statusCode: number, public errorCode: ApiErrorCode) {
    super();

    this.name = 'apiError';
  }
}

export class AuthError extends Error {
  constructor(public statusCode: number, public errorCode: AuthErrorCode) {
    super();

    this.name = 'authError';
  }
}
