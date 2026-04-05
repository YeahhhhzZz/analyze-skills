#!/usr/bin/env node
/**
 * Release script — syncs version across package.json, plugin.json, marketplace.json
 * Usage: npm run release <version>  e.g. npm run release 0.2.0
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const version = process.argv[2];
if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
  console.error('Usage: npm run release <version>  (e.g. npm run release 0.2.0)');
  process.exit(1);
}

const files = [
  { path: 'package.json', update: (json) => { json.version = version; } },
  { path: '.claude-plugin/plugin.json', update: (json) => { json.version = version; } },
  { path: '.claude-plugin/marketplace.json', update: (json) => { json.metadata.version = version; } },
];

for (const { path, update } of files) {
  const fullPath = resolve(root, path);
  const json = JSON.parse(readFileSync(fullPath, 'utf8'));
  update(json);
  writeFileSync(fullPath, JSON.stringify(json, null, 2) + '\n', 'utf8');
  console.log(`✓ ${path} → ${version}`);
}

console.log(`\nNext steps:
  1. Update CHANGELOG.md
  2. git add . && git commit -m "chore: release v${version}"
  3. git tag v${version}
  4. git push && git push --tags`);
