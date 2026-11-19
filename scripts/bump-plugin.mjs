import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const CHANGELOG_HEADER = "# Changelog\n\n";

export const bumpPlugin = (pluginDir, apiName) => {
  const manifestFile = join(pluginDir, ".claude-plugin", "plugin.json");
  const changelogFile = join(pluginDir, "CHANGELOG.md");
  const manifest = JSON.parse(readFileSync(manifestFile, "utf8"));
  const changelog = readFileSync(changelogFile, "utf8");
  if (!changelog.startsWith(CHANGELOG_HEADER)) {
    throw new Error(`${changelogFile} does not start with "# Changelog" followed by a blank line`);
  }

  const [major, minor, patch] = manifest.version.split(".").map(Number);
  manifest.version = `${major}.${minor}.${patch + 1}`;
  const entry = `## ${manifest.version}\n\n- Regenerate the ${apiName} references from the latest OpenAPI spec.\n\n`;
  writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
  writeFileSync(changelogFile, `${CHANGELOG_HEADER}${entry}${changelog.slice(CHANGELOG_HEADER.length)}`);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [pluginDir, apiName] = process.argv.slice(2);
  if (pluginDir === undefined || apiName === undefined) {
    throw new Error("Usage: node scripts/bump-plugin.mjs <plugin dir> <API name>");
  }
  bumpPlugin(pluginDir, apiName);
}
