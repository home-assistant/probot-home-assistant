import * as assert from "assert";
import { LabelBotPlugin } from "../../../src/plugins/LabelBot/label_bot";
import { ParsedPath } from "../../../src/util/parse_path";

describe("LabelBotPlugin", () => {
  it("works", async () => {
    let setLabels: any;

    await LabelBotPlugin({
      payload: {
        pull_request: {
          // @ts-ignore
          base: {
            ref: "master",
          },
        },
      },
      // @ts-ignore
      issue: (val) => val,
      github: {
        issues: {
          // @ts-ignore
          async addLabels(labels) {
            setLabels = labels;
          },
        },
      },
      _prFiles: [
        {
          filename: "homeassistant/components/mqtt/climate.py",
        },
      ],
    });
    assert.deepEqual(setLabels, {
      labels: ["integration: mqtt", "merging-to-master", "core"],
    });
  });
});
