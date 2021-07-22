import * as assert from "assert";
import { runIssueLinks } from "../../../src/plugins/IssueLinks/issue_links";

describe("IssueLinks", () => {
  it("Add comment", async () => {
    await runIssueLinks({
      // @ts-ignore
      log: () => undefined,
      name: "issues",
      payload: {
        // @ts-ignore
        label: { name: "integration: awesome" },
        // @ts-ignore
        issue: { url: "https://api.github.com/repos/home-assistant/core/issues/1234" }
      },
      // @ts-ignore
      issue: (val) => val,
      github: {
        // @ts-ignore
        issues: {},
      },
      _prFiles: [],
    });
  });
});
