import type { EditorProps } from '../types/index';
export interface EditorRef {
    getContent: () => string;
    setContent: (content: string) => void;
    focus: () => void;
    blur: () => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}
export declare class LilacEditor implements EditorRef {
    private container;
    private editorWrapper;
    private contentElement;
    private toolbar;
    private state;
    private props;
    private lastContentRef;
    constructor(props: EditorProps);
    private createEditor;
    private getEditorContext;
    private initializePlugins;
    private setupEventListeners;
    private handleInput;
    private handleKeyDown;
    private handleToolClick;
    private handleFocus;
    private handleBlur;
    private handleSelectionChange;
    private updateContent;
    private updateContentFromDOM;
    private updateActiveTools;
    private updatePlaceholder;
    private updateCharCount;
    getContent(): string;
    setContent(content: string): void;
    focus(): void;
    blur(): void;
    undo(): void;
    redo(): void;
    get canUndo(): boolean;
    get canRedo(): boolean;
    setReadOnly(readOnly: boolean): void;
    destroy(): void;
}
