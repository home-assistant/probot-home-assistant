// @ts-nocheck
import * as assert from "assert";
import { log } from "../../mock";
import {
  NAME,
  runSetIntegration,
} from "../../../src/plugins/SetIntegration/set_integration";

describe(NAME, () => {
  let setLabels: string[];
  let getLabelResponse: any;
  let issueBody: string;
  const mockContext = {
    log,
    payload: {
      repository: { name: "core" },
      issue: {
        body: issueBody,
      },
    },
    issue: (val) => val,
    github: {
      issues: {
        async addLabels(labels) {
          setLabels = labels;
        },
        async getLabel() {
          return getLabelResponse;
        },
      },
    },
  };

  beforeEach(function() {
    setLabels = [];
    getLabelResponse = {};
    mockContext.payload.issue.body = "";
  });

  it("Integration label does exsist", async () => {
    mockContext.payload.issue.body =
      "Link: https://www.home-assistant.io/integrations/awesome";
    getLabelResponse = { status: 200, data: { name: "integration: awesome" } };
    await runSetIntegration(mockContext);

    assert.deepStrictEqual(setLabels, { labels: ["integration: awesome"] });
  });

  it("Integration label does not exsist", async () => {
    mockContext.payload.issue.body =
      "Link: https://www.home-assistant.io/integrations/not_valid";
    getLabelResponse = { status: 404 };
    await runSetIntegration(mockContext);
    assert.deepStrictEqual(setLabels, []);
  });

  it("Integration with underscore", async () => {
    mockContext.payload.issue.body =
      "Link: https://www.home-assistant.io/integrations/awesome_integration";
    getLabelResponse = {
      status: 200,
      data: { name: "integration: awesome_integration" },
    };
    await runSetIntegration(mockContext);

    assert.deepStrictEqual(setLabels, {
      labels: ["integration: awesome_integration"],
    });
  });

  it("Integration with platform", async () => {
    mockContext.payload.issue.body =
      "Link: https://www.home-assistant.io/integrations/platform.awesome";
    getLabelResponse = {
      status: 200,
      data: { name: "integration: awesome" },
    };
    await runSetIntegration(mockContext);

    assert.deepStrictEqual(setLabels, {
      labels: ["integration: awesome"],
    });
  });
});
