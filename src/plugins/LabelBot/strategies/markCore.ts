import { PRContext } from "../../../types";
import { ParsedPath } from "../../../util/parse_path";

export default function(
  context: PRContext,
  parsed: ParsedPath[],
  labels: Set<string>
) {
  return parsed.some((file) => file.core) ? ["core"] : [];
}
