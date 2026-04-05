# Releasing

This project ships as a Claude Code plugin. No build step required — the skill is a Markdown file.

## Versioning

Follow [Semantic Versioning](https://semver.org/):

| Change | Version bump |
|--------|-------------|
| Fix typo or improve wording in SKILL.md | PATCH (0.1.x) |
| Improve analysis quality, add output options | MINOR (0.x.0) |
| Breaking change to skill behavior or interface | MAJOR (x.0.0) |

## Release Checklist

1. **Ensure main is up to date**
   ```bash
   git checkout main && git pull
   ```

2. **Bump version** (run the release script):
   ```bash
   npm run release 0.2.0
   ```
   This updates the version in `package.json`, `.claude-plugin/plugin.json`, and `.claude-plugin/marketplace.json` in one step.

3. **Update CHANGELOG.md** — add an entry for the new version.

4. **Commit, tag, and push**:
   ```bash
   git add .
   git commit -m "chore: release v0.2.0"
   git tag v0.2.0
   git push && git push --tags
   ```

5. **Create a GitHub Release** — use the CHANGELOG entry as release notes.

## After release

Users update by running inside Claude Code:
```
/plugin update analyze-skills
```

## Hotfix process

Branch from the latest tag, fix, then follow the same checklist with a PATCH version bump.
