import { ParsedPath } from "../../util/parse_path";
import { fetchPullRequestFilesFromContext } from "../../util/pull_request";

// Convert a list of file paths to labels to set

import componentAndPlatform from "./strategies/componentAndPlatform";
import integrationFromDocLink from "./strategies/integrationFromDocLink";
import newIntegrationOrPlatform from "./strategies/newIntegrationOrPlatform";
import removePlatform from "./strategies/removePlatform";
import warnOnMergeToMaster from "./strategies/warnOnMergeToMaster";
import markCore from "./strategies/markCore";
import smallPR from "./strategies/smallPR";
import hasTests from "./strategies/hasTests";
import typeOfChange from "./strategies/typeOfChange";
import { IssueContext, PRContext } from "../../types";
import { Application } from "probot";
import { filterEventByRepo } from "../../util/filter_event_repo";
import { filterEventNoBot } from "../../util/filter_event_no_bot";
import { REPO_CORE } from "../../const";

const NAME = "LabelBot";

const PULL_STRATEGIES = [
  componentAndPlatform,
  newIntegrationOrPlatform,
  removePlatform,
  warnOnMergeToMaster,
  markCore,
  smallPR,
  hasTests,
  typeOfChange,
];

const ISSUE_STRATEGIES = [integrationFromDocLink];

export const initLabelBot = (app: Application) => {
  app.on(
    "pull_request.opened",
    filterEventNoBot(NAME, filterEventByRepo(NAME, REPO_CORE, runLabelBotPull))
  );

  app.on(
    "issues.opened",
    filterEventNoBot(NAME, filterEventByRepo(NAME, REPO_CORE, runLabelBotPull))
  );
};

export const runLabelBotPull = async (context: PRContext) => {
  const files = await fetchPullRequestFilesFromContext(context);
  const parsed = files.map((file) => new ParsedPath(file));
  const labelSet: Set<string> = new Set();

  PULL_STRATEGIES.forEach((strategy) => {
    for (let label of strategy(context, parsed)) {
      labelSet.add(label);
    }
  });

  await handleNewLabels(context, context.payload.pull_request.number, labelSet);
};

export const runLabelBotIssue = async (context: IssueContext) => {
  const labelSet: Set<string> = new Set();

  ISSUE_STRATEGIES.forEach(async (strategy) => {
    for await (let label of await strategy(context)) {
      labelSet.add(label);
    }
  });

  await handleNewLabels(context, context.payload.issue.number, labelSet);
};

const handleNewLabels = async (
  context: PRContext | IssueContext,
  issue_number: number,
  labelSet?: Set<string>
) => {
  const labels = Array.from(labelSet);
  const issueContext = context.issue();

  if (labels.length === 0 || labels.length > 9) {
    context.log(
      `LabelBot: Not setting ${labels.length} labels because out of range of what we allow`
    );
    return;
  }

  context.log(
    `LabelBot: Setting labels on # ${issue_number}: ${labels.join(", ")}`
  );

  await context.github.issues.addLabels(
    // Bug in Probot: https://github.com/probot/probot/issues/917
    // @ts-ignore
    context.issue({
      labels,
    })
  );
};
