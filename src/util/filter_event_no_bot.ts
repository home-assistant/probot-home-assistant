import { Context } from "probot";

export const filterEventNoBot = <T>(
  name: string,
  handler: (context: Context<T>) => Promise<void>
): ((context: Context<T>) => Promise<void>) => {
  // Wrapped handler function
  return async (context: Context<T>) => {
    if (context.isBot) {
      context.log(name, `Skipping event because it's a bot.`);
      return;
    }

    await handler(context);
  };
};
