import * as assert from "assert";
import { ParsedPath } from "../../src/util/parse_path";

describe("parsePath", () => {
  it("detects core", () => {
    const result = new ParsedPath(
      // @ts-ignore
      { filename: "homeassistant/core.py" }
    );
    assert.equal(result.core, true);
    assert.equal(result.type, "core");
  });

  it("detects helpers", () => {
    const result = new ParsedPath(
      // @ts-ignore
      {
        filename: "homeassistant/helpers/entity.py",
      }
    );
    assert.equal(result.core, true);
    assert.equal(result.type, "helpers");
  });

  it("detects util", () => {
    const result = new ParsedPath(
      // @ts-ignore
      {
        filename: "homeassistant/util/__init__.py",
      }
    );
    assert.equal(result.core, true);
    assert.equal(result.component, null);
    assert.equal(result.platform, null);
    assert.equal(result.type, "util");
  });

  it("detects scripts", () => {
    const result = new ParsedPath(
      // @ts-ignore
      {
        filename: "homeassistant/scripts/benchmark.py",
      }
    );
    assert.equal(result.core, true);
    assert.equal(result.component, null);
    assert.equal(result.platform, null);
    assert.equal(result.type, "scripts");
  });

  it("detect component from component that is dir with init file", () => {
    const result = new ParsedPath(
      // @ts-ignore
      {
        filename: "homeassistant/components/group/__init__.py",
      }
    );
    assert.equal(result.core, true);
    assert.equal(result.component, "group");
    assert.equal(result.platform, null);
    assert.equal(result.type, "component");
  });

  it("detect component when not entity component", () => {
    const result = new ParsedPath(
      // @ts-ignore
      {
        filename: "homeassistant/components/mqtt/server.py",
      }
    );
    assert.equal(result.core, true);
    assert.equal(result.component, "mqtt");
    assert.equal(result.platform, null);
    assert.equal(result.type, "component");
  });

  it("detect core entity component", () => {
    const result = new ParsedPath(
      // @ts-ignore
      {
        filename: "homeassistant/components/light/__init__.py",
      }
    );
    assert.equal(result.core, true);
    assert.equal(result.component, "light");
    assert.equal(result.platform, null);
    assert.equal(result.type, "component");
  });

  it("detect core automation platform", () => {
    const result = new ParsedPath(
      // @ts-ignore
      {
        filename: "homeassistant/components/automation/state.py",
      }
    );
    assert.equal(result.core, true);
    assert.equal(result.component, "automation");
    assert.equal(result.platform, null);
    assert.equal(result.type, "component");
  });

  it("detect embedded platform", () => {
    const result = new ParsedPath(
      // @ts-ignore
      {
        filename: "homeassistant/components/hue/light.py",
      }
    );
    assert.equal(result.core, false);
    assert.equal(result.component, "hue");
    assert.equal(result.platform, "light");
    assert.equal(result.type, "platform");
  });

  it("mark component services", () => {
    const result = new ParsedPath(
      // @ts-ignore
      {
        filename: "homeassistant/components/light/services.yaml",
      }
    );
    assert.equal(result.core, true);
    assert.equal(result.component, "light");
    assert.equal(result.platform, null);
    assert.equal(result.type, "services");
  });

  it("detect new component structure", () => {
    const result = new ParsedPath(
      // @ts-ignore
      {
        filename: "homeassistant/components/hue/auth.py",
      }
    );
    assert.equal(result.core, false);
    assert.equal(result.component, "hue");
    assert.equal(result.platform, null);
    assert.equal(result.type, "component");
  });

  it("detect new component platform structure", () => {
    const result = new ParsedPath(
      // @ts-ignore
      {
        filename: "homeassistant/components/hue/light.py",
      }
    );
    assert.equal(result.core, false);
    assert.equal(result.component, "hue");
    assert.equal(result.platform, "light");
    assert.equal(result.type, "platform");
  });

  it("detects core tests", () => {
    const result = new ParsedPath(
      // @ts-ignore
      {
        filename: "tests/helpers/test_entity_component.py",
      }
    );
    assert.equal(result.core, true);
    assert.equal(result.component, null);
    assert.equal(result.platform, null);
    assert.equal(result.type, "helpers");
  });

  it("detects component tests", () => {
    const result = new ParsedPath(
      // @ts-ignore
      {
        filename: "tests/components/hue/test_light.py",
      }
    );
    assert.equal(result.core, false);
    assert.equal(result.component, "hue");
    assert.equal(result.platform, "light");
    assert.equal(result.type, "test");
  });

  it("detects requirements_all.txt", () => {
    const result = new ParsedPath(
      // @ts-ignore
      {
        filename: "requirements_all.txt",
      }
    );
    assert.equal(result.filename, "requirements_all.txt");
    assert.equal(result.core, false);
    assert.equal(result.component, null);
    assert.equal(result.platform, null);
    assert.equal(result.type, null);
  });
});
