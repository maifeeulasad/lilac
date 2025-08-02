import React, { forwardRef, useImperativeHandle, useEffect, useRef } from 'react';
import { useEditorState } from '@/hooks';
import { cn } from '@/utils';
import type { EditorProps } from '@/types';
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
  const lastContentRef = useRef<string>('');
  
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
    ...(onChange && { onChange }),
    ...(onSelectionChange && { onSelectionChange }),
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

  // Initialize content on first render only
  React.useEffect(() => {
    if (editorRef.current && initialContent && !lastContentRef.current) {
      editorRef.current.textContent = initialContent;
      lastContentRef.current = initialContent;
    }
  }, [initialContent]);

  // Update content when changed externally (like undo/redo) but preserve cursor
  React.useEffect(() => {
    if (editorRef.current && state.content !== lastContentRef.current) {
      const currentContent = editorRef.current.textContent || '';
      
      // Only update if content actually differs from DOM
      if (currentContent !== state.content) {
        // Save cursor position
        const selection = window.getSelection();
        let cursorPos = 0;
        
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          cursorPos = range.startOffset;
        }
        
        // Update content
        editorRef.current.textContent = state.content;
        lastContentRef.current = state.content;
        
        // Restore cursor position
        if (selection && state.content) {
          try {
            const textNode = editorRef.current.firstChild || editorRef.current;
            const range = document.createRange();
            const maxPos = state.content.length;
            const safePos = Math.min(cursorPos, maxPos);
            
            if (textNode.nodeType === Node.TEXT_NODE) {
              range.setStart(textNode, safePos);
              range.setEnd(textNode, safePos);
            } else {
              range.setStart(textNode, 0);
              range.setEnd(textNode, 0);
            }
            
            selection.removeAllRanges();
            selection.addRange(range);
          } catch (e) {
            // If cursor restoration fails, just place it at the end
            editorRef.current.focus();
          }
        }
      }
    }
  }, [state.content]);

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    getContent: () => state.content,
    setContent: (content: string) => {
      updateContent(content);
      if (editorRef.current) {
        editorRef.current.textContent = content;
        lastContentRef.current = content;
      }
    },
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
      // Restore previous content
      target.textContent = lastContentRef.current;
      return;
    }

    // Update our tracking ref
    lastContentRef.current = newContent;
    
    // Update state without causing re-render of DOM content
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
        />
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
