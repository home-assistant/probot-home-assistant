import { Context } from "probot";

import {
  WebhookPayloadPullRequest,
  WebhookPayloadLabel,
  WebhookPayloadIssues,
} from "@octokit/webhooks";

export type PRContext = Context<WebhookPayloadPullRequest>;
export type IssueContext = Context<WebhookPayloadIssues>;
export type LabeledIssueOrPRContext = Context<
  (WebhookPayloadPullRequest | WebhookPayloadIssues) & WebhookPayloadLabel
>;
