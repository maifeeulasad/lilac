import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LilacEditor } from '../core/components/Editor';
import type { EditorProps } from '../core/types/index';

// jsdom has no execCommand, and the editor calls it on every toolbar action.
// Stubbing it keeps those paths from throwing; whether the command produces the
// right markup is a browser question, not a jsdom one.
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
  const editor = new LilacEditor({ container, ...props });
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

describe('construction', () => {
  it('mounts into the container', () => {
    mount();
    expect(container.querySelector('.lilac-editor')).not.toBeNull();
    expect(container.querySelector('.lilac-editor__content')).not.toBeNull();
  });

  it('marks the content element as an accessible textbox', () => {
    mount();
    const content = container.querySelector('.lilac-editor__content')!;
    expect(content.getAttribute('role')).toBe('textbox');
    expect(content.getAttribute('aria-multiline')).toBe('true');
    expect((content as HTMLElement).contentEditable).toBe('true');
  });

  it('omits the toolbar unless asked', () => {
    mount();
    expect(container.querySelector('.lilac-toolbar')).toBeNull();
  });

  it('renders the toolbar when enabled', () => {
    mount({ toolbar: { show: true } });
    expect(container.querySelector('.lilac-toolbar')).not.toBeNull();
    expect(container.querySelectorAll('.lilac-toolbar__button').length).toBeGreaterThan(0);
  });

  it('shows the placeholder only while empty', () => {
    mount({ placeholder: 'Write here' });
    const placeholder = container.querySelector('.lilac-editor__placeholder') as HTMLElement;
    expect(placeholder.textContent).toBe('Write here');
    expect(placeholder.style.display).toBe('block');
  });

  it('hides the placeholder when constructed with content', () => {
    mount({ initialContent: 'hello' });
    const placeholder = container.querySelector('.lilac-editor__placeholder') as HTMLElement;
    expect(placeholder.style.display).toBe('none');
  });
});

describe('content', () => {
  it('round-trips plain text', () => {
    const editor = mount();
    editor.setContent('hello');
    expect(editor.getContent()).toBe('hello');
    expect(container.querySelector('.lilac-editor__content')!.textContent).toBe('hello');
  });

  it('round-trips html in rich-text mode', () => {
    const editor = mount({ toolbar: { show: true } });
    editor.setContent('<p>hi</p>');
    expect(editor.getContent()).toBe('<p>hi</p>');
    expect(container.querySelector('.lilac-editor__content')!.innerHTML).toBe('<p>hi</p>');
  });

  it('reports initialContent from getContent', () => {
    expect(mount({ initialContent: 'seed' }).getContent()).toBe('seed');
  });

  it('notifies onChange', () => {
    const onChange = vi.fn();
    mount({ onChange }).setContent('next');
    expect(onChange).toHaveBeenCalledWith('next');
  });
});

describe('history', () => {
  it('starts with nothing to undo or redo', () => {
    const editor = mount();
    expect(editor.canUndo).toBe(false);
    expect(editor.canRedo).toBe(false);
  });

  it('undoes back to the previous content', () => {
    const editor = mount({ initialContent: 'first' });
    editor.setContent('second');
    expect(editor.canUndo).toBe(true);

    editor.undo();
    expect(editor.getContent()).toBe('first');
  });

  it('redoes what was undone', () => {
    const editor = mount({ initialContent: 'first' });
    editor.setContent('second');
    editor.undo();
    expect(editor.canRedo).toBe(true);

    editor.redo();
    expect(editor.getContent()).toBe('second');
  });

  it('ignores undo when the stack is empty', () => {
    const editor = mount({ initialContent: 'only' });
    editor.undo();
    expect(editor.getContent()).toBe('only');
  });
});

describe('read-only', () => {
  it('starts editable', () => {
    mount();
    expect((container.querySelector('.lilac-editor__content') as HTMLElement).contentEditable).toBe('true');
  });

  it('toggles contenteditable and the modifier class', () => {
    const editor = mount();
    editor.setReadOnly(true);

    const content = container.querySelector('.lilac-editor__content')!;
    expect((content as HTMLElement).contentEditable).toBe('false');
    expect(container.querySelector('.lilac-editor')!.classList.contains('lilac-editor--readonly')).toBe(true);

    editor.setReadOnly(false);
    expect((content as HTMLElement).contentEditable).toBe('true');
  });

  it('disables toolbar buttons', () => {
    mount({ toolbar: { show: true } }).setReadOnly(true);
    const button = container.querySelector('.lilac-toolbar__button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});

describe('destroy', () => {
  it('removes the editor from the DOM', () => {
    const editor = mount();
    editor.destroy();
    expect(container.querySelector('.lilac-editor')).toBeNull();
  });

  it('runs the plugin unmount hook', () => {
    const onEditorUnmount = vi.fn();
    mount({ plugins: [{ id: 'p', name: 'P', version: '1.0.0', onEditorUnmount }] }).destroy();
    expect(onEditorUnmount).toHaveBeenCalled();
  });
});

describe('maxLength', () => {
  it('renders a character counter', () => {
    mount({ maxLength: 100 });
    expect(container.querySelector('.lilac-editor__char-count')).not.toBeNull();
  });

  it('omits the footer when unset', () => {
    mount();
    expect(container.querySelector('.lilac-editor__footer')).toBeNull();
  });
});
