import { Context, Logger } from "probot";

export const filterEventNoBot = <T>(
  plugin: string,
  handler: (context: Context<T>) => Promise<void>
): ((context: Context<T>) => Promise<void>) => {
  // Wrapped handler function
  return async (context: Context<T>) => {
    if (context.isBot) {
      context.log.debug({ plugin }, `Skipping event because it's a bot.`);
      return;
    }

    await handler(context);
  };
};
