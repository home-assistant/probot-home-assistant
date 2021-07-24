/**
 * Helper to debounce a function. Returns a promise that can be awaited to wait
 * until the function has ran, and get the return value.
 */
export const debounce = <T>(
  func: () => T,
  wait: number
): (() => Promise<T>) => {
  let timeout: NodeJS.Timeout = null;
  let resolve: (T) => void = null;
  let reject: (T) => void = null;
  let promise: Promise<T> = null;

  return () => {
    if (promise == null)
      promise = new Promise<T>((res, rej) => ([resolve, reject] = [res, rej]));

    const later = () => {
      timeout = promise = null;
      try {
        resolve(func());
      } catch (e) {
        reject(e);
      }
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    return promise;
  };
};
