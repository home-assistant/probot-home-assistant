import { entityComponents, coreComponents } from "../const";
import { PullsListFilesResponseItem } from "@octokit/rest";
import { basename } from "path";

export class ParsedPath {
  public file: PullsListFilesResponseItem;
  public type:
    | null
    | "core"
    | "auth"
    | "auth_providers"
    | "generated"
    | "scripts"
    | "helpers"
    | "util"
    | "test"
    | "services"
    | "component"
    | "platform" = null;
  public component: null | string = null;
  public platform: null | string = null;
  public core = false;

  constructor(file: PullsListFilesResponseItem) {
    this.file = file;
    const parts = file.filename.split("/");
    const rootFolder = parts.length > 1 ? parts.shift() : undefined;

    if (!["tests", "homeassistant"].includes(rootFolder)) {
      return;
    }

    const subfolder = parts.shift();

    if (subfolder !== "components") {
      this.core = true;

      if (subfolder.endsWith(".py")) {
        this.type = "core";
      } else {
        this.type = subfolder as any;
      }
      return;
    }

    // This is not possible anymore after great migration
    if (parts.length < 2) {
      return;
    }

    this.component = parts.shift();
    let filename = parts[0].replace(".py", "");

    if (rootFolder === "tests") {
      this.type = "test";
      filename = filename.replace("test_", "");
      if (entityComponents.includes(filename)) {
        this.platform = filename;
      }
    } else if (filename === "services.yaml") {
      this.type = "services";
    } else if (entityComponents.includes(filename)) {
      this.type = "platform";
      this.platform = filename;
    } else {
      this.type = "component";
    }

    this.core = coreComponents.includes(this.component);
  }

  get additions() {
    return this.file.additions;
  }

  get status() {
    return this.file.status;
  }

  get path() {
    return this.file.filename;
  }

  get filename() {
    return basename(this.path);
  }
}
