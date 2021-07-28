import * as assert from "assert";
import * as sinon from "sinon";
import { log } from "../../mock";
import {
  runHacktoberfestNewPR,
  runHacktoberfestClosedPR,
  isHacktoberfestLive,
} from "../../../src/plugins/Hacktoberfest/hacktoberfest";

describe("Hacktoberfest", () => {
  describe("Check live", () => {
    it("Hacktoberfest is live", async () => {
      const clock = sinon.useFakeTimers(new Date(2020, 9, 1).getTime());
      assert.strictEqual(isHacktoberfestLive(), true);
      clock.restore();
    });
    it("Hacktoberfest is not live", async () => {
      const clock = sinon.useFakeTimers(new Date(2020, 8, 1).getTime());
      assert.strictEqual(isHacktoberfestLive(), false);
      clock.restore();
    });
  });
  describe("Check labels", () => {
    it("Add hacktoberfest label on new PR", async () => {
      let setLabels: any;
      await runHacktoberfestNewPR({
        // @ts-ignore
        log,
        name: "pull_request",
        payload: {
          // @ts-ignore
          pull_request: {
            labels: [],
          },
          // @ts-ignore
          sender: {
            login: "developer",
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
      });
      assert.deepEqual(setLabels, {
        labels: ["Hacktoberfest"],
      });
    });
    it("Remove hacktoberfest label and add invalid label on closed PR", async () => {
      let setLabels: any;
      let removeLabel: any;
      await runHacktoberfestClosedPR({
        // @ts-ignore
        log,
        name: "pull_request",
        payload: {
          // @ts-ignore
          pull_request: {
            labels: [{ name: "Hacktoberfest" }],
            merged: false,
          },
          // @ts-ignore
          sender: {
            login: "developer",
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
            // @ts-ignore
            async removeLabel(label) {
              removeLabel = label;
            },
          },
        },
      });
      assert.deepEqual(setLabels, {
        labels: ["invalid"],
      });
      assert(removeLabel, "Hacktoberfest");
    });
  });
});
