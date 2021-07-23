import { LabeledIssueOrPRContext } from "../../types";
import { Application } from "probot";
import { REPO_CORE } from "../../const";
import { filterEventByRepo } from "../../util/filter_event_repo";
import { scheduleComment } from "../../util/comment";

const NAME = "IssueLinks";

export const initIssueLinks = (app: Application) => {
  app.on(["issues.labeled"], filterEventByRepo(NAME, REPO_CORE, runIssueLinks));
};

export const runIssueLinks = async (context: LabeledIssueOrPRContext) => {
  const labelName = context.payload.label.name;

  if (labelName.indexOf("integration: ") === -1) {
    return;
  }

  const integrationName = labelName.split("integration: ")[1];
  const docLink = `https://www.home-assistant.io/integrations/${integrationName}`;
  const codeLink = `https://github.com/home-assistant/core/tree/dev/homeassistant/components/${integrationName}`;

  const commentBody = `[${integrationName} documentation](${docLink})\n[${integrationName} source](${codeLink})`;

  context.log(NAME, `Adding comment with links ${commentBody}`);
  await scheduleComment(context, "IssueLinks", commentBody);
};
