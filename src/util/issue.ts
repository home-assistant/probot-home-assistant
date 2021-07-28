import { IssuesGetResponse } from "@octokit/rest";
import {
  WebhookPayloadIssuesIssue,
  WebhookPayloadPullRequestPullRequest,
} from "@octokit/webhooks";
import { GitHubAPI } from "probot/lib/github";
import { IssueContext, PRContext } from "../types";

interface GitHubAPIpatched extends GitHubAPI {
  _hassIssuesCache?: { [key: string]: Promise<IssuesGetResponse> };
}

export const fetchIssueWithCache = async (
  github: GitHubAPI,
  owner: string,
  repo: string,
  number: number
) => {
  const patchedContext = github as GitHubAPIpatched;
  const key = `${owner}/${repo}/${number}`;

  if (!patchedContext._hassIssuesCache) {
    patchedContext._hassIssuesCache = {};
  }

  if (!(key in patchedContext._hassIssuesCache)) {
    patchedContext._hassIssuesCache[key] = github.issues
      .get({
        owner,
        repo,
        issue_number: number,
      })
      .then(({ data }) => data);
  }

  return patchedContext._hassIssuesCache[key];
};

// PRs are shaped as issues. This method will help normalize it.
export const getIssueFromPayload = (
  context: PRContext | IssueContext
): WebhookPayloadIssuesIssue | WebhookPayloadPullRequestPullRequest => {
  if (context.name === "issues") {
    return context.payload["issue"];
  }
  if (context.name === "pull_request") {
    return context.payload["pull_request"];
  }
  throw new Error(`Unable to get issue for ${context.name} context`);
};
