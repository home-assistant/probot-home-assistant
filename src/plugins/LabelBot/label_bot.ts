import { WebhookPayloadIssuesIssue } from "@octokit/webhooks";
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
import warnOnMergeToRelease from "./strategies/warnOnMergeToRelease";

const NAME = "LabelBot";

const STRATEGIES = [
  newIntegrationOrPlatform,
  removePlatform,
  warnOnMergeToRelease,
  markCore,
  smallPR,
  hasTests,
  typeOfChange,
  componentAndPlatform,
];

const MANAGED_LABELS = [
  // hasTests
  "has-tests",
  // markCore
  "core",
  // metadataUpdate
  "metadata-only",
  // newIntegrationOrPlatform
  "new-integration",
  "new-platform",
  // removePlatform
  "remove-platform",
  // smallPR
  "small-pr",
  // typeOfChange
  "bugfix",
  "dependency",
  "new-feature",
  "breaking-change",
  "code-quality",
  // warnOnMergeToMaster
  "merging-to-master",
  "merging-to-rc",
];

export const initLabelBot = (app: Application) => {
  app.on(
    [
      "pull_request.opened",
      "pull_request.reopened",
      "pull_request.synchronized",
    ],
    filterEventNoBot(NAME, filterEventByRepo(NAME, REPO_CORE, runLabelBot))
  );
};

export const runLabelBot = async (context: PRContext) => {
  const log = context.log.child({ plugin: NAME });

  const pr = context.payload.pull_request;
  const currentLabels = (pr.labels as WebhookPayloadIssuesIssue["labels"]).map(
    (label) => label.name
  );
  const currentManaged = currentLabels.filter(
    (label) =>
      label.startsWith("integration: ") || MANAGED_LABELS.includes(label)
  );
  log.debug(`Current labels of PR #${pr.number}: ${currentLabels}.`);
  log.debug(`Current managed labels of PR #${pr.number}: ${currentManaged}.`);

  let strategies = [];
  if (pr.base.ref !== "dev") {
    // when not merging to dev branch, only use merging-to-* tags.
    strategies.push(warnOnMergeToRelease);
  } else {
    strategies.push(...STRATEGIES);
  }

  const files = await fetchPullRequestFilesFromContext(context);
  const parsed = files.map((file) => new ParsedPath(file));
  const labelSet = new Set<string>();
  for (let strategy of strategies) {
    for (let label of strategy(context, parsed)) {
      labelSet.add(label);
    }
  }

  const labels = Array.from(labelSet);
  log.debug(`Computed labels for PR #${pr.number}: ${labels}.`);

  const addLabels = labels.filter((label) => !currentLabels.includes(label));
  const removeLabels = currentManaged.filter((label) => labels.includes(label));
  const promises: Promise<unknown>[] = [];

  if (addLabels.length > 0) {
    log.info(`Adding labels to PR #${pr.number}: ${addLabels}.`);
    promises.push(context.github.issues.addLabels(context.issue({ labels })));
  }

  if (removeLabels.length > 0) {
    log.info(`Removing labels from PR #${pr.number}: ${removeLabels}.`);
    removeLabels.forEach((label) =>
      promises.push(
        context.github.issues.removeLabel(context.issue({ name: label }))
      )
    );
  }

  await Promise.all(promises);
};
