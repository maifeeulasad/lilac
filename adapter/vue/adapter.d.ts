import type { EditorProps } from '../../core/types/index';
/**
 * Creates a Vue adapter for the Lilac editor
 * This adapter provides Vue-specific bindings while using the core editor
 */
export declare function createVueAdapter(): {
    name: string;
    version: string;
};
export interface LilacEditorProps extends Partial<EditorProps> {
    modelValue?: string;
    'onUpdate:modelValue'?: (content: string) => void;
}
