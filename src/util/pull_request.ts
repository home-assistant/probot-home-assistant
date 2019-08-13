import {
  PullsListFilesResponseItem,
  PullsGetResponse,
  IssuesAddLabelsParams,
} from "@octokit/rest";
import { PRContext } from "../types";
import { GitHubAPI } from "probot/lib/github";

interface PRContextPatched extends PRContext {
  _prFiles?: Promise<PullsListFilesResponseItem[]>;
}

// Helper methods to get pull request info while caching on context.

export const fetchPullRequestFilesFromContext = (
  context: PRContext
): Promise<PullsListFilesResponseItem[]> => {
  const prContext = context as PRContextPatched;

  if (!prContext._prFiles) {
    prContext._prFiles = prContext.github.pulls
      .listFiles(prContext.issue())
      .then(({ data }) => data);
  }
  return prContext._prFiles;
};

export class ParsedGitHubIssueOrPR {
  public organization: string;
  public repository: string;
  public number: string;

  constructor(organization: string, repository: string, number: string) {
    this.organization = organization;
    this.repository = repository;
    this.number = number;
  }

  issue() {
    return {
      owner: this.organization,
      repo: this.repository,
      issue_number: Number(this.number),
    };
  }
}

export const extractIssuesOrPullRequestLinksFromHTML = (body: string) => {
  const re = /https:\/\/github.com\/([\w-\.]+)\/([\w-\.]+)\/pull\/(\d+)/g;
  let match;
  const results: ParsedGitHubIssueOrPR[] = [];

  do {
    match = re.exec(body);
    if (match) {
      results.push(new ParsedGitHubIssueOrPR(match[1], match[2], match[3]));
    }
  } while (match);

  return results;
};

export const extractIssuesOrPullRequestLinksFromMarkdown = (body: string) => {
  const re = /([\w-\.]+)\/([\w-\.]+)#(\d+)/g;
  let match;
  const results: ParsedGitHubIssueOrPR[] = [];

  do {
    match = re.exec(body);
    if (match) {
      results.push(new ParsedGitHubIssueOrPR(match[1], match[2], match[3]));
    }
  } while (match);

  return results;
};
