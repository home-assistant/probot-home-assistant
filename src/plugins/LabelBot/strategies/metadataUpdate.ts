import { PRContext } from "../../../types";
import { ParsedPath } from "../../../util/parse_path";

const METADATA_FILES = [
  "CODEOWNERS",
  "manifest.json",
  "requirements_all.txt",
  "requirements_docs.txt",
  "requirements_test.txt",
  "requirements_test_all.txt",
  "services.yaml",
];

export default function(context: PRContext, parsed: ParsedPath[]) {
  return parsed.every((fil) => METADATA_FILES.includes(fil.filename))
    ? ["metadata-only"]
    : [];
}
