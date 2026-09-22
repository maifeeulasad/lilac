// Lilac Astro Adapter
//
// Astro renders to static HTML with client islands, so a conventional
// component wrapper is the wrong shape. This package ships two things instead:
//
//   1. mountLilacEditor(el, options) — a client-side factory to call from an
//      Astro `<script>` or inside any framework island, mounting the editor
//      into an element.
//   2. lilac() — an Astro integration that pre-bundles @lilac-wysiwyg/core with
//      Vite so the editor's ESM loads cleanly in dev and build.
//
//   ---
//   // astro.config.mjs
//   import lilac from '@lilac-wysiwyg/astro';
//   export default defineConfig({ integrations: [lilac()] });
//   ---
//   <div id="editor"></div>
//   <script>
//     import { mountLilacEditor } from '@lilac-wysiwyg/astro';
//     mountLilacEditor(document.getElementById('editor'), { toolbar: true });
//   </script>

import { LilacEditor as LilacCore } from '@lilac-wysiwyg/core';
import type { EditorPlugin, EditorProps, EditorRef, ToolbarConfig } from '@lilac-wysiwyg/core';

/** Options for {@link mountLilacEditor}. */
export interface MountLilacOptions {
  /** Initial content. */
  value?: string;
  /** Initial content (alias for `value`). */
  initialContent?: string;
  /** Placeholder text when the editor is empty. */
  placeholder?: string;
  /** Whether the editor starts read-only. */
  readOnly?: boolean;
  /** Toolbar configuration. `true` uses the default tool set. */
  toolbar?: ToolbarConfig | boolean;
  /** CSS class name. */
  className?: string;
  /** Minimum height in pixels. */
  minHeight?: number;
  /** Maximum height in pixels. */
  maxHeight?: number;
  /** Theme for the editor. */
  theme?: 'light' | 'dark' | 'auto';
  /** Auto focus on mount. */
  autoFocus?: boolean;
  /** Plugins to use. */
  plugins?: EditorPlugin[];
  /** Called when content changes. */
  onChange?: (content: string) => void;
}

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
 * Mount a Lilac editor into `container`. Intended for client-side use in an
 * Astro `<script>` or island. Returns the editor instance; call `.destroy()`
 * when the island unmounts.
 */
export function mountLilacEditor(container: HTMLElement, options: MountLilacOptions = {}): EditorRef {
  let toolbarConfig: ToolbarConfig | undefined;
  if (options.toolbar === true) toolbarConfig = DEFAULT_TOOLS;
  else if (typeof options.toolbar === 'object') toolbarConfig = options.toolbar;

  const props: EditorProps = {
    container,
    initialContent: options.value !== undefined ? options.value : (options.initialContent ?? ''),
    placeholder: options.placeholder ?? 'Start writing...',
    readOnly: options.readOnly ?? false,
    autoFocus: options.autoFocus ?? false,
    minHeight: options.minHeight ?? 200,
    maxHeight: options.maxHeight ?? 600,
    theme: options.theme ?? 'light',
    className: options.className ?? '',
    plugins: options.plugins,
    toolbar: toolbarConfig,
    onChange: (content) => options.onChange?.(content),
  };
  return new LilacCore(props);
}

// Minimal structural types for the slice of the Astro integration API used
// here. Depending on the full `astro` types would couple the build to their
// exact shape; Astro stays a peer dependency only.
interface ViteUpdate {
  optimizeDeps?: { include?: string[] };
  ssr?: { noExternal?: string[] };
}
interface AstroConfigSetupOptions {
  updateConfig: (config: { vite?: ViteUpdate }) => void;
}
export interface AstroIntegrationLike {
  name: string;
  hooks: {
    'astro:config:setup'?: (options: AstroConfigSetupOptions) => void | Promise<void>;
  };
}

/**
 * Astro integration that pre-bundles the core with Vite, so the editor's ESM
 * resolves cleanly in both dev and production builds.
 */
export function lilac(): AstroIntegrationLike {
  return {
    name: '@lilac-wysiwyg/astro',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({
          vite: {
            optimizeDeps: { include: ['@lilac-wysiwyg/core'] },
            ssr: { noExternal: ['@lilac-wysiwyg/core'] },
          },
        });
      },
    },
  };
}

export default lilac;
