import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { createRequire } from 'module';
import { homedir as getHomedir } from 'os';

const require = createRequire(import.meta.url);
const matter = require('gray-matter');

/**
 * Recursively find all SKILL.md files within dir, up to maxDepth levels deep.
 */
function findSkillFiles(dir, depth = 0) {
  if (depth > 2 || !existsSync(dir)) return [];
  const results = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isFile() && entry.name === 'SKILL.md') {
      results.push(fullPath);
    } else if (entry.isDirectory() && depth < 2) {
      results.push(...findSkillFiles(fullPath, depth + 1));
    }
  }
  return results;
}

function parseSkillFile(filePath, source) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const { data } = matter(content);
    if (data.name && data.description) {
      return { name: data.name, description: String(data.description), source, path: filePath };
    }
  } catch {
    // skip unparseable files
  }
  return null;
}

function scanUserSkills(claudeDir) {
  const skillsDir = join(claudeDir, 'skills');
  if (!existsSync(skillsDir)) return [];
  const results = [];
  let entries;
  try {
    entries = readdirSync(skillsDir, { withFileTypes: true });
  } catch {
    return [];
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillFile = join(skillsDir, entry.name, 'SKILL.md');
    if (!existsSync(skillFile)) continue;
    const skill = parseSkillFile(skillFile, 'user-skills');
    if (skill) results.push(skill);
  }
  return results;
}

function scanPluginSkills(claudeDir) {
  const manifestPath = join(claudeDir, 'plugins', 'installed_plugins.json');
  if (!existsSync(manifestPath)) return [];

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch {
    return [];
  }

  const results = [];
  const seen = new Set();

  for (const [pluginKey, installs] of Object.entries(manifest.plugins || {})) {
    for (const install of installs) {
      const skillFiles = findSkillFiles(install.installPath);
      for (const filePath of skillFiles) {
        const skill = parseSkillFile(filePath, pluginKey);
        if (skill && !seen.has(skill.name)) {
          seen.add(skill.name);
          results.push(skill);
        }
      }
    }
  }
  return results;
}

export function scan(claudeDir = join(getHomedir(), '.claude')) {
  if (!existsSync(claudeDir)) return [];
  const userSkills = scanUserSkills(claudeDir);
  const userNames = new Set(userSkills.map(s => s.name));
  const pluginSkills = scanPluginSkills(claudeDir).filter(s => !userNames.has(s.name));
  return [...userSkills, ...pluginSkills];
}
