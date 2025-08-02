// Main entry point for the Lilac Editor library
export { Editor, Toolbar } from './components';
export type { EditorRef } from './components';
export { useEditorState } from './hooks';
export type {
  EditorConfig, EditorProps,
  EditorState, HistoryState, SelectionRange, ToolbarConfig,
  ToolbarTool
} from './types';
export { cn, debounce, executeFormatCommand, extractTextFromHtml, getActiveFormats, insertImage, insertLink, isValidUrl, sanitizeHtml, throttle } from './utils';

// Plugin System
export {
  emojiPlugin, PluginManager,
  pluginManager, tablePlugin, wordCountPlugin
} from './plugins';
export type {
  ContentTransformer, ContextMenuItem, EditorContext, EditorPanel, EditorPlugin, PluginManager as IPluginManager, KeyboardShortcut, ToolbarButton
} from './types/plugin';

