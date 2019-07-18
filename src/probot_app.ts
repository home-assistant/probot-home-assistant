import { Application, Context } from "probot";

export const probotApp = (app: Application) => {
  app.on("pull_request.opened", async (context: Context) => {
    console.log("Opened", context.event);
  });

  app.on("pull_request.edited", async (context: Context) => {
    console.log("Edited", context.event);
  });
};
