import { PRContext } from "../../types";
import { Application } from "probot";
import {
  filterEventByRepo,
  extractRepoFromContext,
} from "../../util/filter_event_repo";
import { REPO_HOME_ASSISTANT, REPO_HOME_ASSISTANT_IO } from "../../const";
import { filterEventNoBot } from "../../util/filter_event_no_bot";
import { fetchPullRequestFilesFromContext } from "../../util/pull_request";
import { ParsedPath } from "../../util/parse_path";
import { ParsedDocsPath } from "../../util/parse_docs_path";

const NAME = "ReviewEnforcer";

const USERS = [
  // Konnected.io, tried to merge an affiliate integration to monetize HA
  "heythisisnate",
  "snicker",
];

const INTEGRATIONS = ["konnected"];

export const initReviewEnforcer = (app: Application) => {
  app.on("pull_request.opened", filterEventNoBot(NAME, runReviewEnforcer));
};

const runReviewEnforcer = async (context: PRContext) => {
  if (USERS.includes(context.payload.sender.login)) {
    await markForReview(context);
    return;
  }

  const repo = extractRepoFromContext(context);

  if (repo === REPO_HOME_ASSISTANT) {
    await checkPythonPRFiles(context);
  } else if (repo === REPO_HOME_ASSISTANT_IO) {
    await checkDocsPRFiles(context);
  }
};

const checkDocsPRFiles = async (context: PRContext) => {
  const files = await fetchPullRequestFilesFromContext(context);
  const parsed = files.map((file) => new ParsedDocsPath(file));

  if (
    parsed.some(
      (file) => file.component && INTEGRATIONS.includes(file.component)
    )
  ) {
    await markForReview(context);
  }
};

const checkPythonPRFiles = async (context: PRContext) => {
  const files = await fetchPullRequestFilesFromContext(context);
  const parsed = files.map((file) => new ParsedPath(file));

  if (
    parsed.some(
      (file) => file.component && INTEGRATIONS.includes(file.component)
    )
  ) {
    await markForReview(context);
  }
};

const markForReview = async (context: PRContext) => {
  await Promise.all([
    context.github.issues.addAssignees(
      context.issue({ assignees: ["balloob"] })
    ),
    context.github.issues.createComment(
      context.issue({
        body: `This pull request needs to be manually signed off by @balloob before it can get merged.`,
      })
    ),
  ]);
};
