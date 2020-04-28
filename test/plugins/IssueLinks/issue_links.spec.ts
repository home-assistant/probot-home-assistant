import * as assert from "assert";
import { runIssueLinks } from "../../../src/plugins/IssueLinks/issue_links";

describe("IssueLinks", () => {
  it("Add comment", async () => {
    await runIssueLinks({
      // @ts-ignore
      log: () => undefined,
      payload: {
        // @ts-ignore
        label: { name: "integration: awesome" },
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
