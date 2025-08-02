import { useCallback, useRef, useState, useEffect } from 'react';
import type { EditorState, SelectionRange, HistoryState } from '@/types';

interface UseEditorStateProps {
  initialContent?: string;
  maxHistorySize?: number;
  onChange?: (content: string) => void;
  onSelectionChange?: (selection: SelectionRange | null) => void;
}

export const useEditorState = (props: UseEditorStateProps = {}) => {
  const {
    initialContent = '',
    maxHistorySize = 50,
    onChange,
    onSelectionChange,
  } = props;
  const [state, setState] = useState<EditorState>(() => ({
    content: initialContent,
    selection: null,
    history: {
      undoStack: [],
      redoStack: [],
      maxHistorySize,
    },
    isReadOnly: false,
  }));

  const editorRef = useRef<HTMLDivElement>(null);

  const updateContent = useCallback((newContent: string, addToHistory = true) => {
    setState(prevState => {
      const newHistory: HistoryState = addToHistory
        ? {
            ...prevState.history,
            undoStack: [
              ...prevState.history.undoStack.slice(-(maxHistorySize - 1)),
              prevState.content,
            ],
            redoStack: [], // Clear redo stack when new content is added
          }
        : prevState.history;

      return {
        ...prevState,
        content: newContent,
        history: newHistory,
      };
    });

    onChange?.(newContent);
  }, [maxHistorySize, onChange]);

  const updateSelection = useCallback((selection: SelectionRange | null) => {
    setState(prevState => ({
      ...prevState,
      selection,
    }));
    onSelectionChange?.(selection);
  }, [onSelectionChange]);

  const undo = useCallback(() => {
    setState(prevState => {
      const { undoStack, redoStack } = prevState.history;
      if (undoStack.length === 0) return prevState;

      const previousContent = undoStack[undoStack.length - 1] || '';
      const newUndoStack = undoStack.slice(0, -1);
      const newRedoStack = [...redoStack, prevState.content];

      const newState = {
        ...prevState,
        content: previousContent,
        history: {
          ...prevState.history,
          undoStack: newUndoStack,
          redoStack: newRedoStack,
        },
      };

      onChange?.(previousContent);
      return newState;
    });
  }, [onChange]);

  const redo = useCallback(() => {
    setState(prevState => {
      const { undoStack, redoStack } = prevState.history;
      if (redoStack.length === 0) return prevState;

      const nextContent = redoStack[redoStack.length - 1] || '';
      const newRedoStack = redoStack.slice(0, -1);
      const newUndoStack = [...undoStack, prevState.content];

      const newState = {
        ...prevState,
        content: nextContent,
        history: {
          ...prevState.history,
          undoStack: newUndoStack,
          redoStack: newRedoStack,
        },
      };

      onChange?.(nextContent);
      return newState;
    });
  }, [onChange]);

  const canUndo = state.history.undoStack.length > 0;
  const canRedo = state.history.redoStack.length > 0;

  const setReadOnly = useCallback((readOnly: boolean) => {
    setState(prevState => ({
      ...prevState,
      isReadOnly: readOnly,
    }));
  }, []);

  // Handle selection changes
  useEffect(() => {
    const handleSelectionChange = () => {
      if (!editorRef.current) return;

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        updateSelection(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const editorEl = editorRef.current;

      // Check if selection is within our editor
      if (!editorEl.contains(range.commonAncestorContainer)) {
        updateSelection(null);
        return;
      }

      // Calculate character positions
      const startOffset = getTextOffset(editorEl, range.startContainer, range.startOffset);
      const endOffset = getTextOffset(editorEl, range.endContainer, range.endOffset);

      updateSelection({
        start: Math.min(startOffset, endOffset),
        end: Math.max(startOffset, endOffset),
      });
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [updateSelection]);

  return {
    state,
    editorRef,
    updateContent,
    updateSelection,
    undo,
    redo,
    canUndo,
    canRedo,
    setReadOnly,
  };
};

// Helper function to calculate text offset within an element
function getTextOffset(root: Node, container: Node, offset: number): number {
  let textOffset = 0;
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    null,
  );

  let currentNode;
  while ((currentNode = walker.nextNode())) {
    if (currentNode === container) {
      return textOffset + offset;
    }
    textOffset += currentNode.textContent?.length || 0;
  }

  return textOffset;
}
