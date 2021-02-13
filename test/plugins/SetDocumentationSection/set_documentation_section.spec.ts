// @ts-nocheck
import * as assert from "assert";
import {
  NAME,
  runSetDocumentationSection,
} from "../../../src/plugins/SetDocumentationSection/set_documentation_section";

describe(NAME, () => {
  let setLabels: string[];
  let getLabelResponse: any;
  let issueBody: string;
  const mockContext = {
    log: () => undefined,
    payload: {
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

  it("Section label does exsist", async () => {
    mockContext.payload.issue.body =
      "Link: https://www.home-assistant.io/getting-started/configuration/";
    getLabelResponse = { status: 200, data: { name: "configuration" } };
    await runSetDocumentationSection(mockContext);
    assert.deepStrictEqual(setLabels, { labels: ["configuration"] });
  });

  it("Section label does exsist only once", async () => {
    mockContext.payload.issue.body = `
    Link: https://www.home-assistant.io/getting-started/configuration/
    Link: https://www.home-assistant.io/getting-started/configuration/
    `;
    getLabelResponse = { status: 200, data: { name: "configuration" } };
    await runSetDocumentationSection(mockContext);
    assert.deepStrictEqual(setLabels, { labels: ["configuration"] });
  });

  it("Section label does not exsist", async () => {
    mockContext.payload.issue.body =
      "Link: https://www.home-assistant.io/getting-started/configuration/";
    getLabelResponse = { status: 404 };
    await runSetDocumentationSection(mockContext);
    assert.deepStrictEqual(setLabels, []);
  });

  it("First section label does not exsist", async () => {
    mockContext.payload.issue.body =
      "Link: https://www.home-assistant.io/getting-started/configuration/";
    getLabelResponse = { status: 404 };
    await runSetDocumentationSection(mockContext);
    assert.deepStrictEqual(setLabels, []);
    getLabelResponse = { status: 200, data: { name: "getting-started" } };
    await runSetDocumentationSection(mockContext);
    assert.deepStrictEqual(setLabels, { labels: ["getting-started"] });
  });

  it("Don't set section label for integration link", async () => {
    mockContext.payload.issue.body =
      "Link: https://www.home-assistant.io/integrations/awesome/";
    await runSetDocumentationSection(mockContext);
    assert.deepStrictEqual(setLabels, []);
  });
});
