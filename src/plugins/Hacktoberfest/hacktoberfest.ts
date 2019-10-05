import { PRContext } from "../../types";
import { Application } from "probot";
import { filterEventByRepo } from "../../util/filter_event_repo";
import { REPO_HOME_ASSISTANT } from "../../const";
import { filterEventNoBot } from "../../util/filter_event_no_bot";
import { WebhookPayloadIssuesIssue } from "@octokit/webhooks";

const NAME = "Hacktoberfest";

const isHacktoberfestLive = () => new Date().getMonth() == 9;

export const initHacktoberfest = (app: Application) => {
  if (isHacktoberfestLive()) {
    app.on(
      ["pull_request.opened"],
      filterEventNoBot(
        NAME,
        filterEventByRepo(NAME, REPO_HOME_ASSISTANT, runHacktoberfestNewPR)
      )
    );
  }
  app.on(
    ["pull_request.closed"],
    filterEventNoBot(
      NAME,
      filterEventByRepo(NAME, REPO_HOME_ASSISTANT, runHacktoberfestClosedPR)
    )
  );
};

const runHacktoberfestNewPR = async (context: PRContext) => {
  await context.github.issues.addLabels({
    ...context.issue(),
    labels: ["Hacktoberfest"],
  });
};

const runHacktoberfestClosedPR = async (context: PRContext) => {
  const pr = context.payload.pull_request;

  // Don't do something if the PR got merged or if it had no Hacktoberfest label.
  if (
    pr.state == "merged" ||
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
