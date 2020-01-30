import * as assert from "assert";

import comp from "../../../../src/plugins/LabelBot/strategies/componentAndPlatform";

import { ParsedPath } from "../../../../src/util/parse_path";

function getOutput(file, prefix = "homeassistant/components/") {
  var output = comp(null, [
    new ParsedPath(
      // @ts-ignore
      { filename: prefix + file }
    ),
  ]);
  return output.length ? output[0] : null;
}

describe("componentAndPlatform", () => {
  it("single component file", () => {
    assert.deepEqual(getOutput("browser/__init__.py"), "integration: browser");
  });

  it("component dir init", () => {
    assert.deepEqual(getOutput("zwave/__init__.py"), "integration: zwave");
  });

  it("component dir file", () => {
    assert.deepEqual(getOutput("zwave/const.py"), "integration: zwave");
  });

  it("component dir plaform file", () => {
    assert.deepEqual(getOutput("zwave/light.py"), "integration: zwave");
  });

  it("platform file", () => {
    assert.deepEqual(getOutput("hue/light.py"), "integration: hue");
  });

  it("platform dir", () => {
    assert.deepEqual(getOutput("lifx/light/const.py"), "integration: lifx");
  });

  it("component services", () => {
    assert.deepEqual(getOutput("light/services.yaml"), "integration: light");
  });

  it("generic services", () => {
    assert.deepEqual(getOutput("services.yaml"), null);
  });

  it("component init file", () => {
    assert.deepEqual(getOutput("cover/__init__.py"), "integration: cover");
  });

  it("component tests", () => {
    assert.deepEqual(
      getOutput("linky/conftest.py", "tests/components/"),
      "integration: linky"
    );
  });
});
