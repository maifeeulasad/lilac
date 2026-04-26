# Lilac Editor

> A smooth, modern WYSIWYG text editor built with TypeScript. Framework-agnostic core with adapters for React, Svelte, Angular, Vue, and Vanilla JS.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-brightgreen?style=for-the-badge)]()
[![Framework Agnostic](https://img.shields.io/badge/Framework-Agnostic-blue?style=for-the-badge)]()

## Architecture

Lilac follows an **adapter pattern** for maximum framework compatibility. The core functionality is isolated from framework-specific implementations, ensuring consistent behavior across all platforms.

```
lilac/
├── core/                    # Framework-agnostic core
│   ├── types/               # TypeScript type definitions
│   ├── plugins/              # Plugin system (emoji, table, word count)
│   ├── utils/                # Utility functions (formatting, icons)
│   ├── components/           # Core components (Editor, Toolbar)
│   └── index.ts              # Core exports
├── adapter/                  # Framework-specific adapters
│   ├── react/                # React component wrapper
│   ├── svelte/               # Svelte component
│   ├── angular/              # Angular component/directive
│   ├── vue/                  # Vue component
│   └── vanilla/              # Vanilla JS wrapper
└── docs/                     # Documentation & demos
```

### Core Design Principles

1. **UI Instructions in Core**: The core package contains all UI styling instructions to ensure consistent appearance across all framework adapters
2. **Framework-Agnostic Logic**: Business logic and state management are kept framework-independent
3. **Adapter Pattern**: Each framework gets its own adapter that bridges the core with framework-specific patterns

## Features

- **Framework-Agnostic Core**: Pure TypeScript implementation with no dependencies
- **Consistent UI**: Centralized UI instructions ensure identical styling across all adapters
- **Plugin System**: Extensible architecture with built-in plugins for emojis, tables, and word count
- **Rich Text Formatting**: Bold, italic, underline, strikethrough, headings, lists, blockquotes, code blocks
- **Media Support**: Link and image insertion with keyboard shortcuts
- **Keyboard Shortcuts**: Ctrl/Cmd + B for bold, Ctrl/Cmd + I for italic, etc.
- **Undo/Redo**: Full history support with 50-step undo stack
- **Theme Support**: Light and dark themes with CSS custom properties
- **Accessibility**: WCAG compliant with ARIA labels and keyboard navigation
- **Plugin API**: Create custom plugins with toolbar buttons, keyboard shortcuts, and lifecycle hooks

## Installation

### Core (Vanilla JS / TypeScript)

```bash
npm install @lilac-wysiwyg/core
pnpm add @lilac-wysiwyg/core
yarn add @lilac-wysiwyg/core
```

### Framework Adapters

```bash
# React
npm install @lilac-wysiwyg/react

# Svelte
npm install @lilac-wysiwyg/svelte

# Angular
npm install @lilac-wysiwyg/angular

# Vue
npm install @lilac-wysiwyg/vue
```

## Quick Start

### Vanilla JS / TypeScript (Core)

```typescript
import { LilacEditor, injectStyles } from '@lilac-wysiwyg/core';

// Inject required styles (only needed once per page)
injectStyles();

// Create editor instance
const editor = new LilacEditor({
  container: document.getElementById('editor')!,
  toolbar: { show: true },
  placeholder: 'Start writing...',
  onChange: (content) => {
    console.log('Content:', content);
  }
});

// Get content
const content = editor.getContent();

// Set content
editor.setContent('<p>Hello World!</p>');
```

### React

```tsx
import { LilacEditor } from '@lilac-wysiwyg/react';
import '@lilac-wysiwyg/react/styles';

function App() {
  const [content, setContent] = useState('<p>Hello!</p>');

  return (
    <LilacEditor
      value={content}
      onChange={setContent}
      toolbar={{ show: true }}
      placeholder="Start writing..."
    />
  );
}
```

### Vue 3

```vue
<template>
  <LilacEditor
    v-model="content"
    :toolbar="{ show: true }"
    placeholder="Start writing..."
  />
</template>

<script setup>
import { ref } from 'vue';
import { LilacEditor } from '@lilac-wysiwyg/vue';

const content = ref('<p>Hello!</p>');
</script>
```

## Using Built-in Plugins

```typescript
import { 
  LilacEditor, 
  injectStyles,
  pluginManager,
  wordCountPlugin,
  emojiPlugin,
  tablePlugin
} from '@lilac-wysiwyg/core';

injectStyles();

// Install plugins
pluginManager.install(wordCountPlugin);
pluginManager.install(emojiPlugin);
pluginManager.install(tablePlugin);

const editor = new LilacEditor({
  container: document.getElementById('editor')!,
  toolbar: { show: true },
  onChange: (content) => console.log('Content:', content)
});
```

## API Reference

### LilacEditor Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `container` | `HTMLElement` | **required** | DOM element to mount the editor |
| `initialContent` | `string` | `''` | Initial HTML content of the editor |
| `placeholder` | `string` | `'Start writing...'` | Placeholder text when editor is empty |
| `readOnly` | `boolean` | `false` | Whether the editor is read-only |
| `autoFocus` | `boolean` | `false` | Auto-focus editor on mount |
| `theme` | `'light' \| 'dark'` | `'light'` | Editor theme |
| `onChange` | `(content: string) => void` | `undefined` | Content change callback |
| `onFocus` | `() => void` | `undefined` | Focus event callback |
| `onBlur` | `() => void` | `undefined` | Blur event callback |
| `toolbar` | `ToolbarConfig` | `undefined` | Toolbar configuration |
| `plugins` | `EditorPlugin[]` | `[]` | Plugins to install |

### LilacEditor Methods

| Method | Description |
|--------|-------------|
| `getContent()` | Get current editor HTML content |
| `setContent(content)` | Set editor content |
| `focus()` | Focus the editor |
| `blur()` | Blur the editor |
| `undo()` | Undo last change |
| `redo()` | Redo last undone change |
| `setReadOnly(readOnly)` | Enable/disable read-only mode |
| `destroy()` | Clean up and remove the editor |

### Toolbar Tools

| Tool | Keyboard Shortcut |
|------|-----------------|
| Bold | Ctrl/Cmd + B |
| Italic | Ctrl/Cmd + I |
| Underline | Ctrl/Cmd + U |
| Strikethrough | - |
| Heading 1-3 | - |
| Paragraph | - |
| Bullet List | - |
| Ordered List | - |
| Blockquote | - |
| Code Block | - |
| Link | Ctrl/Cmd + K |
| Image | - |

## Plugin System

Lilac features a powerful plugin system that allows extending the editor with custom functionality.

### Built-in Plugins

- **Word Count Plugin**: Displays real-time document statistics (Ctrl+Shift+W)
- **Emoji Picker Plugin**: Insert emojis with an easy-to-use picker (Ctrl+Shift+E)
- **Table Inserter Plugin**: Insert and manage HTML tables (Ctrl+Shift+T)

### Creating Custom Plugins

```typescript
import type { EditorPlugin } from '@lilac-wysiwyg/core';

export const myCustomPlugin: EditorPlugin = {
  id: 'my-custom-plugin',
  name: 'My Custom Plugin',
  version: '1.0.0',

  // Toolbar buttons
  toolbarButtons: [{
    id: 'my-button',
    icon: '<svg>...</svg>',
    label: 'My Tool',
    tooltip: 'My custom tool',
    onClick: (context) => {
      context.insertContent('<strong>Custom!</strong>');
    },
  }],

  // Keyboard shortcuts
  keyboardShortcuts: [{
    key: 'm',
    ctrlKey: true,
    action: (context) => {
      context.insertContent('<em>Shortcut!</em>');
    },
  }],

  // Lifecycle hooks
  onInstall: (context) => console.log('Installed'),
  onEditorMount: (context) => console.log('Ready'),
  onContentChange: (content, context) => {
    // React to content changes
  },
};
```

## Customization

### Themes

Override CSS custom properties to create custom themes:

```css
.lilac-editor {
  --lilac-color-primary: #your-color;
  --lilac-color-background: #your-bg;
  --lilac-border-radius: 8px;
}
```

## Development

```bash
# Install dependencies
pnpm install

# Build core library
pnpm build

# Watch for changes
pnpm dev

# Type check
pnpm typecheck
```

## Documentation

Visit our [GitHub Pages](https://maifeeulasad.github.io/lilac/) for complete documentation and live demos for each framework adapter.

## Roadmap

- [x] Rich text toolbar with all formatting options
- [x] Plugin system with built-in plugins
- [x] Emoji picker
- [x] Table inserter
- [x] Word count plugin
- [x] React adapter
- [x] Svelte adapter
- [ ] Angular adapter
- [ ] Vue adapter
- [ ] Markdown export/import
- [ ] Image upload and embedding
- [ ] Find and replace
- [ ] Mobile optimizations

## Contributing

We welcome contributions! Please see our Contributing Guide for details.

## License

MIT License - See [LICENSE](LICENSE) for details.

## Author

Maifee Ul Asad <maifeeulasad@gmail.com>

## Preview

![preview of lilac](https://raw.githubusercontent.com/maifeeulasad/lilac/refs/heads/main/snap/screenshot.png)

---

<div align="center">
  <p>Made with by <a href="https://github.com/maifeeulasad">maifeeulasad</a></p>
  <p>If you find this project useful, please star us on GitHub!</p>
</div>
