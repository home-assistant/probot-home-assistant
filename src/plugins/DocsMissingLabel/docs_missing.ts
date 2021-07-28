import { PRContext } from "../../types";
import { Application } from "probot";
import { ORG_HASS, REPO_CORE, REPO_DOCS } from "../../const";
import { filterEventByRepo } from "../../util/filter_event_repo";
import {
  extractIssuesOrPullRequestMarkdownLinks,
  extractPullRequestURLLinks,
} from "../../util/text_parser";

const NAME = "DocsMissingLabel";

const MANAGE_LABEL = "docs-missing";
const DOCS_REQUIRED = ["new-integration", "new-platform"];

export const initDocsMissingLabel = (app: Application) => {
  app.on(
    ["pull_request.labeled", "pull_request.unlabeled", "pull_request.edited"],
    filterEventByRepo(NAME, REPO_CORE, runDocsMissingCore)
  );
  app.on(
    "pull_request.edited",
    filterEventByRepo(NAME, REPO_DOCS, runDocsMissingDocs)
  );
};

export const runDocsMissingCore = async (context: PRContext) => {
  const log = context.log.child({ plugin: NAME });
  const pr = context.payload.pull_request;
  const labels = pr.labels.map((label) => label.name);

  const needsDocs = DOCS_REQUIRED.some((label) => labels.includes(label));
  if (!needsDocs) {
    log.debug(`Nothing to do, PR #${pr.number} doesn't require docs.`);
    return;
  }

  const hasDocs = extractIssuesOrPullRequestMarkdownLinks(pr.body)
    .concat(extractPullRequestURLLinks(pr.body))
    .some((link) => link.owner === ORG_HASS && link.repo === REPO_DOCS);

  if (hasDocs && labels.includes(MANAGE_LABEL)) {
    log.info(`Removing label from PR #${pr.number}, now links to docs.`);
    await context.github.issues.removeLabel(
      context.issue({ name: MANAGE_LABEL })
    );
  } else if (!hasDocs && !labels.includes(MANAGE_LABEL)) {
    log.info(`Adding label to PR #${pr.number}.`);
    await context.github.issues.addLabels(
      context.issue({ labels: [MANAGE_LABEL] })
    );
  }
};

export const runDocsMissingDocs = async (context: PRContext) => {
  const log = context.log.child({ plugin: NAME });
  const pr = context.payload.pull_request;

  const linksToCore = extractIssuesOrPullRequestMarkdownLinks(pr.body)
    .concat(extractPullRequestURLLinks(pr.body))
    .filter((link) => link.owner === ORG_HASS && link.repo === REPO_CORE);

  if (linksToCore.length !== 1) {
    log.debug(`Ignoring docs PR #${pr.number}, doesn't link to one core PR.`);
    return;
  }

  const coreLink = linksToCore[0];
  log.debug(`Docs PR #${pr.number} links to core PR #${coreLink.number}.`);

  const corePr = await context.github.pulls.get(coreLink.pull());
  if (!corePr.data.labels.some((label) => label.name === MANAGE_LABEL)) {
    log.debug(`PR #${coreLink.number} doesn't have label.`);
    return;
  }

  log.info(`Removing label from PR #${coreLink.number}, has incoming link.`);
  await context.github.issues.removeLabel({
    ...coreLink.issue(),
    name: MANAGE_LABEL,
  });
};
