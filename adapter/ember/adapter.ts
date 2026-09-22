// Lilac Ember Adapter
//
// Exposes the editor as an element modifier via ember-modifier's functional
// `modifier`. A modifier is Ember's idiomatic "attach behavior to this element"
// primitive (the analogue of a Svelte action), so this needs no Glimmer
// component template and builds with `tsc`.
//
//   import Lilac from '@lilac-wysiwyg/ember';
//   // (register as a helper/modifier per your app's resolver, or use directly)
//
//   <div {{lilac value=this.body toolbar=true onChange=this.setBody}}></div>

import { modifier } from 'ember-modifier';
import { LilacEditor as LilacCore } from '@lilac-wysiwyg/core';
import type { EditorPlugin, EditorProps, EditorRef, SelectionRange, ToolbarConfig } from '@lilac-wysiwyg/core';

/** Named arguments accepted by the `lilac` modifier. */
export interface LilacModifierArgs {
  /** Editor content. Changing it updates the editor. */
  value?: string;
  /** Initial content (alias for `value`). */
  initialContent?: string;
  /** Placeholder text when the editor is empty. */
  placeholder?: string;
  /** Whether the editor is read-only. Changing it updates the editor. */
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

/**
 * The `lilac` element modifier.
 *
 * Builds the editor once when the element is installed and tears it down when
 * the element is removed. The modifier re-runs when a tracked argument it reads
 * changes, so `value` and `readOnly` stay in sync.
 */
export const lilac = modifier((element: HTMLElement, _positional: unknown[], named: LilacModifierArgs) => {
  let toolbarConfig: ToolbarConfig | undefined;
  if (named.toolbar === true) toolbarConfig = DEFAULT_TOOLS;
  else if (typeof named.toolbar === 'object') toolbarConfig = named.toolbar;

  const props: EditorProps = {
    container: element,
    initialContent: named.value !== undefined ? named.value : (named.initialContent ?? ''),
    placeholder: named.placeholder ?? 'Start writing...',
    readOnly: named.readOnly ?? false,
    autoFocus: named.autoFocus ?? false,
    minHeight: named.minHeight ?? 200,
    maxHeight: named.maxHeight ?? 600,
    theme: named.theme ?? 'light',
    className: named.className ?? '',
    plugins: named.plugins,
    toolbar: toolbarConfig,
    onChange: (content) => named.onChange?.(content),
    onFocus: () => named.onFocus?.(),
    onBlur: () => named.onBlur?.(),
    onSelectionChange: (selection: SelectionRange | null) => named.onSelectionChange?.(selection),
  };

  const editor: EditorRef = new LilacCore(props);

  return () => editor.destroy();
});

/** Create an Ember adapter descriptor for the Lilac editor. */
export function createEmberAdapter() {
  return {
    name: 'ember',
    version: '0.5.0',
    modifier: lilac,
  };
}

export default lilac;
