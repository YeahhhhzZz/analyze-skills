import { describe, it, expect } from 'vitest';
import { toMarkdown } from '../src/reporter.js';

describe('toMarkdown', () => {
  const groups = [
    {
      group: 'Document Skills',
      skills: ['skill-a', 'skill-b'],
      reason: 'Both operate on documents.',
    },
    {
      group: 'Calendar Skills',
      skills: ['skill-c'],
      reason: 'Both focus on calendars.',
    },
  ];
  const skills = [
    { name: 'skill-a', description: 'Doc work' },
    { name: 'skill-b', description: 'More doc work' },
    { name: 'skill-c', description: 'Calendar work' },
  ];

  it('returns a Markdown string', () => {
    expect(toMarkdown(groups, skills)).toEqual(expect.any(String));
  });

  it('includes group name as heading', () => {
    expect(toMarkdown(groups, skills)).toContain('## Overlap Group 1: Document Skills');
  });

  it('lists skills in each group', () => {
    const markdown = toMarkdown(groups, skills);
    expect(markdown).toContain('- skill-a');
    expect(markdown).toContain('- skill-b');
    expect(markdown).toContain('- skill-c');
  });

  it('includes reason for each group', () => {
    const markdown = toMarkdown(groups, skills);
    expect(markdown).toContain('Reason: Both operate on documents.');
    expect(markdown).toContain('Reason: Both focus on calendars.');
  });

  it('includes summary line at end', () => {
    expect(toMarkdown(groups, skills).trim().endsWith('Found 2 overlap groups across 3 skills.')).toBe(
      true
    );
  });
});
