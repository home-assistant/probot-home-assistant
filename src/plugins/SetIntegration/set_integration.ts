import { Application } from "probot";
import { REPO_CORE, REPO_HOME_ASSISTANT_IO } from "../../const";
import { IssueContext } from "../../types";
import { filterEventNoBot } from "../../util/filter_event_no_bot";
import { extractRepoFromContext } from "../../util/filter_event_repo";
import { extractIntegrationDocumentationLinks } from "../../util/text_parser";

export const NAME = "SetIntegration";

const activeRepositories = [REPO_CORE, REPO_HOME_ASSISTANT_IO];

export const initSetIntegration = (app: Application) => {
  app.on(["issues.opened"], filterEventNoBot(NAME, runSetIntegration));
};

export const runSetIntegration = async (context: IssueContext) => {
  const repository = extractRepoFromContext(context);
  if (!activeRepositories.includes(repository)) {
    console.log(
      NAME,
      `Skipping event because repository ${repository} does not match ${activeRepositories}.`
    );
    return;
  }
  const foundLinks = extractIntegrationDocumentationLinks(
    context.payload.issue.body
  );

  let labels = (await Promise.all(
    foundLinks.map(async (link) => {
      const label = `integration: ${link.integration}`;
      const exist = await context.github.issues.getLabel(
        context.issue({ name: label })
      );
      if (exist.status === 200 && exist.data.name === label) {
        return label;
      }
    })
  )).filter(Boolean);

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
