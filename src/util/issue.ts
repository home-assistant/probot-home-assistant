import { IssuesGetResponse } from "@octokit/rest";
import { Context } from "probot";
import { PRContext, IssueContext } from "../types";
import {
  WebhookPayloadIssuesIssue,
  WebhookPayloadPullRequestPullRequest,
} from "@octokit/webhooks";

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
