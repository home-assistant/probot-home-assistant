import { PayloadRepository } from "@octokit/webhooks";
import { Context } from "probot";

export const extractRepoFromContext = (
  context: Context<any>
): string | undefined => {
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
  return repo;
};

export const filterEventByRepo = <T>(
  plugin: string,
  allowRepos: string | string[],
  handler: (context: Context<T>) => Promise<void>
): ((context: Context<T>) => Promise<void>) => {
  const allow = Array.isArray(allowRepos) ? allowRepos : [allowRepos];

  // Wrapped handler function
  return async (context: Context<T>) => {
    const repo = extractRepoFromContext(context);

    if (!repo) {
      context.log.debug(
        { plugin },
        `Skipping event because it has no repository.`
      );
      return;
    }

    if (!allow.includes(repo)) {
      context.log.debug(
        { plugin },
        `Skipping event because repository ${repo} does not match ${allow}.`
      );
      return;
    }

    await handler(context);
  };
};
