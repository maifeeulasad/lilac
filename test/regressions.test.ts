// Regression tests for the bugs filed as issues.
//
// These target behavior fixed in separate branches. Each is marked `.fails`
// where the bug is still present on main, so the suite stays green *and* the
// assertion is real: when the corresponding PR lands, vitest reports the test
// as unexpectedly passing and it should be flipped to a plain `it`.

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
  it.fails('detaches its selectionchange listener', () => {
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
  it.fails('does not give a second editor the first editor\'s plugin buttons', () => {
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
  it.fails('counts visible text rather than markup', () => {
    const editor = mount({ toolbar: { show: true }, maxLength: 500 });
    editor.setContent('<b>a</b>');

    const counter = container.querySelector('.lilac-editor__char-count')!;
    // One visible character, not the seven characters of "<b>a</b>".
    expect(counter.textContent?.trim()).toBe('1/500');
  });
});

describe('#9 content from outside must be sanitized', () => {
  it.fails('strips event handler attributes passed to setContent', () => {
    const editor = mount({ toolbar: { show: true } });
    editor.setContent('<img src=x onerror="alert(1)">');

    expect(container.querySelector('.lilac-editor__content')!.innerHTML).not.toContain('onerror');
  });
});
