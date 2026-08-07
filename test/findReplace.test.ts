import { describe, expect, it } from 'vitest';
import { countMatches, findMatches, replaceAll } from '../core/utils/findReplace';

describe('findMatches', () => {
  it('finds all non-overlapping occurrences', () => {
    expect(findMatches('the cat sat on the mat', 'at')).toEqual([
      { start: 5, end: 7 },
      { start: 9, end: 11 },
      { start: 20, end: 22 },
    ]);
  });

  it('is case-insensitive by default', () => {
    expect(countMatches('Foo foo FOO', 'foo')).toBe(3);
  });

  it('respects caseSensitive', () => {
    expect(countMatches('Foo foo FOO', 'foo', { caseSensitive: true })).toBe(1);
  });

  it('matches whole words only when asked', () => {
    expect(countMatches('cat category cats', 'cat')).toBe(3); // substring
    expect(countMatches('cat category cats', 'cat', { wholeWord: true })).toBe(1);
  });

  it('treats regex metacharacters literally', () => {
    expect(findMatches('a.b a.b axb', 'a.b')).toEqual([
      { start: 0, end: 3 },
      { start: 4, end: 7 },
    ]);
  });

  it('returns nothing for an empty needle', () => {
    expect(findMatches('anything', '')).toEqual([]);
  });

  it('does not find overlapping matches', () => {
    expect(countMatches('aaaa', 'aa')).toBe(2);
  });
});

describe('replaceAll', () => {
  it('replaces every match and reports the count', () => {
    expect(replaceAll('the cat sat', 'a', 'A')).toEqual({ text: 'the cAt sAt', count: 2 });
  });

  it('inserts the replacement literally ($& is not special)', () => {
    expect(replaceAll('a', 'a', '$&')).toEqual({ text: '$&', count: 1 });
  });

  it('leaves the text untouched when there is no match', () => {
    expect(replaceAll('hello', 'z', 'Q')).toEqual({ text: 'hello', count: 0 });
  });

  it('can delete matches by replacing with empty string', () => {
    expect(replaceAll('a-b-c', '-', '')).toEqual({ text: 'abc', count: 2 });
  });

  it('honors whole-word replacement', () => {
    expect(replaceAll('cat cats cat', 'cat', 'dog', { wholeWord: true })).toEqual({
      text: 'dog cats dog',
      count: 2,
    });
  });
});
