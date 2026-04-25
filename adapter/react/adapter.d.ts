import type { EditorProps } from '../../core/types/index';
/**
 * Creates a React adapter for the Lilac editor
 * This adapter provides React-specific bindings while using the core editor
 */
export declare function createReactAdapter(): {
    name: string;
    version: string;
};
export interface LilacEditorProps extends Partial<EditorProps> {
    value?: string;
    onChange?: (content: string) => void;
}
