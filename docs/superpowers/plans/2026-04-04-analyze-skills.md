# analyze-skills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Node.js CLI + Claude Code skill that scans installed skills, identifies semantic overlaps via Claude API, and presents them for human review.

**Architecture:** CLI-first. `ClaudeCodeScanner` reads `~/.claude/skills/` and `installed_plugins.json`, normalizes skills into `{ name, description, source, path }`. `analyzer.js` calls Claude Haiku to cluster overlaps. `reporter.js` prints colored terminal output and optionally writes Markdown. The Claude Code skill is a thin wrapper that invokes the CLI, with an LLM-based fallback when CLI is absent.

**Tech Stack:** Node.js (ESM), `@anthropic-ai/sdk`, `chalk@5`, `gray-matter`, `commander`, `vitest`

---

## File Map

| File | Responsibility |
|------|---------------|
| `package.json` | Project config, deps, bin entry |
| `bin/analyze-skills.js` | CLI entry: arg parsing, env check, wires pipeline |
| `src/scanners/claude-code.js` | Scans `~/.claude/skills/` and plugin cache |
| `src/analyzer.js` | Calls Claude Haiku API, returns overlap groups |
| `src/reporter.js` | Colored terminal output + Markdown file generation |
| `src/index.js` | Orchestrates scanner → analyzer → reporter |
| `skills/analyze-skills/SKILL.md` | Claude Code skill (thin wrapper) |
| `tests/scanners/claude-code.test.js` | Scanner unit tests |
| `tests/analyzer.test.js` | Analyzer unit tests (mocked API) |
| `tests/reporter.test.js` | Reporter unit tests |

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `bin/analyze-skills.js` (stub)
- Create: `src/scanners/claude-code.js` (stub)
- Create: `src/analyzer.js` (stub)
- Create: `src/reporter.js` (stub)
- Create: `src/index.js` (stub)

- [ ] **Step 1: Create package.json**

```json
{
  "name": "analyze-skills",
  "version": "0.1.0",
  "description": "Analyze installed Claude Code skills for overlaps",
  "type": "module",
  "bin": {
    "analyze-skills": "./bin/analyze-skills.js"
  },
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.27.0",
    "chalk": "^5.3.0",
    "commander": "^12.0.0",
    "gray-matter": "^4.0.3"
  },
  "devDependencies": {
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `cd /Users/dp/workspace/github/analyze-skills && npm install`
Expected: `node_modules/` created, no errors

- [ ] **Step 3: Create stub files**

`bin/analyze-skills.js`:
```javascript
#!/usr/bin/env node
// stub
```

`src/scanners/claude-code.js`:
```javascript
// stub
export function scan(claudeDir) { return []; }
```

`src/analyzer.js`:
```javascript
// stub
export async function analyze(skills, client = null) { return []; }
```

`src/reporter.js`:
```javascript
// stub
export function report(groups, skills, outputPath = null) {}
export function toMarkdown(groups, skills) { return ''; }
```

`src/index.js`:
```javascript
// stub
export async function run(options = {}) {}
```

- [ ] **Step 4: Verify Node.js can load entry point**

Run: `node bin/analyze-skills.js`
Expected: No output, no error (stub runs and exits)

- [ ] **Step 5: Commit**

```bash
cd /Users/dp/workspace/github/analyze-skills
git add package.json package-lock.json bin/ src/
git commit -m "chore: scaffold project structure with stubs"
```

---

## Task 2: ClaudeCodeScanner

**Files:**
- Modify: `src/scanners/claude-code.js`
- Create: `tests/scanners/claude-code.test.js`
- Create: `tests/fixtures/claude-home/skills/skill-a/SKILL.md`
- Create: `tests/fixtures/claude-home/skills/skill-b/SKILL.md`
- Create: `tests/fixtures/claude-home/plugins/installed_plugins.json`
- Create: `tests/fixtures/claude-home/plugins/cache/my-plugin/1.0/skills/skill-c/SKILL.md`

- [ ] **Step 1: Write the failing tests**

Create `tests/fixtures/claude-home/skills/skill-a/SKILL.md`:
```markdown
---
name: skill-a
description: Does thing A with documents
---
# Skill A
```

Create `tests/fixtures/claude-home/skills/skill-b/SKILL.md`:
```markdown
---
name: skill-b
description: Also does thing A, similar to skill-a
---
# Skill B
```

Create `tests/fixtures/claude-home/plugins/cache/my-plugin/1.0/skills/skill-c/SKILL.md`:
```markdown
---
name: skill-c
description: Handles meeting notes and summaries
---
# Skill C
```

Create `tests/fixtures/claude-home/plugins/installed_plugins.json`:
```json
{
  "version": 2,
  "plugins": {
    "my-plugin@org": [
      {
        "scope": "user",
        "installPath": "PLACEHOLDER"
      }
    ]
  }
}
```

Create `tests/scanners/claude-code.test.js`:
```javascript
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

  it('deduplicates skills with the same name', () => {
    const skills = scan(fixtureDir);
    const names = skills.map(s => s.name);
    const unique = new Set(names);
    expect(names.length).toBe(unique.size);
  });

  it('returns empty array if claudeDir does not exist', () => {
    const skills = scan('/nonexistent/path');
    expect(skills).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/dp/workspace/github/analyze-skills && npm test`
Expected: FAIL — `scan` returns `[]` (stub), tests expecting `skill-a` etc. fail

- [ ] **Step 3: Implement ClaudeCodeScanner**

Write `src/scanners/claude-code.js`:
```javascript
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
  const userSkills = scanUserSkills(claudeDir);
  const userNames = new Set(userSkills.map(s => s.name));
  const pluginSkills = scanPluginSkills(claudeDir).filter(s => !userNames.has(s.name));
  return [...userSkills, ...pluginSkills];
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: All 5 scanner tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/scanners/claude-code.js tests/scanners/ tests/fixtures/
git commit -m "feat: implement ClaudeCodeScanner with user and plugin skill discovery"
```

---

## Task 3: Analyzer

**Files:**
- Modify: `src/analyzer.js`
- Create: `tests/analyzer.test.js`

- [ ] **Step 1: Write the failing test**

Create `tests/analyzer.test.js`:
```javascript
import { describe, it, expect, vi } from 'vitest';
import { analyze } from '../src/analyzer.js';

const mockSkills = [
  { name: 'lark-vc', description: '飞书视频会议：查询会议记录、获取会议纪要' },
  { name: 'lark-minutes', description: '飞书妙记：获取妙记基础信息和相关 AI 产物（总结、待办）' },
  { name: 'lark-doc', description: '飞书云文档：创建和编辑飞书文档' },
  { name: 'lark-wiki', description: '飞书知识库：管理知识空间和文档节点' },
];

const mockResponse = [
  {
    group: 'Meeting Notes',
    skills: ['lark-vc', 'lark-minutes'],
    reason: 'Both handle meeting recordings and AI-generated summaries.',
  },
  {
    group: 'Document Creation',
    skills: ['lark-doc', 'lark-wiki'],
    reason: 'Both create and manage Feishu document content.',
  },
];

describe('analyze', () => {
  it('returns overlap groups from Claude API response', async () => {
    const fakeClient = {
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{ text: JSON.stringify(mockResponse) }],
        }),
      },
    };

    const groups = await analyze(mockSkills, fakeClient);
    expect(groups).toHaveLength(2);
    expect(groups[0]).toMatchObject({
      group: expect.any(String),
      skills: expect.arrayContaining(['lark-vc', 'lark-minutes']),
      reason: expect.any(String),
    });
  });

  it('extracts JSON even when wrapped in markdown code block', async () => {
    const fakeClient = {
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{ text: '```json\n' + JSON.stringify(mockResponse) + '\n```' }],
        }),
      },
    };
    const groups = await analyze(mockSkills, fakeClient);
    expect(groups).toHaveLength(2);
  });

  it('returns empty array when API returns empty array', async () => {
    const fakeClient = {
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{ text: '[]' }],
        }),
      },
    };
    const groups = await analyze(mockSkills, fakeClient);
    expect(groups).toEqual([]);
  });

  it('calls API with correct model', async () => {
    const fakeClient = {
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{ text: '[]' }],
        }),
      },
    };
    await analyze(mockSkills, fakeClient);
    const call = fakeClient.messages.create.mock.calls[0][0];
    expect(call.model).toBe('claude-haiku-4-5-20251001');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `analyze` returns `[]` (stub), tests expecting groups fail

- [ ] **Step 3: Implement analyzer**

Write `src/analyzer.js`:
```javascript
import Anthropic from '@anthropic-ai/sdk';

const PROMPT = (skillList) => `Here is a list of installed Claude Code skills:

${skillList}

Identify groups of skills that have overlapping or duplicate functionality. Only include groups with 2 or more skills. If no overlaps exist, return an empty array.

Respond with ONLY a JSON array (no markdown, no explanation):
[
  {
    "group": "short group name in English",
    "skills": ["skill-name-1", "skill-name-2"],
    "reason": "one sentence explaining the overlap"
  }
]`;

export async function analyze(skills, client = null) {
  if (!client) {
    client = new Anthropic();
  }

  const skillList = skills.map(s => `- ${s.name}: ${s.description}`).join('\n');

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [{ role: 'user', content: PROMPT(skillList) }],
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return [];
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: All 4 analyzer tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/analyzer.js tests/analyzer.test.js
git commit -m "feat: implement analyzer using Claude Haiku for semantic overlap detection"
```

---

## Task 4: Reporter

**Files:**
- Modify: `src/reporter.js`
- Create: `tests/reporter.test.js`

- [ ] **Step 1: Write the failing tests**

Create `tests/reporter.test.js`:
```javascript
import { describe, it, expect } from 'vitest';
import { toMarkdown } from '../src/reporter.js';

const skills = [
  { name: 'lark-vc', description: 'Feishu video meeting records' },
  { name: 'lark-minutes', description: 'Feishu audio notes and summaries' },
  { name: 'lark-doc', description: 'Feishu cloud document creation' },
  { name: 'lark-wiki', description: 'Feishu knowledge base management' },
];

const groups = [
  {
    group: 'Meeting Notes',
    skills: ['lark-vc', 'lark-minutes'],
    reason: 'Both handle meeting recordings and summaries.',
  },
  {
    group: 'Document Creation',
    skills: ['lark-doc', 'lark-wiki'],
    reason: 'Both create and manage document content.',
  },
];

describe('toMarkdown', () => {
  it('includes all group names', () => {
    const md = toMarkdown(groups, skills);
    expect(md).toContain('Meeting Notes');
    expect(md).toContain('Document Creation');
  });

  it('includes all skill names', () => {
    const md = toMarkdown(groups, skills);
    expect(md).toContain('lark-vc');
    expect(md).toContain('lark-minutes');
    expect(md).toContain('lark-doc');
    expect(md).toContain('lark-wiki');
  });

  it('includes reason for each group', () => {
    const md = toMarkdown(groups, skills);
    expect(md).toContain('Both handle meeting recordings');
    expect(md).toContain('Both create and manage document');
  });

  it('includes summary line with counts', () => {
    const md = toMarkdown(groups, skills);
    expect(md).toContain('2 overlap groups');
    expect(md).toContain('4 skills');
  });

  it('returns no-overlap message when groups is empty', () => {
    const md = toMarkdown([], skills);
    expect(md).toContain('No overlapping skills found');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `toMarkdown` returns `''` (stub)

- [ ] **Step 3: Implement reporter**

Write `src/reporter.js`:
```javascript
import chalk from 'chalk';
import { writeFileSync } from 'fs';

export function toMarkdown(groups, skills) {
  if (groups.length === 0) {
    return '# Skill Analysis Report\n\nNo overlapping skills found.\n';
  }

  const lines = ['# Skill Analysis Report\n'];

  groups.forEach((g, i) => {
    lines.push(`## Overlap Group ${i + 1}: ${g.group}\n`);
    g.skills.forEach(name => {
      const skill = skills.find(s => s.name === name);
      const desc = skill ? skill.description : '';
      lines.push(`- **${name}**: ${desc}`);
    });
    lines.push(`\n**Reason:** ${g.reason}\n`);
  });

  const totalSkills = new Set(groups.flatMap(g => g.skills)).size;
  lines.push(`---\n_Found ${groups.length} overlap groups across ${totalSkills} skills. All decisions left to human._\n`);

  return lines.join('\n');
}

export function report(groups, skills, outputPath = null) {
  if (groups.length === 0) {
    console.log(chalk.green('✓ No overlapping skills found.'));
    return;
  }

  const totalSkills = new Set(groups.flatMap(g => g.skills)).size;
  console.log(chalk.bold(`\nFound ${groups.length} overlap group(s) involving ${totalSkills} skills:\n`));

  groups.forEach((g, i) => {
    console.log(chalk.yellow.bold(`## Group ${i + 1}: ${g.group}`));
    g.skills.forEach(name => {
      const skill = skills.find(s => s.name === name);
      const desc = skill
        ? skill.description.slice(0, 60) + (skill.description.length > 60 ? '…' : '')
        : '';
      console.log(`  ${chalk.cyan(name.padEnd(40))} ${chalk.gray(desc)}`);
    });
    console.log(`  ${chalk.dim('Reason:')} ${g.reason}`);
    console.log();
  });

  console.log(chalk.dim('─'.repeat(60)));
  console.log(chalk.dim(`${groups.length} overlap groups, ${totalSkills} skills involved. All decisions left to human.`));

  if (outputPath) {
    const md = toMarkdown(groups, skills);
    writeFileSync(outputPath, md, 'utf8');
    console.log(chalk.green(`\nReport saved to ${outputPath}`));
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: All 5 reporter tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/reporter.js tests/reporter.test.js
git commit -m "feat: implement reporter with colored terminal output and Markdown generation"
```

---

## Task 5: CLI Entry Point + Orchestration

**Files:**
- Modify: `bin/analyze-skills.js`
- Modify: `src/index.js`

- [ ] **Step 1: Implement src/index.js**

```javascript
import { scan } from './scanners/claude-code.js';
import { analyze } from './analyzer.js';
import { report } from './reporter.js';

export async function run({ outputPath = null } = {}) {
  console.log('Scanning installed skills…');
  const skills = scan();

  if (skills.length === 0) {
    console.log('No skills found in ~/.claude/');
    return;
  }

  console.log(`Found ${skills.length} skills. Analyzing for overlaps…`);
  const groups = await analyze(skills);
  report(groups, skills, outputPath);
}
```

- [ ] **Step 2: Implement bin/analyze-skills.js**

```javascript
#!/usr/bin/env node
import { Command } from 'commander';
import { run } from '../src/index.js';

const program = new Command();

program
  .name('analyze-skills')
  .description('Analyze installed Claude Code skills for overlaps')
  .version('0.1.0')
  .option('-o, --output <file>', 'save Markdown report to file')
  .action(async (options) => {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('Error: ANTHROPIC_API_KEY environment variable is required');
      process.exit(1);
    }
    try {
      await run({ outputPath: options.output });
    } catch (err) {
      console.error('Error:', err.message);
      process.exit(1);
    }
  });

program.parse();
```

- [ ] **Step 3: Make bin executable**

Run: `chmod +x bin/analyze-skills.js`

- [ ] **Step 4: Smoke test with --version**

Run: `node bin/analyze-skills.js --version`
Expected: `0.1.0`

- [ ] **Step 5: Smoke test with --help**

Run: `node bin/analyze-skills.js --help`
Expected:
```
Usage: analyze-skills [options]

Analyze installed Claude Code skills for overlaps

Options:
  -V, --version        output the version number
  -o, --output <file>  save Markdown report to file
  -h, --help           display help for command
```

- [ ] **Step 6: Run full test suite**

Run: `npm test`
Expected: All tests PASS

- [ ] **Step 7: Commit**

```bash
git add bin/analyze-skills.js src/index.js
git commit -m "feat: wire CLI entry point and pipeline orchestration"
```

---

## Task 6: Claude Code Skill

**Files:**
- Create: `skills/analyze-skills/SKILL.md`

- [ ] **Step 1: Create skill directory**

Run: `mkdir -p /Users/dp/workspace/github/analyze-skills/skills/analyze-skills`

- [ ] **Step 2: Write SKILL.md**

Create `skills/analyze-skills/SKILL.md`:
```markdown
---
name: analyze-skills
description: Analyze installed Claude Code skills for overlaps and duplicates. Lists overlapping skill groups for human review. No automated actions taken — all decisions left to human.
---

# Analyze Skills

Scan installed Claude Code skills and identify groups with overlapping functionality.
Present findings to the user for human review. Take no automated action.

## Steps

1. Check if the CLI is available:
   ```bash
   npx analyze-skills --version 2>/dev/null
   ```

2. **If exit code 0 (CLI installed):** Run the analysis:
   ```bash
   npx analyze-skills
   ```
   If the user asked for a file, add `--output report.md`.

3. **If CLI not found:** Perform inline analysis using the skill list already
   loaded in session context (system-reminder).

   Read through the available skills list and group any that have overlapping
   or duplicate functionality. Output using this exact format:

   ```
   ## Overlap Group 1: [Category Name]
   - skill-name-1    brief description
   - skill-name-2    brief description
   Reason: one sentence explaining the overlap

   ## Overlap Group 2: [Category Name]
   ...

   ---
   Found N overlap groups across M skills. All decisions left to human.
   ```

   If no overlaps found: output `✓ No overlapping skills found.`
```

- [ ] **Step 3: Commit**

```bash
git add skills/
git commit -m "feat: add analyze-skills Claude Code skill with CLI and fallback modes"
```

---

## Task 7: Final Verification

- [ ] **Step 1: Run full test suite**

Run: `npm test`
Expected: All tests PASS, no failures

- [ ] **Step 2: End-to-end smoke test (requires ANTHROPIC_API_KEY)**

Run: `ANTHROPIC_API_KEY=your-key node bin/analyze-skills.js`
Expected: Colored output showing overlap groups from your actual installed skills

- [ ] **Step 3: Test --output flag**

Run: `ANTHROPIC_API_KEY=your-key node bin/analyze-skills.js --output /tmp/report.md && cat /tmp/report.md`
Expected: Report printed to terminal AND saved as Markdown at `/tmp/report.md`

- [ ] **Step 4: Commit and tag**

```bash
git add .
git commit -m "chore: final verification complete"
git tag v0.1.0
```
