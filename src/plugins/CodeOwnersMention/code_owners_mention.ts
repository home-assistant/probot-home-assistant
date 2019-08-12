const codeownersUtils = require("codeowners-utils");
import { LabeledIssueOrPRContext } from "../../types";
import { Application } from "probot";
import { REPO_HOME_ASSISTANT } from "../../const";
import { filterEventByRepo } from "../../util/filter_event_repo";
import { filterEventNoBot } from "../../util/filter_event_no_bot";
import { getIssueFromPayload } from "../../util/issue";
import { WebhookPayloadIssuesIssue } from "@octokit/webhooks";

const NAME = "CodeOwnersMention";

export const initCodeOwnersMention = (app: Application) => {
  app.on(
    ["issues.labeled", "pull_request.labeled"],
    filterEventNoBot(
      NAME,
      filterEventByRepo(NAME, REPO_HOME_ASSISTANT, runCodeOwnersMention)
    )
  );
};

export const runCodeOwnersMention = async (
  context: LabeledIssueOrPRContext
) => {
  const labelName = context.payload.label.name;
  const triggerIssue = getIssueFromPayload(context);
  const triggerURL = triggerIssue.html_url;

  if (labelName.indexOf("integration: ") === -1) {
    return;
  }

  const codeownersData = await context.github.repos.getContents(
    context.repo({ path: "CODEOWNERS" })
  );

  const integrationName = labelName.split("integration: ")[1];

  const path = `homeassistant/components/${integrationName}/*`;

  const str = Buffer.from(codeownersData.data.content, "base64").toString();

  if (str.indexOf(integrationName) === -1) {
    context.log(
      `Integration ${integrationName} not in CODEOWNERS, exiting during processing of ${triggerURL}`
    );
    return;
  }

  const entries = parse(str);
  const match = codeownersUtils.matchFile(path, entries);

  if (!match) {
    context.log(
      `No match found in CODEOWNERS for ${path}, exiting during processing of ${triggerURL}`
    );
    return;
  }

  const codeownersLine = `${codeownersData.data.html_url}#L${match.line}`;

  // The type for the PR payload is wrong for assignees. Cast it to issue. type is the same.
  const assignees = (triggerIssue.assignees as WebhookPayloadIssuesIssue["assignees"]).map(
    (assignee) => assignee.login.toLowerCase()
  );

  const commentersData = await context.github.issues.listComments(
    context.issue({ per_page: 100 })
  );
  const commenters = commentersData.data.map((commenter) =>
    commenter.user.login.toLowerCase()
  );

  const payloadUsername = triggerIssue.user.login;

  const mentions = match.owners.filter((rawUsername) => {
    const username = rawUsername.substring(1);
    return (
      payloadUsername != username &&
      assignees.indexOf(username) === -1 &&
      commenters.indexOf(username) === -1
    );
  });

  const triggerLabel = context.name === "issues" ? "issue" : "pull request";

  const commentBody = `Hey there ${mentions.join(
    ", "
  )}, mind taking a look at this ${triggerLabel} as its been labeled with a integration (\`${integrationName}\`) you are listed as a [codeowner](${codeownersLine}) for? Thanks!`;

  context.log(
    `Adding comment to ${triggerLabel} ${triggerURL}: ${commentBody}`
  );

  const newAssignees = match.owners.map((rawUsername) =>
    rawUsername.substring(1)
  );

  const promises: Promise<unknown>[] = [
    context.github.issues.addAssignees(
      context.issue({ assignees: newAssignees })
    ),
  ];

  if (mentions.length > 0) {
    promises.push(
      context.github.issues.createComment(context.issue({ body: commentBody }))
    );
  }

  await Promise.all(promises);
};

// Temporary local patched version of whats in codeowners-utils
// until https://github.com/jamiebuilds/codeowners-utils/pull/1 is merged
function parse(str: string) {
  let entries = [];
  let lines = str.split("\n");

  lines.forEach((entry, idx) => {
    let [content, comment] = entry.split("#");
    let trimmed = content.trim();
    if (trimmed === "") return;
    let [pattern, ...owners] = trimmed.split(/\s+/);
    let line = idx + 1;
    entries.push({ pattern, owners, line });
  });

  return entries.reverse();
}
