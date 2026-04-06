---
name: analyze-skills
description: Analyze installed Claude Code skills for overlaps, duplicates, and conflicts. Lists overlap groups and conflicting instructions for human review. No automated actions taken — all decisions left to human.
---

# Analyze Skills

Scan the installed Claude Code skills visible in this session and identify: (1) groups with overlapping or duplicate functionality, and (2) pairs with conflicting instructions. Present findings for human review. Take no automated action.

## How to analyze

The full list of installed skills is already loaded in your session context (system-reminder). Use that list directly — no external API calls or CLI tools needed.

### Overlaps

Go through the skill list and group any skills that serve overlapping purposes. Consider:
- Similar trigger conditions (both activate on the same user intent)
- Redundant functionality (one skill covers what another already does)
- Duplicate domain coverage (e.g. multiple meeting-notes skills, multiple document-creation skills)

### Conflicts

Look for pairs of skills that give **contradictory or incompatible instructions** that would cause Claude to behave inconsistently. Examples:
- One skill says "always write tests first (TDD)" while another says "skip tests for small changes"
- One skill says "use 2-space indentation" while another says "use tabs"
- One skill says "always explain your reasoning" while another says "be terse and skip explanations"
- One skill says "prefer functional style" while another says "use class-based components"

Assign severity:
- **high**: direct contradiction — cannot follow both simultaneously
- **medium**: philosophical tension — different preferences that could coexist in some contexts

Do NOT report overlaps as conflicts. Only report actual opposing instructions.

## Output format

```
## Overlapping Skills

| Group | Skills | Reason |
|-------|--------|--------|
| Meeting Content | `lark-vc`, `lark-minutes`, `lark-workflow-meeting-summary` | All three handle meeting artifacts with overlapping triggers. |
| DevOps / Infra | `devops-engineer`, `kubernetes-specialist` | devops-engineer covers the same K8s scope. |

---

## Conflicts

| Severity | Skill A | Skill B | Category | Description |
|----------|---------|---------|----------|-------------|
| 🔴 High | `tdd-guide` | `quick-fixes` | testing-strategy | tdd-guide mandates tests before code; quick-fixes says skip tests for small changes. |
| 🟡 Medium | `frontend-design` | `ui-ux-pro-max` | design-approach | Different but compatible design philosophies; may produce inconsistent output. |

---
Found N overlap groups and M conflicts across K skills. All decisions left to human.
```

If no overlaps are found, output: `No overlapping skills found.` in the table section.
If no conflicts are found, output: `No conflicts found.` in the conflicts section.

## Rules

- Only include overlap groups with 2 or more skills
- Only include conflicts that are genuine contradictions, not just different preferences
- Keep group names short and in English
- Keep reasons and conflict descriptions to one sentence each
- Do not suggest which skill to keep, remove, or edit — list only, human decides
- Use 🔴 for high severity conflicts, 🟡 for medium severity conflicts
