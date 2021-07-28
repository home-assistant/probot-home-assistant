import { PRContext } from "../../types";
import { Application } from "probot";
import { extractRepoFromContext } from "../../util/filter_event_repo";
import { REPO_HOME_ASSISTANT_IO, ORG_HASS } from "../../const";
import { getIssueFromPayload } from "../../util/issue";
import {
  extractIssuesOrPullRequestMarkdownLinks,
  extractPullRequestURLLinks,
} from "../../util/text_parser";
import { getPRState } from "../../util/pull_request";
import { formatContext } from "../../util/log";

const NAME = "DocsParenting";

export const initDocsParenting = (app: Application) => {
  app.on(["pull_request.opened", "pull_request.edited"], async (context) => {
    if (extractRepoFromContext(context) === REPO_HOME_ASSISTANT_IO) {
      await runDocsParentingDocs(context);
    } else {
      await runDocsParentingNonDocs(context);
    }
  });
  app.on(
    ["pull_request.reopened", "pull_request.closed"],
    updateDocsParentStatus
  );
};

// Deal with PRs on Home Assistant Python repo
const runDocsParentingNonDocs = async (context: PRContext) => {
  const log = context.log.child({ plugin: NAME });
  const triggerIssue = getIssueFromPayload(context);

  const linksToDocs = extractIssuesOrPullRequestMarkdownLinks(triggerIssue.body)
    .concat(extractPullRequestURLLinks(triggerIssue.body))
    .filter((link) => link.repo === REPO_HOME_ASSISTANT_IO);

  log.debug(`NON-DOCS: Found ${linksToDocs.length} links to docs PRs.`);

  if (linksToDocs.length === 0) {
    return;
  }

  if (linksToDocs.length > 2) {
    log.info(
      `NON-DOCS: Ignoring too many PRs linked from ${formatContext(context)}.`
    );
    return;
  }

  const PRnumbers = linksToDocs.map((link) => link.number);
  const linkedFrom = formatContext(context);
  log.info(
    `NON-DOCS: Adding has-parent label to docs PRs ${PRnumbers} linked from ${linkedFrom}.`
  );

  await Promise.all([
    linksToDocs.map((link) =>
      context.github.issues.addLabels({
        ...link.issue(),
        labels: ["has-parent"],
      })
    ),
  ]);
};

// Deal with PRs on Home Assistant.io repo
const runDocsParentingDocs = async (context: PRContext) => {
  const log = context.log.child({ plugin: NAME });
  const triggerIssue = getIssueFromPayload(context);
  const linksToNonDocs = extractIssuesOrPullRequestMarkdownLinks(
    triggerIssue.body
  )
    .concat(extractPullRequestURLLinks(triggerIssue.body))
    .filter(
      (link) => link.owner === ORG_HASS && link.repo !== REPO_HOME_ASSISTANT_IO
    );

  log.debug(`DOCS: Found ${linksToNonDocs.length} links to non-docs PRs.`);
  if (linksToNonDocs.length === 0) {
    return;
  }

  log.info(`DOCS: Adding has-parent label to docs PR #${triggerIssue.number}.`);
  await context.github.issues.addLabels({
    ...context.issue(),
    labels: ["has-parent"],
  });
};

/**
 * Goal is to reflect the parent status on the docs PR.
 *  - parent opened: make sure docs PR is open
 *  - parent closed: make sure docs PR is closed
 *  - parent merged: add label "parent-merged"
 */
const updateDocsParentStatus = async (context: PRContext) => {
  if (extractRepoFromContext(context) === REPO_HOME_ASSISTANT_IO) {
    return;
  }

  const log = context.log.child({ plugin: NAME });
  const pr = context.payload.pull_request;

  const linksToDocs = extractIssuesOrPullRequestMarkdownLinks(pr.body).filter(
    (link) => link.repo === REPO_HOME_ASSISTANT_IO
  );

  log.debug(
    `SYNC: ${formatContext(context)} contains ${linksToDocs.length} links.`
  );

  if (linksToDocs.length !== 1) {
    return;
  }

  const docLink = linksToDocs[0];
  const parentState = getPRState(pr);

  if (parentState === "open") {
    // Parent is open, docs issue should be open too.
    const docsPR = await docLink.fetchPR(context.github);
    const docsPRState = getPRState(docsPR);

    if (docsPRState === "open") {
      log.debug(
        `SYNC: Parent got opened, docs PR #${docLink.number} is already open.`
      );
      return;
    }

    if (docsPRState === "merged") {
      log.debug(
        `SYNC: Parent got opened, docs PR #${docLink.number} is already merged.`
      );
      return;
    }

    // docs PR state == closed
    log.info(`SYNC: Parent got opened, opening docs PR #${docLink.number}.`);
    await context.github.pulls.update({
      ...docLink.pull(),
      state: "open",
    });
    return;
  }

  if (parentState === "closed") {
    log.info(`SYNC: Parent got closed, closing docs PR #${docLink.number}.`);
    await context.github.pulls.update({
      ...docLink.pull(),
      state: "closed",
    });
    return;
  }

  // Parent state == merged
  log.info(`SYNC: Adding parent-merged label to docs PR #${docLink.number}.`);
  await context.github.issues.addLabels({
    ...docLink.issue(),
    labels: ["parent-merged"],
  });
};
