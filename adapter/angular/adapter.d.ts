import type { EditorProps } from '../../core/types/index';
/**
 * Creates an Angular adapter for the Lilac editor
 * This adapter provides Angular-specific bindings while using the core editor
 */
export declare function createAngularAdapter(): {
    name: string;
    version: string;
};
export interface LilacEditorConfig extends EditorProps {
}
