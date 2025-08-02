# 🌸 Lilac

> A smooth, modern WYSIWYG text editor with a clean interface, elegant typography, and a calming editing experience.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)

![preview of lilac](https://raw.githubusercontent.com/maifeeulasad/lilac/refs/heads/main/snap/screenshot.png)

## ✨ Features

- **🎨 Beautiful Design**: Clean, calming interface with elegant typography
- **📝 Rich Text Editing**: Full WYSIWYG editor with formatting toolbar
- **⚡ Modern Stack**: Built with React 18, TypeScript, and Vite
- **🔧 Fully Typed**: Strict TypeScript configuration for better development experience
- **📱 Responsive**: Works seamlessly across desktop, tablet, and mobile devices
- **🌙 Dark Mode**: Built-in light and dark theme support
- **♿ Accessible**: WCAG compliant with proper ARIA attributes
- **⚙️ Configurable**: Extensive customization options
- **🔄 Undo/Redo**: Full history management with keyboard shortcuts
- **⌨️ Keyboard Shortcuts**: Full support for common formatting shortcuts
- **🛠️ Extensible Toolbar**: Customizable toolbar with rich formatting options
- **🔌 Plugin System**: Powerful extension system with built-in plugins
- **🎯 Framework Agnostic**: Designed to work with multiple frameworks (React first, more coming)

## 🚀 Quick Start

### Installation

```bash
npm install lilac-editor
# or
yarn add lilac-editor
# or
pnpm add lilac-editor
```

### Basic Usage

```tsx
import React from 'react';
import { Editor } from 'lilac-editor';

function MyApp() {
  const [content, setContent] = useState('');

  return (
    <Editor
      initialContent="<h1>Welcome to Lilac!</h1><p>Start typing...</p>"
      placeholder="Enter your text here..."
      onChange={setContent}
      theme="light"
      autoFocus
      toolbar={{
        show: true,
        tools: ['bold', 'italic', 'underline', 'separator', 'heading1', 'heading2']
      }}
    />
  );
}
```

### Using Built-in Plugins

```tsx
import React from 'react';
import { Editor, wordCountPlugin, emojiPlugin, tablePlugin } from 'lilac-editor';

function MyApp() {
  const [content, setContent] = useState('');

  return (
    <Editor
      initialContent="<h1>Welcome to Lilac!</h1><p>Start typing...</p>"
      onChange={setContent}
      plugins={[
        wordCountPlugin,    // Document statistics panel
        emojiPlugin,        // Emoji picker with Ctrl+Shift+E
        tablePlugin,        // Table inserter with Ctrl+Shift+T
      ]}
      toolbar={{ show: true }}
    />
  );
}
```

### Advanced Usage with Ref

```tsx
import React, { useRef } from 'react';
import { Editor, type EditorRef } from 'lilac-editor';

function MyApp() {
  const editorRef = useRef<EditorRef>(null);

  const handleUndo = () => {
    editorRef.current?.undo();
  };

  const handleRedo = () => {
    editorRef.current?.redo();
  };

  const getContent = () => {
    const content = editorRef.current?.getContent();
    console.log('Current content:', content);
  };

  return (
    <div>
      <div>
        <button onClick={handleUndo}>Undo</button>
        <button onClick={handleRedo}>Redo</button>
        <button onClick={getContent}>Get Content</button>
      </div>
      
      <Editor
        ref={editorRef}
        initialContent="Welcome to Lilac Editor!"
        maxLength={5000}
        toolbar={{ show: true }}
      />
    </div>
  );
}
```

## 📖 API Reference

### EditorProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialContent` | `string` | `''` | Initial content of the editor (HTML for rich text) |
| `placeholder` | `string` | `'Start writing...'` | Placeholder text when editor is empty |
| `readOnly` | `boolean` | `false` | Whether the editor is read-only |
| `autoFocus` | `boolean` | `false` | Auto-focus editor on mount |
| `maxLength` | `number` | `undefined` | Maximum character limit (plain text mode only) |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'light'` | Editor theme |
| `className` | `string` | `undefined` | Additional CSS class |
| `style` | `CSSProperties` | `undefined` | Inline styles |
| `onChange` | `(content: string) => void` | `undefined` | Content change callback |
| `onSelectionChange` | `(selection: SelectionRange \| null) => void` | `undefined` | Selection change callback |
| `onFocus` | `() => void` | `undefined` | Focus event callback |
| `onBlur` | `() => void` | `undefined` | Blur event callback |
| `toolbar` | `ToolbarConfig` | `undefined` | Toolbar configuration |
| `plugins` | `EditorPlugin[]` | `[]` | Array of plugins to install |

### ToolbarConfig

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `show` | `boolean` | `false` | Whether to show the toolbar |
| `tools` | `ToolbarTool[]` | Default tools | Array of toolbar tools to display |
| `position` | `'top' \| 'bottom' \| 'floating'` | `'top'` | Toolbar position (top only for now) |

### Available Toolbar Tools

| Tool | Description | Keyboard Shortcut |
|------|-------------|-------------------|
| `'bold'` | Bold text formatting | Ctrl/Cmd + B |
| `'italic'` | Italic text formatting | Ctrl/Cmd + I |
| `'underline'` | Underline text formatting | Ctrl/Cmd + U |
| `'strikethrough'` | Strikethrough text formatting | - |
| `'heading1'` | Heading 1 format | - |
| `'heading2'` | Heading 2 format | - |
| `'heading3'` | Heading 3 format | - |
| `'paragraph'` | Paragraph format | - |
| `'bulletList'` | Bullet list | - |
| `'orderedList'` | Numbered list | - |
| `'blockquote'` | Block quote | - |
| `'codeBlock'` | Code block | - |
| `'link'` | Insert/edit link | Ctrl/Cmd + K |
| `'image'` | Insert image | - |
| `'separator'` | Visual separator | - |

### Example Toolbar Configuration

```tsx
<Editor
  toolbar={{
    show: true,
    tools: [
      'bold',
      'italic',
      'underline',
      'separator',
      'heading1',
      'heading2',
      'heading3',
      'paragraph',
      'separator',
      'bulletList',
      'orderedList',
      'blockquote',
      'separator',
      'link',
      'codeBlock'
    ]
  }}
/>
```

### EditorRef Methods

| Method | Type | Description |
|--------|------|-------------|
| `getContent()` | `() => string` | Get current editor content |
| `setContent(content)` | `(content: string) => void` | Set editor content |
| `focus()` | `() => void` | Focus the editor |
| `blur()` | `() => void` | Blur the editor |
| `undo()` | `() => void` | Undo last change |
| `redo()` | `() => void` | Redo last undone change |
| `canUndo` | `boolean` | Whether undo is available |
| `canRedo` | `boolean` | Whether redo is available |

## 🔌 Plugin System

Lilac features a powerful plugin system that allows you to extend the editor with custom functionality. The system supports toolbar buttons, side panels, keyboard shortcuts, content transformers, and more.

### Built-in Plugins

#### 📊 Word Count Plugin
Displays real-time document statistics in a side panel.

```tsx
import { wordCountPlugin } from 'lilac-editor';

<Editor plugins={[wordCountPlugin]} />
```

**Features:**
- Words, characters, paragraphs count
- Real-time updates
- Right sidebar panel
- Clean, organized display

#### 😊 Emoji Picker Plugin
Add emojis to your content with an easy-to-use picker.

```tsx
import { emojiPlugin } from 'lilac-editor';

<Editor plugins={[emojiPlugin]} />
```

**Features:**
- Categorized emoji selection (Smileys, Nature, Food, Travel, Objects)
- Toolbar button integration
- Keyboard shortcut: `Ctrl+Shift+E`
- Modal interface with search

#### 📋 Table Inserter Plugin
Insert and customize HTML tables with an interactive dialog.

```tsx
import { tablePlugin } from 'lilac-editor';

<Editor plugins={[tablePlugin]} />
```

**Features:**
- Configurable rows and columns
- Header row option
- Border toggle
- Live preview
- Keyboard shortcut: `Ctrl+Shift+T`

### Creating Custom Plugins

Create your own plugins by implementing the `EditorPlugin` interface:

```tsx
import { EditorPlugin, EditorContext } from 'lilac-editor';
import { MyIcon } from 'lucide-react';

export const myCustomPlugin: EditorPlugin = {
  id: 'my-custom-plugin',
  name: 'My Custom Plugin',
  version: '1.0.0',
  description: 'A custom plugin that does amazing things',
  
  // Add toolbar buttons
  toolbarButtons: [
    {
      id: 'my-button',
      icon: <MyIcon size={16} />,
      label: 'My Tool',
      tooltip: 'My custom tool (Ctrl+M)',
      onClick: (context: EditorContext) => {
        context.insertContent('<strong>Custom content!</strong>');
      },
    },
  ],
  
  // Add keyboard shortcuts
  keyboardShortcuts: [
    {
      key: 'm',
      ctrlKey: true,
      action: (context: EditorContext) => {
        context.insertContent('<em>Shortcut triggered!</em>');
      },
    },
  ],
  
  // Add custom styles
  styles: `
    .my-custom-styles {
      color: #ff6b6b;
      font-weight: bold;
    }
  `,
  
  // Lifecycle hooks
  onInstall: (context) => console.log('Plugin installed'),
  onContentChange: (content, context) => {
    // React to content changes
  },
};
```

### Plugin Capabilities

| Feature | Description |
|---------|-------------|
| **Toolbar Buttons** | Add custom formatting tools and actions |
| **Side Panels** | Create custom UI panels (left, right, bottom) |
| **Keyboard Shortcuts** | Define custom hotkey combinations |
| **Content Transformers** | Process and transform content automatically |
| **Lifecycle Hooks** | React to editor events (mount, unmount, content changes) |
| **Custom Styles** | Inject CSS for plugin-specific styling |
| **Context Menu** | Add right-click menu items |

### Plugin Manager

Access the plugin manager for programmatic control:

```tsx
import { pluginManager } from 'lilac-editor';

// Install a plugin
pluginManager.install(myCustomPlugin);

// Check if installed
if (pluginManager.isInstalled('my-plugin-id')) {
  console.log('Plugin is active');
}

// Get all plugins
const allPlugins = pluginManager.getAllPlugins();

// Uninstall a plugin
pluginManager.uninstall('my-plugin-id');
```

### Plugin API Exports

```tsx
// Plugin system
import { 
  PluginManager, 
  pluginManager,
  EditorPlugin,
  EditorContext 
} from 'lilac-editor';

// Built-in plugins
import { 
  wordCountPlugin,
  emojiPlugin,
  tablePlugin 
} from 'lilac-editor';
```

## 🛠️ Development

### Prerequisites

- Node.js 18+, recommended 20+ LTS
- npm, yarn, or pnpm

### Setup

```bash
# Clone the repository
git clone https://github.com/maifeeulasad/lilac.git
cd lilac

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run typecheck
```

### Project Structure

```
src/
├── components/          # React components
│   ├── Editor/         # Main editor component
│   └── Toolbar/        # Toolbar component
├── hooks/              # Custom React hooks
├── plugins/            # Plugin system and built-in plugins
│   ├── PluginManager.ts    # Plugin manager
│   ├── wordCount.tsx       # Word count plugin
│   ├── emojiPicker.tsx     # Emoji picker plugin
│   ├── tableInserter.tsx   # Table inserter plugin
│   └── index.ts            # Plugin exports
├── types/              # TypeScript type definitions
│   ├── editor.ts           # Core editor types
│   ├── plugin.ts           # Plugin system types
│   └── index.ts            # Type exports
├── utils/              # Utility functions
├── App.tsx             # Demo application
├── main.tsx            # Entry point
└── index.ts            # Library exports
```

## 🎨 Customization

### Themes

Lilac comes with built-in light and dark themes. You can also create custom themes by overriding CSS custom properties:

```css
.lilac-editor {
  --lilac-color-primary: #your-color;
  --lilac-color-background: #your-bg;
  --lilac-border-radius: 8px;
  /* ... other variables */
}
```

### Styling

The editor uses CSS custom properties for easy theming. All styles are scoped to prevent conflicts with your application.

## 🗺️ Roadmap

- [x] 🔧 Rich text toolbar (Bold, Italic, Underline, etc.)
- [x] � Emoji support (via Emoji Picker plugin)
- [ ] �📋 Copy/Paste enhancements
- [x] 🔗 Link insertion and management
- [ ] 🖼️ Image upload and embedding
- [ ] 📝 Markdown support
- [ ] 🔍 Find and replace
- [x] 📊 Table support
- [ ] 🎯 Vue.js integration
- [ ] 🅰️ Angular integration
- [x] � Plugin system
- [ ] �📱 Mobile optimizations
- [ ] 🎨 More themes
- [ ] 🧪 Comprehensive test suite

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for your changes
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by modern text editors like Notion, Linear, and GitHub
- Built with love using React, TypeScript, and modern web technologies
- Thanks to all contributors and the open-source community

---

<div align="center">
  <p>Made with 🌸 by <a href="https://github.com/maifeeulasad">maifeeulasad</a></p>
  <p>⭐ Star us on GitHub if you find this project useful!</p>
</div>