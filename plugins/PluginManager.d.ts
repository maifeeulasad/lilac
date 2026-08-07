import type { ContextMenuItem, EditorContext, EditorPanel, EditorPlugin, KeyboardShortcut } from '../types/index.js';
/**
 * The subset of EditorPlugin keys that are lifecycle hooks, i.e. the callable
 * ones. Excludes data members such as `toolbarButtons` and `styles`.
 */
type PluginHookName = {
    [K in keyof EditorPlugin]-?: NonNullable<EditorPlugin[K]> extends (...args: never[]) => void ? K : never;
}[keyof EditorPlugin];
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
    /**
     * Invoke a lifecycle hook on every installed plugin.
     *
     * Arguments are forwarded verbatim, in the order the hook declares them. The
     * context is NOT injected here — call sites pass it in its declared position,
     * which for most hooks is last.
     */
    executeHook<T extends PluginHookName>(hook: T, ...args: Parameters<NonNullable<EditorPlugin[T]>>): void;
    getToolbarButtons(): any[];
    getContextMenuItems(): ContextMenuItem[];
    getKeyboardShortcuts(): KeyboardShortcut[];
    getPanels(): EditorPanel[];
    transformContent(content: string): string;
    private injectStyles;
    private removeStyles;
}
/**
 * Shared manager instance.
 *
 * @deprecated LilacEditor now owns a PluginManager per instance. This shared
 * one is no longer wired to any editor — plugins installed here will not
 * receive an editor context and their toolbar buttons will not render. Pass
 * plugins via the `plugins` editor option instead. Kept only so existing
 * imports keep resolving; it will be removed in a future major.
 */
export declare const pluginManager: PluginManager;
export {};
