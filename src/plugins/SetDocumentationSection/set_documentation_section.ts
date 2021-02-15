import { Application } from "probot";
import { REPO_HOME_ASSISTANT_IO } from "../../const";
import { IssueContext } from "../../types";
import { filterEventNoBot } from "../../util/filter_event_no_bot";
import { extractDocumentationSectionsLinks } from "../../util/text_parser";
import { filterEventByRepo } from "../../util/filter_event_repo";

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
  const foundSections = extractDocumentationSectionsLinks(
    context.payload.issue.body
  );

  if (foundSections.includes("integration")) {
    // Don't do anything for integration sections
    return;
  }

  let labels = (await Promise.all(
    foundSections.map(async (section) => {
      try {
        const exist = await context.github.issues.getLabel(
          context.issue({ name: section })
        );
        if (exist.status === 200 && exist.data.name === section) {
          return section;
        }
      } catch (err) {
        context.log(err);
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
