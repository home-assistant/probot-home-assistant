import { PRContext } from "../../../types";
import { ParsedPath } from "../../../util/parse_path";

const SMALL_PR_THRESHOLD = 30;

export default function(context: PRContext, parsed: ParsedPath[]) {
  const total = parsed.reduce(
    (tot, file) =>
      file.type === "test" || file.type === null ? tot : tot + file.additions,
    0
  );
  return total < SMALL_PR_THRESHOLD ? ["small-pr"] : [];
}
