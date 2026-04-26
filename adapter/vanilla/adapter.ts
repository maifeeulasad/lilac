// Lilac Vanilla JS Adapter
// Provides basic wrapper for Lilac editor in plain JavaScript

import type { EditorRef } from '../../core/components/Editor';
import { LilacEditor } from '../../core/components/Editor';
import type { EditorProps } from '../../core/types/index';

/**
 * Creates a Vanilla JS adapter for the Lilac editor
 * This adapter provides a simple factory function for plain JavaScript usage
 */
export function createVanillaAdapter() {
  return {
    name: 'vanilla',
    version: '0.5.0',

    /**
     * Create a new Lilac editor instance
     * @param container - The DOM element to mount the editor in
     * @param options - Editor configuration options
     * @returns The editor instance
     */
    createEditor: (container: HTMLElement, options?: Partial<EditorProps>): EditorRef => {
      const props: EditorProps = {
        container,
        toolbar: {
          show: true,
          tools: ['bold', 'italic', 'underline', 'strikethrough', 'separator', 'heading1', 'heading2', 'paragraph', 'separator', 'bulletList', 'orderedList', 'separator', 'blockquote', 'codeBlock', 'separator', 'link', 'image'],
        },
        ...options,
      };
      return new LilacEditor(props);
    },

    /**
     * Create editor with toolbar configuration
     */
    createEditorWithToolbar: (container: HTMLElement, tools: any[], options?: Partial<EditorProps>): EditorRef => {
      const props: EditorProps = {
        container,
        toolbar: {
          show: true,
          tools,
        },
        ...options,
      };
      return new LilacEditor(props);
    },

    /**
     * Default tools configuration
     */
    defaultTools: [
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
    ] as const,
  };
}

// Export the editor class for direct usage
export type { EditorPlugin, ToolbarConfig } from '../../core/types/index';
export { LilacEditor };
export type { EditorRef };

// Default export for convenience
export default createVanillaAdapter();
