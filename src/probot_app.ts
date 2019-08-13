import { Application, Context } from "probot";
import { initLabelBot } from "./plugins/LabelBot/label_bot";
import { initCodeOwnersMention } from "./plugins/CodeOwnersMention/code_owners_mention";
import { initReviewEnforcer } from "./plugins/ReviewEnforcer/review_enforcer";
import { initDocsParenting } from "./plugins/DocsParenting/docs_parenting";
import { initLabelCleaner } from "./plugins/LabelCleaner/label_cleaner";
import { initDocsBranchLabels } from "./plugins/DocsBranchLabels/docs_branch_labels";

export const probotApp = (app: Application) => {
  initLabelBot(app);
  initCodeOwnersMention(app);
  initReviewEnforcer(app);
  initDocsParenting(app);
  initLabelCleaner(app);
  initDocsBranchLabels(app);
};
