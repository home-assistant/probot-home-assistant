import { WebhookPayloadIssuesIssue } from "@octokit/webhooks";
import { Application } from "probot";
import { REPO_DOCS } from "../../const";
import { PRContext } from "../../types";
import { filterEventByRepo } from "../../util/filter_event_repo";

const NAME = "DocsBranchLabels";

const BRANCHES = ["current", "rc", "next"];

export const initDocsBranchLabels = (app: Application) => {
  app.on(
    ["pull_request.opened", "pull_request.edited"],
    filterEventByRepo(NAME, REPO_DOCS, runDocsBranchLabels)
  );
};

export const runDocsBranchLabels = async (context: PRContext) => {
  const log = context.log.child({ plugin: NAME });

  const pr = context.payload.pull_request;
  const targetBranch = pr.base.ref;
  // Typing is wrong for PRs, so use labels type from issues
  const currentLabels = (pr.labels as WebhookPayloadIssuesIssue["labels"]).map(
    (label) => label.name
  );
  const tasks: Promise<unknown>[] = [];

  if (
    BRANCHES.includes(targetBranch) &&
    !currentLabels.includes(targetBranch)
  ) {
    log.info(`Adding label ${targetBranch} to PR #${pr.number}.`);
    tasks.push(
      context.github.issues.addLabels(context.issue({ labels: [targetBranch] }))
    );
  }

  // Find labels to remove
  const toRemove = currentLabels.filter(
    (label) => BRANCHES.includes(label) && label !== targetBranch
  );
  if (toRemove.length > 0) {
    log.info(`Removing labels from PR #${pr.number}: ${toRemove}`);
    toRemove.forEach((label) =>
      tasks.push(
        context.github.issues.removeLabel(context.issue({ name: label }))
      )
    );
  }

  if (tasks.length > 0) {
    await Promise.all(tasks);
  }
};
