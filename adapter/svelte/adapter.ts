// Lilac Svelte Adapter
//
// Exposes the editor as a Svelte *action* rather than a component. An action is
// a plain function, so this package needs no Svelte compiler in its build and
// works identically in Svelte 4 and 5 (where the component authoring API
// changed). Use it with `use:lilac`:
//
//   <script>
//     import { lilac } from '@lilac-wysiwyg/svelte';
//     let content = '<p>Hello!</p>';
//   </script>
//
//   <div use:lilac={{ value: content, onChange: (c) => (content = c) }} />

import { LilacEditor, type EditorRef } from '@lilac-wysiwyg/core';
import type { EditorPlugin, EditorProps, SelectionRange, ToolbarConfig } from '@lilac-wysiwyg/core';

/** Options accepted by the `lilac` action. */
export interface LilacEditorProps {
  /** Editor content. Changing it updates the editor. */
  value?: string;
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Whether the editor is read-only. Changing it updates the editor. */
  readOnly?: boolean;
  /** Toolbar configuration. `true` uses the default tool set. */
  toolbar?: ToolbarConfig | boolean;
  /** Initial content (alias for value) */
  initialContent?: string;
  /** CSS class name */
  className?: string;
  /** Minimum height in pixels */
  minHeight?: number;
  /** Maximum height in pixels */
  maxHeight?: number;
  /** Theme for the editor */
  theme?: 'light' | 'dark' | 'auto';
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** Plugins to use */
  plugins?: EditorPlugin[];
  /** Callback when content changes */
  onChange?: (content: string) => void;
  /** Callback when editor is focused */
  onFocus?: () => void;
  /** Callback when editor loses focus */
  onBlur?: () => void;
  /** Callback when selection changes */
  onSelectionChange?: (selection: SelectionRange | null) => void;
}

const DEFAULT_TOOLS: ToolbarConfig = {
  show: true,
  tools: [
    'bold', 'italic', 'underline', 'strikethrough', 'separator',
    'heading1', 'heading2', 'paragraph', 'separator',
    'bulletList', 'orderedList', 'separator',
    'blockquote', 'codeBlock', 'separator',
    'link', 'image',
  ],
};

function resolveToolbar(toolbar: LilacEditorProps['toolbar']): ToolbarConfig | undefined {
  if (toolbar === true || toolbar === undefined) return DEFAULT_TOOLS;
  if (toolbar === false) return undefined;
  return toolbar;
}

/** What a Svelte action returns. Structural, so no svelte import is needed. */
export interface ActionReturn<P> {
  update?: (params: P) => void;
  destroy?: () => void;
}

/**
 * Svelte action that mounts a Lilac editor into the node it is applied to.
 *
 * Callbacks are read from the latest params on every invocation, so handlers
 * that close over component state stay current.
 */
export function lilac(node: HTMLElement, params: LilacEditorProps = {}): ActionReturn<LilacEditorProps> {
  let current = params;

  const editorProps: EditorProps = {
    container: node,
    initialContent: current.value !== undefined ? current.value : (current.initialContent || ''),
    placeholder: current.placeholder,
    readOnly: current.readOnly,
    autoFocus: current.autoFocus,
    minHeight: current.minHeight,
    maxHeight: current.maxHeight,
    theme: current.theme,
    className: current.className,
    plugins: current.plugins,
    toolbar: resolveToolbar(current.toolbar),
    onChange: (content) => current.onChange?.(content),
    onFocus: () => current.onFocus?.(),
    onBlur: () => current.onBlur?.(),
    onSelectionChange: (selection) => current.onSelectionChange?.(selection),
  };

  const editor = new LilacEditor(editorProps);

  return {
    update(next: LilacEditorProps) {
      const previous = current;
      current = next;

      if (next.value !== undefined && next.value !== editor.getContent()) {
        editor.setContent(next.value);
      }
      if (next.readOnly !== previous.readOnly) {
        editor.setReadOnly(!!next.readOnly);
      }
    },
    destroy() {
      editor.destroy();
    },
  };
}

/**
 * Small store around an editor instance, for callers who prefer a store to the
 * action's callbacks. Bind it with `store.bindEditor(...)`.
 */
export function createLilacStore(initialContent = '') {
  let content = initialContent;
  let editor: EditorRef | null = null;

  return {
    get content() {
      return content;
    },
    set content(value: string) {
      content = value;
      editor?.setContent(value);
    },

    get canUndo() {
      return editor?.canUndo ?? false;
    },
    get canRedo() {
      return editor?.canRedo ?? false;
    },

    bindEditor(editorRef: EditorRef) {
      editor = editorRef;
    },

    undo() {
      editor?.undo();
      if (editor) content = editor.getContent();
    },

    redo() {
      editor?.redo();
      if (editor) content = editor.getContent();
    },
  };
}

/**
 * Create a Svelte adapter for the Lilac editor.
 */
export function createSvelteAdapter() {
  return {
    name: 'svelte',
    version: '0.5.0',
    action: lilac,
    createStore: createLilacStore,
  };
}

export { LilacEditor };
export type { EditorRef };

export default createSvelteAdapter();
