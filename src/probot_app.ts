import { Application, Context } from "probot";
import { initLabelBotPlugin } from "./plugins/LabelBot/label_bot";
import { initCodeOwnersMention } from "./plugins/CodeOwnersMention/code_owners_mention";

export const probotApp = (app: Application) => {
  initLabelBotPlugin(app);
  initCodeOwnersMention(app);
};
