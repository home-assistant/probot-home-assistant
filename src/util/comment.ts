/**
 * Helper to leave a comment on a PR.
 *
 * We debounce it so that we only leave 1 comment with all notices.
 */
import { debounce } from "debounce";
import { COMMENT_DEBOUNCE_TIME } from "../const";
import { PRContext, IssueContext } from "../types";
import { getIssueFromPayload } from "./issue";

type PendingComment = {
  debouncedPost: Function,
  context: PRContext | IssueContext,
  comments: Array<{ handler: string, message: string }>;
}

const pendingComments = new Map<string, PendingComment>();

const postComment = (key: string) => {
  const pendingComment = pendingComments.get(key);
  pendingComments.delete(key);

  const context = pendingComment.context;

  const toPost = pendingComment.comments.map(
    (comment) =>
      `${comment.message}\n<sub><sup>(message by ${comment.handler})</sup></sub>`
  );

  let commentBody = toPost.join("\n\n---\n\n");

  context.github.issues.createComment(context.issue({ body: commentBody }));
};

export const scheduleComment = (
  context: PRContext | IssueContext,
  handler: string,
  message: string
) => {
  const key = getIssueFromPayload(context).url;
  if (!pendingComments.has(key)) {
    pendingComments.set(key, {
      debouncedPost: debounce(() => postComment(key), COMMENT_DEBOUNCE_TIME),
      context,
      comments: []
    });
  }

  const pendingComment = pendingComments.get(key);
  pendingComment.comments.push({ handler, message });
  pendingComment.debouncedPost();
};
