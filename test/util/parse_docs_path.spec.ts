import * as assert from "assert";
import { ParsedDocsPath } from "../../src/util/parse_docs_path";

describe("parsePath", () => {
  it("detects non-docs files", () => {
    const result = new ParsedDocsPath(
      // @ts-ignore
      { filename: "_config.yml" }
    );
    assert.equal(result.type, null);
  });
  it("detects integration files", () => {
    const result = new ParsedDocsPath(
      // @ts-ignore
      { filename: "source/_components/mqtt.markdown" }
    );
    assert.equal(result.type, "integration");
    assert.equal(result.component, "mqtt");
    assert.equal(result.platform, null);
  });
  it("detects platform files", () => {
    const result = new ParsedDocsPath(
      // @ts-ignore
      { filename: "source/_components/light.mqtt.markdown" }
    );
    assert.equal(result.type, "integration");
    assert.equal(result.component, "mqtt");
    assert.equal(result.platform, "light");
  });
  it("detects other files", () => {
    const result = new ParsedDocsPath(
      // @ts-ignore
      { filename: "source/index.markdown" }
    );
    assert.equal(result.type, null);
  });
});
