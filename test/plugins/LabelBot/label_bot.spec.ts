import * as assert from "assert";
import { runLabelBot } from "../../../src/plugins/LabelBot/label_bot";

describe("LabelBotPlugin", () => {
  it("works", async () => {
    let setLabels: any;

    await runLabelBot({
      // @ts-ignore
      log: () => undefined,
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
      labels: ["merging-to-master", "core", "integration: mqtt"],
    });
  });

  it("many labels", async () => {
    let setLabels: any;

    await runLabelBot({
      // @ts-ignore
      log: () => undefined,
      payload: {
        pull_request: {
          // @ts-ignore
          base: {
            ref: "master",
          },
          body:
            "\n- [x] Bugfix (non-breaking change which fixes an issue)" +
            "\n- [x] Breaking change (fix/feature causing existing functionality to break)",
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
        {
          filename: "homeassistant/components/hue/light.py",
        },
        {
          filename: "homeassistant/components/zha/lock.py",
        },
        {
          filename: "homeassistant/components/switch/group.py",
        },
        {
          filename: "homeassistant/components/camera/__init__.py",
        },
        {
          filename: "homeassistant/components/zwave/sensor.py",
        },
        {
          filename: "homeassistant/components/zeroconf/usage.py",
        },
        {
          filename: "homeassistant/components/xiaomi/device_tracker.py",
        },
        {
          filename: "homeassistant/components/tts/notify.py",
        },
        {
          filename: "homeassistant/components/serial/sensor.py",
        },
      ],
    });
    assert.deepEqual(setLabels, {
      labels: ["merging-to-master", "core", "bugfix", "breaking-change"],
    });
  });
});
