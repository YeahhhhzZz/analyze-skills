# analyze-skills

中文文档请见 [README.zh.md](README.zh.md)

A Claude Code plugin that analyzes your installed skills for overlapping or duplicate functionality and conflicting instructions, and presents the findings for human review. No API key required — analysis runs entirely inside your Claude Code session.

## Install

```
/plugin marketplace add YeahhhhzZz/analyze-skills
/plugin install analyze-skills@YeahhhhzZz-analyze-skills
```

## Usage

Once installed, invoke the skill in any Claude Code session:

```
/analyze-skills
```

Claude will analyze the full list of installed skills already loaded in your session context, grouping any with overlapping functionality and flagging any with contradictory instructions.

**Example output:**

```
## Overlap Group 1: Meeting Notes
- lark-vc                   video meeting records and notes
- lark-minutes              audio/recording notes
- lark-workflow-meeting-summary  meeting summary workflow
Reason: All three handle meeting artifacts with highly overlapping triggers.

---

## Conflicts

🔴 **tdd-guide** vs **quick-fixes** (testing-strategy)
tdd-guide mandates writing tests before implementation; quick-fixes says to skip tests for small changes.

---
Found 3 overlap groups and 1 conflict across 7 skills. All decisions left to human.
```

All decisions (keep, remove, edit) are left to you.

## How it works

The full list of your installed skills is automatically loaded into every Claude Code session via the system context. The skill instructs Claude to semantically cluster that list and report overlap groups — no external API calls, no extra dependencies.

## CLI (optional)

For use outside Claude Code, a standalone Node.js CLI is also available:

```bash
# Requires ANTHROPIC_API_KEY
npx analyze-skills
npx analyze-skills --output report.md
```

See `bin/` and `src/` for the CLI source.

## License

MIT
