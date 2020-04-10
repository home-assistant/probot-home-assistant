import * as assert from "assert";
import {
  runDocsTargetBranch,
  bodyShouldTargetCurrent,
  bodyShouldTargetNext,
} from "../../../src/plugins/DocsTargetBranch/docs_target_branch";

describe("DocsTargetBranch", () => {
  it("The branch is correct (current)", async () => {
    let setLabels: any;
    let setAssignees: any;
    let creteMessageBody: any;

    await runDocsTargetBranch({
      // @ts-ignore
      log: () => undefined,
      payload: {
        pull_request: {
          // @ts-ignore
          base: {
            ref: "current",
          },
          body: "",
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
          async addAssignees(assignees) {
            setAssignees = assignees;
          },
        },
      },
      _prFiles: [],
    });
    assert.notDeepEqual(setLabels, {
      labels: ["needs-rebase", "in-progress"],
    });
    assert.notDeepEqual(setAssignees, {
      assignees: ["developer"],
    });
  });
  it("The branch is correct (next)", async () => {
    let setLabels: any;
    let setAssignees: any;
    let creteMessageBody: any;

    await runDocsTargetBranch({
      // @ts-ignore
      log: () => undefined,
      payload: {
        pull_request: {
          // @ts-ignore
          base: {
            ref: "next",
          },
          body:
            "Link to parent pull request in the codebase: [1337](https://github.com/home-assistant/core/pull/1337)",
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
          async addAssignees(assignees) {
            setAssignees = assignees;
          },
        },
      },
      _prFiles: [],
    });
    assert.notDeepEqual(setLabels, {
      labels: ["needs-rebase", "in-progress"],
    });
    assert.notDeepEqual(setAssignees, {
      assignees: ["developer"],
    });
  });
  it("Is next, should be current", async () => {
    let setLabels: any;
    let setAssignees: any;
    let creteMessageBody: any;

    await runDocsTargetBranch({
      // @ts-ignore
      log: () => undefined,
      payload: {
        pull_request: {
          // @ts-ignore
          base: {
            ref: "next",
          },
          body: "",
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
          async addAssignees(assignees) {
            setAssignees = assignees;
          },
          // @ts-ignore
          async createComment(body) {
            creteMessageBody = body;
          },
        },
      },
      _prFiles: [],
    });
    assert.deepEqual(setLabels, {
      labels: ["needs-rebase", "in-progress"],
    });
    assert.deepEqual(setAssignees, {
      assignees: ["developer"],
    });
    assert.deepEqual(creteMessageBody, {
      body: bodyShouldTargetCurrent,
    });
  });
  it("Is current, should be next", async () => {
    let setLabels: any;
    let setAssignees: any;
    let creteMessageBody: any;

    await runDocsTargetBranch({
      // @ts-ignore
      log: () => undefined,
      payload: {
        pull_request: {
          // @ts-ignore
          base: {
            ref: "current",
          },
          body:
            "Link to parent pull request in the codebase: [1337](https://github.com/home-assistant/core/pull/1337)",
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
          async addAssignees(assignees) {
            setAssignees = assignees;
          },
          // @ts-ignore
          async createComment(body) {
            creteMessageBody = body;
          },
        },
      },
      _prFiles: [],
    });
    assert.deepEqual(setLabels, {
      labels: ["needs-rebase", "in-progress"],
    });
    assert.deepEqual(setAssignees, {
      assignees: ["developer"],
    });
    assert.deepEqual(creteMessageBody, {
      body: bodyShouldTargetNext,
    });
  });
});
