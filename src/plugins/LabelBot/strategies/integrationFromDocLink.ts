import { IssueContext } from "../../../types";
import { extractIntegrationDocumentationLinks } from "../../../util/text_parser";

export default async function(context: IssueContext): Promise<string[]> {
  const currentLabels = (await context.github.issues.listLabelsForRepo(
    context.issue()
  )).data.map((label) => label.name);

  const links = extractIntegrationDocumentationLinks(context.payload.issue.body)
    .map((link) => `integration: ${link.integration}`)
    .filter((label) => currentLabels.includes(label));

  return links.length !== 1 ? [] : links;
}
