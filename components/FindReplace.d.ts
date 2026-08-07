interface FindReplaceOptions {
    /** Editor root the panel is appended to. */
    editor: HTMLElement;
    /** The contenteditable element to search within. */
    content: HTMLElement;
    /** Called after any replacement so the editor can sync content/history. */
    onMutate: () => void;
}
export declare class FindReplace {
    private readonly panel;
    private findInput;
    private replaceInput;
    private countLabel;
    private readonly options;
    private matches;
    private current;
    private findOptions;
    private open;
    constructor(options: FindReplaceOptions);
    isOpen(): boolean;
    show(): void;
    hide(): void;
    toggle(): void;
    destroy(): void;
    private build;
    private input;
    private button;
    private toggleButton;
    private onKeyDown;
    /** Recompute matches for the current query and highlight the first one. */
    private refresh;
    private collect;
    private step;
    private highlight;
    private clearMatches;
    private updateCount;
    private replaceCurrent;
    private replaceEverything;
}
export {};
