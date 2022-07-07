import { PRContext } from "../../../types";
import { ParsedPath } from "../../../util/parse_path";
import { extractTasks } from "../../../util/text_parser";

const BODYMATCHES = [
  {
    description: "Bugfix (non-breaking change which fixes an issue)",
    labels: ["bugfix"],
  },
  {
    description: "Dependency upgrade",
    labels: ["dependency"],
  },
  {
    description: "New integration (thank you!)",
    labels: ["new-integration"],
  },
  {
    description:
      "New feature (which adds functionality to an existing integration)",
    labels: ["new-feature"],
  },
  {
    description:
      "Deprecation (breaking change to happen in the future)",
    labels: ["deprecation"],
  },
  {
    description:
      "Breaking change (fix/feature causing existing functionality to break)",
    labels: ["breaking-change"],
  },
  {
    description:
      "Code quality improvements to existing code or addition of tests",
    labels: ["code-quality"],
  },
];

export default function(context: PRContext, parsed: ParsedPath[]) {
  const completedTasks = extractTasks(context.payload.pull_request.body || "")
    .filter((task) => {
      return task.checked;
    })
    .map((task) => task.description);

  let labels: string[] = [];
  BODYMATCHES.forEach((match) => {
    if (completedTasks.includes(match.description)) {
      match.labels.forEach((label) => {
        labels.push(label);
      });
    }
  });

  return labels;
}
