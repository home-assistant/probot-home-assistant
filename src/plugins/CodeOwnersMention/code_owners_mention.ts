const codeownersUtils = require("codeowners-utils");
import { WebhookPayloadIssuesIssue } from "@octokit/webhooks";
import { Application } from "probot";
import { REPO_CORE, REPO_HOME_ASSISTANT_IO } from "../../const";
import { LabeledIssueOrPRContext } from "../../types";
import { scheduleComment } from "../../util/comment";
import { extractRepoFromContext } from "../../util/filter_event_repo";
import { getIssueFromPayload } from "../../util/issue";
import { formatContext } from "../../util/log";

const NAME = "CodeOwnersMention";

const activeRepositories = [REPO_CORE, REPO_HOME_ASSISTANT_IO];

export const initCodeOwnersMention = (app: Application) => {
  app.on(["issues.labeled", "pull_request.labeled"], runCodeOwnersMention);
};

export const runCodeOwnersMention = async (
  context: LabeledIssueOrPRContext
) => {
  const log = context.log.child({ plugin: NAME });

  const repository = extractRepoFromContext(context);
  if (!activeRepositories.includes(repository)) {
    log.debug(
      `Skipping event because repository ${repository} does not match ${activeRepositories}.`
    );
    return;
  }

  const labelName = context.payload.label.name;
  const triggerIssue = getIssueFromPayload(context);

  if (labelName.indexOf("integration: ") === -1) {
    return;
  }

  const codeownersData = await context.github.repos.getContents(
    context.repo({ path: "CODEOWNERS" })
  );

  const integrationName = labelName.split("integration: ")[1];

  const path =
    repository === REPO_CORE
      ? `homeassistant/components/${integrationName}/*`
      : `source/_integrations/${integrationName}.markdown`;

  const str = Buffer.from(codeownersData.data.content, "base64").toString();

  if (str.indexOf(integrationName) === -1) {
    log.info(
      `Skipping label ${labelName} because integration ${integrationName} is not in CODEOWNERS.`
    );
    return;
  }

  const entries = parse(str);
  const match = codeownersUtils.matchFile(path, entries);

  if (!match) {
    log.info(
      `Skipping label ${labelName} because path ${path} is not found in CODEOWNERS.`
    );
    return;
  }

  const owners = match.owners.map(
    // Remove the `@`
    (usr) => usr.substring(1).toLowerCase()
  );

  // Because of our patched parse(), TS doesn't know about the match property.
  // @ts-ignore
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

  const payloadUsername = triggerIssue.user.login.toLowerCase();
  const ownersMinusAuthor = owners.filter((usr) => usr !== payloadUsername);

  log.info(`Assigning to ${formatContext(context)}: ${ownersMinusAuthor}`);
  const promises: Promise<unknown>[] = [
    context.github.issues.addAssignees(
      context.issue({ assignees: ownersMinusAuthor })
    ),
  ];

  const mentions = ownersMinusAuthor
    .filter((usr) => !assignees.includes(usr) && !commenters.includes(usr))
    // Add `@` because used in a comment.
    .map((usr) => `@${usr}`);

  if (mentions.length > 0) {
    const triggerLabel =
      repository === REPO_CORE
        ? context.name === "issues"
          ? "issue"
          : "pull request"
        : "feedback";
    const commentBody = `Hey there ${mentions.join(
      ", "
    )}, mind taking a look at this ${triggerLabel} as it has been labeled with an integration (\`${integrationName}\`) you are listed as a [code owner](${codeownersLine}) for? Thanks!`;

    log.info(`Adding comment to ${formatContext(context)}: ${commentBody}`);

    promises.push(scheduleComment(context, "CodeOwnersMention", commentBody));
  }

  // Add a label if author of issue/PR is a code owner
  if (owners.includes(payloadUsername)) {
    log.info(`Adding by-code-owner label to ${formatContext(context)}.`);

    promises.push(
      context.github.issues.addLabels(
        context.issue({ labels: ["by-code-owner"] })
      )
    );
  }

  await Promise.all(promises);
};

// Temporary local patched version of what's in codeowners-utils
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
