import * as assert from "assert";

import newIntegration from "../../../../src/plugins/LabelBot/strategies/newIntegrationOrPlatform";

import { ParsedPath } from "../../../../src/util/parse_path";

function getOutput(file, status) {
  var output = newIntegration(null, [
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

describe("newIntegration", () => {
  it("add new integration", () => {
    assert.deepEqual(getOutput("http/__init__.py", "added"), "new-integration");
  });

  it("add platform to integration", () => {
    assert.deepEqual(getOutput("mqtt/fan.py", "added"), "new-platform");
  });
});
