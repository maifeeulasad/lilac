// Lilac Angular Adapter
// Provides Angular component and directive for Lilac editor

import { LilacEditor, type EditorRef } from '../../core/components/Editor';
import type { EditorPlugin, EditorProps, ToolbarConfig } from '../../core/types/index';

/**
 * Configuration options for the Angular component
 */
export interface LilacEditorConfig {
  /** Initial content for the editor */
  initialContent?: string;
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Whether the editor is read-only */
  readOnly?: boolean;
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** Minimum height in pixels */
  minHeight?: number;
  /** Maximum height in pixels */
  maxHeight?: number;
  /** Theme for the editor */
  theme?: 'light' | 'dark' | 'auto';
  /** Toolbar configuration */
  toolbar?: ToolbarConfig | boolean;
  /** Plugins to use */
  plugins?: EditorPlugin[];
  /** CSS class name */
  className?: string;
}

/**
 * Angular component for Lilac WYSIWYG editor
 * Usage:
 * <lilac-editor
 *   [(ngModel)]="content"
 *   [config]="editorConfig"
 *   (contentChange)="onContentChange($event)"
 * ></lilac-editor>
 */
export const LilacEditorComponent = {
  selector: 'lilac-editor',
  template: `
    <div
      #editorContainer
      class="lilac-angular-editor"
      [class]="config?.className || ''"
    ></div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .lilac-angular-editor {
      width: 100%;
    }
  `],
  inputs: {
    config: 'config',
  },
  outputs: {
    contentChange: 'contentChange',
    focus: 'focus',
    blur: 'blur',
    selectionChange: 'selectionChange',
  },
  ngModule: undefined, // Set this when importing the module
};

/**
 * Angular directive for Lilac editor (alternative to component)
 * Usage:
 * <div lilacEditor [config]="editorConfig" (contentChange)="onContentChange($event)"></div>
 */
export const LilacEditorDirective = {
  selector: '[lilacEditor]',
  inputs: {
    editorConfig: 'lilacEditor',
  },
  outputs: {
    contentChange: 'contentChange',
    focus: 'focus',
    blur: 'blur',
    selectionChange: 'selectionChange',
  },
};

/**
 * Default configuration for the Angular adapter
 */
export const defaultEditorConfig: LilacEditorConfig = {
  placeholder: 'Start writing...',
  readOnly: false,
  autoFocus: false,
  minHeight: 200,
  maxHeight: 600,
  theme: 'light',
  toolbar: {
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
  },
};

/**
 * Create an Angular adapter for the Lilac editor
 */
export function createAngularAdapter() {
  return {
    name: 'angular',
    version: '0.4.0',
    component: LilacEditorComponent,
    directive: LilacEditorDirective,
    defaultConfig: defaultEditorConfig,
  };
}

/**
 * Helper function to create editor options from config
 */
export function createEditorOptions(
  container: HTMLElement,
  config: LilacEditorConfig,
  callbacks?: {
    onChange?: (content: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    onSelectionChange?: (selection: any) => void;
  }
): EditorProps {
  const mergedConfig = { ...defaultEditorConfig, ...config };

  // Determine toolbar config
  let toolbarConfig: ToolbarConfig | undefined;
  if (mergedConfig.toolbar === true) {
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
  } else if (typeof mergedConfig.toolbar === 'object') {
    toolbarConfig = mergedConfig.toolbar;
  }

  return {
    container,
    initialContent: mergedConfig.initialContent || '',
    placeholder: mergedConfig.placeholder,
    readOnly: mergedConfig.readOnly,
    autoFocus: mergedConfig.autoFocus,
    minHeight: mergedConfig.minHeight,
    maxHeight: mergedConfig.maxHeight,
    theme: mergedConfig.theme,
    className: mergedConfig.className,
    plugins: mergedConfig.plugins,
    toolbar: toolbarConfig,
    onChange: callbacks?.onChange,
    onFocus: callbacks?.onFocus,
    onBlur: callbacks?.onBlur,
    onSelectionChange: callbacks?.onSelectionChange,
  };
}

/**
 * Service for managing multiple editor instances
 */
export class LilacEditorService {
  private editors: Map<string, EditorRef> = new Map();

  /**
   * Create a new editor instance
   */
  createEditor(id: string, container: HTMLElement, config?: LilacEditorConfig): EditorRef {
    const options = createEditorOptions(container, config || {});
    const editor = new LilacEditor(options);
    this.editors.set(id, editor);
    return editor;
  }

  /**
   * Get an editor instance by ID
   */
  getEditor(id: string): EditorRef | undefined {
    return this.editors.get(id);
  }

  /**
   * Destroy an editor instance
   */
  destroyEditor(id: string): void {
    const editor = this.editors.get(id);
    if (editor) {
      editor.destroy();
      this.editors.delete(id);
    }
  }

  /**
   * Destroy all editor instances
   */
  destroyAll(): void {
    this.editors.forEach((editor) => editor.destroy());
    this.editors.clear();
  }
}

export default createAngularAdapter();
