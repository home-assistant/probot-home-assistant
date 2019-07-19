import { PullsListFilesResponseItem, PullsGetResponse } from "@octokit/rest";
import { PRContext } from "../types";

interface PRContextPatched extends PRContext {
  _pr?: PullsGetResponse;
  _prFiles?: PullsListFilesResponseItem[];
}

// Helper methods to get pull request info while caching on context.

export const getPullRequestFromContext = async (
  context: PRContext
): Promise<PullsGetResponse> => {
  const prContext = context as PRContextPatched;

  if (!prContext._pr) {
    prContext._pr = (await prContext.github.pulls.get(prContext.issue())).data;
  }
  return prContext._pr;
};

export const getPullRequestFilesFromContext = async (
  context: PRContext
): Promise<PullsListFilesResponseItem[]> => {
  const prContext = context as PRContextPatched;

  if (!prContext._prFiles) {
    prContext._prFiles = (await prContext.github.pulls.listFiles(
      prContext.issue()
    )).data;
  }
  return prContext._prFiles;
};
