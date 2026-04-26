// Lilac Svelte Adapter
// Provides Svelte component wrapper for Lilac editor

import { onMount, onDestroy } from 'svelte';
import { LilacEditor, type EditorRef } from '../../core/components/Editor';
import type { EditorProps, EditorPlugin, ToolbarConfig } from '../../core/types/index';

/**
 * Props for the LilacEditor Svelte component
 */
export interface LilacEditorProps {
  /** Initial content for the editor */
  value?: string;
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Whether the editor is read-only */
  readOnly?: boolean;
  /** Toolbar configuration */
  toolbar?: ToolbarConfig | boolean;
  /** Initial content (alias for value) */
  initialContent?: string;
  /** CSS class name */
  className?: string;
  /** Minimum height in pixels */
  minHeight?: number;
  /** Maximum height in pixels */
  maxHeight?: number;
  /** Theme for the editor */
  theme?: 'light' | 'dark' | 'auto';
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** Plugins to use */
  plugins?: EditorPlugin[];
  /** Callback when content changes */
  onChange?: (content: string) => void;
  /** Callback when editor is focused */
  onFocus?: () => void;
  /** Callback when editor loses focus */
  onBlur?: () => void;
  /** Callback when selection changes */
  onSelectionChange?: (selection: any) => void;
}

/**
 * Svelte component wrapper for Lilac WYSIWYG editor
 */
let LilacEditorComponent: any;

/**
 * Create the LilacEditor component
 */
function createLilacEditorComponent() {
  return {
    props: {
      value: { type: String, default: '' },
      placeholder: { type: String, default: 'Start writing...' },
      readOnly: { type: Boolean, default: false },
      toolbar: { type: [Object, Boolean], default: true },
      initialContent: { type: String, default: '' },
      className: { type: String, default: '' },
      minHeight: { type: Number, default: 200 },
      maxHeight: { type: Number, default: 600 },
      theme: { type: String, default: 'light' },
      autoFocus: { type: Boolean, default: false },
      plugins: { type: Array, default: () => [] },
      onChange: { type: Function, default: undefined },
      onFocus: { type: Function, default: undefined },
      onBlur: { type: Function, default: undefined },
      onSelectionChange: { type: Function, default: undefined },
    },

    setup(props: LilacEditorProps) {
      let container: HTMLDivElement;
      let editor: EditorRef | null = null;

      const onMount = () => {
        // Determine toolbar config
        let toolbarConfig: ToolbarConfig | undefined;
        if (props.toolbar === true) {
          toolbarConfig = {
            show: true,
            tools: [
              'bold',
              'italic',
              'underline',
              'strikethrough',
              'separator',
              'heading1',
              'heading2',
              'paragraph',
              'separator',
              'bulletList',
              'orderedList',
              'separator',
              'blockquote',
              'codeBlock',
              'separator',
              'link',
              'image',
            ],
          };
        } else if (typeof props.toolbar === 'object') {
          toolbarConfig = props.toolbar;
        }

        const content = props.value !== undefined ? props.value : (props.initialContent || '');

        const editorProps: EditorProps = {
          container,
          initialContent: content,
          placeholder: props.placeholder,
          readOnly: props.readOnly,
          autoFocus: props.autoFocus,
          minHeight: props.minHeight,
          maxHeight: props.maxHeight,
          theme: props.theme as 'light' | 'dark' | 'auto',
          className: props.className,
          plugins: props.plugins,
          toolbar: toolbarConfig,
          onChange: (newContent) => {
            props.onChange?.(newContent);
          },
          onFocus: () => {
            props.onFocus?.();
          },
          onBlur: () => {
            props.onBlur?.();
          },
          onSelectionChange: (selection) => {
            props.onSelectionChange?.(selection);
          },
        };

        editor = new LilacEditor(editorProps);
      };

      const onDestroy = () => {
        if (editor) {
          editor.destroy();
          editor = null;
        }
      };

      // Reactive update for value
      $effect(() => {
        if (editor && props.value !== undefined && props.value !== editor.getContent()) {
          editor.setContent(props.value);
        }
      });

      // Reactive update for readOnly
      $effect(() => {
        if (editor) {
          editor.setReadOnly(props.readOnly);
        }
      });

      return {
        bind: (node: HTMLDivElement) => {
          container = node;
          onMount();
        },
        onDestroy,
      };
    },

    template: `
      <div
        use:bind
        class="lilac-svelte-editor {className}"
      />
    `,
  };
}

/**
 * Create a Svelte store for the editor
 */
export function createLilacStore(initialContent = '') {
  let content = $state(initialContent);
  let canUndo = $state(false);
  let canRedo = $state(false);
  let editor: EditorRef | null = null;

  return {
    get content() {
      return content;
    },
    set content(value: string) {
      content = value;
      if (editor) {
        editor.setContent(value);
      }
    },

    get canUndo() {
      return canUndo;
    },
    get canRedo() {
      return canRedo;
    },

    bindEditor(editorRef: EditorRef) {
      editor = editorRef;
      canUndo = editor.canUndo;
      canRedo = editor.canRedo;
    },

    updateState() {
      if (editor) {
        canUndo = editor.canUndo;
        canRedo = editor.canRedo;
      }
    },
  };
}

/**
 * Create a Svelte adapter for the Lilac editor
 */
export function createSvelteAdapter() {
  return {
    name: 'svelte',
    version: '0.4.0',
    component: LilacEditorComponent,
    createStore: createLilacStore,
  };
}

export type { LilacEditorProps };
export default createSvelteAdapter();
