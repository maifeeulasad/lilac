// Core types for the Lilac editor
import type { CSSProperties } from 'react';
import type { EditorPlugin } from './plugin';

export interface EditorState {
  content: string;
  selection: SelectionRange | null;
  history: HistoryState;
  isReadOnly: boolean;
}

export interface SelectionRange {
  start: number;
  end: number;
}

export interface HistoryState {
  undoStack: string[];
  redoStack: string[];
  maxHistorySize: number;
}

export interface EditorConfig {
  placeholder?: string;
  readOnly?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
  style?: CSSProperties;
}

export interface ToolbarConfig {
  show?: boolean;
  tools?: ToolbarTool[];
  position?: 'top' | 'bottom' | 'floating';
}

export type ToolbarTool = 
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'paragraph'
  | 'bulletList'
  | 'orderedList'
  | 'blockquote'
  | 'codeBlock'
  | 'link'
  | 'image'
  | 'separator';

export interface EditorProps extends EditorConfig {
  initialContent?: string;
  onChange?: (content: string) => void;
  onSelectionChange?: (selection: SelectionRange | null) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  toolbar?: ToolbarConfig;
  plugins?: EditorPlugin[];
}
