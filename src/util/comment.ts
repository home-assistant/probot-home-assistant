/**
 * Helper to leave a comment on a PR.
 *
 * We debounce it so that we only leave 1 comment with all notices.
 */
import { debounce } from "debounce";
import { PRContext, IssueContext } from "../types";

type PatchedContext = (PRContext | IssueContext) & {
  _commentsToPost?: Array<{ handler: string; message: string }>;
};

const WAIT_COMMENTS = 200; // ms

const postComment = (context: PRContext | IssueContext) => {
  const patchedContext = context as PatchedContext;
  const comments = patchedContext._commentsToPost!;

  // Can happen if race condition etc.
  if (comments.length === 0) {
    return;
  }

  // Empty it, in case probot takes longer than 300ms and this runs again.
  patchedContext._commentsToPost = [];

  const toPost = comments.map(
    (comment) =>
      `${comment.message} <sub><sup>(message by ${comment.handler})</sup></sub>`
  );

  let commentBody = toPost.join("\n\n---\n\n");

  context.github.issues.createComment(context.issue({ body: commentBody }));
};

const debouncedPostComment = debounce(postComment, WAIT_COMMENTS);

export const scheduleComment = (
  context: PRContext | IssueContext,
  handler: string,
  message: string
) => {
  const patchedContext = context as PatchedContext;
  if (!("_commentsToPost" in patchedContext)) {
    patchedContext._commentsToPost = [];
  }
  patchedContext._commentsToPost.push({ handler, message });
  debouncedPostComment(context);
};
