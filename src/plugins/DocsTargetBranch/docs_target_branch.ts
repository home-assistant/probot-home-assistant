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

  context.log(NAME, `Found ${links.length} links`);

  if (links.length === 0) {
    if (target !== "current") {
      await wrongTargetBranchDetected(context, "current");
    }
    return;
  }

  if (target !== "next") {
    await wrongTargetBranchDetected(context, "next");
  }
};

const wrongTargetBranchDetected = async (
  context: PRContext,
  correctTargetBranch: "current" | "next"
) => {
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

  context.log(NAME, `Adding ${labels} to PR`);
  promises.push(
    context.github.issues.addLabels(
      // Bug in Probot: https://github.com/probot/probot/issues/917
      // @ts-ignore
      context.issue({
        labels,
      })
    )
  );

  context.log(NAME, `Adding ${author} as assignee`);
  promises.push(
    context.github.issues.addAssignees(context.issue({ assignees: [author] }))
  );

  context.log(
    NAME,
    `Adding comment to ${context.payload.pull_request.number}: ${body}`
  );

  if (!currentLabels.includes("needs-rebase")) {
    // If the label "needs-rebase" allready exsist we can assume that this action has run, and we should ignore it.
    promises.push(
      context.github.issues.createComment(
        context.issue({
          body,
        })
      )
    );
  }

  await Promise.all(promises);
};
