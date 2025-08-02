// Main entry point for the Lilac Editor library
export { Editor } from './components';
export { Toolbar } from './components';
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
export { cn, debounce, throttle, isValidUrl, sanitizeHtml, extractTextFromHtml, executeFormatCommand, getActiveFormats, insertLink, insertImage } from './utils';

// Plugin System
export { 
  PluginManager, 
  pluginManager,
  emojiPlugin,
  wordCountPlugin,
  tablePlugin,
} from './plugins';
export type {
  EditorPlugin,
  EditorContext,
  ToolbarButton,
  ContextMenuItem,
  EditorPanel,
  KeyboardShortcut,
  ContentTransformer,
  PluginManager as IPluginManager
} from './types/plugin';
