import { Application } from "probot";
import { REPO_CORE, REPO_DOCS } from "../../const";
import { IssueContext } from "../../types";
import { filterEventNoBot } from "../../util/filter_event_no_bot";
import { filterEventByRepo } from "../../util/filter_event_repo";
import { doesLabelExist } from "../../util/label";
import { extractIntegrationDocumentationLinks } from "../../util/text_parser";

export const NAME = "SetIntegration";

export const initSetIntegration = (app: Application) => {
  app.on(
    ["issues.opened"],
    filterEventNoBot(
      NAME,
      filterEventByRepo(NAME, [REPO_CORE, REPO_DOCS], runSetIntegration)
    )
  );
};

export const runSetIntegration = async (context: IssueContext) => {
  const log = context.log.child({ plugin: NAME });

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
