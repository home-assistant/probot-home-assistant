import { Context } from "probot";
import { PayloadRepository } from "@octokit/webhooks";

export const filterEventByRepo = <T>(
  name: string,
  filterRepository: string,
  handler: (context: Context<T>) => Promise<void>
): ((context: Context<T>) => Promise<void>) => {
  // Wrapped handler function
  return async (context: Context<T>) => {
    const repo = this.payload.repository as PayloadRepository | undefined;

    if (!repo) {
      context.log(
        `Not running event for ${name} because it has no repository.`
      );
      return;
    }
    if (repo.name !== filterRepository) {
      context.log(
        `Not running event for ${name} because repository ${repo.name} does not match ${filterRepository}.`
      );
      return;
    }

    await handler(context);
  };
};
