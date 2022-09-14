import type { MessageDescriptor } from 'react-intl';

declare module 'react-intl' {
  interface ExtractableMessage {
    [key: string]: string;
  }

  export function defineMessages<T extends ExtractableMessage>(
    messages: T
  ): { [K in keyof T]: MessageDescriptor };
}
