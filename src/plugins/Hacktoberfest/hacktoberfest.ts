import { PRContext } from "../../types";
import { Application } from "probot";
import { filterEventByRepo } from "../../util/filter_event_repo";
import { REPO_CORE } from "../../const";
import { filterEventNoBot } from "../../util/filter_event_no_bot";
import { WebhookPayloadIssuesIssue } from "@octokit/webhooks";

const NAME = "Hacktoberfest";

export const isHacktoberfestLive = () => new Date().getMonth() == 10;

export const initHacktoberfest = (app: Application) => {
  if (isHacktoberfestLive()) {
    app.on(["pull_request.opened"], runHacktoberfestNewPR);
  }
  app.on(["pull_request.closed"], runHacktoberfestClosedPR);
};

export const runHacktoberfestNewPR = async (context: PRContext) => {
  await context.github.issues.addLabels({
    ...context.issue(),
    labels: ["Hacktoberfest"],
  });
};

export const runHacktoberfestClosedPR = async (context: PRContext) => {
  const pr = context.payload.pull_request;

  // Don't do something if the PR got merged or if it had no Hacktoberfest label.
  if (
    pr.merged ||
    (pr.labels as WebhookPayloadIssuesIssue["labels"]).find(
      (label) => label.name === "Hacktoberfest"
    ) == undefined
  ) {
    return;
  }

  // If a Hacktoberfest PR got closed, automatically add "invalid" to it so it wont't count for Hacktoberfest
  await Promise.all([
    context.github.issues.addLabels({
      ...context.issue(),
      labels: ["invalid"],
    }),
    context.github.issues.removeLabel({
      ...context.issue(),
      name: "Hacktoberfest",
    }),
  ]);
};
