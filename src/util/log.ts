import { IssueContext, PRContext } from "../types";

export const formatContext = (context: PRContext | IssueContext): string => {
  if (context.name === "issues") {
    const payload = (context as IssueContext).payload;
    return `issue ${payload.repository.name}#${payload.issue.number}`;
  }
  if (context.name === "pull_request") {
    const payload = (context as PRContext).payload;
    return `PR ${payload.repository.name}#${payload.pull_request.number}`;
  }

  throw new Error(`logContext() called with invalid context.`);
};
