// @ts-nocheck
import * as assert from "assert";

import integrationFromDocLink from "../../../../src/plugins/LabelBot/strategies/integrationFromDocLink";

describe("integrationFromDocLink", () => {
  it("Valid integration docLink", async () => {
    const integrations = await integrationFromDocLink({
      log: () => undefined,
      payload: {
        issue: {
          body:
            "Link to integration documentation on our website: https://www.home-assistant.io/integrations/test",
        },
      },
      issue: (val) => val,
      github: {
        issues: {
          async listLabelsForRepo() {
            return { data: [{ name: "integration: test" }] };
          },
        },
      },
    });
    assert.deepStrictEqual(integrations, ["integration: test"]);
  });

  it("Not valid integration docLink", async () => {
    const integrations = await integrationFromDocLink({
      log: () => undefined,
      payload: {
        issue: {
          body: "https://www.home-assistant.io/integrations/not_valid",
        },
      },
      issue: (val) => val,
      github: {
        issues: {
          async listLabelsForRepo() {
            return { data: [{ name: "integration: test" }] };
          },
        },
      },
    });
    assert.deepStrictEqual(integrations, []);
  });
});
