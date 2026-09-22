// Lilac Qwik Adapter
//
// A Qwik component that mounts the editor in a client-only visible task (the
// editor touches the DOM, so it never runs during SSR). The editor instance is
// non-serializable, so it is held via noSerialize(); value and readOnly are
// tracked in their own tasks so a change updates the editor without rebuilding
// it.
//
// Event handlers are QRLs (onChange$, onFocus$, ...), matching Qwik's
// convention.
//
// NOTE: this package builds with `tsc` like the other adapters. For full
// resumability, consume it from an app built with the Qwik optimizer.
//
//   import { LilacEditor } from '@lilac-wysiwyg/qwik';
//
//   <LilacEditor value={content.value} onChange$={(c) => (content.value = c)} toolbar />

import {
  component$,
  noSerialize,
  useSignal,
  useVisibleTask$,
  type NoSerialize,
  type QRL,
} from '@builder.io/qwik';
import { LilacEditor as LilacCore } from '@lilac-wysiwyg/core';
import type { EditorPlugin, EditorProps, EditorRef, SelectionRange, ToolbarConfig } from '@lilac-wysiwyg/core';

/** Props for the Qwik `LilacEditor` component. */
export interface LilacEditorProps {
  /** Editor content. Changing it updates the editor. */
  value?: string;
  /** Initial content (alias for `value`). */
  initialContent?: string;
  /** Placeholder text when the editor is empty. Applied on mount only. */
  placeholder?: string;
  /** Whether the editor is read-only. Changing it updates the editor. */
  readOnly?: boolean;
  /** Toolbar configuration. `true` uses the default tool set. Mount only. */
  toolbar?: ToolbarConfig | boolean;
  /** CSS class name. Applied on mount only. */
  class?: string;
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
  /** Called when content changes. */
  onChange$?: QRL<(content: string) => void>;
  /** Called when the editor is focused. */
  onFocus$?: QRL<() => void>;
  /** Called when the editor loses focus. */
  onBlur$?: QRL<() => void>;
  /** Called when the selection changes. */
  onSelectionChange$?: QRL<(selection: SelectionRange | null) => void>;
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

/** Qwik component wrapper for the Lilac WYSIWYG editor. */
export const LilacEditor = component$<LilacEditorProps>((props) => {
  const hostRef = useSignal<HTMLDivElement>();
  const editorRef = useSignal<NoSerialize<EditorRef>>();

  // eslint-disable-next-line qwik/no-use-visible-task -- the editor is a DOM widget
  useVisibleTask$(({ cleanup }) => {
    const el = hostRef.value;
    if (!el) return;

    let toolbarConfig: ToolbarConfig | undefined;
    if (props.toolbar === true) toolbarConfig = DEFAULT_TOOLS;
    else if (typeof props.toolbar === 'object') toolbarConfig = props.toolbar;

    const editorProps: EditorProps = {
      container: el,
      initialContent: props.value !== undefined ? props.value : (props.initialContent ?? ''),
      placeholder: props.placeholder ?? 'Start writing...',
      readOnly: props.readOnly ?? false,
      autoFocus: props.autoFocus ?? false,
      minHeight: props.minHeight ?? 200,
      maxHeight: props.maxHeight ?? 600,
      theme: props.theme ?? 'light',
      className: props.class ?? '',
      plugins: props.plugins,
      toolbar: toolbarConfig,
      onChange: (content) => { void props.onChange$?.(content); },
      onFocus: () => { void props.onFocus$?.(); },
      onBlur: () => { void props.onBlur$?.(); },
      onSelectionChange: (selection) => { void props.onSelectionChange$?.(selection); },
    };
    const editor = new LilacCore(editorProps);
    editorRef.value = noSerialize(editor);
    cleanup(() => editor.destroy());
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    const next = track(() => props.value);
    const editor = editorRef.value;
    if (editor && next !== undefined && next !== editor.getContent()) {
      editor.setContent(next);
    }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    const readOnly = track(() => props.readOnly);
    editorRef.value?.setReadOnly(readOnly ?? false);
  });

  return <div ref={hostRef} class={`lilac-qwik-editor ${props.class ?? ''}`.trim()} data-testid="lilac-qwik-editor" />;
});

/** Create a Qwik adapter descriptor for the Lilac editor. */
export function createQwikAdapter() {
  return {
    name: 'qwik',
    version: '0.5.0',
    component: LilacEditor,
  };
}

export default LilacEditor;
