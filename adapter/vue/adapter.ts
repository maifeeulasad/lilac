// Lilac Vue Adapter
// Provides Vue component for Lilac editor

import type { EditorProps } from '../../core/types/index';

/**
 * Creates a Vue adapter for the Lilac editor
 * This adapter provides Vue-specific bindings while using the core editor
 */
export function createVueAdapter() {
  return {
    name: 'vue',
    version: '0.3.2',
  };
}

// Vue component placeholder
export interface LilacEditorProps extends Partial<EditorProps> {
  modelValue?: string;
  'onUpdate:modelValue'?: (content: string) => void;
}
