import { describe, it, expect } from 'vitest';
import { toMarkdown } from '../src/reporter.js';

const overlaps = [
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
const conflicts = [
  {
    severity: 'high',
    skillA: 'skill-a',
    skillB: 'skill-b',
    conflictDescription: 'skill-a uses spaces; skill-b uses tabs.',
    categoryTag: 'code-style',
  },
];

describe('toMarkdown', () => {
  it('returns a Markdown string', () => {
    expect(toMarkdown({ overlaps, conflicts: [] }, skills)).toEqual(expect.any(String));
  });

  it('includes group name in overlaps table', () => {
    const markdown = toMarkdown({ overlaps, conflicts: [] }, skills);
    expect(markdown).toContain('## Overlapping Skills');
    expect(markdown).toContain('Document Skills');
  });

  it('lists skills in each group as table row', () => {
    const markdown = toMarkdown({ overlaps, conflicts: [] }, skills);
    expect(markdown).toContain('skill-a');
    expect(markdown).toContain('skill-b');
    expect(markdown).toContain('skill-c');
  });

  it('includes reason for each group in table', () => {
    const markdown = toMarkdown({ overlaps, conflicts: [] }, skills);
    expect(markdown).toContain('Both operate on documents.');
    expect(markdown).toContain('Both focus on calendars.');
  });

  it('includes summary line with overlap and conflict counts', () => {
    const markdown = toMarkdown({ overlaps, conflicts }, skills);
    expect(markdown).toContain('Found 2 overlap groups');
    expect(markdown).toContain('1 conflict');
  });

  it('includes conflicts section heading', () => {
    const markdown = toMarkdown({ overlaps, conflicts }, skills);
    expect(markdown).toContain('## Conflicts');
  });

  it('shows severity indicator for each conflict', () => {
    const markdown = toMarkdown({ overlaps, conflicts }, skills);
    expect(markdown).toContain('🔴');
  });

  it('lists the two conflicting skills and description', () => {
    const markdown = toMarkdown({ overlaps, conflicts }, skills);
    expect(markdown).toContain('skill-a');
    expect(markdown).toContain('skill-b');
    expect(markdown).toContain('skill-a uses spaces; skill-b uses tabs.');
  });

  it('shows "No conflicts found" when conflicts array is empty', () => {
    const markdown = toMarkdown({ overlaps, conflicts: [] }, skills);
    expect(markdown).toContain('No conflicts found');
  });
});
