import { describe, it, expect } from 'vitest';
import { extractJson } from '../src/utils.js';

describe('extractJson', () => {
  it('returns bare JSON unchanged', () => {
    const input = '[{"group":"Docs","skills":["a"],"reason":"overlap"}]';
    expect(extractJson(input)).toBe(input);
  });

  it('extracts JSON from markdown code block', () => {
    const inner = '[{"group":"Docs","skills":["a"],"reason":"overlap"}]';
    const input = '```json\n' + inner + '\n```';
    expect(extractJson(input)).toBe(inner);
  });
});
