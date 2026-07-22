// Lilac Core - Framework-agnostic WYSIWYG editor core
// This module exports the core functionality without UI dependencies

export * from './plugins/index';
export * from './types/index';

// Re-export formatting utilities
export {
  cn,
  debounce, escapeHtml, executeFormatCommand, extractTextFromHtml, formatCommands, getActiveFormats, getShortcutKey, insertImage, insertLink, isFormatActive, isValidUrl, keyboardShortcuts, sanitizeHtml, throttle
} from './utils/formatting';

// HTML sanitization
export { isSafeUrl, sanitizeContent } from './utils/sanitize';

// CSS injection helper - UI instructions for consistent styling
export { injectStyles } from './utils/styles';

// Export Editor class for direct usage
export { LilacEditor } from './components/Editor';
export type { EditorRef } from './components/Editor';
export { Toolbar } from './components/Toolbar';

