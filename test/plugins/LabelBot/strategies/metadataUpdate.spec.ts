import * as assert from "assert";

import metadataUpdate from "../../../../src/plugins/LabelBot/strategies/metadataUpdate";
import { ParsedPath } from "../../../../src/util/parse_path";

function getOutput(files: string[]) {
  var output = metadataUpdate(
    null,

    files.map(
      (filename) =>
        new ParsedPath(
          // @ts-ignore
          { filename }
        )
    )
  );
  return output.length ? output[0] : null;
}

describe("metadataUpdate", () => {
  it("tags metadata only updates", () => {
    assert.deepEqual(
      getOutput([
        "CODEOWNERS",
        "requirements_all.txt",
        "requirements_docs.txt",
        "requirements_test.txt",
        "requirements_test_all.txt",
        "homeassistant/components/mqtt/manifest.json",
        "homeassistant/components/mqtt/services.yaml",
      ]),
      "metadata-only"
    );
  });

  it("detects non-metadata file changes", () => {
    assert.deepEqual(
      getOutput(["requirements_all.txt", "homeassistant/core.py"]),
      null
    );
  });
});
