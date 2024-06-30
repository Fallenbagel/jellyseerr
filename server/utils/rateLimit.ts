export type RateLimitOptions = {
  maxRequests?: number;
  perMilliseconds?: number;
  maxRPS?: number;
};

export default function rateLimit<
  T extends (...args: Parameters<T>) => Promise<U>,
  U
>(fn: T, options: RateLimitOptions): (...args: Parameters<T>) => Promise<U> {
  const maxRequests = options.maxRPS ?? options.maxRequests ?? 1;
  const perMilliseconds = options.maxRPS
    ? 1000
    : options.perMilliseconds ?? 1000;

  const queue: {
    args: Parameters<T>;
    resolve: (value: U) => void;
  }[] = [];
  let activeRequests = 0;
  let timer: NodeJS.Timeout | null = null;

  const processQueue = () => {
    if (queue.length === 0) {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      return;
    }

    while (activeRequests < maxRequests) {
      activeRequests++;
      const item = queue.shift();
      if (!item) break;
      const { args, resolve } = item;
      fn(...args)
        .then(resolve)
        .finally(() => {
          activeRequests--;
          if (queue.length > 0) {
            if (!timer) {
              timer = setInterval(processQueue, perMilliseconds);
            }
          } else {
            if (timer) {
              clearInterval(timer);
              timer = null;
            }
          }
        });
    }
  };

  return (...args: Parameters<T>): Promise<U> => {
    return new Promise<U>((resolve) => {
      queue.push({ args, resolve });
      processQueue();
    });
  };
}
