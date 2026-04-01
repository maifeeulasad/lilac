import type { EditorContext, ToolbarButton, ToolbarTool } from '../types';
export interface ToolbarOptions {
    tools?: ToolbarTool[];
    onToolClick: (tool: ToolbarTool) => void;
    activeTools?: Set<ToolbarTool>;
    disabled?: boolean;
    pluginButtons?: ToolbarButton[];
    editorContext?: EditorContext;
}
export declare class Toolbar {
    private element;
    private options;
    constructor(options: ToolbarOptions);
    private createElement;
    private createButton;
    private createPluginButton;
    getElement(): HTMLElement;
    updateActiveTools(activeTools: Set<ToolbarTool>): void;
    setDisabled(disabled: boolean): void;
}
