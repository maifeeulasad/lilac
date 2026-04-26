// Lilac Vue Adapter
// Provides Vue component for Lilac editor

import { ref, onMounted, onBeforeUnmount, watch, type Ref } from 'vue';
import { LilacEditor, type EditorRef } from '../../core/components/Editor';
import type { EditorProps, EditorPlugin, ToolbarConfig } from '../../core/types/index';

/**
 * Props for the LilacEditor Vue component
 */
export interface LilacEditorProps {
  /** Initial content for the editor */
  modelValue?: string;
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Whether the editor is read-only */
  readOnly?: boolean;
  /** Toolbar configuration */
  toolbar?: ToolbarConfig | boolean;
  /** Initial content (alias for modelValue) */
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
}

/**
 * Emits for the LilacEditor Vue component
 */
export interface LilacEditorEmits {
  (e: 'update:modelValue', value: string): void;
  (e: 'focus'): void;
  (e: 'blur'): void;
  (e: 'selectionChange', selection: any): void;
}

/**
 * Exposed methods via defineExpose
 */
export interface LilacEditorExposed {
  getContent: () => string;
  setContent: (content: string): void;
  focus: () => void;
  blur: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: Ref<boolean>;
  canRedo: Ref<boolean>;
}

/**
 * Vue component wrapper for Lilac WYSIWYG editor
 */
export const LilacEditorComponent = {
  name: 'LilacEditor',

  props: {
    modelValue: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: 'Start writing...',
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
    toolbar: {
      type: [Object, Boolean],
      default: true,
    },
    initialContent: {
      type: String,
      default: '',
    },
    className: {
      type: String,
      default: '',
    },
    minHeight: {
      type: Number,
      default: 200,
    },
    maxHeight: {
      type: Number,
      default: 600,
    },
    theme: {
      type: String as () => 'light' | 'dark' | 'auto',
      default: 'light',
    },
    autoFocus: {
      type: Boolean,
      default: false,
    },
    plugins: {
      type: Array as () => EditorPlugin[],
      default: () => [],
    },
  },

  emits: ['update:modelValue', 'focus', 'blur', 'selectionChange'],

  setup(props: LilacEditorProps, { emit, expose }: { emit: any; expose: any }) {
    const containerRef = ref<HTMLDivElement | null>(null);
    let editorInstance: EditorRef | null = null;

    const canUndo = ref(false);
    const canRedo = ref(false);

    // Get content value (modelValue takes precedence)
    const getContentValue = () => {
      return props.modelValue !== undefined ? props.modelValue : (props.initialContent || '');
    };

    // Initialize editor
    onMounted(() => {
      if (!containerRef.value) return;

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

      const editorProps: EditorProps = {
        container: containerRef.value,
        initialContent: getContentValue(),
        placeholder: props.placeholder,
        readOnly: props.readOnly,
        autoFocus: props.autoFocus,
        minHeight: props.minHeight,
        maxHeight: props.maxHeight,
        theme: props.theme,
        className: props.className,
        plugins: props.plugins,
        toolbar: toolbarConfig,
        onChange: (newContent) => {
          emit('update:modelValue', newContent);
        },
        onFocus: () => {
          emit('focus');
        },
        onBlur: () => {
          emit('blur');
        },
        onSelectionChange: (selection) => {
          emit('selectionChange', selection);
        },
      };

      editorInstance = new LilacEditor(editorProps);

      // Update undo/redo state
      canUndo.value = editorInstance.canUndo;
      canRedo.value = editorInstance.canRedo;
    });

    // Cleanup
    onBeforeUnmount(() => {
      if (editorInstance) {
        editorInstance.destroy();
        editorInstance = null;
      }
    });

    // Watch for modelValue changes
    watch(
      () => props.modelValue,
      (newValue) => {
        if (editorInstance && newValue !== editorInstance.getContent()) {
          editorInstance.setContent(newValue || '');
        }
      }
    );

    // Watch for readOnly changes
    watch(
      () => props.readOnly,
      (newReadOnly) => {
        if (editorInstance) {
          editorInstance.setReadOnly(newReadOnly);
        }
      }
    );

    // Expose methods
    expose({
      getContent: () => editorInstance?.getContent() ?? '',
      setContent: (content: string) => {
        editorInstance?.setContent(content);
      },
      focus: () => {
        editorInstance?.focus();
      },
      blur: () => {
        editorInstance?.blur();
      },
      undo: () => {
        editorInstance?.undo();
      },
      redo: () => {
        editorInstance?.redo();
      },
      canUndo,
      canRedo,
    });

    return {
      containerRef,
      canUndo,
      canRedo,
    };
  },

  template: `
    <div
      ref="containerRef"
      class="lilac-vue-editor"
      :class="className"
    />
  `,
};

/**
 * Create a Vue adapter for the Lilac editor
 */
export function createVueAdapter() {
  return {
    name: 'vue',
    version: '0.4.0',
    component: LilacEditorComponent,
  };
}

export { LilacEditorComponent as LilacEditor };
export type { LilacEditorProps, LilacEditorEmits, LilacEditorExposed };
export default LilacEditorComponent;
