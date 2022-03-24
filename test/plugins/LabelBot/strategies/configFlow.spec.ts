import * as assert from "assert";

import configFlow from "../../../../src/plugins/LabelBot/strategies/configFlow";

import { ParsedPath } from "../../../../src/util/parse_path";

function getOutput(files, status) {
  var output = configFlow(
    null,
    files.map(
      (file) =>
        new ParsedPath(
          // @ts-ignore
          {
            filename: "homeassistant/components/" + file,
            status,
          }
        )
    )
  );
  return output.length ? output[0] : null;
}

describe("configFlow", () => {
  it("add new integration", () => {
    assert.deepEqual(
      getOutput(["http/__init__.py", "http/config_flow.py"], "added"),
      null
    );
  });

  it("add config flow to existing integration", () => {
    assert.deepEqual(
      getOutput(["mqtt/config_flow.py"], "added"),
      "config-flow"
    );
  });
});
