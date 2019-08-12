import { PullsListFilesResponseItem, PullsGetResponse } from "@octokit/rest";
import { PRContext } from "../types";

interface PRContextPatched extends PRContext {
  _prFiles?: Promise<PullsListFilesResponseItem[]>;
}

// Helper methods to get pull request info while caching on context.

export const fetchPullRequestFilesFromContext = (
  context: PRContext
): Promise<PullsListFilesResponseItem[]> => {
  const prContext = context as PRContextPatched;

  if (!prContext._prFiles) {
    prContext._prFiles = prContext.github.pulls
      .listFiles(prContext.issue())
      .then(({ data }) => data);
  }
  return prContext._prFiles;
};
