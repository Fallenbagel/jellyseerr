import type { ApiErrorCode, AuthErrorCode } from '@server/constants/error';

export class NetworkError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: ApiErrorCode | AuthErrorCode
  ) {
    super();

    this.name = 'apiError';
  }
}
