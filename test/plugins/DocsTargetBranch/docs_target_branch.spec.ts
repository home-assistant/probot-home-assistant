import * as assert from "assert";
import {
  runDocsTargetBranch,
  bodyShouldTargetCurrent,
  bodyShouldTargetNext,
} from "../../../src/plugins/DocsTargetBranch/docs_target_branch";
import { PRContext } from "../../../src/types";

describe("DocsTargetBranch", () => {
  it("The branch is correct (current)", async () => {
    let setLabels: any;
    let setAssignees: any;

    await runDocsTargetBranch({
      // @ts-ignore
      log: () => undefined,
      name: "pull_request",
      payload: {
        pull_request: {
          // @ts-ignore
          base: {
            ref: "current",
          },
          labels: [],
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

    await runDocsTargetBranch({
      // @ts-ignore
      log: () => undefined,
      name: "pull_request",
      payload: {
        pull_request: {
          // @ts-ignore
          base: {
            ref: "next",
          },
          labels: [],
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

    const context: Partial<PRContext> = {
      // @ts-ignore
      log: () => undefined,
      name: "pull_request",
      payload: {
        pull_request: {
          // @ts-ignore
          base: {
            ref: "next",
          },
          labels: [],
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
    };
    await runDocsTargetBranch(context as any);
    assert.deepEqual(setLabels, {
      labels: ["needs-rebase", "in-progress"],
    });
    assert.deepEqual(setAssignees, {
      assignees: ["developer"],
    });
    assert.deepEqual(
      (context as any)._commentsToPost[0].message,
      bodyShouldTargetCurrent
    );
  });
  it("Is current, should be next", async () => {
    let setLabels: any;
    let setAssignees: any;
    let createMessageBody: any;

    const context: Partial<PRContext> = {
      // @ts-ignore
      log: () => undefined,
      name: "pull_request",
      payload: {
        pull_request: {
          // @ts-ignore
          base: {
            ref: "current",
          },
          labels: [],
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
            createMessageBody = body;
          },
        },
      },
      _prFiles: [],
    };
    await runDocsTargetBranch(context as any);
    assert.deepEqual(setLabels, {
      labels: ["needs-rebase", "in-progress"],
    });
    assert.deepEqual(setAssignees, {
      assignees: ["developer"],
    });
    assert.deepEqual(
      (context as any)._commentsToPost[0].message,
      bodyShouldTargetNext
    );
  });
  it("Label 'needs-rebase' already exsist", async () => {
    await runDocsTargetBranch({
      // @ts-ignore
      log: () => undefined,
      name: "pull_request",
      payload: {
        pull_request: {
          // @ts-ignore
          base: {
            ref: "current",
          },
          labels: ["needs-rebase"],
        },
        // @ts-ignore
        sender: {
          login: "developer",
        },
      },
      // @ts-ignore
      issue: (val) => val,
      _prFiles: [],
    });
  });
});
