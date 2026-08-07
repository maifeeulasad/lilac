// Lilac Core - Framework-agnostic WYSIWYG editor core
// This module exports the core functionality without UI dependencies

export * from './plugins/index.js';
export * from './types/index.js';

// Re-export formatting utilities
export {
  cn,
  debounce, escapeHtml, executeFormatCommand, extractTextFromHtml, formatCommands, getActiveFormats, getShortcutKey, insertImage, insertLink, isFormatActive, isValidUrl, keyboardShortcuts, sanitizeHtml, throttle
} from './utils/formatting.js';

// HTML sanitization
export { isSafeUrl, sanitizeContent } from './utils/sanitize.js';

// CSS injection helper - UI instructions for consistent styling
export { injectStyles } from './utils/styles.js';

// Export Editor class for direct usage
export { LilacEditor } from './components/Editor.js';
export type { EditorRef } from './components/Editor.js';
export { Toolbar } from './components/Toolbar.js';

