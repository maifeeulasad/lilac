import type { ContextMenuItem, EditorContext, EditorPanel, EditorPlugin, KeyboardShortcut } from 'core/types';
export declare class PluginManager {
    plugins: Map<string, EditorPlugin>;
    private context;
    constructor();
    setContext(context: EditorContext): void;
    install(plugin: EditorPlugin): void;
    uninstall(pluginId: string): void;
    getPlugin(pluginId: string): EditorPlugin | undefined;
    getAllPlugins(): EditorPlugin[];
    isInstalled(pluginId: string): boolean;
    executeHook<T extends keyof EditorPlugin>(hook: T, ...args: unknown[]): void;
    getToolbarButtons(): any[];
    getContextMenuItems(): ContextMenuItem[];
    getKeyboardShortcuts(): KeyboardShortcut[];
    getPanels(): EditorPanel[];
    transformContent(content: string): string;
    private injectStyles;
    private removeStyles;
}
export declare const pluginManager: PluginManager;
