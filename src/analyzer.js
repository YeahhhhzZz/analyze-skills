import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-haiku-4-5-20251001';

function buildPrompt(skills) {
  const skillList = skills
    .map(
      skill =>
        `- ${skill.name}: ${skill.description}${skill.source ? ` (source: ${skill.source})` : ''}`
    )
    .join('\n');

  return [
    'Analyze the following Claude Code skills for semantic overlap or duplication.',
    'Return only JSON as an array of objects with keys: group, skills, reason.',
    'Each skills value must be an array of skill names.',
    '',
    'Skills:',
    skillList,
  ].join('\n');
}

function extractJson(text) {
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return fencedMatch ? fencedMatch[1].trim() : text.trim();
}

export async function analyze(skills, client = null) {
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
        content: buildPrompt(skills),
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
