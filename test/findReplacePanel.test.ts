import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LilacEditor } from '../core/components/Editor';
import type { EditorProps } from '../core/types/index';

beforeEach(() => {
  Object.defineProperty(document, 'execCommand', {
    value: vi.fn(() => true),
    writable: true,
    configurable: true,
  });
});

let container: HTMLElement;
const editors: LilacEditor[] = [];

function mount(props: Partial<EditorProps> = {}): LilacEditor {
  const editor = new LilacEditor({ container, toolbar: { show: true }, ...props });
  editors.push(editor);
  return editor;
}

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  while (editors.length) editors.pop()!.destroy();
  container.remove();
  document.body.innerHTML = '';
});

function panel() {
  return container.querySelector('.lilac-find') as HTMLElement | null;
}
function findInput() {
  return container.querySelectorAll('.lilac-find__input')[0] as HTMLInputElement;
}
function replaceInput() {
  return container.querySelectorAll('.lilac-find__input')[1] as HTMLInputElement;
}
function type(input: HTMLInputElement, value: string) {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}
function clickByTitle(title: string) {
  const btn = container.querySelector(`.lilac-find [title="${title}"]`) as HTMLButtonElement;
  btn.click();
}

describe('find & replace panel', () => {
  it('is not created until the editor is searched', () => {
    mount();
    expect(panel()).toBeNull();
  });

  it('opens with Ctrl+F', () => {
    const editor = mount();
    editor.setContent('<p>hello world</p>');
    const content = container.querySelector('.lilac-editor__content') as HTMLElement;
    content.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', ctrlKey: true, bubbles: true }));
    expect(panel()).not.toBeNull();
    expect(panel()!.hidden).toBe(false);
  });

  it('reports the match count for the query', () => {
    const editor = mount();
    editor.setContent('<p>the cat sat on the mat</p>');
    editor.openFind();
    type(findInput(), 'at');
    expect(container.querySelector('.lilac-find__count')!.textContent).toBe('1/3');
  });

  it('replaces all matches and syncs content + onChange', () => {
    const onChange = vi.fn();
    const editor = mount({ onChange });
    editor.setContent('<p>cat cat cat</p>');
    editor.openFind();
    type(findInput(), 'cat');
    type(replaceInput(), 'dog');
    clickByTitle('Replace all matches');
    expect(editor.getContent()).toContain('dog dog dog');
    expect(editor.getContent()).not.toContain('cat');
    expect(onChange).toHaveBeenCalled();
  });

  it('respects the whole-word toggle', () => {
    const editor = mount();
    editor.setContent('<p>cat category cats</p>');
    editor.openFind();
    type(findInput(), 'cat');
    expect(container.querySelector('.lilac-find__count')!.textContent).toBe('1/3');
    clickByTitle('Whole word');
    expect(container.querySelector('.lilac-find__count')!.textContent).toBe('1/1');
  });

  it('closes with Escape', () => {
    const editor = mount();
    editor.setContent('<p>hello</p>');
    editor.openFind();
    expect(panel()!.hidden).toBe(false);
    panel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(panel()!.hidden).toBe(true);
  });
});
