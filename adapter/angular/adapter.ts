// Lilac Angular Adapter
// Provides Angular component and directive for Lilac editor

import type { EditorProps } from '../../core/types/index';

/**
 * Creates an Angular adapter for the Lilac editor
 * This adapter provides Angular-specific bindings while using the core editor
 */
export function createAngularAdapter() {
  return {
    name: 'angular',
    version: '0.3.2',
  };
}

// Angular component/directive placeholder
export interface LilacEditorConfig extends EditorProps { }
