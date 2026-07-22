// Regression tests for the bugs fixed in #12-#21.
//
// These were written while the bugs were still present, marked `it.fails` so
// the assertions were live rather than aspirational. Each duly reported as
// unexpectedly passing the moment its fix merged, and was then flipped to a
// plain `it`. They now guard against reintroduction.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LilacEditor } from '../core/components/Editor';
import type { EditorProps } from '../core/types/index';

let container: HTMLElement;
const editors: LilacEditor[] = [];

function mount(props: Partial<EditorProps> = {}): LilacEditor {
  const editor = new LilacEditor({ container, ...props });
  editors.push(editor);
  return editor;
}

beforeEach(() => {
  Object.defineProperty(document, 'execCommand', {
    value: vi.fn(() => true), writable: true, configurable: true,
  });
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  while (editors.length) editors.pop()!.destroy();
  container.remove();
  document.body.innerHTML = '';
});

describe('#2 destroy() must not leak a document listener', () => {
  it('detaches its selectionchange listener', () => {
    const add = vi.spyOn(document, 'addEventListener');
    const remove = vi.spyOn(document, 'removeEventListener');

    const editor = mount();
    const added = add.mock.calls.filter(([type]) => type === 'selectionchange').length;
    editor.destroy();
    const removed = remove.mock.calls.filter(([type]) => type === 'selectionchange').length;

    expect(added).toBe(1);
    expect(removed).toBe(1);

    add.mockRestore();
    remove.mockRestore();
  });
});

describe('#3 plugins must not bleed between editor instances', () => {
  it('does not give a second editor the first editor\'s plugin buttons', () => {
    const plugin = {
      id: 'bleed-check',
      name: 'Bleed Check',
      version: '1.0.0',
      toolbarButtons: [{ id: 'btn', icon: '<svg></svg>', label: 'Btn', onClick: vi.fn() }],
    };

    const containerA = document.createElement('div');
    const containerB = document.createElement('div');
    document.body.append(containerA, containerB);

    const a = new LilacEditor({ container: containerA, toolbar: { show: true }, plugins: [plugin] });
    const b = new LilacEditor({ container: containerB, toolbar: { show: true }, plugins: [] });
    editors.push(a, b);

    expect(containerA.querySelectorAll('.lilac-toolbar__button--plugin')).toHaveLength(1);
    // b asked for no plugins, so it should render no plugin buttons.
    expect(containerB.querySelectorAll('.lilac-toolbar__button--plugin')).toHaveLength(0);
  });
});

describe('#11 maxLength must apply in rich-text mode', () => {
  it('counts visible text rather than markup', () => {
    const editor = mount({ toolbar: { show: true }, maxLength: 500 });
    editor.setContent('<b>a</b>');

    const counter = container.querySelector('.lilac-editor__char-count')!;
    // One visible character, not the seven characters of "<b>a</b>".
    expect(counter.textContent?.trim()).toBe('1/500');
  });
});

describe('#9 content from outside must be sanitized', () => {
  it('strips event handler attributes passed to setContent', () => {
    const editor = mount({ toolbar: { show: true } });
    editor.setContent('<img src=x onerror="alert(1)">');

    expect(container.querySelector('.lilac-editor__content')!.innerHTML).not.toContain('onerror');
  });
});
