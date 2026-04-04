# analyze-skills

中文文档请见 [README.zh.md](README.zh.md)

A Node.js CLI tool and Claude Code skill that scans your locally installed Claude Code skills, identifies groups with overlapping or duplicate functionality using Claude AI (Haiku), and presents the findings for human review. No automated changes are made — every decision is left to you.

## Requirements

- Node.js 18+
- `ANTHROPIC_API_KEY` environment variable

## Installation (local development)

```bash
npm install
```

## Usage

### CLI

```bash
# Scan skills and print overlap groups to the terminal
npx analyze-skills

# Scan and also save a Markdown report
npx analyze-skills --output report.md

# Show version
npx analyze-skills --version
```

Set your API key before running:

```bash
export ANTHROPIC_API_KEY=sk-...
npx analyze-skills
```

### Claude Code skill

Install `skills/analyze-skills/SKILL.md` into your Claude Code skills directory, then invoke it inside a Claude Code session:

```
/analyze-skills
```

If the CLI is not installed, the skill falls back to inline LLM analysis.

## How it works

1. Scans `~/.claude/skills/*/SKILL.md` and `~/.claude/plugins/installed_plugins.json` to collect all locally installed skills.
2. Sends the skill metadata to the Claude Haiku API, which semantically clusters skills with overlapping or duplicate functionality.
3. Prints the groups to the terminal with color-coded output.
4. Optionally writes a Markdown report if `--output` is specified.

All decisions about what to keep, merge, or remove are left to you.

## Tech stack

Node.js ESM · `@anthropic-ai/sdk` · `chalk` · `commander` · `gray-matter` · `vitest`
