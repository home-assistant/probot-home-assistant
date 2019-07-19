import { Context } from "probot";

import { WebhookPayloadPullRequest } from "@octokit/webhooks";

export type PRContext = Context<WebhookPayloadPullRequest>;
