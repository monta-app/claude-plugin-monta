import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { bumpPlugin } from "./bump-plugin.mjs";

const pluginWith = (version, changelog) => {
  const pluginDir = mkdtempSync(join(tmpdir(), "bump-plugin-"));
  after(() => rmSync(pluginDir, { recursive: true }));
  mkdirSync(join(pluginDir, ".claude-plugin"));
  writeFileSync(join(pluginDir, ".claude-plugin", "plugin.json"), `${JSON.stringify({ name: "monta-public-api", version }, null, 2)}\n`);
  writeFileSync(join(pluginDir, "CHANGELOG.md"), changelog);
  return pluginDir;
};

const versionOf = (pluginDir) => JSON.parse(readFileSync(join(pluginDir, ".claude-plugin", "plugin.json"), "utf8")).version;

test("bumping a plugin raises its patch version and puts a changelog entry for the API on top", () => {
  const pluginDir = pluginWith("0.1.9", "# Changelog\n\n## 0.1.9\n\n- Earlier entry.\n");

  bumpPlugin(pluginDir, "Monta Public API");

  assert.equal(versionOf(pluginDir), "0.1.10");
  assert.equal(
    readFileSync(join(pluginDir, "CHANGELOG.md"), "utf8"),
    "# Changelog\n\n## 0.1.10\n\n- Regenerate the Monta Public API references from the latest OpenAPI spec.\n\n## 0.1.9\n\n- Earlier entry.\n",
  );
});

test("a changelog without the expected header fails the bump and leaves the version and changelog as they were", () => {
  const pluginDir = pluginWith("0.1.9", "# Changelog\r\n\r\n## 0.1.9\r\n");

  assert.throws(() => bumpPlugin(pluginDir, "Monta Public API"), /does not start with "# Changelog"/);

  assert.equal(versionOf(pluginDir), "0.1.9");
  assert.equal(readFileSync(join(pluginDir, "CHANGELOG.md"), "utf8"), "# Changelog\r\n\r\n## 0.1.9\r\n");
});
