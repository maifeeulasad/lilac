// Lilac Preact Adapter
//
// The same component shape as the React adapter, wired to Preact's hooks. tsc
// compiles the JSX directly (jsxImportSource: preact), so the build needs no
// extra tooling. forwardRef / useImperativeHandle come from preact/compat; the
// rest of the hooks from preact/hooks.
//
//   import { LilacEditor } from '@lilac-wysiwyg/preact';
//
//   <LilacEditor value={content} onChange={setContent} toolbar />

import { forwardRef, useImperativeHandle } from 'preact/compat';
import { useEffect, useRef } from 'preact/hooks';
import { LilacEditor as LilacCore } from '@lilac-wysiwyg/core';
import type { EditorProps, SelectionRange, ToolbarConfig } from '@lilac-wysiwyg/core';

/** Props for the Preact `LilacEditor` component. */
export interface LilacEditorProps extends Omit<EditorProps, 'container' | 'toolbar'> {
  /** Editor content. Updates the editor when it changes. */
  value?: string;
  /** Callback when content changes. */
  onChange?: (content: string) => void;
  /** Placeholder text when the editor is empty. Applied on mount only. */
  placeholder?: string;
  /** Whether the editor is read-only. Updates after mount. */
  readOnly?: boolean;
  /** Toolbar configuration. `true` uses the default tool set. Mount only. */
  toolbar?: ToolbarConfig | boolean;
  /** Initial content (alias for `value`). */
  initialContent?: string;
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
}

/** Ref methods exposed by the `LilacEditor` component. */
export interface LilacEditorHandle {
  getContent: () => string;
  setContent: (content: string) => void;
  focus: () => void;
  blur: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
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

/**
 * Preact component wrapper for the Lilac WYSIWYG editor.
 *
 * `value`, `readOnly` and the callback props react to changes; the remaining
 * configuration props are read once at construction. Change them by remounting
 * with a different `key`.
 */
export const LilacEditorComponent = forwardRef<LilacEditorHandle, LilacEditorProps>(
  (
    {
      value,
      onChange,
      placeholder = 'Start writing...',
      readOnly = false,
      toolbar,
      initialContent = '',
      className = '',
      minHeight = 200,
      maxHeight = 600,
      theme = 'light',
      autoFocus = false,
      plugins,
      onFocus,
      onBlur,
      onSelectionChange,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<LilacCore | null>(null);

    // The editor is constructed once; callbacks flow through this ref, refreshed
    // every render, so it always invokes the current handler.
    const handlersRef = useRef({ onChange, onFocus, onBlur, onSelectionChange });
    handlersRef.current = { onChange, onFocus, onBlur, onSelectionChange };

    const content = value !== undefined ? value : initialContent;

    useEffect(() => {
      if (!containerRef.current || editorRef.current) return;

      let toolbarConfig: ToolbarConfig | undefined;
      if (toolbar === true) toolbarConfig = DEFAULT_TOOLS;
      else if (typeof toolbar === 'object') toolbarConfig = toolbar;

      editorRef.current = new LilacCore({
        container: containerRef.current,
        initialContent: content,
        placeholder,
        readOnly,
        autoFocus,
        minHeight,
        maxHeight,
        theme,
        className,
        plugins,
        toolbar: toolbarConfig,
        onChange: (newContent: string) => handlersRef.current.onChange?.(newContent),
        onFocus: () => handlersRef.current.onFocus?.(),
        onBlur: () => handlersRef.current.onBlur?.(),
        onSelectionChange: (selection: SelectionRange | null) =>
          handlersRef.current.onSelectionChange?.(selection),
      });

      return () => {
        editorRef.current?.destroy();
        editorRef.current = null;
      };
    }, []);

    useEffect(() => {
      if (editorRef.current && content !== editorRef.current.getContent()) {
        editorRef.current.setContent(content);
      }
    }, [content]);

    useEffect(() => {
      editorRef.current?.setReadOnly(readOnly);
    }, [readOnly]);

    useImperativeHandle(ref, () => ({
      getContent: () => editorRef.current?.getContent() ?? '',
      setContent: (newContent: string) => editorRef.current?.setContent(newContent),
      focus: () => editorRef.current?.focus(),
      blur: () => editorRef.current?.blur(),
      undo: () => editorRef.current?.undo(),
      redo: () => editorRef.current?.redo(),
      get canUndo() {
        return editorRef.current?.canUndo ?? false;
      },
      get canRedo() {
        return editorRef.current?.canRedo ?? false;
      },
    }));

    return (
      <div
        ref={containerRef}
        className={`lilac-preact-editor ${className}`}
        data-testid="lilac-preact-editor"
      />
    );
  },
);

LilacEditorComponent.displayName = 'LilacEditor';

/** Create a Preact adapter descriptor for the Lilac editor. */
export function createPreactAdapter() {
  return {
    name: 'preact',
    version: '0.5.0',
    component: LilacEditorComponent,
  };
}

export { LilacEditorComponent as LilacEditor };
export default LilacEditorComponent;
