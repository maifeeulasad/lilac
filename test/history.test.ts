// History (undo/redo) behavior — the 50-step cap and stack discipline walk
// through updateContent in Editor.ts. editor.test.ts covers the happy path;
// these pin the bounds.

import { afterEach, describe, expect, it } from 'vitest';
import { mountEditor, type EditorHarness } from './helpers/editor';

let h: EditorHarness;

afterEach(() => h?.cleanup());

function fill(count: number): void {
  for (let i = 0; i < count; i++) h.editor.setContent(`v${i}`);
}

describe('history', () => {
  it('caps the undo stack at 50 entries', () => {
    h = mountEditor();
    fill(60);
    let steps = 0;
    while (h.editor.canUndo) {
      h.editor.undo();
      steps++;
    }
    // 60 writes recorded 60 snapshots ('', v0..v58); only the newest 50
    // survive, so the earliest 10 edits (v0..v9) can no longer be restored.
    expect(steps).toBe(50);
    expect(h.editor.getContent()).toBe('v9');
  });

  it('does not record a history entry when content is unchanged', () => {
    h = mountEditor({ initialContent: 'same' });
    h.editor.setContent('same');
    h.editor.setContent('same');
    expect(h.editor.canUndo).toBe(false);
  });

  it('clears the redo stack on a fresh edit', () => {
    h = mountEditor({ initialContent: 'a' });
    h.editor.setContent('b');
    h.editor.undo();
    expect(h.editor.canRedo).toBe(true);
    h.editor.setContent('c');
    expect(h.editor.canRedo).toBe(false);
  });

  it('runs onChange while walking undo/redo', () => {
    const seen: string[] = [];
    h = mountEditor({ initialContent: 'a', onChange: (c) => seen.push(c) });
    h.editor.setContent('b');
    h.editor.undo();
    h.editor.redo();
    expect(seen).toEqual(['b', 'a', 'b']);
  });

  it('preserves root state when undoing back to the beginning', () => {
    h = mountEditor({ initialContent: 'root' });
    h.editor.setContent('next');
    h.editor.undo();
    expect(h.editor.getContent()).toBe('root');
    expect(h.editor.canUndo).toBe(false);
  });

  it('is a no-op past the bottom of the stack', () => {
    h = mountEditor({ initialContent: 'only' });
    h.editor.undo();
    h.editor.undo();
    expect(h.editor.getContent()).toBe('only');
  });
});