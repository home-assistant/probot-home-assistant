import { Application } from "probot";
import { REPO_CORE } from "../../const";
import { PRContext } from "../../types";
import { filterEventNoBot } from "../../util/filter_event_no_bot";
import { filterEventByRepo } from "../../util/filter_event_repo";
import { ParsedPath } from "../../util/parse_path";
import { fetchPullRequestFilesFromContext } from "../../util/pull_request";

import componentAndPlatform from "./strategies/componentAndPlatform";
import hasTests from "./strategies/hasTests";
import markCore from "./strategies/markCore";
import newIntegrationOrPlatform from "./strategies/newIntegrationOrPlatform";
import removePlatform from "./strategies/removePlatform";
import smallPR from "./strategies/smallPR";
import typeOfChange from "./strategies/typeOfChange";
import warnOnMergeToMaster from "./strategies/warnOnMergeToMaster";

const NAME = "LabelBot";

const STRATEGIES = [
  newIntegrationOrPlatform,
  removePlatform,
  warnOnMergeToMaster,
  markCore,
  smallPR,
  hasTests,
  typeOfChange,
];

export const initLabelBot = (app: Application) => {
  app.on(
    "pull_request.opened",
    filterEventNoBot(NAME, filterEventByRepo(NAME, REPO_CORE, runLabelBot))
  );

  // app.on("issues.edited", async (context: PRContext) => {
  //   // This is also for PRs
  //   // context.log("Edited", context.event);
  // });
};

export const runLabelBot = async (context: PRContext) => {
  const log = context.log.child({ plugin: NAME });
  const files = await fetchPullRequestFilesFromContext(context);
  const parsed = files.map((file) => new ParsedPath(file));
  const labelSet = new Set();

  STRATEGIES.forEach((strategy) => {
    for (let label of strategy(context, parsed)) {
      labelSet.add(label);
    }
  });

  // componentAndPlatform can create many labels, process them separately
  const componentLabelSet = new Set();
  for (let label of componentAndPlatform(context, parsed)) {
    componentLabelSet.add(label);
  }

  if (labelSet.size + componentLabelSet.size <= 9) {
    componentLabelSet.forEach(labelSet.add, labelSet);
  }

  const labels = Array.from(labelSet);
  if (labels.length === 0) return;

  if (labels.length > 9) {
    log.warn(
      `Not setting ${labels.length} on PR #${context.payload.pull_request.number}, because it is out of the allowed range.`
    );
    return;
  }

  log.info(
    `Adding labels to PR #${context.payload.pull_request.number}: ${labels}.`
  );
  await context.github.issues.addLabels(
    // Bug in Probot: https://github.com/probot/probot/issues/917
    // @ts-ignore
    context.issue({
      labels,
    })
  );
};
