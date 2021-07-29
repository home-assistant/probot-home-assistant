import { PRContext } from "../../../types";
import { ParsedPath } from "../../../util/parse_path";

const MAX_INTEGRATION_LABELS = 6;

export default (
  context: PRContext,
  parsed: ParsedPath[],
  labels: Set<string>
) => {
  const labelSet = new Set<string>(
    parsed
      .filter((file) => file.component)
      .map((file) => `integration: ${file.component}`)
  );
  return labelSet.size <= MAX_INTEGRATION_LABELS ? Array.from(labelSet) : [];
};
