// @ts-nocheck
import * as assert from "assert";
import {
  NAME,
  runSetIntegration,
} from "../../../src/plugins/SetIntegration/set_integration";

describe(NAME, () => {
  let setLabels: string[];
  const mockContext = {
    log: () => undefined,
    payload: {
      issue: {},
    },
    issue: (val) => val,
    github: {
      issues: {
        async listLabelsForRepo() {
          return { data: [{ name: "integration: awesome" }] };
        },
        async addLabels(labels) {
          setLabels = labels;
        },
      },
    },
  };

  beforeEach(function() {
    setLabels = [];
  });

  it("Valid integration docLink", async () => {
    await runSetIntegration({
      ...mockContext,
      payload: {
        issue: {
          body:
            "Link to integration documentation on our website: https://www.home-assistant.io/integrations/awesome",
        },
      },
    });

    assert.deepStrictEqual(setLabels, { labels: ["integration: awesome"] });
  });
  it("Not valid integration docLink", async () => {
    await runSetIntegration({
      ...mockContext,
      payload: {
        issue: {
          body: "https://www.home-assistant.io/integrations/not_valid",
        },
      },
    });
    assert.deepStrictEqual(setLabels, []);
  });
});
