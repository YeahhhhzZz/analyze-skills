---
name: analyze-skills
description: Analyze installed Claude Code skills for overlaps and duplicates. Lists overlapping skill groups for human review. No automated actions taken — all decisions left to human.
---

# Analyze Skills

Scan installed Claude Code skills and identify groups with overlapping functionality.
Present findings to the user for human review. Take no automated action.

## Steps

1. Check if the CLI is available by running: `npx analyze-skills --version 2>/dev/null`

2. If exit code 0 (CLI installed): Run the analysis with: `npx analyze-skills`
   If the user asked for a file, add `--output report.md`.

3. If CLI not found: Perform inline analysis using the skill list already loaded in session context (system-reminder).

   Read through the available skills list and group any that have overlapping or duplicate functionality. Output using this format:

   ```md
   ## Overlap Group 1: [Category Name]
   - skill-name-1    brief description
   - skill-name-2    brief description
   Reason: one sentence explaining the overlap

   ---
   Found N overlap groups across M skills. All decisions left to human.
   ```

   If no overlaps found: output checkmark No overlapping skills found.
