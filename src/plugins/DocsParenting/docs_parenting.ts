import { PRContext } from "../../types";
import { Application } from "probot";
import { extractRepoFromContext } from "../../util/filter_event_repo";
import { REPO_HOME_ASSISTANT_IO, ORG_HASS } from "../../const";
import { getIssueFromPayload } from "../../util/issue";
import { extractIssuesOrPullRequestLinksFromMarkdown } from "../../util/text_parser";
import { getPRState } from "../../util/pull_request";

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
    ["pull_request.opened", "pull_request.closed"],
    updateDocsParentStatus
  );
};

// Deal with PRs on Home Assistant Python repo
const runDocsParentingNonDocs = async (context: PRContext) => {
  const triggerIssue = getIssueFromPayload(context);

  const linksToDocs = extractIssuesOrPullRequestLinksFromMarkdown(
    triggerIssue.body
  ).filter((link) => link.repo === REPO_HOME_ASSISTANT_IO);

  context.log(
    NAME,
    "NON-DOC-PR",
    `Found ${linksToDocs.length} links to doc PRs`
  );

  if (linksToDocs.length === 0) {
    return;
  }

  if (linksToDocs.length > 2) {
    context.log(
      NAME,
      "NON-DOC-PR",
      "Not adding has-parent label because HASS PR has more than 2 links to docs PRs."
    );
    return;
  }

  context.log(
    NAME,
    "NON-DOC-PR",
    `Adding has-parent label to doc PRS ${linksToDocs
      .map((link) => link.number)
      .join(", ")}`
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
  const triggerIssue = getIssueFromPayload(context);
  const linksToNonDocs = extractIssuesOrPullRequestLinksFromMarkdown(
    triggerIssue.body
  ).filter(
    (link) => link.owner === ORG_HASS && link.repo !== REPO_HOME_ASSISTANT_IO
  );

  context.log(
    NAME,
    "DOC-PR",
    `Found ${linksToNonDocs.length} links to non-doc PRs`
  );

  if (linksToNonDocs.length === 0) {
    return;
  }

  context.log(
    NAME,
    "DOC-PR",
    `Adding has-parent label to doc PR ${triggerIssue.number}`
  );

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
  const log = (msg: string) => context.log(NAME, "PARENT-STATUS-SYNC", msg);

  const pr = context.payload.pull_request;

  const linksToDocs = extractIssuesOrPullRequestLinksFromMarkdown(
    pr.body
  ).filter((link) => link.repo === REPO_HOME_ASSISTANT_IO);

  log(`PR ${pr.number} contains ${linksToDocs.length} links to doc PRs`);

  if (linksToDocs.length !== 1) {
    if (linksToDocs.length > 1) {
      log(`Not doing work because more than 1 link found.`);
    }
    return;
  }

  const docLink = linksToDocs[0];
  const parentState = getPRState(pr);

  if (parentState === "open") {
    // Parent is open, docs issue should be open too.
    const docsPR = await docLink.fetchPR(context.github);
    const docsPRState = getPRState(docsPR);

    if (docsPRState === "open") {
      log(
        `Parent got opened, docs PR ${docLink.number} is already open. Not doing work`
      );
      return;
    }

    if (docsPRState === "merged") {
      log(`Parent got opened but docs PR ${docLink.number} is already merged.`);
      return;
    }

    // docs PR state == closed
    log(`Parent got opened, opening docs PR ${docLink.number}.`);
    await context.github.pulls.update({
      ...docLink.pull(),
      state: "open",
    });
    return;
  }

  if (parentState === "closed") {
    log(`Parent got closed, closing docs PR ${docLink.number}`);
    await context.github.pulls.update({
      ...docLink.pull(),
      state: "closed",
    });
    return;
  }

  // Parent state == merged
  log(`Adding parent-merged label to doc PR ${docLink.number}`);

  await context.github.issues.addLabels({
    ...docLink.issue(),
    labels: ["parent-merged"],
  });
};
