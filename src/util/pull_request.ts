import { PullsGetResponse, PullsListFilesResponseItem } from "@octokit/rest";
import { GitHubAPI } from "probot/lib/github";
import { PRContext } from "../types";

interface PRContextPatched extends PRContext {
  _prFiles?: Promise<PullsListFilesResponseItem[]>;
}

interface GitHubAPIpatched extends GitHubAPI {
  _hassPullsCache?: { [key: string]: Promise<PullsGetResponse> };
}

export const fetchPRWithCache = async (
  github: GitHubAPI,
  owner: string,
  repo: string,
  number: number
) => {
  const patchedContext = github as GitHubAPIpatched;
  const key = `${owner}/${repo}/${number}`;

  if (!patchedContext._hassPullsCache) {
    patchedContext._hassPullsCache = {};
  }

  if (!(key in patchedContext._hassPullsCache)) {
    patchedContext._hassPullsCache[key] = github.pulls
      .get({
        owner,
        repo,
        pull_number: number,
      })
      .then(({ data }) => data);
  }

  return patchedContext._hassPullsCache[key];
};

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

export const getPRState = (pr: { state: string; merged: boolean }) =>
  pr.state === "open" ? "open" : pr.merged ? "merged" : "closed";
