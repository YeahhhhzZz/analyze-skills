import Anthropic from '@anthropic-ai/sdk';
import { extractJson } from './utils.js';

const MODEL = 'claude-haiku-4-5-20251001';
const CONTENT_TRUNCATE = 500;

function buildConflictPrompt(skills) {
  const skillList = skills
    .map(skill => {
      const body = (skill.content || '').slice(0, CONTENT_TRUNCATE);
      return `- ${skill.name} (${skill.source}): ${skill.description}\n  Content: ${body}`;
    })
    .join('\n\n');

  return [
    'Analyze the following Claude Code skills for contradictory instructions.',
    'A conflict is when two skills give opposing or incompatible directives that would cause inconsistent behavior.',
    'Examples of conflicts:',
    '- One skill says "always use TDD" while another says "skip tests for small changes"',
    '- One skill says "use tabs" while another says "use 2-space indentation"',
    '- One skill says "always add comments" while another says "avoid unnecessary comments"',
    '',
    'Overlaps (skills doing similar things) are NOT conflicts. Only report actual contradictions.',
    '',
    'For each conflict, assign severity:',
    '- "high": direct contradiction (cannot follow both simultaneously)',
    '- "medium": philosophical tension (different preferences that could coexist in some contexts)',
    '',
    'Return ONLY a JSON array of objects with keys: severity, skillA, skillB, conflictDescription, categoryTag.',
    'If no conflicts exist, return [].',
    '',
    'Skills:',
    skillList,
  ].join('\n');
}

export async function analyzeConflicts(skills, client = null) {
  if (!Array.isArray(skills) || skills.length === 0) {
    return [];
  }

  const anthropic = client ?? new Anthropic();
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: buildConflictPrompt(skills),
      },
    ],
  });

  const text = response.content
    .filter(block => block?.text)
    .map(block => block.text)
    .join('\n')
    .trim();

  const parsed = JSON.parse(extractJson(text));
  return Array.isArray(parsed) ? parsed : [];
}
