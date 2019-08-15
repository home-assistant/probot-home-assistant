import * as assert from "assert";
import {
  ParsedGitHubIssueOrPR,
  extractPullRequestURLLinks,
  extractIssuesOrPullRequestMarkdownLinks,
} from "../../src/util/text_parser";

describe("ParsedGitHubIssueOrPR", () => {
  it("parses pull request link", () => {
    const result = new ParsedGitHubIssueOrPR(
      "home-assistant",
      "home-assistant.io",
      10120
    );
    assert.equal(result.owner, "home-assistant");
    assert.equal(result.repo, "home-assistant.io");
    assert.equal(result.number, 10120);
  });
});

describe("extractPullRequestURLLinks", () => {
  it("finds pull request links", () => {
    const result = extractPullRequestURLLinks(
      `
Hello, this is a new PR to add X.

Docs PR: https://github.com/home-assistant/home-assistant.io/pull/10120

And frontend PR:
https://github.com/home-assistant/home-assistant-polymer/pull/512
    `
    );
    assert.equal(result.length, 2);

    const linkDocs = result[0];
    assert.equal(linkDocs.owner, "home-assistant");
    assert.equal(linkDocs.repo, "home-assistant.io");
    assert.equal(linkDocs.number, 10120);

    const linkPolymer = result[1];
    assert.equal(linkPolymer.owner, "home-assistant");
    assert.equal(linkPolymer.repo, "home-assistant-polymer");
    assert.equal(linkPolymer.number, 512);
  });
});

describe("extractIssuesOrPullRequestMarkdownLinks", () => {
  it("finds pull request links", () => {
    const result = extractIssuesOrPullRequestMarkdownLinks(
      `
      ## Description:
      This bumps the version of PyRMVtransport to v0.2.8 and adds a config flow for RMV transport. The sensors can now also be shown on the map.

      **Pull request with documentation for [home-assistant.io](https://github.com/home-assistant/home-assistant.io) (if applicable):** home-assistant/home-assistant.io#10052
          `
    );
    assert.equal(result.length, 1);

    const linkDocs = result[0];
    assert.equal(linkDocs.owner, "home-assistant");
    assert.equal(linkDocs.repo, "home-assistant.io");
    assert.equal(linkDocs.number, 10052);
  });
});
