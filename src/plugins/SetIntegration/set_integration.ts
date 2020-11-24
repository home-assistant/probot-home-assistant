import { Application } from "probot";
import { REPO_CORE } from "../../const";
import { IssueContext } from "../../types";
import { filterEventNoBot } from "../../util/filter_event_no_bot";
import { filterEventByRepo } from "../../util/filter_event_repo";
import { extractIntegrationDocumentationLinks } from "../../util/text_parser";

export const NAME = "SetIntegration";

export const initSetIntegration = (app: Application) => {
  app.on(
    ["issues.opened"],
    filterEventNoBot(
      NAME,
      filterEventByRepo(NAME, REPO_CORE, runSetIntegration)
    )
  );
};

export const runSetIntegration = async (context: IssueContext) => {
  const currentLabels = (await context.github.issues.listLabelsForRepo(
    context.issue()
  )).data.map((label) => label.name);

  const labels = extractIntegrationDocumentationLinks(
    context.payload.issue.body
  )
    .map((link) => `integration: ${link.integration}`)
    .filter((label) => currentLabels.includes(label));

  if (labels.length === 0) {
    return;
  }

  context.log(
    `${NAME}: Setting labels on #${context.payload.issue.number}: ${labels.join(
      ", "
    )}`
  );
  await context.github.issues.addLabels(context.issue({ labels }));
};
