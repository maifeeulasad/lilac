import type { ContextMenuItem, EditorContext, EditorPanel, EditorPlugin, KeyboardShortcut } from '../types/index';

/**
 * The subset of EditorPlugin keys that are lifecycle hooks, i.e. the callable
 * ones. Excludes data members such as `toolbarButtons` and `styles`.
 */
type PluginHookName = {
  [K in keyof EditorPlugin]-?: NonNullable<EditorPlugin[K]> extends (...args: never[]) => void ? K : never;
}[keyof EditorPlugin];

/**
 * Plugin stylesheets are injected into document.head, which is shared by every
 * editor on the page, while PluginManager instances are per-editor. Refcount
 * them here so that tearing down one editor does not strip the styles out from
 * under another editor still using the same plugin.
 */
const styleRefCounts = new Map<string, number>();

export class PluginManager {
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

  /**
   * Invoke a lifecycle hook on every installed plugin.
   *
   * Arguments are forwarded verbatim, in the order the hook declares them. The
   * context is NOT injected here — call sites pass it in its declared position,
   * which for most hooks is last.
   */
  executeHook<T extends PluginHookName>(
    hook: T,
    ...args: Parameters<NonNullable<EditorPlugin[T]>>
  ): void {
    this.plugins.forEach((plugin) => {
      const hookFn = plugin[hook];
      if (typeof hookFn === 'function') {
        try {
          (hookFn as (...hookArgs: unknown[]) => void).apply(plugin, args);
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
  getContextMenuItems(): ContextMenuItem[] {
    const items: ContextMenuItem[] = [];
    this.plugins.forEach((plugin) => {
      if (plugin.contextMenuItems) {
        items.push(...plugin.contextMenuItems);
      }
    });
    return items;
  }

  // Get all keyboard shortcuts from plugins
  getKeyboardShortcuts(): KeyboardShortcut[] {
    const shortcuts: KeyboardShortcut[] = [];
    this.plugins.forEach((plugin) => {
      if (plugin.keyboardShortcuts) {
        shortcuts.push(...plugin.keyboardShortcuts);
      }
    });
    return shortcuts;
  }

  // Get all panels from plugins
  getPanels(): EditorPanel[] {
    const panels: EditorPanel[] = [];
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
    const refs = styleRefCounts.get(styleId) ?? 0;
    styleRefCounts.set(styleId, refs + 1);

    // Already on the page for another editor — leave the existing node alone.
    if (refs > 0 && document.getElementById(styleId)) return;

    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }

  private removeStyles(pluginId: string): void {
    const styleId = `lilac-plugin-${pluginId}`;
    const refs = styleRefCounts.get(styleId) ?? 0;

    if (refs > 1) {
      styleRefCounts.set(styleId, refs - 1);
      return;
    }

    styleRefCounts.delete(styleId);
    document.getElementById(styleId)?.remove();
  }
}

// Singleton instance
export const pluginManager = new PluginManager();
