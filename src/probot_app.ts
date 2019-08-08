import { Application, Context } from "probot";
import { initLabelBot } from "./plugins/LabelBot/label_bot";
import { initCodeOwnersMention } from "./plugins/CodeOwnersMention/code_owners_mention";
import { initReviewEnforcer } from "./plugins/ReviewEnforcer/review_enforcer";

export const probotApp = (app: Application) => {
  initLabelBot(app);
  initCodeOwnersMention(app);
  initReviewEnforcer(app);
};
