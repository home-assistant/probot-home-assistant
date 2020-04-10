import * as assert from "assert";
import { runLabelBot } from "../../../../src/plugins/LabelBot/label_bot";

describe("LabelBotPlugin - typeOfChange", () => {
  it("dependency", async () => {
    let setLabels: any;

    await runLabelBot({
      // @ts-ignore
      log: () => undefined,
      payload: {
        // @ts-ignore
        pull_request: {
          // @ts-ignore
          base: {
            ref: "master",
          },
          body: "\\n- [X] Dependency upgrade",
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
      _prFiles: [],
    });
    assert.deepEqual(setLabels, {
      labels: ["merging-to-master", "small-pr", "type: dependency"],
    });
  });
  it("bugfix", async () => {
    let setLabels: any;

    await runLabelBot({
      // @ts-ignore
      log: () => undefined,
      payload: {
        // @ts-ignore
        pull_request: {
          // @ts-ignore
          base: {
            ref: "master",
          },
          body: "\\n- [X] Bugfix (non-breakin change)",
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
      _prFiles: [],
    });
    assert.deepEqual(setLabels, {
      labels: ["merging-to-master", "small-pr", "type: bugfix"],
    });
  });
  it("New integration", async () => {
    let setLabels: any;

    await runLabelBot({
      // @ts-ignore
      log: () => undefined,
      payload: {
        // @ts-ignore
        pull_request: {
          // @ts-ignore
          base: {
            ref: "master",
          },
          body: "\\n- [X] New integration (thank you!)",
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
      _prFiles: [],
    });
    assert.deepEqual(setLabels, {
      labels: ["merging-to-master", "small-pr", "type: new-integration"],
    });
  });
  it("New feature", async () => {
    let setLabels: any;

    await runLabelBot({
      // @ts-ignore
      log: () => undefined,
      payload: {
        // @ts-ignore
        pull_request: {
          // @ts-ignore
          base: {
            ref: "master",
          },
          body:
            "\\n- [X] New feature (which adds functionality to an existing integration)",
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
      _prFiles: [],
    });
    assert.deepEqual(setLabels, {
      labels: ["merging-to-master", "small-pr", "type: new-feature"],
    });
  });
  it("Breaking change", async () => {
    let setLabels: any;

    await runLabelBot({
      // @ts-ignore
      log: () => undefined,
      payload: {
        // @ts-ignore
        pull_request: {
          // @ts-ignore
          base: {
            ref: "master",
          },
          body:
            "\\n- [X] Breaking change (fix/feature causing existing functionality to break)",
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
      _prFiles: [],
    });
    assert.deepEqual(setLabels, {
      labels: ["merging-to-master", "small-pr", "type: breaking-change"],
    });
  });
  it("Code quality", async () => {
    let setLabels: any;

    await runLabelBot({
      // @ts-ignore
      log: () => undefined,
      payload: {
        // @ts-ignore
        pull_request: {
          // @ts-ignore
          base: {
            ref: "master",
          },
          body:
            "\\n- [X] Code quality improvements to existing code or addition of tests",
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
      _prFiles: [],
    });
    assert.deepEqual(setLabels, {
      labels: ["merging-to-master", "small-pr", "type: code-quality"],
    });
  });
});
