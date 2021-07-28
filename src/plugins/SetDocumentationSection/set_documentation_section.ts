import { Application } from "probot";
import { REPO_HOME_ASSISTANT_IO } from "../../const";
import { IssueContext } from "../../types";
import { filterEventNoBot } from "../../util/filter_event_no_bot";
import { filterEventByRepo } from "../../util/filter_event_repo";
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

  const foundSections = extractDocumentationSectionsLinks(
    context.payload.issue.body
  );

  if (foundSections.includes("integration")) {
    // Don't do anything for integration sections
    return;
  }

  log.debug(
    `Trying labels ${foundSections} for issue #${context.payload.issue.number}.`
  );
  let labels = (await Promise.all(
    foundSections.map(async (section) => {
      try {
        const exist = await context.github.issues.getLabel(
          context.issue({ name: section })
        );
        if (exist.data.name === section) {
          return section;
        }
      } catch (err) {
        context.log.error({ plugin: NAME, err });
      }
    })
  )).filter(Boolean);

  if (labels.length === 0) {
    return;
  }

  log.info(
    `Setting labels on issue #${context.payload.issue.number}: ${labels}.`
  );
  await context.github.issues.addLabels(context.issue({ labels }));
};
