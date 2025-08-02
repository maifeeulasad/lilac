import { ReactNode } from 'react';
import { EditorState } from './editor';

export interface EditorContext {
    state: EditorState;
    setState: (state: Partial<EditorState>) => void;
    element: HTMLElement | null;
    focus: () => void;
    blur: () => void;
    insertContent: (content: string) => void;
    formatSelection: (command: string, value?: string) => void;
    getSelectedText: () => string;
}

export interface ToolbarButton {
    id: string;
    icon: ReactNode;
    label: string;
    tooltip?: string;
    onClick: (context: EditorContext) => void;
    isActive?: (context: EditorContext) => boolean;
    shortcut?: string;
    group?: string;
}

export interface EditorPlugin {
    id: string;
    name: string;
    version: string;
    description?: string;
    author?: string;

    // Lifecycle hooks
    onInstall?: (context: EditorContext) => void;
    onUninstall?: (context: EditorContext) => void;
    onEditorMount?: (context: EditorContext) => void;
    onEditorUnmount?: (context: EditorContext) => void;

    // Content hooks
    onContentChange?: (content: string, context: EditorContext) => void;
    onSelectionChange?: (selection: { start: number; end: number } | null, context: EditorContext) => void;

    // UI extensions
    toolbarButtons?: ToolbarButton[];
    contextMenuItems?: ContextMenuItem[];
    panels?: EditorPanel[];

    // Keyboard shortcuts
    keyboardShortcuts?: KeyboardShortcut[];

    // Content transformers
    contentTransformers?: ContentTransformer[];

    // Custom styles
    styles?: string;

    // Configuration
    config?: Record<string, any>;
}

export interface ContextMenuItem {
    id: string;
    label: string;
    icon?: ReactNode;
    onClick: (context: EditorContext) => void;
    separator?: boolean;
    visible?: (context: EditorContext) => boolean;
}

export interface EditorPanel {
    id: string;
    title: string;
    icon?: ReactNode;
    position: 'left' | 'right' | 'bottom';
    defaultOpen?: boolean;
    component: React.ComponentType<{ context: EditorContext }>;
}

export interface KeyboardShortcut {
    key: string;
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    metaKey?: boolean;
    action: (context: EditorContext) => void;
    preventDefault?: boolean;
}

export interface ContentTransformer {
    id: string;
    name: string;
    transform: (content: string, context: EditorContext) => string;
    reverse?: (content: string, context: EditorContext) => string;
}

export interface PluginManager {
    plugins: Map<string, EditorPlugin>;
    install: (plugin: EditorPlugin) => void;
    uninstall: (pluginId: string) => void;
    getPlugin: (pluginId: string) => EditorPlugin | undefined;
    getAllPlugins: () => EditorPlugin[];
    isInstalled: (pluginId: string) => boolean;
    executeHook: <T extends keyof EditorPlugin>(hook: T, ...args: any[]) => void;
}
