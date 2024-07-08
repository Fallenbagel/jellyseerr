export default function retry<
  T extends (...args: Parameters<T>) => Promise<U>,
  U
>(fn: T, retryCount: number): (...args: Parameters<T>) => Promise<U> {
  const fnWithRetries = async (
    retryCount: number,
    ...args: Parameters<T>
  ): Promise<U> => {
    try {
      return await fn(...args);
    } catch (e) {
      if (retryCount > 1) {
        return fnWithRetries(retryCount - 1, ...args);
      } else {
        throw e;
      }
    }
  };

  return (...args: Parameters<T>): Promise<U> => {
    return fnWithRetries(retryCount, ...args);
  };
}
