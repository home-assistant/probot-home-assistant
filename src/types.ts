import { Context } from "probot";

import {
  WebhookPayloadPullRequest,
  WebhookPayloadLabel,
  WebhookPayloadIssues,
} from "@octokit/webhooks";

export type PRContext = Context<WebhookPayloadPullRequest>;
export type IssueContext = Context<WebhookPayloadIssues>;
export type LabeledIssueOrPRContext = (PRContext | IssueContext) &
  Context<WebhookPayloadLabel>;
