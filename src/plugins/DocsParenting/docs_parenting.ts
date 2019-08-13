import { PRContext } from "../../types";
import { Application } from "probot";
import { extractRepoFromContext } from "../../util/filter_event_repo";
import { REPO_HOME_ASSISTANT_IO, ORG_HASS } from "../../const";
import { getIssueFromPayload } from "../../util/issue";
import { extractIssuesOrPullRequestLinksFromMarkdown } from "../../util/pull_request";

const NAME = "DocsParenting";

export const initDocsParenting = (app: Application) => {
  app.on(["pull_request.opened", "pull_request.edited"], async (context) => {
    if (extractRepoFromContext(context) === REPO_HOME_ASSISTANT_IO) {
      await runDocsParentingDocs(context);
    } else {
      await runDocsParentingNonDocs(context);
    }
  });
};

// Deal with PRs on Home Assistant Python repo
const runDocsParentingNonDocs = async (context: PRContext) => {
  const triggerIssue = getIssueFromPayload(context);

  const linksToDocs = extractIssuesOrPullRequestLinksFromMarkdown(
    triggerIssue.body
  ).filter((link) => link.repository === REPO_HOME_ASSISTANT_IO);

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
      "Not adding has-parent label because HASS PR has more than 2 links to docs PRs."
    );
    return;
  }

  context.log(
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
    (link) =>
      link.organization === ORG_HASS &&
      link.repository !== REPO_HOME_ASSISTANT_IO
  );

  context.log(
    NAME,
    "DOC-PR",
    `Found ${linksToNonDocs.length} links to non-doc PRs`
  );

  if (linksToNonDocs.length === 0) {
    return;
  }

  context.log(`Adding has-parent label to doc PR ${triggerIssue.number}`);

  await context.github.issues.addLabels({
    ...context.issue(),
    labels: ["has-parent"],
  });
};
