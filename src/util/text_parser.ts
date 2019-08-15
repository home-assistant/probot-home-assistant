import { GitHubAPI } from "probot/lib/github";
import { fetchIssueWithCache } from "./issue";
import { fetchPRWithCache } from "./pull_request";

export class ParsedGitHubIssueOrPR {
  public owner: string;
  public repo: string;
  public number: number;

  constructor(owner: string, repo: string, number: number) {
    this.owner = owner;
    this.repo = repo;
    this.number = number;
  }

  issue() {
    return {
      owner: this.owner,
      repo: this.repo,
      issue_number: this.number,
    };
  }

  pull() {
    return {
      owner: this.owner,
      repo: this.repo,
      pull_number: this.number,
    };
  }

  async fetchIssue(github: GitHubAPI) {
    return await fetchIssueWithCache(
      github,
      this.owner,
      this.repo,
      this.number
    );
  }

  async fetchPR(github: GitHubAPI) {
    return await fetchPRWithCache(github, this.owner, this.repo, this.number);
  }
}

export const extractPullRequestURLLinks = (body: string) => {
  const re = /https:\/\/github.com\/([\w-\.]+)\/([\w-\.]+)\/pull\/(\d+)/g;
  let match;
  const results: ParsedGitHubIssueOrPR[] = [];

  do {
    match = re.exec(body);
    if (match) {
      results.push(
        new ParsedGitHubIssueOrPR(match[1], match[2], Number(match[3]))
      );
    }
  } while (match);

  return results;
};

export const extractIssuesOrPullRequestMarkdownLinks = (body: string) => {
  const re = /([\w-\.]+)\/([\w-\.]+)#(\d+)/g;
  let match;
  const results: ParsedGitHubIssueOrPR[] = [];

  do {
    match = re.exec(body);
    if (match) {
      results.push(
        new ParsedGitHubIssueOrPR(match[1], match[2], Number(match[3]))
      );
    }
  } while (match);

  return results;
};
