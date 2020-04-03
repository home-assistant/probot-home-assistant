import { PRContext } from "../../../types";
import { ParsedPath } from "../../../util/parse_path";

export default (context: PRContext, parsed: ParsedPath[]) =>
  parsed
    .filter((file) => file.component)
    .map((file) => `integration: ${file.component}`);
