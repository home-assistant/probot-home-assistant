import { Application } from "probot";
import { REPO_HOME_ASSISTANT_IO } from "../../const";
import { IssueContext } from "../../types";
import { filterEventNoBot } from "../../util/filter_event_no_bot";
import { filterEventByRepo } from "../../util/filter_event_repo";
import { doesLabelExist } from "../../util/label";
import { extractDocumentationSectionsLinks } from "../../util/text_parser";

export const NAME = "SetDocumentationSection";

export const initSetDocumentationSection = (app: Application) => {
  app.on(
    ["issues.opened"],
    filterEventNoBot(
      NAME,
      filterEventByRepo(
        NAME,
        REPO_HOME_ASSISTANT_IO,
        runSetDocumentationSection
      )
    )
  );
};

export const runSetDocumentationSection = async (context: IssueContext) => {
  const log = context.log.child({ plugin: NAME });

  const issue = context.payload.issue;
  const foundSections = extractDocumentationSectionsLinks(issue.body);

  if (foundSections.includes("integrations")) {
    // Don't do anything for integration sections
    return;
  }

  log.debug(`Trying labels ${foundSections} for issue #${issue.number}.`);
  const existence = await Promise.all(
    foundSections.map((label) => doesLabelExist(context, label))
  );
  const labels = foundSections.filter((_, i) => existence[i]);

  if (labels.length === 0) {
    return;
  }

  log.info(`Setting labels on issue #${issue.number}: ${labels}.`);
  await context.github.issues.addLabels(context.issue({ labels }));
};
