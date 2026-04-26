// Lilac React Adapter
// Provides React component wrapper for Lilac editor

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { LilacEditor, type EditorRef } from '../../core/components/Editor';
import type { EditorProps, ToolbarConfig } from '../../core/types/index';

/**
 * Props for the LilacEditor React component
 */
export interface LilacEditorProps extends Omit<EditorProps, 'container'> {
  /** Initial content for the editor */
  value?: string;
  /** Callback when content changes */
  onChange?: (content: string) => void;
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Whether the editor is read-only */
  readOnly?: boolean;
  /** Toolbar configuration */
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
 * React component wrapper for Lilac WYSIWYG editor
 */
const LilacEditorComponent = forwardRef<LilacEditorHandle, LilacEditorProps>(
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
      ...rest
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<EditorRef | null>(null);
    const [isReady, setIsReady] = useState(false);

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
        onChange: (newContent) => {
          onChange?.(newContent);
        },
        onFocus: () => {
          onFocus?.();
        },
        onBlur: () => {
          onBlur?.();
        },
        onSelectionChange: (selection) => {
          onSelectionChange?.(selection);
        },
      };

      editorRef.current = new LilacEditor(editorProps);
      setIsReady(true);

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
    version: '0.4.0',
    component: LilacEditorComponent,
  };
}

export { LilacEditorComponent as LilacEditor };
export type { LilacEditorHandle, LilacEditorProps };
export default LilacEditorComponent;
