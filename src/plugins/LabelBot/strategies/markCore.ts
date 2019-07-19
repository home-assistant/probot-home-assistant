import { PRContext } from "../../../types";
import { ParsedPath } from "../../../util/parse_path";

export default function(context: PRContext, parsed: ParsedPath[]) {
  return parsed.some((file) => file.core) ? ["core"] : [];
}
