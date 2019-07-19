import { PRContext } from "../../../types";
import { ParsedPath } from "../../../util/parse_path";

export default function(context: PRContext, parsed: ParsedPath[]) {
  return context.payload.pull_request.base.ref === "master"
    ? ["merging-to-master"]
    : [];
}
