// Main entry point for the Lilac Editor library
export { Editor } from './components';
export type { EditorRef } from './components';
export type { 
  EditorProps, 
  EditorState, 
  EditorConfig, 
  ToolbarConfig, 
  ToolbarTool,
  SelectionRange,
  HistoryState
} from './types';
export { useEditorState } from './hooks';
export { cn, debounce, throttle, isValidUrl, sanitizeHtml, extractTextFromHtml } from './utils';
