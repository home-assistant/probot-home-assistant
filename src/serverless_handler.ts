import { serverless } from "@probot/serverless-lambda";
import { probotApp } from "./probot_app";
import { applyChanges } from "./changes";

export const probot = async (event, context) => {
  const origDone = context.done;
  let doneArgs: unknown[] | undefined;
  context.done = (...args) => {
    doneArgs = args;
  };
  const result = await serverless(probotApp)(event, context);
  await applyChanges();
  context.done = origDone;
  context.done(...doneArgs);
  return result;
};
