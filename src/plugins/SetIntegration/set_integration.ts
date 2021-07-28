import { Application } from "probot";
import { REPO_CORE, REPO_HOME_ASSISTANT_IO } from "../../const";
import { IssueContext } from "../../types";
import { filterEventNoBot } from "../../util/filter_event_no_bot";
import { extractRepoFromContext } from "../../util/filter_event_repo";
import { doesLabelExist } from "../../util/label";
import { extractIntegrationDocumentationLinks } from "../../util/text_parser";

export const NAME = "SetIntegration";

const activeRepositories = [REPO_CORE, REPO_HOME_ASSISTANT_IO];

export const initSetIntegration = (app: Application) => {
  app.on(["issues.opened"], filterEventNoBot(NAME, runSetIntegration));
};

export const runSetIntegration = async (context: IssueContext) => {
  const log = context.log.child({ plugin: NAME });

  const repository = extractRepoFromContext(context);
  if (!activeRepositories.includes(repository)) {
    log.debug(
      `Skipping event because repository ${repository} does not match ${activeRepositories}.`
    );
    return;
  }

  const issue = context.payload.issue;
  const foundLinks = extractIntegrationDocumentationLinks(issue.body);

  const foundLabels = foundLinks.map(
    (link) => `integration: ${link.integration}`
  );
  log.debug(`Trying labels ${foundLabels} for issue #${issue.number}.`);
  const existence = await Promise.all(
    foundLabels.map((label) => doesLabelExist(context, label, REPO_CORE))
  );
  const labels = foundLabels.filter((_, i) => existence[i]);

  if (labels.length === 0) {
    return;
  }

  log.info(`Setting labels on issue #${issue.number}: ${labels}.`);
  await context.github.issues.addLabels(context.issue({ labels }));
};
