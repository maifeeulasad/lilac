// ARIA snapshot tests.
//
// The accessibility surface of the editor, pinned as a canonical tree. These
// are the jsdom-side rendering contract for semantics: roles, labels,
// aria-multiline, contenteditable, aria-pressed toggles, and hidden states.
// The browser suite re-checks the same contract against Chromium's *real*
// accessibility tree via Playwright's `toMatchAriaSnapshot`.

import { describe, expect, it } from 'vitest';
import { mountEditor } from '../helpers/editor';

describe('accessibility tree', () => {
  it('exposes the editable region as a multiline textbox', () => {
    const h = mountEditor({ toolbar: { show: true } });
    expect(h.aria()).toMatchSnapshot('textbox');
    h.cleanup();
  });

  it('disables the editable region and toolbar when read-only', () => {
    const h = mountEditor({ toolbar: { show: true } });
    h.editor.setReadOnly(true);
    expect(h.aria()).toMatchSnapshot('read only');
    h.cleanup();
  });

  it('reflects toggles as aria-pressed on every tool button', () => {
    const h = mountEditor({ toolbar: { show: true }, initialContent: '<p>text</p>' });
    const aria = h.aria();
    expect(aria).toContain('aria-pressed="false"');
    // Every toolbar button carries a pressed state for the toggle contract.
    h.root.querySelectorAll<HTMLElement>('.lilac-toolbar__button').forEach((btn) => {
      expect(btn.getAttribute('aria-pressed')).not.toBeNull();
    });
    h.cleanup();
  });

  it('hides the find panel until it is opened', () => {
    const h = mountEditor({ toolbar: { show: true }, initialContent: '<p>text</p>' });
    h.editor.openFind();
    const aria = h.aria();
    expect(aria).toContain('- search');
    // Hidden nodes leave the a11y tree entirely — closing removes the panel.
    h.editor.closeFind();
    expect(h.aria()).not.toContain('- search');
    h.cleanup();
  });

  it('keeps the placeholder text out of the tree when hidden by content', () => {
    const h = mountEditor({ toolbar: { show: true }, initialContent: '<p>filled</p>' });
    expect(h.aria()).not.toContain('Start writing');
    h.cleanup();
  });
});