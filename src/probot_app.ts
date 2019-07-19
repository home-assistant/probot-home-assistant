import { Application, Context } from "probot";
import { LabelBotPlugin } from "./plugins/LabelBot/label_bot";

export const probotApp = (app: Application) => {
  app.on("pull_request.opened", async (context: Context) => {
    if (context.isBot) {
      console.log("Not dealing action for bot");
      return;
    }
    console.log("Opened", context.event);
    LabelBotPlugin(context);
  });

  app.on("issues.edited", async (context: Context) => {
    // This is also for PRs
    console.log("Edited", context.event);
  });
};
