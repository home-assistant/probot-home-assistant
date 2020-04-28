/**
 * Helper to leave a comment on a PR.
 *
 * We debounce it so that we only leave 1 comment with all notices.
 */
import { debounce } from "debounce";
import { PRContext, IssueContext } from "../types";
import { scheduleChange } from "../changes";

type PatchedContext = (PRContext | IssueContext) & {
  _commentsToPost?: Array<{ handler: string; message: string }>;
};

let registered = false;

const postComment = async (context: PRContext | IssueContext) => {
  const patchedContext = context as PatchedContext;
  const comments = patchedContext._commentsToPost!;
  const toPost = comments.map(
    (comment) =>
      `${comment.message}\n<sub><sup>(message by ${comment.handler})</sup></sub>`
  );

  let commentBody = toPost.join("\n\n---\n\n");

  await context.github.issues.createComment(
    context.issue({ body: commentBody })
  );
};

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
  if (registered) {
    return;
  }
  registered = true;
  scheduleChange(() => postComment(context));
};
