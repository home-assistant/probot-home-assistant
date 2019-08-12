import { ParsedPath } from "../../util/parse_path";
import { fetchPullRequestFilesFromContext } from "../../util/pull_request";

// Convert a list of file paths to labels to set

import componentAndPlatform from "./strategies/componentAndPlatform";
import newIntegrationOrPlatform from "./strategies/newIntegrationOrPlatform";
import removePlatform from "./strategies/removePlatform";
import warnOnMergeToMaster from "./strategies/warnOnMergeToMaster";
import markCore from "./strategies/markCore";
import smallPR from "./strategies/smallPR";
import hasTests from "./strategies/hasTests";
import { PRContext } from "../../types";
import { Application } from "probot";
import { filterEventByRepo } from "../../util/filter_event_repo";
import { filterEventNoBot } from "../../util/filter_event_no_bot";
import { REPO_HOME_ASSISTANT } from "../../const";

const NAME = "LabelBot";

const STRATEGIES = [
  componentAndPlatform,
  newIntegrationOrPlatform,
  removePlatform,
  warnOnMergeToMaster,
  markCore,
  smallPR,
  hasTests,
];

export const initLabelBot = (app: Application) => {
  app.on(
    "pull_request.opened",
    filterEventNoBot(
      NAME,
      filterEventByRepo(NAME, REPO_HOME_ASSISTANT, runLabelBot)
    )
  );

  // app.on("issues.edited", async (context: PRContext) => {
  //   // This is also for PRs
  //   // context.log("Edited", context.event);
  // });
};

export const runLabelBot = async (context: PRContext) => {
  const files = await fetchPullRequestFilesFromContext(context);
  const parsed = files.map((file) => new ParsedPath(file));
  const labelSet = new Set();

  STRATEGIES.forEach((strategy) => {
    for (let label of strategy(context, parsed)) {
      labelSet.add(label);
    }
  });

  const labels = Array.from(labelSet);

  if (labels.length === 0 || labels.length > 9) {
    context.log(
      `LabelBot: Not setting ${labels.length} labels because out of range of what we allow`
    );
    return;
  }

  context.log(
    `LabelBot: Setting labels on PR ${
      context.payload.pull_request.number
    }: ${labels.join(", ")}`
  );

  await context.github.issues.addLabels(
    // Bug in Probot: https://github.com/probot/probot/issues/917
    // @ts-ignore
    context.issue({
      labels,
    })
  );
};
