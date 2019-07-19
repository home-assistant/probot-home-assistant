import * as assert from "assert";

import hasTests from "../../../../src/plugins/LabelBot/strategies/hasTests";

import { ParsedPath } from "../../../../src/util/parse_path";

function getOutput(filename) {
  var output = hasTests(null, [
    new ParsedPath(
      // @ts-ignore
      { filename }
    ),
  ]);
  return output.length ? output[0] : null;
}

describe("hasTests", () => {
  it("marks PRs with tests", () => {
    assert.deepEqual(getOutput("tests/components/light/hue.py"), "has-tests");
  });
  it("not mark PRs without tests", () => {
    assert.deepEqual(getOutput("homeassistant/components/light/hue.py"), null);
  });
});
