// Lilac Lit Adapter
//
// Exposes the editor as a native custom element, <lilac-editor>, built on
// LitElement. Reactive properties are declared with the static `properties`
// getter rather than decorators, so the package builds with `tsc` alone and
// needs no decorator/compiler configuration.
//
// The element renders into the light DOM (createRenderRoot returns `this`) so
// Lilac's global stylesheet reaches the editable region — a shadow root would
// wall it off.
//
//   import '@lilac-wysiwyg/lit';
//
//   <lilac-editor value="<p>Hello!</p>" toolbar></lilac-editor>
//   el.addEventListener('change', (e) => console.log(e.detail));

import { LitElement, html } from 'lit';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import { LilacEditor as LilacCore } from '@lilac-wysiwyg/core';
import type { EditorPlugin, EditorProps, EditorRef, ToolbarConfig } from '@lilac-wysiwyg/core';

const DEFAULT_TOOLS: ToolbarConfig = {
  show: true,
  tools: [
    'bold', 'italic', 'underline', 'strikethrough', 'separator',
    'heading1', 'heading2', 'paragraph', 'separator',
    'bulletList', 'orderedList', 'separator',
    'blockquote', 'codeBlock', 'separator',
    'link', 'image',
  ],
};

/**
 * `<lilac-editor>` custom element.
 *
 * Emits a `change` CustomEvent (`detail: string`) on every content change, and
 * `lilac-focus` / `lilac-blur` / `lilac-selection-change` events. `value` and
 * `read-only` react to attribute/property changes; the rest are read on first
 * render, since rebuilding the editor would discard undo history and caret.
 */
export class LilacEditorElement extends LitElement {
  static properties = {
    value: { type: String },
    placeholder: { type: String },
    readOnly: { type: Boolean, attribute: 'read-only' },
    minHeight: { type: Number, attribute: 'min-height' },
    maxHeight: { type: Number, attribute: 'max-height' },
    theme: { type: String },
    autoFocus: { type: Boolean, attribute: 'auto-focus' },
    toolbar: { type: Boolean },
  };

  declare value: string;
  declare placeholder: string;
  declare readOnly: boolean;
  declare minHeight: number;
  declare maxHeight: number;
  declare theme: 'light' | 'dark' | 'auto';
  declare autoFocus: boolean;
  declare toolbar: ToolbarConfig | boolean;

  /** Plugins are objects, not attributes, so they are set as a property only. */
  plugins?: EditorPlugin[];

  private editor: EditorRef | null = null;
  private mountRef: Ref<HTMLDivElement> = createRef();

  constructor() {
    super();
    this.value = '';
    this.placeholder = 'Start writing...';
    this.readOnly = false;
    this.minHeight = 200;
    this.maxHeight = 600;
    this.theme = 'light';
    this.autoFocus = false;
    this.toolbar = true;
  }

  // Light DOM: the editor's global CSS must reach the editable region.
  protected createRenderRoot(): HTMLElement {
    return this;
  }

  protected firstUpdated(): void {
    const mount = this.mountRef.value;
    if (!mount) return;

    let toolbarConfig: ToolbarConfig | undefined;
    if (this.toolbar === true) toolbarConfig = DEFAULT_TOOLS;
    else if (typeof this.toolbar === 'object') toolbarConfig = this.toolbar;

    const props: EditorProps = {
      container: mount,
      initialContent: this.value,
      placeholder: this.placeholder,
      readOnly: this.readOnly,
      autoFocus: this.autoFocus,
      minHeight: this.minHeight,
      maxHeight: this.maxHeight,
      theme: this.theme,
      plugins: this.plugins,
      toolbar: toolbarConfig,
      onChange: (content) => {
        this.value = content;
        this.dispatchEvent(new CustomEvent('change', { detail: content }));
      },
      onFocus: () => this.dispatchEvent(new CustomEvent('lilac-focus')),
      onBlur: () => this.dispatchEvent(new CustomEvent('lilac-blur')),
      onSelectionChange: (selection) =>
        this.dispatchEvent(new CustomEvent('lilac-selection-change', { detail: selection })),
    };
    this.editor = new LilacCore(props);
  }

  protected updated(changed: Map<string, unknown>): void {
    if (!this.editor) return;
    if (changed.has('value') && this.value !== this.editor.getContent()) {
      this.editor.setContent(this.value);
    }
    if (changed.has('readOnly')) {
      this.editor.setReadOnly(this.readOnly);
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.editor?.destroy();
    this.editor = null;
  }

  protected render() {
    return html`<div
      class="lilac-lit-editor"
      data-testid="lilac-lit-editor"
      ${ref(this.mountRef)}
    ></div>`;
  }
}

/** Register `<lilac-editor>` if it is not already defined. */
export function defineLilacEditor(tag = 'lilac-editor'): void {
  if (!customElements.get(tag)) {
    customElements.define(tag, LilacEditorElement);
  }
}

// Auto-register on import — the common case for a custom element.
defineLilacEditor();

/** Create a Lit adapter descriptor for the Lilac editor. */
export function createLitAdapter() {
  return {
    name: 'lit',
    version: '0.5.0',
    element: LilacEditorElement,
  };
}

export default LilacEditorElement;
