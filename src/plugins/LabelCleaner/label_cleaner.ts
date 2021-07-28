import { WebhookPayloadIssuesIssue } from "@octokit/webhooks";
import { Application } from "probot";
import { REPO_CORE, REPO_DOCS } from "../../const";
import { PRContext } from "../../types";
import { extractRepoFromContext } from "../../util/filter_event_repo";
import { getIssueFromPayload } from "../../util/issue";
import { formatContext } from "../../util/log";

const NAME = "LabelCleaner";

// Map repositories to labels that need cleaning.
const TO_CLEAN: { [key: string]: string[] } = {
  [REPO_CORE]: ["Ready for review"],
  [REPO_DOCS]: [
    "needs-rebase",
    "in-progress",
    "awaits-parent",
    "ready-for-review",
    "parent-merged",
  ],
};

export const initLabelCleaner = (app: Application) => {
  app.on(["pull_request.closed"], runLabelCleaner);
};

export const runLabelCleaner = async (context: PRContext) => {
  const repo = extractRepoFromContext(context);
  if (!(repo in TO_CLEAN)) {
    return;
  }

  const pr = getIssueFromPayload(context);

  // Typing is wrong for PRs, so use labels type from issues
  const currentLabels = (pr.labels as WebhookPayloadIssuesIssue["labels"]).map(
    (label) => label.name
  );

  const labelsToRemove = TO_CLEAN[repo]
    // Find all labels that the PR has
    .filter((label) => currentLabels.includes(label));

  // If any label delete tasks created, await them.
  if (labelsToRemove.length) {
    context.log.info(
      { plugin: NAME },
      `Cleaning up labels on ${formatContext(context)}: ${labelsToRemove}.`
    );
    await Promise.all(
      labelsToRemove.map((label) =>
        context.github.issues.removeLabel(context.issue({ name: label }))
      )
    );
  }
};
