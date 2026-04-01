export class PluginManager {
    constructor() {
        this.plugins = new Map();
        this.context = null;
        this.plugins = new Map();
    }
    setContext(context) {
        this.context = context;
    }
    install(plugin) {
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
    uninstall(pluginId) {
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
    getPlugin(pluginId) {
        return this.plugins.get(pluginId);
    }
    getAllPlugins() {
        return Array.from(this.plugins.values());
    }
    isInstalled(pluginId) {
        return this.plugins.has(pluginId);
    }
    executeHook(hook, ...args) {
        if (!this.context)
            return;
        this.plugins.forEach((plugin) => {
            const hookFn = plugin[hook];
            if (typeof hookFn === 'function') {
                try {
                    hookFn.apply(plugin, [this.context, ...args]);
                }
                catch (error) {
                    console.error(`Error executing hook ${String(hook)} for plugin ${plugin.id}:`, error);
                }
            }
        });
    }
    // Get all toolbar buttons from plugins
    getToolbarButtons() {
        const buttons = [];
        this.plugins.forEach((plugin) => {
            if (plugin.toolbarButtons) {
                buttons.push(...plugin.toolbarButtons);
            }
        });
        return buttons;
    }
    // Get all context menu items from plugins
    getContextMenuItems() {
        const items = [];
        this.plugins.forEach((plugin) => {
            if (plugin.contextMenuItems) {
                items.push(...plugin.contextMenuItems);
            }
        });
        return items;
    }
    // Get all keyboard shortcuts from plugins
    getKeyboardShortcuts() {
        const shortcuts = [];
        this.plugins.forEach((plugin) => {
            if (plugin.keyboardShortcuts) {
                shortcuts.push(...plugin.keyboardShortcuts);
            }
        });
        return shortcuts;
    }
    // Get all panels from plugins
    getPanels() {
        const panels = [];
        this.plugins.forEach((plugin) => {
            if (plugin.panels) {
                panels.push(...plugin.panels);
            }
        });
        return panels;
    }
    // Transform content using all installed plugins
    transformContent(content) {
        let transformedContent = content;
        this.plugins.forEach((plugin) => {
            if (plugin.contentTransformers && this.context) {
                plugin.contentTransformers.forEach((transformer) => {
                    transformedContent = transformer.transform(transformedContent, this.context);
                });
            }
        });
        return transformedContent;
    }
    injectStyles(pluginId, styles) {
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
    removeStyles(pluginId) {
        const styleId = `lilac-plugin-${pluginId}`;
        const styleElement = document.getElementById(styleId);
        if (styleElement) {
            styleElement.remove();
        }
    }
}
// Singleton instance
export const pluginManager = new PluginManager();
