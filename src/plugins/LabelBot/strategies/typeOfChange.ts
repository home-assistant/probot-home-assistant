import { PRContext } from "../../../types";
import { ParsedPath } from "../../../util/parse_path";

const BODYMATCHES = [
  {
    key: /\\n- \[(x|X)\] Bugfix /,
    label: "type: bugfix",
  },
  {
    key: /\\n- \[(x|X)\] Dependency upgrade/,
    label: "type: dependency",
  },
  {
    key: /\\n- \[(x|X)\] New integration /,
    label: "type: new-integration",
  },
  {
    key: /\\n- \[(x|X)\] New feature /,
    label: "type: new-feature",
  },
  {
    key: /\\n- \[(x|X)\] Breaking change /,
    label: "type: breaking-change",
  },
  {
    key: /\\n- \[(x|X)\] Code quality improvements /,
    label: "type: code-quality",
  },
];

export default function(context: PRContext, parsed: ParsedPath[]) {
  let labels: string[] = [];
  BODYMATCHES.forEach((match) => {
    if (match.key.test(context.payload.pull_request.body)) {
      labels.push(match.label);
    }
  });

  return labels;
}
