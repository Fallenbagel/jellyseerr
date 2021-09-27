declare module 'plex-api' {
  export default class PlexAPI {
    constructor(intiialOptions: {
      hostname: string;
      port: number;
      token?: string;
      https?: boolean;
      timeout?: number;
      authenticator: {
        authenticate: (
          _plexApi: PlexAPI,
          cb: (err?: string, token?: string) => void
        ) => void;
      };
      options: {
        identifier: string;
        product: string;
        deviceName: string;
        platform: string;
      };
      requestOptions?: Record<string, string | number>;
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: <T extends Record<string, any>>(
      endpoint:
        | string
        | {
            uri: string;
            extraHeaders?: Record<string, string | number>;
          }
    ) => Promise<T>;
  }
}
