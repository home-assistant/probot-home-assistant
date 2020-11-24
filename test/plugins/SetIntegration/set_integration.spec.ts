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
          return {
            data: [
              { name: "integration: awesome" },
              { name: "integration: awesome_integration" },
            ],
          };
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

  it("Integration label does exsist", async () => {
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

  it("Integration label does not exsist", async () => {
    await runSetIntegration({
      ...mockContext,
      payload: {
        issue: {
          body:
            "Link to integration documentation on our website: https://www.home-assistant.io/integrations/not_valid",
        },
      },
    });
    assert.deepStrictEqual(setLabels, []);
  });

  it("Integration with underscore", async () => {
    await runSetIntegration({
      ...mockContext,
      payload: {
        issue: {
          body:
            "Link to integration documentation on our website: https://www.home-assistant.io/integrations/awesome_integration",
        },
      },
    });

    assert.deepStrictEqual(setLabels, {
      labels: ["integration: awesome_integration"],
    });
  });
});
