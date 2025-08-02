import React, { forwardRef, useImperativeHandle } from 'react';
import { useEditorState } from '@/hooks';
import { cn } from '@/utils';
import type { EditorProps, EditorState } from '@/types';
import './Editor.css';

export interface EditorRef {
  getContent: () => string;
  setContent: (content: string) => void;
  focus: () => void;
  blur: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const Editor = forwardRef<EditorRef, EditorProps>(({
  initialContent = '',
  placeholder = 'Start writing...',
  readOnly = false,
  autoFocus = false,
  maxLength,
  theme = 'light',
  className,
  style,
  onChange,
  onSelectionChange,
  onFocus,
  onBlur,
  toolbar,
}, ref) => {
  const {
    state,
    editorRef,
    updateContent,
    undo,
    redo,
    canUndo,
    canRedo,
    setReadOnly,
  } = useEditorState({
    initialContent,
    onChange,
    onSelectionChange,
  });

  // Set read-only state when prop changes
  React.useEffect(() => {
    setReadOnly(readOnly);
  }, [readOnly, setReadOnly]);

  // Auto-focus if requested
  React.useEffect(() => {
    if (autoFocus && editorRef.current) {
      editorRef.current.focus();
    }
  }, [autoFocus]);

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    getContent: () => state.content,
    setContent: (content: string) => updateContent(content),
    focus: () => editorRef.current?.focus(),
    blur: () => editorRef.current?.blur(),
    undo,
    redo,
    canUndo,
    canRedo,
  }), [state.content, updateContent, undo, redo, canUndo, canRedo]);

  const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const newContent = target.textContent || '';
    
    // Check max length
    if (maxLength && newContent.length > maxLength) {
      return;
    }

    updateContent(newContent);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Handle shortcuts
    if (event.metaKey || event.ctrlKey) {
      switch (event.key) {
        case 'z':
          if (event.shiftKey) {
            event.preventDefault();
            redo();
          } else {
            event.preventDefault();
            undo();
          }
          break;
        case 'y':
          event.preventDefault();
          redo();
          break;
      }
    }
  };

  const handleFocus = () => {
    onFocus?.();
  };

  const handleBlur = () => {
    onBlur?.();
  };

  const isEmpty = !state.content.trim();
  const showPlaceholder = isEmpty && placeholder;

  return (
    <div 
      className={cn(
        'lilac-editor',
        `lilac-editor--${theme}`,
        {
          'lilac-editor--readonly': state.isReadOnly,
          'lilac-editor--empty': isEmpty,
        },
        className
      )}
      style={style}
    >
      {toolbar?.show && (
        <div className="lilac-editor__toolbar">
          {/* Toolbar will be implemented in a separate component */}
          <div className="lilac-editor__toolbar-placeholder">
            Toolbar coming soon...
          </div>
        </div>
      )}
      
      <div className="lilac-editor__content-wrapper">
        {showPlaceholder && (
          <div className="lilac-editor__placeholder">
            {placeholder}
          </div>
        )}
        
        <div
          ref={editorRef}
          className="lilac-editor__content"
          contentEditable={!state.isReadOnly}
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          role="textbox"
          aria-multiline="true"
          aria-label="Text editor"
          data-testid="lilac-editor-content"
        >
          {state.content}
        </div>
      </div>
      
      {maxLength && (
        <div className="lilac-editor__footer">
          <span className="lilac-editor__char-count">
            {state.content.length}{maxLength ? `/${maxLength}` : ''}
          </span>
        </div>
      )}
    </div>
  );
});

Editor.displayName = 'LilacEditor';
