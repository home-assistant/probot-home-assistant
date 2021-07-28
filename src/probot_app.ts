import { Application, Context } from "probot";
import { initLabelBot } from "./plugins/LabelBot/label_bot";
import { initIssueLinks } from "./plugins/IssueLinks/issue_links";
import { initCodeOwnersMention } from "./plugins/CodeOwnersMention/code_owners_mention";
import { initReviewEnforcer } from "./plugins/ReviewEnforcer/review_enforcer";
import { initDocsParenting } from "./plugins/DocsParenting/docs_parenting";
import { initDocsTargetBranch } from "./plugins/DocsTargetBranch/docs_target_branch";
import { initLabelCleaner } from "./plugins/LabelCleaner/label_cleaner";
import { initDocsBranchLabels } from "./plugins/DocsBranchLabels/docs_branch_labels";
import { initDocsMissingLabel } from "./plugins/DocsMissingLabel/docs_missing";
import { initDocsMissingStatus } from "./plugins/DocsMissingStatus/docs_missing";
import { initHacktoberfest } from "./plugins/Hacktoberfest/hacktoberfest";
import { initDependencyBump } from "./plugins/DependencyBump/dependency_bump";
import { initSetIntegration } from "./plugins/SetIntegration/set_integration";
import { initSetDocumentationSection } from "./plugins/SetDocumentationSection/set_documentation_section";

export const probotApp = (app: Application) => {
  initLabelBot(app);
  initCodeOwnersMention(app);
  initIssueLinks(app);
  initReviewEnforcer(app);
  initDocsParenting(app);
  initDocsTargetBranch(app);
  initLabelCleaner(app);
  initDocsBranchLabels(app);
  initDocsMissingLabel(app);
  initDocsMissingStatus(app);
  initHacktoberfest(app);
  initDependencyBump(app);
  initSetIntegration(app);
  initSetDocumentationSection(app);
};
