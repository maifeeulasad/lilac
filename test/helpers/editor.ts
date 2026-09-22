// Shared mounting harness for editor tests.
//
// The existing suites each carry their own copy of this; new suites use this
// one so mounting, execCommand stubbing and teardown stay in lockstep.

import { vi } from 'vitest';
import { LilacEditor } from '../../core/components/Editor';
import type { EditorProps } from '../../core/types/index';
import { serializeLilac, lilacAriaSnapshot } from './serialize';

export interface EditorHarness {
  container: HTMLElement;
  editor: LilacEditor;
  root: HTMLElement;
  content: HTMLElement;
  /** Destroy the editor and remove fixtures from the DOM. */
  cleanup: () => void;
  /** The canonical HTML of the whole `.lilac-editor` shell. */
  shell: (opts?: Parameters<typeof serializeLilac>[1]) => string;
  /** The canonical HTML of the editable region's markup. */
  markup: (opts?: Parameters<typeof serializeLilac>[1]) => string;
  /** The canonical accessibility tree of the editor shell. */
  aria: () => string;
}

let activeEditors: LilacEditor[] = [];

/**
 * Mount a fresh editor in a fresh container. `execCommand` is stubbed to report
 * success (jsdom has no implementation); real command semantics are covered by
 * the browser suite. Returns helpers for assertions.
 */
export function mountEditor(props: Partial<EditorProps> = {}): EditorHarness {
  Object.defineProperty(document, 'execCommand', {
    value: vi.fn(() => true),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(document, 'queryCommandState', {
    value: vi.fn(() => false),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(document, 'queryCommandValue', {
    value: vi.fn(() => ''),
    writable: true,
    configurable: true,
  });

  const container = document.createElement('div');
  document.body.appendChild(container);

  const editor = new LilacEditor({ container, ...props });
  activeEditors.push(editor);

  const root = container.querySelector('.lilac-editor') as HTMLElement;
  const content = container.querySelector('.lilac-editor__content') as HTMLElement;

  return {
    container,
    editor,
    root,
    content,
    cleanup: () => {
      while (activeEditors.length) activeEditors.pop()!.destroy();
      container.remove();
      document.body.innerHTML = '';
    },
    shell: (opts) => serializeLilac(root, opts),
    markup: (opts) => serializeLilac(content, opts),
    aria: () => lilacAriaSnapshot(root),
  };
}

/** Text selection helper: select the text `needle` inside the editor content. */
export function selectText(content: HTMLElement, needle: string): void {
  const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode() as Text | null;
  while (node) {
    const index = node.data.indexOf(needle);
    if (index !== -1) {
      const range = document.createRange();
      range.setStart(node, index);
      range.setEnd(node, index + needle.length);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      return;
    }
    node = walker.nextNode() as Text | null;
  }
  throw new Error(`selectText: "${needle}" not found in editor content`);
}