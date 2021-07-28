import { Application } from "probot";
import { REPO_CORE } from "../../const";
import { LabeledIssueOrPRContext } from "../../types";
import { scheduleComment } from "../../util/comment";
import { filterEventByRepo } from "../../util/filter_event_repo";
import { formatContext } from "../../util/log";

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
  const filterPRs = encodeURIComponent(`is:pr label:"${labelName}"`);
  const filterIssues = encodeURIComponent(`is:issue label:"${labelName}"`);
  const prsLink = `https://github.com/home-assistant/core/pulls?q=${filterPRs}`;
  const issuesLink = `https://github.com/home-assistant/core/issues?q=${filterIssues}`;
  const codeLink = `https://github.com/home-assistant/core/tree/dev/homeassistant/components/${integrationName}`;
  const docLink = `https://www.home-assistant.io/integrations/${integrationName}`;

  const commentBody = [
    `[${integrationName} documentation](${docLink})`,
    `[${integrationName} issues](${issuesLink})`,
    `[${integrationName} source](${codeLink})`,
    `[${integrationName} recent changes](${prsLink})`,
  ].join("\n");

  context.log.info(
    { plugin: NAME },
    `Adding links comment to ${integrationName} to ${formatContext(context)}.`
  );
  await scheduleComment(context, "IssueLinks", commentBody);
};
