import { LabeledIssueOrPRContext } from "../../types";

const codeownersUtils = require("codeowners-utils");

export const initCodeOwnersMention = (app) => {
  app.on(
    ["issues.labeled", "pull_request.labeled"],
    async (context: LabeledIssueOrPRContext) => {
      const labelName = context.payload.label.name;
      const triggerType = context.name === "issues" ? "issue" : "pull_request";
      const triggerURL = context.payload[triggerType].html_url;

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
          `Integration named ${integrationName} not in CODEOWNERS, exiting during processing of ${triggerURL}`
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

      const issue = await context.github.issues.get(context.issue());
      const assignees = issue.data.assignees.map((assignee) =>
        assignee.login.toLowerCase()
      );

      const commentersData = await context.github.issues.listComments(
        context.issue({ per_page: 100 })
      );
      const commenters = commentersData.data.map((commenter) =>
        commenter.user.login.toLowerCase()
      );

      const payloadUsername = context.payload[triggerType].user.login;

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

      await context.github.issues.addAssignees(
        context.issue({ assignees: newAssignees })
      );

      if (mentions.length === 0) {
        return;
      }

      const issueComment = context.issue({ body: commentBody });
      return context.github.issues.createComment(issueComment);
    }
  );
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
