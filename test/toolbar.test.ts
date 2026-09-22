// Toolbar behavior: wiring, disabled state, active-state propagation. The
// snapshot suites pin its structure; these pin what happens when it is used.

import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountEditor, type EditorHarness } from './helpers/editor';

let h: EditorHarness;

afterEach(() => h?.cleanup());

describe('toolbar', () => {
  it('renders a button per tool, separators excluded from the count', () => {
    h = mountEditor({ toolbar: { show: true } });
    expect(h.root.querySelectorAll('.lilac-toolbar__button')).toHaveLength(12);
    expect(h.root.querySelectorAll('.lilac-toolbar__separator')).toHaveLength(3);
  });

  it('names every tool button for assistive tech', () => {
    h = mountEditor({ toolbar: { show: true } });
    const labels = Array.from(h.root.querySelectorAll('.lilac-toolbar__button')).map(
      (b) => b.getAttribute('aria-label'),
    );
    expect(labels).toContain('Bold (Ctrl+B)');
    expect(labels).toContain('Link (Ctrl+K)');
    expect(labels).toContain('Code Block');
  });

  it('dispatches a format command on click and syncs content', () => {
    h = mountEditor({ toolbar: { show: true }, initialContent: '<p>text</p>' });
    const bold = h.root.querySelector<HTMLButtonElement>('[data-tool="bold"]')!;
    bold.click();
    expect(document.execCommand).toHaveBeenCalledWith('bold', false);
  });

  it('does not fire while the editor is read-only', () => {
    h = mountEditor({ toolbar: { show: true }, initialContent: '<p>text</p>' });
    h.editor.setReadOnly(true);
    const bold = h.root.querySelector<HTMLButtonElement>('[data-tool="bold"]')!;
    bold.click();
    expect(document.execCommand).not.toHaveBeenCalled();
  });

  it('disables every button when read-only', () => {
    h = mountEditor({ toolbar: { show: true } });
    h.editor.setReadOnly(true);
    const buttons = Array.from(h.root.querySelectorAll<HTMLButtonElement>('.lilac-toolbar__button'));
    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons.every((b) => b.disabled)).toBe(true);
  });

  it('marks the toolbar with the disabled modifier class', () => {
    h = mountEditor({ toolbar: { show: true } });
    h.editor.setReadOnly(true);
    expect(h.root.querySelector('.lilac-toolbar')!.classList.contains('lilac-toolbar--disabled')).toBe(true);
  });

  it('runs plugin button onClick with the editor context', () => {
    const onClick = vi.fn();
    h = mountEditor({
      toolbar: { show: true },
      plugins: [{
        id: 'b', name: 'B', version: '1.0.0',
        toolbarButtons: [{ id: 'btn', icon: '<svg></svg>', label: 'B', onClick }],
      }],
    });
    h.root.querySelector<HTMLButtonElement>('.lilac-toolbar__button--plugin')!.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('reports an active tool as aria-pressed=true', () => {
    h = mountEditor({ toolbar: { show: true, tools: ['bold', 'italic'] }, initialContent: '<p><b>bold</b></p>' });
    // Simulate Chromium reporting the caret inside a bold run. Configured
    // after mount: mountEditor resets the stub to a fresh mock.
    (document.queryCommandState as ReturnType<typeof vi.fn>).mockImplementation((cmd: string) => cmd === 'bold');
    h.content.dispatchEvent(new FocusEvent('focus'));
    h.content.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    const bold = h.root.querySelector<HTMLButtonElement>('[data-tool="bold"]')!;
    expect(bold.getAttribute('aria-pressed')).toBe('true');
    expect(bold.classList.contains('lilac-toolbar__button--active')).toBe(true);
  });

  it('does not tag tools active when no explicit tool list was configured', () => {
    // Documents current behavior rather than endorsing it: Editor#updateActiveTools
    // reads `props.toolbar.tools`, so with the default toolbar (no `tools` key) the
    // active-state highlight is skipped entirely. Editor.ts:539.
    h = mountEditor({ toolbar: { show: true }, initialContent: '<p><b>bold</b></p>' });
    (document.queryCommandState as ReturnType<typeof vi.fn>).mockImplementation((cmd: string) => cmd === 'bold');
    h.content.dispatchEvent(new FocusEvent('focus'));
    const bold = h.root.querySelector<HTMLButtonElement>('[data-tool="bold"]')!;
    expect(bold.getAttribute('aria-pressed')).toBe('false');
    expect(bold.classList.contains('lilac-toolbar__button--active')).toBe(false);
  });
});