# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm test` — run tests (API calls are mocked; no `ANTHROPIC_API_KEY` needed)
- `npm run test:watch` — run tests in watch mode
- `npm run lint` — run ESLint on `src/`, `bin/`, `tests/`
- `npm run release <version>` — bump version across all manifest files (see below)

## Version Management

Always use `npm run release <version>` to bump versions. This script keeps three files in sync:
- `package.json`
- `.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`

Never edit version fields in those files manually.

## Architecture

This project has two modes:

- **Skill mode** — runs inside a Claude Code session using already-loaded skill context; no API key required
- **CLI mode** — standalone Node.js tool; requires `ANTHROPIC_API_KEY` at runtime (not for tests, which mock the API)

Entry point: `./bin/analyze-skills.js`. Core modules are in `src/`; the Claude Code skill definition is in `skills/analyze-skills/SKILL.md`.

## Repo Conventions

- Branch naming: `feature/*`, `fix/*`, `chore/*`
- Commit style: conventional commits (`feat:`, `fix:`, `docs:`, `chore:`, etc.)
- ES modules throughout (`"type": "module"` in package.json) — use `import`/`export`, not `require`
