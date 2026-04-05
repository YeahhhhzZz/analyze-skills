# analyze-skills Design Spec

**Date:** 2026-04-04  
**Status:** Approved

## Problem

The skill ecosystem has grown to dozens of community skills. Many overlap in purpose (e.g., multiple meeting-notes skills, multiple document-creation skills). Users have no way to detect these overlaps — they must manually read every skill description. This leads to bloated installs, trigger conflicts, and wasted context window.

## Goal

Provide a tool that scans locally installed skills, identifies semantically overlapping groups, and presents them to the user for human review. No automated actions taken — all decisions left to the human.

## Approach

**Option chosen: CLI-first, Skill as thin wrapper (Strategy B)**

- The CLI is the single source of truth for analysis logic.
- The Skill invokes the CLI when installed, with LLM-based fallback when the CLI is absent.
- This ensures CLI and Skill outputs are always consistent.

## Architecture

```
/analyze-skills (Claude Code Skill)
  └── checks if CLI installed
      ├── yes → shell exec `npx analyze-skills`, display output
      └── no  → fallback: LLM analyzes skill list from session context

analyze-skills (Node.js CLI, npx)
  ├── ClaudeCodeScanner   reads ~/.claude/skills/ + installed_plugins.json
  ├── analyzer.js         calls Claude API (Haiku 4.5) for semantic clustering
  └── reporter.js         colored terminal output + optional Markdown file
```

## CLI Project Structure

```
analyze-skills/
├── bin/
│   └── analyze-skills.js     # Entry point, CLI arg parsing
├── src/
│   ├── scanners/
│   │   └── claude-code.js    # Scans ~/.claude/skills/ and plugin cache
│   ├── analyzer.js           # Claude API semantic overlap analysis
│   ├── reporter.js           # Terminal output + Markdown generation
│   └── index.js              # Orchestrates the pipeline
├── package.json
└── README.md
```

## Data Flow

```
ClaudeCodeScanner
  → [{ name, description, source, path }]   # normalized skill objects
  → analyzer.js (claude-haiku-4-5 API)
  → [{ group: string, skills: string[], reason: string }]
  → reporter.js
  → colored terminal + optional --output report.md
```

## Skill Data Sources (v1: Claude Code only)

| Source | Path |
|--------|------|
| User skills | `~/.claude/skills/*/SKILL.md` |
| Installed plugins | `~/.claude/plugins/installed_plugins.json` → each `installPath/skills/*/SKILL.md` |

**Extension point:** Scanner uses a Strategy interface. Future scanners (`.agents/skills/`, `.cursor/skills-cursor/`) can be added without modifying core logic.

## CLI Interface

```bash
npx analyze-skills                     # analyze and print to terminal
npx analyze-skills --output report.md  # also save Markdown report
npx analyze-skills --json              # machine-readable output (reserved, not v1)
npx analyze-skills --version           # version check (used by Skill to detect install)
```

## Output Format

Both CLI and Skill fallback produce the same structure:

```
## Overlap Group 1: Meeting Notes
- lark-vc                       video meeting records and notes
- lark-minutes                  audio/recording notes
- lark-workflow-meeting-summary  meeting summary workflow
Reason: All three handle meeting artifacts with highly overlapping triggers.

## Overlap Group 2: Document Creation
- lark-doc   Feishu cloud docs
- lark-wiki  Feishu knowledge base
Reason: Both create and edit Feishu document content.

---
Found N overlap groups across M skills. All decisions left to human.
```

## Skill Design (thin wrapper)

```markdown
---
name: analyze-skills
description: Analyze installed Claude Code skills for overlaps and duplicates.
             Lists overlapping skill groups for human review.
---

## Steps
1. Run `npx analyze-skills --version` to check if CLI is installed.
2. If installed: run `npx analyze-skills` and display output.
3. If not installed: use skill list from session context (system-reminder)
   to perform inline LLM analysis. Output in the same grouped format.
```

## What's Out of Scope (v1)

- Automated removal or merging of skills
- Scanning `.agents/skills/`, `.cursor/skills-cursor/`, or other agent ecosystems
- Interactive guided deletion flow
- Similarity scoring or ranking within groups

## Future Extensions

- `--also-scan ~/.agents/skills` flag to include other agent ecosystems
- Interactive mode: prompt user to keep/remove each group
- Publish to npm as `analyze-skills` package
