// from https://github.com/gajus/global-agent/blob/master/src/utilities/bindHttpMethod.ts

import type http from 'http';
import type https from 'https';

type AgentType = http.Agent | https.Agent;

export default (
  // eslint-disable-next-line @typescript-eslint/ban-types
  originalMethod: Function,
  agent: AgentType
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (...args: any[]) => {
    let url;
    let options;
    let callback;

    if (typeof args[0] === 'string' || args[0] instanceof URL) {
      url = args[0];

      if (typeof args[1] === 'function') {
        options = {};
        callback = args[1];
      } else {
        options = {
          ...args[1],
        };
        callback = args[2];
      }
    } else {
      options = {
        ...args[0],
      };
      callback = args[1];
    }

    options.agent = agent;

    if (url) {
      return originalMethod(url, options, callback);
    } else {
      return originalMethod(options, callback);
    }
  };
};
