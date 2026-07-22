// Lilac React Adapter
// Provides React component wrapper for Lilac editor

// todo: update w `@lilac-wysiwyg/core`
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { LilacEditor } from '@lilac-wysiwyg/core';
import type { EditorProps, SelectionRange, ToolbarConfig } from '@lilac-wysiwyg/core';

/**
 * Props for the LilacEditor React component
 */
export interface LilacEditorProps extends Omit<EditorProps, 'container' | 'toolbar'> {
  /** Initial content for the editor */
  value?: string;
  /** Callback when content changes */
  onChange?: (content: string) => void;
  /** Placeholder text when editor is empty. Applied on mount only. */
  placeholder?: string;
  /** Whether the editor is read-only. Updates after mount. */
  readOnly?: boolean;
  /** Toolbar configuration. Applied on mount only. */
  toolbar?: ToolbarConfig | boolean;
  /** Initial content (alias for value) */
  initialContent?: string;
  /** CSS class name. Applied on mount only. */
  className?: string;
  /** Minimum height in pixels. Applied on mount only. */
  minHeight?: number;
  /** Maximum height in pixels. Applied on mount only. */
  maxHeight?: number;
  /** Theme for the editor. Applied on mount only. */
  theme?: 'light' | 'dark' | 'auto';
  /** Auto focus on mount */
  autoFocus?: boolean;
}

/**
 * Ref methods exposed by the LilacEditor component
 */
export interface LilacEditorHandle {
  /** Get current editor content */
  getContent: () => string;
  /** Set editor content */
  setContent: (content: string) => void;
  /** Focus the editor */
  focus: () => void;
  /** Blur the editor */
  blur: () => void;
  /** Undo last change */
  undo: () => void;
  /** Redo last undone change */
  redo: () => void;
  /** Check if undo is available */
  canUndo: boolean;
  /** Check if redo is available */
  canRedo: boolean;
}

/**
 * React component wrapper for Lilac WYSIWYG editor.
 *
 * `value`, `readOnly` and the callback props react to changes. The remaining
 * configuration props are read once at construction — the underlying editor
 * builds its DOM in the constructor, and rebuilding it on a prop change would
 * discard the undo history and the caret. Change them by remounting with a
 * different `key`.
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
      onSelectionChange
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<LilacEditor | null>(null);

    // The editor is constructed once, so anything it closes over would be
    // frozen at first render. Callbacks go through this ref instead, which is
    // refreshed every render, so the editor always invokes the current one.
    const handlersRef = useRef({ onChange, onFocus, onBlur, onSelectionChange });
    handlersRef.current = { onChange, onFocus, onBlur, onSelectionChange };

    // Merge value and initialContent
    const content = value !== undefined ? value : initialContent;

    // Initialize editor
    useEffect(() => {
      if (!containerRef.current || editorRef.current) return;

      const container = containerRef.current;

      // Determine toolbar config
      let toolbarConfig: ToolbarConfig | undefined;
      if (toolbar === true) {
        toolbarConfig = {
          show: true,
          tools: [
            'bold',
            'italic',
            'underline',
            'strikethrough',
            'separator',
            'heading1',
            'heading2',
            'paragraph',
            'separator',
            'bulletList',
            'orderedList',
            'separator',
            'blockquote',
            'codeBlock',
            'separator',
            'link',
            'image',
          ],
        };
      } else if (typeof toolbar === 'object') {
        toolbarConfig = toolbar;
      }

      const editorProps: EditorProps = {
        container,
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
        onChange: (newContent: string) => {
          handlersRef.current.onChange?.(newContent);
        },
        onFocus: () => {
          handlersRef.current.onFocus?.();
        },
        onBlur: () => {
          handlersRef.current.onBlur?.();
        },
        onSelectionChange: (selection: SelectionRange | null) => {
          handlersRef.current.onSelectionChange?.(selection);
        },
      };

      editorRef.current = new LilacEditor(editorProps);

      return () => {
        if (editorRef.current) {
          editorRef.current.destroy();
          editorRef.current = null;
        }
      };
    }, []);

    // Update content when value changes
    useEffect(() => {
      if (editorRef.current && content !== editorRef.current.getContent()) {
        editorRef.current.setContent(content);
      }
    }, [content]);

    // Update readOnly state
    useEffect(() => {
      if (editorRef.current) {
        editorRef.current.setReadOnly(readOnly);
      }
    }, [readOnly]);

    // Expose editor methods via ref
    useImperativeHandle(ref, () => ({
      getContent: () => editorRef.current?.getContent() ?? '',
      setContent: (newContent: string) => {
        editorRef.current?.setContent(newContent);
      },
      focus: () => {
        editorRef.current?.focus();
      },
      blur: () => {
        editorRef.current?.blur();
      },
      undo: () => {
        editorRef.current?.undo();
      },
      redo: () => {
        editorRef.current?.redo();
      },
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
        className={`lilac-react-editor ${className}`}
        data-testid="lilac-react-editor"
      />
    );
  }
);

LilacEditorComponent.displayName = 'LilacEditor';

/**
 * Create a React adapter for the Lilac editor
 */
export function createReactAdapter() {
  return {
    name: 'react',
    version: '0.5.0',
    component: LilacEditorComponent,
  };
}

export { LilacEditorComponent as LilacEditor };
export default LilacEditorComponent;
