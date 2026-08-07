import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { injectStyles } from '../core/utils/styles';

function styleText(): string {
  return document.getElementById('lilac-editor-styles')?.textContent ?? '';
}

beforeEach(() => {
  document.getElementById('lilac-editor-styles')?.remove();
});
afterEach(() => {
  document.getElementById('lilac-editor-styles')?.remove();
});

describe('injectStyles', () => {
  it('injects a single stylesheet, idempotently', () => {
    injectStyles();
    injectStyles();
    expect(document.querySelectorAll('#lilac-editor-styles')).toHaveLength(1);
  });

  it('ships touch-friendly hit targets for coarse pointers', () => {
    injectStyles();
    const css = styleText();
    expect(css).toContain('@media (pointer: coarse)');
    // 44px is the conventional minimum touch target.
    expect(css).toMatch(/@media \(pointer: coarse\)[\s\S]*44px/);
  });

  it('keeps the editable font at 16px so iOS does not zoom on focus', () => {
    injectStyles();
    expect(styleText()).toContain('--lilac-font-size: 16px');
  });

  it('makes the find panel responsive on narrow screens', () => {
    injectStyles();
    expect(styleText()).toContain('@media (max-width: 480px)');
  });
});
