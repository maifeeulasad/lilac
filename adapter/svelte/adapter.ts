// Lilac Svelte Adapter
// Provides Svelte component wrapper for Lilac editor

import type { EditorProps } from '../../core/types/index';

/**
 * Creates a Svelte adapter for the Lilac editor
 * This adapter provides Svelte-specific bindings while using the core editor
 */
export function createSvelteAdapter() {
  return {
    name: 'svelte',
    version: '0.3.2',
  };
}

// Svelte component placeholder
export interface LilacEditorProps extends Partial<EditorProps> {
  bind: value?: string;
}
