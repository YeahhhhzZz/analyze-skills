import { describe, it, expect, vi } from 'vitest';
import { analyzeConflicts } from '../src/conflict-analyzer.js';

const makeClient = (responseText) => ({
  messages: {
    create: vi.fn().mockResolvedValue({
      content: [{ text: responseText }],
    }),
  },
});

const skills = [
  { name: 'skill-a', description: 'Code style', source: 'user-skills', content: 'Always use 2-space indentation. Never use tabs.' },
  { name: 'skill-b', description: 'Quick fixes', source: 'user-skills', content: 'For small changes, skip tests to save time.' },
  { name: 'skill-c', description: 'TDD guide', source: 'user-skills', content: 'Always write tests before implementation. Never skip tests.' },
];

describe('analyzeConflicts', () => {
  it('calls client.messages.create with Claude Haiku and skill content (not just name/description)', async () => {
    const client = makeClient('[]');
    await analyzeConflicts(skills, client);

    expect(client.messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-haiku-4-5-20251001',
        messages: [
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('Always use 2-space indentation'),
          }),
        ],
      })
    );
  });

  it('parses JSON response into conflict objects', async () => {
    const conflicts = [
      {
        severity: 'high',
        skillA: 'skill-b',
        skillB: 'skill-c',
        conflictDescription: 'skill-b says to skip tests; skill-c mandates tests before implementation.',
        categoryTag: 'testing-strategy',
      },
    ];
    const client = makeClient(JSON.stringify(conflicts));
    const result = await analyzeConflicts(skills, client);
    expect(result).toEqual(conflicts);
  });

  it('extracts JSON wrapped in markdown code blocks', async () => {
    const conflicts = [{ severity: 'medium', skillA: 'skill-a', skillB: 'skill-b', conflictDescription: 'Style tension.', categoryTag: 'code-style' }];
    const client = makeClient('```json\n' + JSON.stringify(conflicts) + '\n```');
    const result = await analyzeConflicts(skills, client);
    expect(result).toEqual(conflicts);
  });

  it('returns empty array when skills array is empty', async () => {
    const client = makeClient('[]');
    const result = await analyzeConflicts([], client);
    expect(result).toEqual([]);
    expect(client.messages.create).not.toHaveBeenCalled();
  });

  it('returns empty array when no conflicts found', async () => {
    const client = makeClient('[]');
    const result = await analyzeConflicts(skills, client);
    expect(result).toEqual([]);
  });

  it('truncates skill content to 500 characters in the prompt', async () => {
    const longContent = 'x'.repeat(1000);
    const skillsWithLongContent = [
      { name: 'big-skill', description: 'Big skill', source: 'user-skills', content: longContent },
      { name: 'other-skill', description: 'Other skill', source: 'user-skills', content: 'Short content.' },
    ];
    const client = makeClient('[]');
    await analyzeConflicts(skillsWithLongContent, client);

    const prompt = client.messages.create.mock.calls[0][0].messages[0].content;
    // The truncated content should appear (500 x's), not the full 1000
    expect(prompt).toContain('x'.repeat(500));
    expect(prompt).not.toContain('x'.repeat(501));
  });
});
