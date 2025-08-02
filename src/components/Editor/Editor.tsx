import React, { forwardRef, useImperativeHandle, useRef, useState, useCallback } from 'react';
import { useEditorState } from '@/hooks';
import { cn, executeFormatCommand, getActiveFormats, insertLink, insertImage, getShortcutKey, keyboardShortcuts } from '@/utils';
import { Toolbar } from '@/components/Toolbar';
import type { EditorProps, ToolbarTool } from '@/types';
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
  const [activeTools, setActiveTools] = useState<Set<ToolbarTool>>(new Set());
  
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

  // Update active formatting tools when selection changes
  const updateActiveTools = useCallback(() => {
    if (!editorRef.current || !toolbar?.tools) return;
    
    const tools = toolbar.tools.filter(tool => tool !== 'separator');
    const active = getActiveFormats(tools);
    setActiveTools(active);
  }, [toolbar?.tools]);

  // Handle toolbar tool clicks
  const handleToolClick = useCallback((tool: ToolbarTool) => {
    if (!editorRef.current) return;

    editorRef.current.focus();

    if (tool === 'link') {
      const url = prompt('Enter URL:');
      if (url) {
        insertLink(url);
        updateContentFromDOM();
      }
    } else if (tool === 'image') {
      const src = prompt('Enter image URL:');
      if (src) {
        insertImage(src);
        updateContentFromDOM();
      }
    } else {
      executeFormatCommand(tool);
      updateContentFromDOM();
    }

    // Update active tools after formatting
    setTimeout(updateActiveTools, 0);
  }, [updateActiveTools]);

  // Update content from DOM (for rich text formatting)
  const updateContentFromDOM = useCallback(() => {
    if (!editorRef.current) return;
    
    const newContent = editorRef.current.innerHTML || '';
    lastContentRef.current = newContent;
    updateContent(newContent);
  }, [updateContent]);

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
      // For rich text, use innerHTML instead of textContent
      if (toolbar?.show) {
        editorRef.current.innerHTML = initialContent;
      } else {
        editorRef.current.textContent = initialContent;
      }
      lastContentRef.current = initialContent;
    }
  }, [initialContent, toolbar?.show]);

  // Update content when changed externally (like undo/redo) but preserve cursor
  React.useEffect(() => {
    if (editorRef.current && state.content !== lastContentRef.current) {
      const currentContent = toolbar?.show ? 
        (editorRef.current.innerHTML || '') : 
        (editorRef.current.textContent || '');
      
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
        if (toolbar?.show) {
          editorRef.current.innerHTML = state.content;
        } else {
          editorRef.current.textContent = state.content;
        }
        lastContentRef.current = state.content;
        
        // Restore cursor position
        if (selection && state.content) {
          try {
            const textNode = editorRef.current.firstChild || editorRef.current;
            const range = document.createRange();
            const maxPos = toolbar?.show ? state.content.length : state.content.length;
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
        
        // Update active tools if toolbar is enabled
        if (toolbar?.show) {
          setTimeout(updateActiveTools, 0);
        }
      }
    }
  }, [state.content, toolbar?.show, updateActiveTools]);

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
    const newContent = toolbar?.show ? 
      (target.innerHTML || '') : 
      (target.textContent || '');
    
    // Check max length (for plain text mode only)
    if (maxLength && !toolbar?.show && newContent.length > maxLength) {
      // Restore previous content
      target.textContent = lastContentRef.current;
      return;
    }

    // Update our tracking ref
    lastContentRef.current = newContent;
    
    // Update state without causing re-render of DOM content
    updateContent(newContent);
    
    // Update active tools if toolbar is enabled
    if (toolbar?.show) {
      setTimeout(updateActiveTools, 0);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Handle formatting shortcuts if toolbar is enabled
    if (toolbar?.show) {
      const shortcutKey = getShortcutKey(event.nativeEvent);
      if (shortcutKey && keyboardShortcuts[shortcutKey]) {
        const tool = keyboardShortcuts[shortcutKey];
        event.preventDefault();
        handleToolClick(tool);
        return;
      }
    }

    // Handle editor shortcuts
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
    // Update active tools when editor gains focus
    if (toolbar?.show) {
      setTimeout(updateActiveTools, 0);
    }
  };

  const handleBlur = () => {
    onBlur?.();
  };

  const handleMouseUp = () => {
    // Update active tools when selection changes via mouse
    if (toolbar?.show) {
      setTimeout(updateActiveTools, 0);
    }
  };

  const handleKeyUp = () => {
    // Update active tools when selection changes via keyboard
    if (toolbar?.show) {
      setTimeout(updateActiveTools, 0);
    }
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
        <Toolbar
          {...(toolbar.tools ? { tools: toolbar.tools } : {})}
          onToolClick={handleToolClick}
          activeTools={activeTools}
          disabled={state.isReadOnly}
        />
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
          onKeyUp={handleKeyUp}
          onMouseUp={handleMouseUp}
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
