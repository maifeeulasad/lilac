import type { EditorProps } from '../types/index.js';
export interface EditorRef {
    getContent: () => string;
    setContent: (content: string) => void;
    focus: () => void;
    blur: () => void;
    undo: () => void;
    redo: () => void;
    setReadOnly: (readOnly: boolean) => void;
    destroy: () => void;
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
    private isDestroyed;
    private readonly onBeforeInput;
    private readonly onInput;
    private readonly onKeyDown;
    private readonly onKeyUp;
    private readonly onMouseUp;
    private readonly onFocusIn;
    private readonly onFocusOut;
    private readonly onSelectionChange;
    private readonly onDragOver;
    private readonly onDrop;
    private readonly onPaste;
    private readonly pluginManager;
    private findReplace;
    constructor(props: EditorProps);
    private createEditor;
    /**
     * Content arriving from outside the editor is untrusted. Only rich-text mode
     * needs this — the plain-text path assigns via textContent, which cannot
     * execute anything.
     */
    private prepareContent;
    private getEditorContext;
    private initializePlugins;
    private setupEventListeners;
    private teardownEventListeners;
    /**
     * Enforce maxLength before the insertion lands, so an over-limit edit is
     * simply refused. Reverting afterwards (the previous approach) rewrote the
     * whole node and dropped the caret to the start of the field.
     */
    private handleBeforeInput;
    private handleInput;
    private handleKeyDown;
    private handleDragOver;
    private handleDrop;
    private handlePaste;
    private embedImages;
    private insertImageElement;
    private ensureFindReplace;
    private handleToolClick;
    private handleFocus;
    private handleBlur;
    private handleSelectionChange;
    private setSelectionState;
    private updateContent;
    private updateContentFromDOM;
    private updateActiveTools;
    private updatePlaceholder;
    /**
     * Length of the content as the user perceives it: visible text, not markup.
     *
     * Parsed via DOMParser rather than a scratch element's innerHTML, because
     * the latter loads resources — `<img src=x onerror=...>` in stored content
     * would fire just from measuring it.
     */
    private getTextLength;
    private updateCharCount;
    getContent(): string;
    setContent(rawContent: string): void;
    private readContentFromDOM;
    private writeContentToDOM;
    /**
     * Caret position as a character offset into the element's text, which
     * survives the node identities being replaced.
     */
    private getCaretOffset;
    private setCaretOffset;
    focus(): void;
    blur(): void;
    undo(): void;
    redo(): void;
    get canUndo(): boolean;
    get canRedo(): boolean;
    setReadOnly(readOnly: boolean): void;
    /** Current content serialized to Markdown (headings, emphasis, lists, code, links, images, quotes). */
    getMarkdown(): string;
    /** Replace the content from a Markdown string. */
    setMarkdown(markdown: string): void;
    /** Open the find & replace panel (also bound to Ctrl/Cmd+F). */
    openFind(): void;
    /** Close the find & replace panel if it is open. */
    closeFind(): void;
    destroy(): void;
}
