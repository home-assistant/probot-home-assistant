import { PRContext } from "../../../types";
import { ParsedPath } from "../../../util/parse_path";

export default function(
  context: PRContext,
  parsed: ParsedPath[],
  labels: Set<string>
) {
  return parsed.some(
    (fil) =>
      fil.type == "component" &&
      fil.status == "added" &&
      fil.filename === "__init__.py"
  )
    ? ["new-integration"]
    : parsed.some((fil) => fil.type == "platform" && fil.status == "added")
    ? ["new-platform"]
    : [];
}
