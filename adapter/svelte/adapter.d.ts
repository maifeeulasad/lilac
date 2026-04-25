import type { EditorProps } from '../../core/types/index';
/**
 * Creates a Svelte adapter for the Lilac editor
 * This adapter provides Svelte-specific bindings while using the core editor
 */
export declare function createSvelteAdapter(): {
    name: string;
    version: string;
};
export interface LilacEditorProps extends Partial<EditorProps> {
    bind?: {
        value: string;
    };
}
