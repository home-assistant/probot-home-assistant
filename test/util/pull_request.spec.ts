import * as assert from "assert";
import {
  ParsedGitHubIssueOrPR,
  extractIssuesOrPullRequestLinksFromHTML,
  extractIssuesOrPullRequestLinksFromMarkdown,
} from "../../src/util/pull_request";
import { GitHubAPI } from "probot/lib/github";

describe("ParsedGitHubIssueOrPR", () => {
  it("parses pull request link", () => {
    const result = new ParsedGitHubIssueOrPR(
      "home-assistant",
      "home-assistant.io",
      "10120"
    );
    assert.equal(result.organization, "home-assistant");
    assert.equal(result.repository, "home-assistant.io");
    assert.equal(result.number, "10120");
  });
});

describe("extractPullRequestLinks", () => {
  it("finds pull request links", () => {
    const result = extractIssuesOrPullRequestLinksFromHTML(
      `
Hello, this is a new PR to add X.

Docs PR: https://github.com/home-assistant/home-assistant.io/pull/10120

And frontend PR:
https://github.com/home-assistant/home-assistant-polymer/pull/512
    `
    );
    assert.equal(result.length, 2);

    const linkDocs = result[0];
    assert.equal(linkDocs.organization, "home-assistant");
    assert.equal(linkDocs.repository, "home-assistant.io");
    assert.equal(linkDocs.number, "10120");

    const linkPolymer = result[1];
    assert.equal(linkPolymer.organization, "home-assistant");
    assert.equal(linkPolymer.repository, "home-assistant-polymer");
    assert.equal(linkPolymer.number, "512");
  });
});

describe("extractPullRequestLinks", () => {
  it("finds pull request links", () => {
    const result = extractIssuesOrPullRequestLinksFromMarkdown(
      `
      ## Description:
      This bumps the version of PyRMVtransport to v0.2.8 and adds a config flow for RMV transport. The sensors can now also be shown on the map.

      **Pull request with documentation for [home-assistant.io](https://github.com/home-assistant/home-assistant.io) (if applicable):** home-assistant/home-assistant.io#10052
          `
    );
    assert.equal(result.length, 1);

    const linkDocs = result[0];
    assert.equal(linkDocs.organization, "home-assistant");
    assert.equal(linkDocs.repository, "home-assistant.io");
    assert.equal(linkDocs.number, "10052");
  });
});
