// Lilac React Adapter
// Provides React component wrapper for Lilac editor

import type { EditorProps } from '../../core/types/index';

/**
 * Creates a React adapter for the Lilac editor
 * This adapter provides React-specific bindings while using the core editor
 */
export function createReactAdapter() {
  return {
    name: 'react',
    version: '0.3.2',
  };
}

// React component placeholder
export interface LilacEditorProps extends Partial<EditorProps> {
  value?: string;
  onChange?: (content: string) => void;
}
