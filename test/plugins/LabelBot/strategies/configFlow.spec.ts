import * as assert from "assert";

import configFlow from "../../../../src/plugins/LabelBot/strategies/configFlow";

import { ParsedPath } from "../../../../src/util/parse_path";

function getOutput(file, status) {
  var output = configFlow(null, [
    new ParsedPath(
      // @ts-ignore
      {
        filename: "homeassistant/components/" + file,
        status,
      }
    ),
  ]);
  return output.length ? output[0] : null;
}

describe("configFlow", () => {
  it("add new integration", () => {
    assert.deepEqual(getOutput("http/__init__.py", "added"), null);
  });

  it("add config flow", () => {
    assert.deepEqual(getOutput("mqtt/config_flow.py", "added"), "config-flow");
  });
});
