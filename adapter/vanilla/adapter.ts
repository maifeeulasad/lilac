// Lilac Vanilla JS Adapter
// Provides basic wrapper for Lilac editor in plain JavaScript

import { LilacEditor } from '../../core/components/Editor';
import type { EditorProps } from '../../core/types/index';

/**
 * Creates a Vanilla JS adapter for the Lilac editor
 * This adapter provides a simple factory function for plain JavaScript usage
 */
export function createVanillaAdapter() {
  return {
    name: 'vanilla',
    version: '0.3.2',
    createEditor: (props: EditorProps) => new LilacEditor(props),
  };
}

// Re-export for convenience
export { LilacEditor };
export type { EditorProps };

