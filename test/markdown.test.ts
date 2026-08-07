import { describe, expect, it } from 'vitest';
import { fromMarkdown, toMarkdown } from '../core/utils/markdown';

describe('toMarkdown', () => {
  it('serializes headings', () => {
    expect(toMarkdown('<h1>Title</h1><h3>Sub</h3>')).toBe('# Title\n\n### Sub');
  });

  it('serializes inline emphasis', () => {
    expect(toMarkdown('<p>a <strong>b</strong> <em>c</em> <del>d</del></p>')).toBe('a **b** *c* ~~d~~');
  });

  it('serializes links and images', () => {
    expect(toMarkdown('<p><a href="https://x.com">x</a></p>')).toBe('[x](https://x.com)');
    expect(toMarkdown('<p><img src="a.png" alt="pic"></p>')).toBe('![pic](a.png)');
  });

  it('serializes lists', () => {
    expect(toMarkdown('<ul><li>a</li><li>b</li></ul>')).toBe('- a\n- b');
    expect(toMarkdown('<ol><li>a</li><li>b</li></ol>')).toBe('1. a\n2. b');
  });

  it('serializes blockquotes and code blocks', () => {
    expect(toMarkdown('<blockquote>quote</blockquote>')).toBe('> quote');
    expect(toMarkdown('<pre><code>const x = 1;</code></pre>')).toBe('```\nconst x = 1;\n```');
  });

  it('serializes inline code', () => {
    expect(toMarkdown('<p>use <code>npm i</code></p>')).toBe('use `npm i`');
  });
});

describe('fromMarkdown', () => {
  it('parses headings', () => {
    expect(fromMarkdown('# Title')).toBe('<h1>Title</h1>');
  });

  it('parses emphasis without touching numbers', () => {
    expect(fromMarkdown('a **b** *c* ~~d~~ and 0 to 9')).toBe(
      '<p>a <strong>b</strong> <em>c</em> <del>d</del> and 0 to 9</p>',
    );
  });

  it('leaves markup inside inline code alone', () => {
    expect(fromMarkdown('run `a * b` now')).toBe('<p>run <code>a * b</code> now</p>');
  });

  it('parses lists', () => {
    expect(fromMarkdown('- a\n- b')).toBe('<ul><li>a</li><li>b</li></ul>');
    expect(fromMarkdown('1. a\n2. b')).toBe('<ol><li>a</li><li>b</li></ol>');
  });

  it('parses fenced code blocks and escapes their content', () => {
    expect(fromMarkdown('```\n<b>&</b>\n```')).toBe('<pre><code>&lt;b&gt;&amp;&lt;/b&gt;</code></pre>');
  });

  it('parses images and links', () => {
    expect(fromMarkdown('![pic](a.png)')).toBe('<p><img src="a.png" alt="pic"></p>');
    expect(fromMarkdown('[x](https://x.com)')).toBe('<p><a href="https://x.com">x</a></p>');
  });
});

describe('round trips', () => {
  const cases: string[] = [
    '# Heading',
    'plain paragraph text',
    'a **bold** and *italic* and ~~struck~~ word',
    '- one\n- two\n- three',
    '1. one\n2. two',
    '> a quote',
    '```\nline1\nline2\n```',
    'inline `code` here',
    '[link](https://example.com)',
    '![alt](img.png)',
  ];

  it.each(cases)('md -> html -> md is stable for %j', (md) => {
    expect(toMarkdown(fromMarkdown(md))).toBe(md);
  });
});
