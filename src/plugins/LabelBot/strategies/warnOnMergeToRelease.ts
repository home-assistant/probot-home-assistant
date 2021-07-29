import { PRContext } from "../../../types";
import { ParsedPath } from "../../../util/parse_path";

export default function(
  context: PRContext,
  parsed: ParsedPath[],
  labels: Set<string>
) {
  return context.payload.pull_request.base.ref === "master"
    ? ["merging-to-master"]
    : context.payload.pull_request.base.ref === "rc"
    ? ["merging-to-rc"]
    : [];
}
