/* eslint-disable @typescript-eslint/no-unused-vars */
import type { User } from '@server/entity/User';
import type { NextFunction, Request, Response } from 'express';

declare global {
  namespace Express {
    export interface Request {
      user?: User;
      locale?: string;
    }
  }

  export type Middleware = <ParamsDictionary, any, any>(
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void | NextFunction> | void | NextFunction;
}

// Declaration merging to apply our own types to SessionData
// See: (https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/express-session/index.d.ts#L23)
declare module 'express-session' {
  export interface SessionData {
    userId: number;
  }
}
