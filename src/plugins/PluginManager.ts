import { EditorContext, EditorPlugin, PluginManager as IPluginManager } from '../types/plugin';

export class PluginManager implements IPluginManager {
    public plugins: Map<string, EditorPlugin> = new Map();
    private context: EditorContext | null = null;

    constructor() {
        this.plugins = new Map();
    }

    setContext(context: EditorContext): void {
        this.context = context;
    }

    install(plugin: EditorPlugin): void {
        if (this.plugins.has(plugin.id)) {
            console.warn(`Plugin ${plugin.id} is already installed`);
            return;
        }

        this.plugins.set(plugin.id, plugin);

        // Inject custom styles if provided
        if (plugin.styles) {
            this.injectStyles(plugin.id, plugin.styles);
        }

        // Call install hook
        if (plugin.onInstall && this.context) {
            plugin.onInstall(this.context);
        }

        console.log(`Plugin ${plugin.id} (${plugin.name}) installed successfully`);
    }

    uninstall(pluginId: string): void {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) {
            console.warn(`Plugin ${pluginId} is not installed`);
            return;
        }

        // Call uninstall hook
        if (plugin.onUninstall && this.context) {
            plugin.onUninstall(this.context);
        }

        // Remove custom styles
        this.removeStyles(pluginId);

        this.plugins.delete(pluginId);
        console.log(`Plugin ${pluginId} uninstalled successfully`);
    }

    getPlugin(pluginId: string): EditorPlugin | undefined {
        return this.plugins.get(pluginId);
    }

    getAllPlugins(): EditorPlugin[] {
        return Array.from(this.plugins.values());
    }

    isInstalled(pluginId: string): boolean {
        return this.plugins.has(pluginId);
    }

    executeHook<T extends keyof EditorPlugin>(hook: T, ...args: any[]): void {
        if (!this.context) return;

        this.plugins.forEach((plugin) => {
            const hookFn = plugin[hook];
            if (typeof hookFn === 'function') {
                try {
                    (hookFn as any).apply(plugin, [this.context, ...args]);
                } catch (error) {
                    console.error(`Error executing hook ${String(hook)} for plugin ${plugin.id}:`, error);
                }
            }
        });
    }

    // Get all toolbar buttons from plugins
    getToolbarButtons() {
        const buttons: any[] = [];
        this.plugins.forEach((plugin) => {
            if (plugin.toolbarButtons) {
                buttons.push(...plugin.toolbarButtons);
            }
        });
        return buttons;
    }

    // Get all context menu items from plugins
    getContextMenuItems() {
        const items: any[] = [];
        this.plugins.forEach((plugin) => {
            if (plugin.contextMenuItems) {
                items.push(...plugin.contextMenuItems);
            }
        });
        return items;
    }

    // Get all keyboard shortcuts from plugins
    getKeyboardShortcuts() {
        const shortcuts: any[] = [];
        this.plugins.forEach((plugin) => {
            if (plugin.keyboardShortcuts) {
                shortcuts.push(...plugin.keyboardShortcuts);
            }
        });
        return shortcuts;
    }

    // Get all panels from plugins
    getPanels() {
        const panels: any[] = [];
        this.plugins.forEach((plugin) => {
            if (plugin.panels) {
                panels.push(...plugin.panels);
            }
        });
        return panels;
    }

    // Transform content using all installed plugins
    transformContent(content: string): string {
        let transformedContent = content;

        this.plugins.forEach((plugin) => {
            if (plugin.contentTransformers && this.context) {
                plugin.contentTransformers.forEach((transformer) => {
                    transformedContent = transformer.transform(transformedContent, this.context!);
                });
            }
        });

        return transformedContent;
    }

    private injectStyles(pluginId: string, styles: string): void {
        const styleId = `lilac-plugin-${pluginId}`;

        // Remove existing styles for this plugin
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
            existingStyle.remove();
        }

        // Create and inject new styles
        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
    }

    private removeStyles(pluginId: string): void {
        const styleId = `lilac-plugin-${pluginId}`;
        const styleElement = document.getElementById(styleId);
        if (styleElement) {
            styleElement.remove();
        }
    }
}

// Singleton instance
export const pluginManager = new PluginManager();
