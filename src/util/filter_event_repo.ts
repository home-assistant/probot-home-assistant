import { Context } from "probot";
import { PayloadRepository } from "@octokit/webhooks";

export const filterEventByRepo = <T>(
  name: string,
  filterRepository: string,
  handler: (context: Context<T>) => Promise<void>
): ((context: Context<T>) => Promise<void>) => {
  // Wrapped handler function
  return async (context: Context<T>) => {
    let repo: string | undefined;
    const anyContext = context as any;

    // PayloadWithRepository events
    if (anyContext.payload && anyContext.payload.repository) {
      repo = (anyContext.payload.repository as PayloadRepository).name;
      // The other events
    } else if (anyContext.repository) {
      const fullRepo = anyContext.repository;
      repo = fullRepo.substr(fullRepo.indexOf("/") + 1);
    }

    if (!repo) {
      context.log(
        `Not running event for ${name} because it has no repository.`
      );
      return;
    }

    const repoName = repo.substr(repo.indexOf("/") + 1);

    if (repoName !== filterRepository) {
      context.log(
        `Not running event for ${name} because repository ${repoName} does not match ${filterRepository}.`
      );
      return;
    }

    await handler(context);
  };
};
