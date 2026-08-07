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
function content() {
  return container.querySelector('.lilac-editor__content') as HTMLElement;
}
function dropFiles(el: HTMLElement, files: File[]) {
  const event = new Event('drop', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'dataTransfer', { value: { files } });
  el.dispatchEvent(event);
}
function pasteFiles(el: HTMLElement, files: File[]) {
  const event = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'clipboardData', { value: { files } });
  el.dispatchEvent(event);
}
const flush = () => new Promise((r) => setTimeout(r, 30));
const png = (bytes = 'x', name = 'p.png') => new File([bytes], name, { type: 'image/png' });

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});
afterEach(() => {
  while (editors.length) editors.pop()!.destroy();
  container.remove();
  document.body.innerHTML = '';
});

describe('image embedding', () => {
  it('embeds a dropped image via the upload hook', async () => {
    const onChange = vi.fn();
    mount({ onChange, onImageUpload: async () => 'https://cdn/x.png' });
    dropFiles(content(), [png()]);

    await vi.waitFor(() => expect(content().querySelector('img')).not.toBeNull());
    expect(content().querySelector('img')!.getAttribute('src')).toBe('https://cdn/x.png');
    expect(onChange).toHaveBeenCalled();
  });

  it('inlines a pasted image as a data URL by default', async () => {
    mount();
    pasteFiles(content(), [png('hello')]);

    await vi.waitFor(() => expect(content().querySelector('img')).not.toBeNull());
    expect(content().querySelector('img')!.getAttribute('src')).toMatch(/^data:image\/png;base64,/);
  });

  it('rejects images over maxImageSize', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mount({ maxImageSize: 2 });
    dropFiles(content(), [png('abcdef')]); // 6 bytes > 2
    await flush();

    expect(content().querySelector('img')).toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('ignores non-image drops', async () => {
    mount();
    dropFiles(content(), [new File(['x'], 'a.txt', { type: 'text/plain' })]);
    await flush();
    expect(content().querySelector('img')).toBeNull();
  });
});
