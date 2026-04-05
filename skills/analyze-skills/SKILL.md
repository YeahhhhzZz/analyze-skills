---
name: analyze-skills
description: Analyze installed Claude Code skills for overlaps and duplicates. Lists overlapping skill groups for human review. No automated actions taken — all decisions left to human.
---

# Analyze Skills

Scan the installed Claude Code skills visible in this session and identify groups with overlapping or duplicate functionality. Present findings for human review. Take no automated action.

## How to analyze

The full list of installed skills is already loaded in your session context (system-reminder). Use that list directly — no external API calls or CLI tools needed.

Go through the skill list and group any skills that serve overlapping purposes. Consider:
- Similar trigger conditions (both activate on the same user intent)
- Redundant functionality (one skill covers what another already does)
- Duplicate domain coverage (e.g. multiple meeting-notes skills, multiple document-creation skills)

## Output format

```
## Overlap Group 1: [Category Name]
- skill-name-1    brief description
- skill-name-2    brief description
- skill-name-3    brief description
Reason: one sentence explaining the overlap

## Overlap Group 2: [Category Name]
- skill-name-a    brief description
- skill-name-b    brief description
Reason: one sentence explaining the overlap

---
Found N overlap groups across M skills. All decisions left to human.
```

If no overlaps are found, output: `✓ No overlapping skills found.`

## Rules

- Only include groups with 2 or more skills
- Keep group names short and in English
- Keep reasons to one sentence
- Do not suggest which skill to keep or remove — list only, human decides
