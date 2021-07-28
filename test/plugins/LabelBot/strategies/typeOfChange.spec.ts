import * as assert from "assert";
import { log } from "../../../mock";
import { runLabelBot } from "../../../../src/plugins/LabelBot/label_bot";

describe("LabelBotPlugin - typeOfChange", () => {
  it("dependency", async () => {
    let setLabels: any;

    await runLabelBot({
      // @ts-ignore
      log,
      payload: {
        // @ts-ignore
        pull_request: {
          // @ts-ignore
          base: {
            ref: "dev",
          },
          body: "\n- [X] Dependency upgrade",
          labels: []
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
      labels: ["small-pr", "dependency"],
    });
  });
  it("bugfix", async () => {
    let setLabels: any;

    await runLabelBot({
      // @ts-ignore
      log,
      payload: {
        // @ts-ignore
        pull_request: {
          // @ts-ignore
          base: {
            ref: "dev",
          },
          body: "\n- [X] Bugfix (non-breaking change which fixes an issue)",
          labels: []
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
      labels: ["small-pr", "bugfix"],
    });
  });
  it("New integration", async () => {
    let setLabels: any;

    await runLabelBot({
      // @ts-ignore
      log,
      payload: {
        // @ts-ignore
        pull_request: {
          // @ts-ignore
          base: {
            ref: "dev",
          },
          body: "\n- [X] New integration (thank you!)",
          labels: []
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
      labels: ["small-pr", "new-integration"],
    });
  });
  it("New feature", async () => {
    let setLabels: any;

    await runLabelBot({
      // @ts-ignore
      log,
      payload: {
        // @ts-ignore
        pull_request: {
          // @ts-ignore
          base: {
            ref: "dev",
          },
          body:
            "\n- [X] New feature (which adds functionality to an existing integration)",
          labels: []
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
      labels: ["small-pr", "new-feature"],
    });
  });
  it("Breaking change", async () => {
    let setLabels: any;

    await runLabelBot({
      // @ts-ignore
      log,
      payload: {
        // @ts-ignore
        pull_request: {
          // @ts-ignore
          base: {
            ref: "dev",
          },
          body:
            "\n- [X] Breaking change (fix/feature causing existing functionality to break)",
          labels: []
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
      labels: ["small-pr", "breaking-change"],
    });
  });
  it("Code quality", async () => {
    let setLabels: any;

    await runLabelBot({
      // @ts-ignore
      log,
      payload: {
        // @ts-ignore
        pull_request: {
          // @ts-ignore
          base: {
            ref: "dev",
          },
          body:
            "\n- [X] Code quality improvements to existing code or addition of tests",
          labels: []
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
      labels: ["small-pr", "code-quality"],
    });
  });
});
