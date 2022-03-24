import * as assert from "assert";

import configFlow from "../../../../src/plugins/LabelBot/strategies/configFlow";

import { ParsedPath } from "../../../../src/util/parse_path";

function getOutput(files, status) {
  var output = configFlow(
    null,
    files.map(
      (filename) =>
        new ParsedPath(
          // @ts-ignore
          {
            filename,
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
      getOutput(
        [
          "tests/components/http/__init__.py",
          "homeassistant/components/http/config_flow.py",
        ],
        "added"
      ),
      null
    );
  });

  it("add config flow to existing integration", () => {
    assert.deepEqual(
      getOutput(["homeassistant/components/mqtt/config_flow.py"], "added"),
      "config-flow"
    );
  });
});
