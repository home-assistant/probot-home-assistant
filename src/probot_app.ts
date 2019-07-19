import { Application, Context } from "probot";
import { runLabelBotPlugin } from "./plugins/LabelBot/label_bot";

export const probotApp = (app: Application) => {
  app.on("pull_request.opened", async (context: Context) => {
    if (context.isBot) {
      context.log("Not dealing action for bot");
      return;
    }
    // context.log("Opened", context.event);
    await runLabelBotPlugin(context);
  });

  app.on("issues.edited", async (context: Context) => {
    // This is also for PRs
    // context.log("Edited", context.event);
  });
};
