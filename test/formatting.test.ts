import { describe, expect, it, vi } from 'vitest';
import {
  cn,
  debounce,
  extractTextFromHtml,
  getShortcutKey,
  isValidUrl,
  keyboardShortcuts,
  throttle,
} from '../core/utils/formatting';

describe('cn', () => {
  it('joins plain strings', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('drops falsy values', () => {
    expect(cn('a', undefined, null, false, 'b')).toBe('a b');
  });

  it('includes object keys whose value is truthy', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active');
  });
});

describe('extractTextFromHtml', () => {
  it('strips tags', () => {
    expect(extractTextFromHtml('<p>Hello <strong>world</strong></p>')).toBe('Hello world');
  });

  it('returns empty string for empty input', () => {
    expect(extractTextFromHtml('')).toBe('');
  });
});

describe('isValidUrl', () => {
  it('accepts absolute URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
  });

  it('rejects bare paths', () => {
    expect(isValidUrl('/relative')).toBe(false);
  });

  // Documents current behavior rather than endorsing it: isValidUrl only asks
  // whether `new URL()` parses, so it is not a safety check. Scheme filtering
  // lives in isSafeUrl (#9).
  it('accepts javascript: URLs, so it must not be used as a security gate', () => {
    expect(isValidUrl('javascript:alert(1)')).toBe(true);
  });
});

describe('getShortcutKey', () => {
  const event = (init: Partial<KeyboardEvent>) => init as KeyboardEvent;

  it('returns null without a modifier', () => {
    expect(getShortcutKey(event({ key: 'b', ctrlKey: false, metaKey: false }))).toBeNull();
  });

  it('builds a ctrl combination', () => {
    expect(getShortcutKey(event({ key: 'b', ctrlKey: true }))).toBe('ctrl+b');
  });

  it('maps to a known toolbar tool', () => {
    const shortcut = getShortcutKey(event({ key: 'b', ctrlKey: true }));
    expect(shortcut && keyboardShortcuts[shortcut]).toBe('bold');
  });

  it('lowercases the key so shift+B still resolves', () => {
    expect(getShortcutKey(event({ key: 'B', ctrlKey: true, shiftKey: true }))).toBe('ctrl+shift+b');
  });
});

describe('debounce', () => {
  it('fires once after the delay', async () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    const debounced = debounce(spy, 50);

    debounced();
    debounced();
    debounced();
    expect(spy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(spy).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});

describe('throttle', () => {
  it('fires immediately then suppresses until the window elapses', () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    const throttled = throttle(spy, 50);

    throttled();
    throttled();
    throttled();
    expect(spy).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(50);
    throttled();
    expect(spy).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
