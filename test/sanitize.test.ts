// The sanitizer is the stored-XSS guard: everything that enters the editor via
// `initialContent` / `setContent` passes through it. Existing suites only touch
// it via a couple of editor-level regressions; these pin its rules directly.

import { describe, expect, it } from 'vitest';
import { sanitizeContent, isSafeUrl } from '../core/utils/sanitize';

describe('sanitizeContent', () => {
  it('drops script and event-handler-bearing content wholesale', () => {
    expect(sanitizeContent('<p>ok</p><script>alert(1)</script>')).toBe('<p>ok</p>');
  });

  it('strips event handlers from otherwise allowed tags', () => {
    expect(sanitizeContent('<img src="x" onerror="alert(1)">')).toBe('<img src="x">');
  });

  it('prunes javascript: URLs from href and src', () => {
    expect(sanitizeContent('<a href="javascript:alert(1)">x</a>')).toBe('<a>x</a>');
    expect(sanitizeContent('<img src="javascript:alert(1)">')).toBe('<img>');
  });

  it('rejects javascript URLs even with whitespace smuggled into the scheme', () => {
    expect(isSafeUrl('java\tscript:alert(1)')).toBe(false);
    expect(isSafeUrl('java\nscript:alert(1)')).toBe(false);
    expect(isSafeUrl('  javascript:alert(1)')).toBe(false);
  });

  it('keeps relative and known-safe absolute URLs', () => {
    expect(sanitizeContent('<a href="/docs">rel</a>')).toBe('<a href="/docs">rel</a>');
    expect(isSafeUrl('https://example.com')).toBe(true);
    expect(isSafeUrl('mailto:hi@example.com')).toBe(true);
    expect(isSafeUrl('tel:+15551234567')).toBe(true);
  });

  it('allows base64 data images but not other data schemes', () => {
    const img = 'data:image/png;base64,iVBORw0KGgo=';
    expect(isSafeUrl(img, true)).toBe(true);
    expect(isSafeUrl('data:text/html;base64,PHNjcmlwdD4=', true)).toBe(false);
    expect(isSafeUrl(img)).toBe(false); // no img context => not allowed
  });

  it('unwraps unknown containers rather than dropping their text', () => {
    expect(sanitizeContent('<section>keep <b>this</b></section>')).toBe('keep <b>this</b>');
  });

  it('hardens target=_blank links with noopener noreferrer', () => {
    expect(sanitizeContent('<a href="https://x.com" target="_blank">x</a>')).toBe(
      '<a href="https://x.com" target="_blank" rel="noopener noreferrer">x</a>',
    );
  });

  it('strips disallowed attributes (inline style dies with them)', () => {
    expect(sanitizeContent('<div style="position:fixed">x</div>')).toBe('<div>x</div>');
  });

  it('drops svg/math and other embeddable-document containers entirely', () => {
    expect(sanitizeContent('<p>a</p><svg><circle/></svg>')).toBe('<p>a</p>');
  });

  it('is idempotent', () => {
    const once = sanitizeContent('<a href="x" onclick="f()"><b>b</b></a>');
    expect(sanitizeContent(once)).toBe(once);
  });
});