import { PRContext } from "../../../types";
import { ParsedPath } from "../../../util/parse_path";

const VALID_TYPES = ["component", "platform"];

export default (context: PRContext, parsed: ParsedPath[]) =>
  parsed
    .filter((file) => VALID_TYPES.includes(file.type))
    .map((file) => `integration: ${file.component}`);
