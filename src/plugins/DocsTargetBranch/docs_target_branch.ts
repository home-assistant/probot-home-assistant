import { Application } from "probot";
import { WebhookPayloadIssuesIssue } from "@octokit/webhooks";
import { PRContext } from "../../types";
import { filterEventByRepo } from "../../util/filter_event_repo";
import { filterEventNoBot } from "../../util/filter_event_no_bot";
import {
  REPO_BRANDS,
  REPO_DEV_DOCUMENTATION,
  REPO_HOME_ASSISTANT_IO,
  ORG_HASS,
} from "../../const";
import {
  extractIssuesOrPullRequestMarkdownLinks,
  extractPullRequestURLLinks,
} from "../../util/text_parser";
import { getIssueFromPayload } from "../../util/issue";
import { scheduleComment } from "../../util/comment";

const NAME = "DocsTargetBranch";
const SKIP_REPOS = [REPO_BRANDS, REPO_DEV_DOCUMENTATION];

export const bodyShouldTargetCurrent: string =
  "It seems that this PR is targeted against an incorrect branch. Documentation updates which apply to our current stable release should target the `current` branch. Please change the target branch of this PR to `current` and rebase if needed. If this is documentation for a new feature, please add a link to that PR in your description.";
export const bodyShouldTargetNext: string =
  "It seems that this PR is targeted against an incorrect branch since it has a parent PR on one of our codebases. Documentation that needs to be updated for an upcoming release should target the `next` branch. Please change the target branch of this PR to `next` and rebase if needed.";

export const initDocsTargetBranch = (app: Application) => {
  app.on(
    ["pull_request.opened", "pull_request.edited"],
    filterEventNoBot(
      NAME,
      filterEventByRepo(NAME, REPO_HOME_ASSISTANT_IO, runDocsTargetBranch)
    )
  );
};

export const runDocsTargetBranch = async (context: PRContext) => {
  const target = context.payload.pull_request.base.ref;
  const links = extractIssuesOrPullRequestMarkdownLinks(
    context.payload.pull_request.body
  ).concat(
    extractPullRequestURLLinks(context.payload.pull_request.body).filter(
      (link) => !SKIP_REPOS.includes(link.repo) || ORG_HASS !== link.owner
    )
  );

  context.log.debug({ plugin: NAME }, `Found ${links.length} links.`);

  if (links.length === 0) {
    if (target !== "current") {
      await wrongTargetBranchDetected(context, "current");
    } else {
      await correctTargetBranchDetected(context);
    }
    return;
  }

  if (target !== "next") {
    await wrongTargetBranchDetected(context, "next");
  } else {
    await correctTargetBranchDetected(context);
  }
};

const correctTargetBranchDetected = async (context: PRContext) => {
  const log = context.log.child({ plugin: NAME });
  const pr = getIssueFromPayload(context);
  const author = context.payload.sender.login;
  const promises: Promise<unknown>[] = [];
  // Typing is wrong for PRs, so use labels type from issues
  const currentLabels = (pr.labels as WebhookPayloadIssuesIssue["labels"]).map(
    (label) => label.name
  );
  if (currentLabels.includes("needs-rebase")) {
    log.info(`Removing label needs-rebase from PR #${pr.number}.`);
    promises.push(
      context.github.issues.removeLabel(
        // Bug in Probot: https://github.com/probot/probot/issues/917
        // @ts-ignore
        context.issue({
          label: "needs-rebase",
        })
      )
    );
  }

  // Typing is wrong for PRs, so use labels type from issues
  const currentAssignees = (pr.assignees as WebhookPayloadIssuesIssue["assignees"]).map(
    (assignee) => assignee.login
  );
  if (currentAssignees.includes(author)) {
    log.info(`Removing ${author} as assignee from PR #${pr.number}.`);
    promises.push(
      context.github.issues.removeAssignees(
        context.issue({ assignees: [author] })
      )
    );
  }
};

const wrongTargetBranchDetected = async (
  context: PRContext,
  correctTargetBranch: "current" | "next"
) => {
  const log = context.log.child({ plugin: NAME });
  const labels = ["needs-rebase", "in-progress"];
  const author = context.payload.sender.login;
  const promises: Promise<unknown>[] = [];
  const body: string =
    correctTargetBranch === "next"
      ? bodyShouldTargetNext
      : bodyShouldTargetCurrent;
  const pr = getIssueFromPayload(context);

  // Typing is wrong for PRs, so use labels type from issues
  const currentLabels = (pr.labels as WebhookPayloadIssuesIssue["labels"]).map(
    (label) => label.name
  );
  if (currentLabels.includes("needs-rebase")) {
    // If the label "needs-rebase" already exists we can assume that this action has run, and we should ignore it.
    return;
  }

  log.info(`Adding labels ${labels.join(", ")} to PR #${pr.number}.`);
  promises.push(
    context.github.issues.addLabels(
      // Bug in Probot: https://github.com/probot/probot/issues/917
      // @ts-ignore
      context.issue({
        labels,
      })
    )
  );

  log.info(`Adding ${author} as assignee to PR #${pr.number}.`);
  promises.push(
    context.github.issues.addAssignees(context.issue({ assignees: [author] }))
  );

  log.info(`Adding comment to PR #${pr.number}: ${body}`);
  promises.push(scheduleComment(context, "DocsTargetBranch", body));

  await Promise.all(promises);
};
