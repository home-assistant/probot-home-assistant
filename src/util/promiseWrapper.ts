// Wrapper to guard against exceptions

import { LoggerWithTarget } from "probot/lib/wrap-logger";

export const promiseWrapper = async (
  logger: LoggerWithTarget,
  promise: Promise<unknown>
): Promise<void> => {
  try {
    await promise;
  } catch (err) {
    logger(err);
  }
};
