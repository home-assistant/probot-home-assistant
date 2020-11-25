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
  const labels: string[] = [];
  const foundLinks = extractIntegrationDocumentationLinks(
    context.payload.issue.body
  );

  for (const link of foundLinks) {
    const label = `integration: ${link.integration}`;
    const exsist = await context.github.issues.getLabel(
      context.issue({ name: label })
    );
    if (exsist.status === 200 && exsist.data.name === label) {
      labels.push(label);
    }
  }

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