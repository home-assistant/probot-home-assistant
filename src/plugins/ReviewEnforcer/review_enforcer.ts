import { PRContext } from "../../types";
import { Application } from "probot";

const USERS = [
  // Konnected.io, tried to merge an integration to monetize HA
  "heythisisnate",
  "snicker",
  // Created a PyPI package that changes hass at runtime to work around our rules
  "perara",
];

export const initReviewEnforcer = (app: Application) => {
  app.on("pull_request.opened", async (context: PRContext) => {
    if (!USERS.includes(context.payload.sender.login)) {
      return;
    }

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
  });
};
