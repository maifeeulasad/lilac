// Lilac SolidJS Adapter
//
// Solid compiles JSX with its own Babel plugin, so this package avoids JSX
// entirely: the component builds its own container element and returns it (Solid
// renders returned DOM nodes as-is), and reactivity comes from Solid primitives.
// That keeps the build `tsc`-only, exactly like the other adapters.
//
//   import { LilacEditor } from '@lilac-wysiwyg/solid';
//
//   <LilacEditor value={content()} onChange={setContent} toolbar />

import { createEffect, onCleanup, onMount } from 'solid-js';
import { LilacEditor as LilacCore } from '@lilac-wysiwyg/core';
import type {
  EditorPlugin,
  EditorProps,
  EditorRef,
  SelectionRange,
  ToolbarConfig,
} from '@lilac-wysiwyg/core';

/** Props for the Solid `LilacEditor` component. */
export interface LilacEditorProps {
  /** Editor content. Changing it updates the editor. */
  value?: string;
  /** Initial content (alias for `value`). */
  initialContent?: string;
  /** Callback when content changes. */
  onChange?: (content: string) => void;
  /** Placeholder text when the editor is empty. Applied on mount only. */
  placeholder?: string;
  /** Whether the editor is read-only. Changing it updates the editor. */
  readOnly?: boolean;
  /** Toolbar configuration. `true` uses the default tool set. Mount only. */
  toolbar?: ToolbarConfig | boolean;
  /** CSS class name. Applied on mount only. */
  className?: string;
  /** Minimum height in pixels. Applied on mount only. */
  minHeight?: number;
  /** Maximum height in pixels. Applied on mount only. */
  maxHeight?: number;
  /** Theme for the editor. Applied on mount only. */
  theme?: 'light' | 'dark' | 'auto';
  /** Auto focus on mount. */
  autoFocus?: boolean;
  /** Plugins to use. Applied on mount only. */
  plugins?: EditorPlugin[];
  /** Callback when the editor is focused. */
  onFocus?: () => void;
  /** Callback when the editor loses focus. */
  onBlur?: () => void;
  /** Callback when the selection changes. */
  onSelectionChange?: (selection: SelectionRange | null) => void;
}

/** The default toolbar, shared by every Lilac adapter. */
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

function resolveToolbar(toolbar: ToolbarConfig | boolean | undefined): ToolbarConfig | undefined {
  if (toolbar === true) return DEFAULT_TOOLS;
  if (typeof toolbar === 'object') return toolbar;
  return undefined;
}

/**
 * Solid component wrapper for the Lilac WYSIWYG editor.
 *
 * `value` and `readOnly` react to changes; the remaining configuration props are
 * read once on mount, since the editor builds its DOM in the constructor and
 * rebuilding it would discard the undo history and caret.
 */
export function LilacEditor(props: LilacEditorProps) {
  const container = document.createElement('div');
  container.className = `lilac-solid-editor ${props.className ?? ''}`.trim();
  container.setAttribute('data-testid', 'lilac-solid-editor');

  let editor: EditorRef | null = null;

  onMount(() => {
    const editorProps: EditorProps = {
      container,
      initialContent: props.value !== undefined ? props.value : (props.initialContent ?? ''),
      placeholder: props.placeholder ?? 'Start writing...',
      readOnly: props.readOnly ?? false,
      autoFocus: props.autoFocus ?? false,
      minHeight: props.minHeight ?? 200,
      maxHeight: props.maxHeight ?? 600,
      theme: props.theme ?? 'light',
      className: props.className ?? '',
      plugins: props.plugins,
      toolbar: resolveToolbar(props.toolbar),
      onChange: (content) => props.onChange?.(content),
      onFocus: () => props.onFocus?.(),
      onBlur: () => props.onBlur?.(),
      onSelectionChange: (selection) => props.onSelectionChange?.(selection),
    };
    editor = new LilacCore(editorProps);
  });

  // Reactive updates: Solid re-runs these whenever the tracked prop changes.
  createEffect(() => {
    const next = props.value;
    if (editor && next !== undefined && next !== editor.getContent()) {
      editor.setContent(next);
    }
  });

  createEffect(() => {
    if (editor) editor.setReadOnly(props.readOnly ?? false);
  });

  onCleanup(() => {
    editor?.destroy();
    editor = null;
  });

  return container;
}

/**
 * Solid directive form: `<div use:lilac={{ value, onChange }} />`.
 *
 * A directive is a plain function, so it needs no compiler beyond Solid's own
 * `use:` handling. Import it where you use it so the compiler keeps the binding.
 */
export function lilac(el: HTMLElement, value: () => LilacEditorProps): void {
  const props = value() ?? {};
  const editorProps: EditorProps = {
    container: el,
    initialContent: props.value !== undefined ? props.value : (props.initialContent ?? ''),
    placeholder: props.placeholder ?? 'Start writing...',
    readOnly: props.readOnly ?? false,
    autoFocus: props.autoFocus ?? false,
    minHeight: props.minHeight ?? 200,
    maxHeight: props.maxHeight ?? 600,
    theme: props.theme ?? 'light',
    className: props.className ?? '',
    plugins: props.plugins,
    toolbar: resolveToolbar(props.toolbar),
    onChange: (content) => props.onChange?.(content),
    onFocus: () => props.onFocus?.(),
    onBlur: () => props.onBlur?.(),
    onSelectionChange: (selection) => props.onSelectionChange?.(selection),
  };
  const editor = new LilacCore(editorProps);
  onCleanup(() => editor.destroy());
}

/** Create a Solid adapter descriptor for the Lilac editor. */
export function createSolidAdapter() {
  return {
    name: 'solid',
    version: '0.5.0',
    component: LilacEditor,
  };
}

export { LilacCore as LilacEditorCore };
export default LilacEditor;
