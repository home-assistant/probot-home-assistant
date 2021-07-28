import {
  WebhookPayloadIssues,
  WebhookPayloadLabel,
  WebhookPayloadPullRequest,
} from "@octokit/webhooks";
import { Context } from "probot";

export type PRContext = Context<WebhookPayloadPullRequest>;
export type IssueContext = Context<WebhookPayloadIssues>;
export type LabeledIssueOrPRContext = (PRContext | IssueContext) &
  Context<WebhookPayloadLabel>;
