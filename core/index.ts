// Lilac Core - Framework-agnostic WYSIWYG editor core
// This module exports the core functionality without UI dependencies

export * from './plugins/index';
export * from './types/index';

// Re-export formatting utilities
export {
  cn,
  debounce, executeFormatCommand, extractTextFromHtml, formatCommands, getActiveFormats, getShortcutKey, insertImage, insertLink, isFormatActive, isValidUrl, keyboardShortcuts, sanitizeHtml, throttle
} from './utils/formatting';

// CSS injection helper - UI instructions for consistent styling
export function injectStyles(): void {
  if (document.getElementById('lilac-editor-styles')) return;

  const style = document.createElement('style');
  style.id = 'lilac-editor-styles';
  style.textContent = `
/* Lilac Editor Styles - Clean, Modern, Calming */
/* UI Instructions - Keep UI consistent across all adapters */

.lilac-editor {
  --lilac-color-primary: #8b7cd8;
  --lilac-color-primary-light: #a898e8;
  --lilac-color-primary-dark: #6d5ac8;
  --lilac-color-background: #ffffff;
  --lilac-color-surface: #f8f9fb;
  --lilac-color-border: #e1e5e9;
  --lilac-color-border-focus: #8b7cd8;
  --lilac-color-text: #2c3e50;
  --lilac-color-text-muted: #64748b;
  --lilac-color-text-placeholder: #9ca3af;
  --lilac-color-hover: rgba(0, 0, 0, 0.05);
  --lilac-border-radius: 12px;
  --lilac-border-radius-small: 8px;
  --lilac-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  --lilac-shadow-focus: 0 0 0 3px rgba(139, 124, 216, 0.1);
  --lilac-transition: all 0.2s ease-in-out;
  --lilac-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --lilac-font-size: 16px;
  --lilac-line-height: 1.6;
  --lilac-letter-spacing: -0.01em;
}

.lilac-editor--dark {
  --lilac-color-background: #1a1b23;
  --lilac-color-surface: #252631;
  --lilac-color-border: #3a3b47;
  --lilac-color-border-focus: #a898e8;
  --lilac-color-text: #e2e8f0;
  --lilac-color-text-muted: #94a3b8;
  --lilac-color-text-placeholder: #64748b;
  --lilac-color-hover: rgba(255, 255, 255, 0.05);
  --lilac-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);
}

.lilac-editor {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--lilac-color-background);
  border: 1px solid var(--lilac-color-border);
  border-radius: var(--lilac-border-radius);
  box-shadow: var(--lilac-shadow);
  font-family: var(--lilac-font-family);
  font-size: var(--lilac-font-size);
  line-height: var(--lilac-line-height);
  letter-spacing: var(--lilac-letter-spacing);
  color: var(--lilac-color-text);
  transition: var(--lilac-transition);
  overflow: hidden;
  height: 100%;
  max-height: 100%;
}

.lilac-editor:focus-within {
  border-color: var(--lilac-color-border-focus);
  box-shadow: var(--lilac-shadow), var(--lilac-shadow-focus);
}

.lilac-editor--readonly {
  background: var(--lilac-color-surface);
  cursor: default;
}

.lilac-editor__content-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.lilac-editor__placeholder {
  position: absolute;
  top: 16px;
  left: 16px;
  color: var(--lilac-color-text-placeholder);
  pointer-events: none;
  font-size: var(--lilac-font-size);
  line-height: var(--lilac-line-height);
  user-select: none;
  z-index: 1;
}

.lilac-editor__content {
  padding: 16px;
  flex: 1;
  outline: none;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  position: relative;
  z-index: 2;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  scrollbar-width: thin;
  scrollbar-color: var(--lilac-color-border) transparent;
}

.lilac-editor__content::-webkit-scrollbar {
  width: 8px;
}

.lilac-editor__content::-webkit-scrollbar-track {
  background: transparent;
}

.lilac-editor__content::-webkit-scrollbar-thumb {
  background: var(--lilac-color-border);
  border-radius: 4px;
}

.lilac-editor__content::-webkit-scrollbar-thumb:hover {
  background: var(--lilac-color-text-muted);
}

.lilac-editor__content h1,
.lilac-editor__content h2,
.lilac-editor__content h3,
.lilac-editor__content h4,
.lilac-editor__content h5,
.lilac-editor__content h6 {
  margin: 1.5em 0 0.75em 0;
  font-weight: 600;
  line-height: 1.4;
  color: var(--lilac-color-text);
}

.lilac-editor__content h1:first-child,
.lilac-editor__content h2:first-child,
.lilac-editor__content h3:first-child {
  margin-top: 0;
}

.lilac-editor__content h1 { font-size: 2em; }
.lilac-editor__content h2 { font-size: 1.5em; }
.lilac-editor__content h3 { font-size: 1.25em; }

.lilac-editor__content p {
  margin: 0 0 1em 0;
}

.lilac-editor__content p:last-child {
  margin-bottom: 0;
}

.lilac-editor__content strong { font-weight: 600; }
.lilac-editor__content em { font-style: italic; }
.lilac-editor__content u { text-decoration: underline; }
.lilac-editor__content s { text-decoration: line-through; }

.lilac-editor__content blockquote {
  margin: 1em 0;
  padding: 0.5em 0 0.5em 1em;
  border-left: 3px solid var(--lilac-color-primary);
  background: var(--lilac-color-surface);
  border-radius: 0 var(--lilac-border-radius-small) var(--lilac-border-radius-small) 0;
  color: var(--lilac-color-text-muted);
}

.lilac-editor__content ul,
.lilac-editor__content ol {
  margin: 1em 0;
  padding-left: 2em;
}

.lilac-editor__content li {
  margin: 0.25em 0;
}

.lilac-editor__content code {
  background: var(--lilac-color-surface);
  padding: 0.125em 0.25em;
  border-radius: var(--lilac-border-radius-small);
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
  font-size: 0.875em;
}

.lilac-editor__content pre {
  background: var(--lilac-color-surface);
  padding: 1em;
  border-radius: var(--lilac-border-radius-small);
  overflow-x: auto;
  margin: 1em 0;
}

.lilac-editor__content pre code {
  background: none;
  padding: 0;
}

.lilac-editor__content a {
  color: var(--lilac-color-primary);
  text-decoration: underline;
}

.lilac-editor__content a:hover {
  color: var(--lilac-color-primary-dark);
}

.lilac-editor__content img {
  max-width: 100%;
  height: auto;
  border-radius: var(--lilac-border-radius-small);
}

.lilac-editor__content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
}

.lilac-editor__content th,
.lilac-editor__content td {
  padding: 8px 12px;
  text-align: left;
  border: 1px solid var(--lilac-color-border);
}

.lilac-editor__content th {
  font-weight: 600;
  background: var(--lilac-color-surface);
}

.lilac-editor__footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 8px 16px;
  background: var(--lilac-color-surface);
  border-top: 1px solid var(--lilac-color-border);
  font-size: 12px;
  position: sticky;
  bottom: 0;
  z-index: 10;
  flex-shrink: 0;
}

.lilac-editor__char-count {
  color: var(--lilac-color-text-muted);
  font-variant-numeric: tabular-nums;
}

.lilac-editor__content:focus { outline: none; }

.lilac-editor__content::selection,
.lilac-editor__content *::selection {
  background: rgba(139, 124, 216, 0.2);
}

/* Toolbar Styles */
.lilac-toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 8px 12px;
  background: var(--lilac-color-surface);
  border-bottom: 1px solid var(--lilac-color-border);
  border-radius: var(--lilac-border-radius) var(--lilac-border-radius) 0 0;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  position: sticky;
  top: 0;
  z-index: 10;
  flex-shrink: 0;
}

.lilac-toolbar::-webkit-scrollbar { display: none; }

.lilac-toolbar--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.lilac-toolbar__button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  color: var(--lilac-color-text);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
  font-size: 0;
  outline: none;
  position: relative;
}

.lilac-toolbar__button:hover:not(:disabled):not(.lilac-toolbar__button--disabled) {
  background: var(--lilac-color-background);
  border-color: var(--lilac-color-border);
  color: var(--lilac-color-primary);
  transform: translateY(-1px) scale(1.05);
  box-shadow: 0 2px 8px rgba(139, 124, 216, 0.15);
}

.lilac-toolbar__button:active:not(:disabled):not(.lilac-toolbar__button--disabled) {
  transform: translateY(0) scale(0.98);
}

.lilac-toolbar__button:focus-visible {
  outline: 2px solid var(--lilac-color-primary);
  outline-offset: 1px;
}

.lilac-toolbar__button--active {
  background: var(--lilac-color-primary);
  border-color: var(--lilac-color-primary);
  color: white;
  box-shadow: 0 2px 6px rgba(139, 124, 216, 0.3);
}

.lilac-toolbar__button--active:hover:not(:disabled) {
  background: var(--lilac-color-primary-dark);
  border-color: var(--lilac-color-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(109, 90, 200, 0.4);
}

.lilac-toolbar__button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.lilac-toolbar__button svg { flex-shrink: 0; }

.lilac-toolbar__separator {
  width: 1px;
  height: 20px;
  background: var(--lilac-color-border);
  margin: 0 4px;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .lilac-toolbar {
    padding: 6px 8px;
    gap: 1px;
  }
  .lilac-toolbar__button {
    width: 28px;
    height: 28px;
  }
  .lilac-editor__content {
    padding: 12px;
  }
  .lilac-editor__placeholder {
    top: 12px;
    left: 12px;
  }
}

/* Animations */
@keyframes lilac-scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.lilac-editor {
  animation: lilac-scale-in 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

@media (prefers-reduced-motion: reduce) {
  .lilac-editor,
  .lilac-toolbar__button {
    animation: none;
    transition: none;
  }
}
  `;
  document.head.appendChild(style);
}

// Export Editor class for direct usage
export { LilacEditor } from './components/Editor';
export type { EditorRef } from './components/Editor';
export { Toolbar } from './components/Toolbar';

