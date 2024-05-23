import type { NetworkErrorCode } from '@server/constants/error';

export class NetworkError extends Error {
  constructor(public statusCode: number, public errorCode: NetworkErrorCode) {
    super();

    this.name = 'apiError';
  }
}
