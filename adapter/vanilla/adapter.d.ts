import { LilacEditor } from '../../core/components/Editor';
import type { EditorProps } from '../../core/types/index';
/**
 * Creates a Vanilla JS adapter for the Lilac editor
 * This adapter provides a simple factory function for plain JavaScript usage
 */
export declare function createVanillaAdapter(): {
    name: string;
    version: string;
    createEditor: (props: EditorProps) => LilacEditor;
};
export { LilacEditor };
export type { EditorProps };
