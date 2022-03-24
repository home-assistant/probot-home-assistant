import { PRContext } from "../../../types";
import { ParsedPath } from "../../../util/parse_path";

export default function (context: PRContext, parsed: ParsedPath[]) {
  const addedFlows = new Set(
    parsed
      .filter(
        (fil) =>
          fil.type == "component" &&
          fil.status == "added" &&
          fil.filename === "config_flow.py"
      )
      .map((fil) => fil.component)
  );
  // remove new integrations
  for (const fil of parsed) {
    if (
      fil.type == "test" &&
      fil.status == "added" &&
      fil.filename === "__init__.py"
    ) {
      addedFlows.delete(fil.component);
    }
  }
  return addedFlows.size ? ["config-flow"] : [];
}
