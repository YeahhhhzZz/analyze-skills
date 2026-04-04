import { describe, it, expect, vi } from 'vitest';
import { analyze } from '../src/analyzer.js';

describe('analyze', () => {
  it('calls client.messages.create with Claude Haiku and the skill list', async () => {
    const client = {
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{ text: '[]' }],
        }),
      },
    };
    const skills = [
      { name: 'skill-a', description: 'Does thing A' },
      { name: 'skill-b', description: 'Does thing B' },
    ];

    await analyze(skills, client);

    expect(client.messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-haiku-4-5-20251001',
        messages: [
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('skill-a'),
          }),
        ],
      })
    );
    expect(client.messages.create.mock.calls[0][0].messages[0].content).toContain('skill-b');
  });

  it('parses JSON response into overlap groups', async () => {
    const groups = [
      {
        group: 'Document skills',
        skills: ['skill-a', 'skill-b'],
        reason: 'Both work with documents.',
      },
    ];
    const client = {
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{ text: JSON.stringify(groups) }],
        }),
      },
    };

    await expect(
      analyze(
        [
          { name: 'skill-a', description: 'Does thing A' },
          { name: 'skill-b', description: 'Does thing B' },
        ],
        client
      )
    ).resolves.toEqual(groups);
  });

  it('extracts JSON wrapped in markdown code blocks', async () => {
    const client = {
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [
            {
              text: '```json\n[{"group":"Docs","skills":["skill-a"],"reason":"Overlap"}]\n```',
            },
          ],
        }),
      },
    };

    await expect(analyze([{ name: 'skill-a', description: 'Does thing A' }], client)).resolves.toEqual([
      { group: 'Docs', skills: ['skill-a'], reason: 'Overlap' },
    ]);
  });

  it('returns empty array when skills array is empty', async () => {
    const client = {
      messages: {
        create: vi.fn(),
      },
    };

    await expect(analyze([], client)).resolves.toEqual([]);
    expect(client.messages.create).not.toHaveBeenCalled();
  });
});
