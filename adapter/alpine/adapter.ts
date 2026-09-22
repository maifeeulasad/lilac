// Lilac Alpine.js Adapter
//
// Registers an `x-lilac` directive. The directive value is an options object
// (evaluated in the Alpine scope), so a server-rendered page can progressively
// enhance a plain element into an editor with no build step beyond `tsc`.
//
//   import Alpine from 'alpinejs';
//   import lilac from '@lilac-wysiwyg/alpine';
//   Alpine.plugin(lilac);
//   Alpine.start();
//
//   <div x-data="{ body: '<p>Hello!</p>' }"
//        x-lilac="{ value: body, toolbar: true, onChange: (c) => body = c }"></div>

import { LilacEditor as LilacCore } from '@lilac-wysiwyg/core';
import type { EditorPlugin, EditorProps, EditorRef, SelectionRange, ToolbarConfig } from '@lilac-wysiwyg/core';

/** Options accepted by the `x-lilac` directive value. */
export interface LilacDirectiveOptions {
  /** Editor content. Changing it (and re-evaluating) updates the editor. */
  value?: string;
  /** Initial content (alias for `value`). */
  initialContent?: string;
  /** Placeholder text when the editor is empty. */
  placeholder?: string;
  /** Whether the editor is read-only. */
  readOnly?: boolean;
  /** Toolbar configuration. `true` uses the default tool set. */
  toolbar?: ToolbarConfig | boolean;
  /** CSS class name. */
  className?: string;
  /** Minimum height in pixels. */
  minHeight?: number;
  /** Maximum height in pixels. */
  maxHeight?: number;
  /** Theme for the editor. */
  theme?: 'light' | 'dark' | 'auto';
  /** Auto focus on mount. */
  autoFocus?: boolean;
  /** Plugins to use. */
  plugins?: EditorPlugin[];
  /** Called when content changes. */
  onChange?: (content: string) => void;
  /** Called when the editor is focused. */
  onFocus?: () => void;
  /** Called when the editor loses focus. */
  onBlur?: () => void;
  /** Called when the selection changes. */
  onSelectionChange?: (selection: SelectionRange | null) => void;
}

const DEFAULT_TOOLS: ToolbarConfig = {
  show: true,
  tools: [
    'bold', 'italic', 'underline', 'strikethrough', 'separator',
    'heading1', 'heading2', 'paragraph', 'separator',
    'bulletList', 'orderedList', 'separator',
    'blockquote', 'codeBlock', 'separator',
    'link', 'image',
  ],
};

// Minimal structural types for the pieces of the Alpine API this plugin uses.
// Depending on the full `alpinejs` types is unnecessary and would couple the
// build to their exact shape across versions.
interface AlpineDirectiveUtilities {
  evaluate: (expression: string) => unknown;
  cleanup: (fn: () => void) => void;
  effect: (fn: () => void) => void;
}
interface AlpineDirectiveMeta {
  expression: string;
}
type AlpineDirectiveCallback = (
  el: HTMLElement,
  meta: AlpineDirectiveMeta,
  utilities: AlpineDirectiveUtilities,
) => void;
interface AlpineLike {
  directive: (name: string, callback: AlpineDirectiveCallback) => void;
}

function buildProps(container: HTMLElement, options: LilacDirectiveOptions): EditorProps {
  let toolbarConfig: ToolbarConfig | undefined;
  if (options.toolbar === true) toolbarConfig = DEFAULT_TOOLS;
  else if (typeof options.toolbar === 'object') toolbarConfig = options.toolbar;

  return {
    container,
    initialContent: options.value !== undefined ? options.value : (options.initialContent ?? ''),
    placeholder: options.placeholder ?? 'Start writing...',
    readOnly: options.readOnly ?? false,
    autoFocus: options.autoFocus ?? false,
    minHeight: options.minHeight ?? 200,
    maxHeight: options.maxHeight ?? 600,
    theme: options.theme ?? 'light',
    className: options.className ?? '',
    plugins: options.plugins,
    toolbar: toolbarConfig,
    onChange: (content) => options.onChange?.(content),
    onFocus: () => options.onFocus?.(),
    onBlur: () => options.onBlur?.(),
    onSelectionChange: (selection) => options.onSelectionChange?.(selection),
  };
}

/**
 * Alpine plugin registering the `x-lilac` directive.
 *
 * The editor is built once from the directive's evaluated options. An Alpine
 * `effect` then keeps `value` and `readOnly` in sync when the surrounding
 * `x-data` state changes.
 */
export function lilacPlugin(Alpine: AlpineLike): void {
  Alpine.directive('lilac', (el, { expression }, { evaluate, cleanup, effect }) => {
    const read = (): LilacDirectiveOptions =>
      (expression ? (evaluate(expression) as LilacDirectiveOptions) : {}) ?? {};

    const editor: EditorRef = new LilacCore(buildProps(el, read()));

    effect(() => {
      const opts = read();
      if (opts.value !== undefined && opts.value !== editor.getContent()) {
        editor.setContent(opts.value);
      }
      editor.setReadOnly(opts.readOnly ?? false);
    });

    cleanup(() => editor.destroy());
  });
}

/** Create an Alpine adapter descriptor for the Lilac editor. */
export function createAlpineAdapter() {
  return {
    name: 'alpine',
    version: '0.5.0',
    plugin: lilacPlugin,
  };
}

export default lilacPlugin;
