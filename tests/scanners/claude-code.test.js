import { describe, it, expect, beforeAll } from 'vitest';
import { writeFileSync, mkdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { scan } from '../../src/scanners/claude-code.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtureDir = resolve(__dirname, '../fixtures/claude-home');
const pluginCacheDir = resolve(fixtureDir, 'plugins/cache/my-plugin/1.0');

// Patch installed_plugins.json to use the real fixture path
beforeAll(() => {
  const manifest = {
    version: 2,
    plugins: {
      'my-plugin@org': [{ scope: 'user', installPath: pluginCacheDir }],
    },
  };
  writeFileSync(
    join(fixtureDir, 'plugins/installed_plugins.json'),
    JSON.stringify(manifest),
    'utf8'
  );
});

describe('scan', () => {
  it('returns skills from ~/.claude/skills/', () => {
    const skills = scan(fixtureDir);
    const names = skills.map(s => s.name);
    expect(names).toContain('skill-a');
    expect(names).toContain('skill-b');
  });

  it('returns skills from installed plugins', () => {
    const skills = scan(fixtureDir);
    const names = skills.map(s => s.name);
    expect(names).toContain('skill-c');
  });

  it('each skill has name, description, source, path', () => {
    const skills = scan(fixtureDir);
    const skillA = skills.find(s => s.name === 'skill-a');
    expect(skillA).toMatchObject({
      name: 'skill-a',
      description: 'Does thing A with documents',
      source: expect.any(String),
      path: expect.stringContaining('SKILL.md'),
    });
  });

  it('deduplicates skills with the same name, user skills take precedence', () => {
    const skills = scan(fixtureDir);
    const names = skills.map(s => s.name);
    const unique = new Set(names);
    expect(names.length).toBe(unique.size);

    // user-skills version of skill-a should win over plugin version
    const skillA = skills.find(s => s.name === 'skill-a');
    expect(skillA.source).toBe('user-skills');
  });

  it('returns empty array if claudeDir does not exist', () => {
    const skills = scan('/nonexistent/path');
    expect(skills).toEqual([]);
  });
});
