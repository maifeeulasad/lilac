import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PluginManager } from '../core/plugins/PluginManager';
import type { EditorContext, EditorPlugin } from '../core/types/index';

function stubContext(): EditorContext {
  return {
    state: {
      content: '',
      selection: null,
      history: { undoStack: [], redoStack: [], maxHistorySize: 50 },
      isReadOnly: false,
    },
    setState: vi.fn(),
    element: null,
    focus: vi.fn(),
    blur: vi.fn(),
    insertContent: vi.fn(),
    formatSelection: vi.fn(),
    getSelectedText: () => '',
  };
}

function stubPlugin(overrides: Partial<EditorPlugin> = {}): EditorPlugin {
  return { id: 'test', name: 'Test', version: '1.0.0', ...overrides };
}

describe('PluginManager', () => {
  let manager: PluginManager;

  beforeEach(() => {
    manager = new PluginManager();
    manager.setContext(stubContext());
  });

  it('installs and reports a plugin', () => {
    manager.install(stubPlugin());
    expect(manager.isInstalled('test')).toBe(true);
    expect(manager.getPlugin('test')?.name).toBe('Test');
  });

  it('runs onInstall with the context', () => {
    const onInstall = vi.fn();
    manager.install(stubPlugin({ onInstall }));
    expect(onInstall).toHaveBeenCalledTimes(1);
  });

  it('refuses to install the same id twice', () => {
    const onInstall = vi.fn();
    manager.install(stubPlugin({ onInstall }));
    manager.install(stubPlugin({ onInstall }));
    expect(onInstall).toHaveBeenCalledTimes(1);
  });

  it('uninstalls and runs the hook', () => {
    const onUninstall = vi.fn();
    manager.install(stubPlugin({ onUninstall }));
    manager.uninstall('test');
    expect(onUninstall).toHaveBeenCalledTimes(1);
    expect(manager.isInstalled('test')).toBe(false);
  });

  it('injects and removes plugin styles', () => {
    manager.install(stubPlugin({ styles: '.x { color: red }' }));
    expect(document.getElementById('lilac-plugin-test')).not.toBeNull();

    manager.uninstall('test');
    expect(document.getElementById('lilac-plugin-test')).toBeNull();
  });

  it('aggregates toolbar buttons and keyboard shortcuts', () => {
    manager.install(stubPlugin({
      toolbarButtons: [{ id: 'b', icon: '', label: 'B', onClick: vi.fn() }],
      keyboardShortcuts: [{ key: 'k', ctrlKey: true, action: vi.fn() }],
    }));

    expect(manager.getToolbarButtons()).toHaveLength(1);
    expect(manager.getKeyboardShortcuts()).toHaveLength(1);
  });

  it('isolates instances from one another', () => {
    const other = new PluginManager();
    other.setContext(stubContext());
    manager.install(stubPlugin());

    expect(other.isInstalled('test')).toBe(false);
    expect(other.getToolbarButtons()).toHaveLength(0);
  });

  it('keeps running other plugins when one hook throws', () => {
    const healthy = vi.fn();
    manager.install(stubPlugin({ id: 'bad', onEditorMount: () => { throw new Error('boom'); } }));
    manager.install(stubPlugin({ id: 'good', onEditorMount: healthy }));

    const context = stubContext();
    expect(() => manager.executeHook('onEditorMount', context)).not.toThrow();
    expect(healthy).toHaveBeenCalled();
  });

  it('runs content transformers in order', () => {
    manager.install(stubPlugin({
      contentTransformers: [
        { id: 't1', name: 'upper', transform: (c) => c.toUpperCase() },
        { id: 't2', name: 'exclaim', transform: (c) => `${c}!` },
      ],
    }));

    expect(manager.transformContent('hi')).toBe('HI!');
  });
});
