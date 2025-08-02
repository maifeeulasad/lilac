import { EditorContext, EditorPlugin, PluginManager as IPluginManager } from '../types/plugin';
export declare class PluginManager implements IPluginManager {
    plugins: Map<string, EditorPlugin>;
    private context;
    constructor();
    setContext(context: EditorContext): void;
    install(plugin: EditorPlugin): void;
    uninstall(pluginId: string): void;
    getPlugin(pluginId: string): EditorPlugin | undefined;
    getAllPlugins(): EditorPlugin[];
    isInstalled(pluginId: string): boolean;
    executeHook<T extends keyof EditorPlugin>(hook: T, ...args: any[]): void;
    getToolbarButtons(): any[];
    getContextMenuItems(): any[];
    getKeyboardShortcuts(): any[];
    getPanels(): any[];
    transformContent(content: string): string;
    private injectStyles;
    private removeStyles;
}
export declare const pluginManager: PluginManager;
