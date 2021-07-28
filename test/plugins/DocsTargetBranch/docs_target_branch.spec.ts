import * as assert from "assert";
import { log } from "../../mock";
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
      log,
      name: "pull_request",
      payload: {
        pull_request: {
          // @ts-ignore
          base: {
            ref: "current",
          },
          labels: [],
          assignees: [],
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
      log,
      name: "pull_request",
      payload: {
        pull_request: {
          // @ts-ignore
          base: {
            ref: "next",
          },
          labels: [],
          assignees: [],
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
    let createComment: any;

    const context: Partial<PRContext> = {
      // @ts-ignore
      log,
      name: "pull_request",
      payload: {
        pull_request: {
          // @ts-ignore
          base: {
            ref: "next",
          },
          labels: [],
          assignees: [],
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
          async createComment(comment) {
            createComment = comment;
          }
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
    assert.ok(createComment.body.indexOf(bodyShouldTargetCurrent) !== -1);
  });
  it("Is current, should be next", async () => {
    let setLabels: any;
    let setAssignees: any;
    let createComment: any;

    const context: Partial<PRContext> = {
      // @ts-ignore
      log,
      name: "pull_request",
      payload: {
        pull_request: {
          // @ts-ignore
          base: {
            ref: "current",
          },
          labels: [],
          assignees: [],
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
            createComment = body;
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
    assert.ok(createComment.body.indexOf(bodyShouldTargetNext) !== -1);
  });
  it("Label 'needs-rebase' already exsist", async () => {
    await runDocsTargetBranch({
      // @ts-ignore
      log,
      name: "pull_request",
      payload: {
        pull_request: {
          // @ts-ignore
          base: {
            ref: "current",
          },
          labels: ["needs-rebase"],
          assignees: [],
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
