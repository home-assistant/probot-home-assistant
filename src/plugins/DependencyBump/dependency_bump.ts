import { Application } from "probot";
import { REPO_CORE } from "../../const";
import { PRContext } from "../../types";
import { filterEventNoBot } from "../../util/filter_event_no_bot";
import { filterEventByRepo } from "../../util/filter_event_repo";
import { fetchPullRequestFilesFromContext } from "../../util/pull_request";

const NAME = "DependencyBump";

const DEPENDENCY_FILES = [
  "setup.py",
  "manifest.json",
  "package_constraints.txt",
  "requirements_all.txt",
  "requirements_docs.txt",
  "requirements_test.txt",
  "requirements_test_all.txt",
];

export const initDependencyBump = (app: Application) => {
  app.on(
    ["pull_request.opened"],
    filterEventNoBot(
      NAME,
      filterEventByRepo(NAME, REPO_CORE, runDependencyBump)
    )
  );
};

const runDependencyBump = async (context: PRContext) => {
  const files = await fetchPullRequestFilesFromContext(context);
  const filenames = files.map((file) => {
    const parts = file.filename.split("/");
    return parts[parts.length - 1];
  });

  if (!filenames.every((filename) => DEPENDENCY_FILES.includes(filename))) {
    return;
  }

  context.log.info(
    { plugin: NAME },
    `Adding label dependency-bump to PR #${context.payload.pull_request.number}.`
  );
  await context.github.issues.addLabels(
    context.issue({ labels: ["dependency-bump"] })
  );
};
