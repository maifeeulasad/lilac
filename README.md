# 🌸 Lilac

> A smooth, modern WYSIWYG text editor with a clean interface, elegant typography, and a calming editing experience.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)

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

## 🛠️ Development

### Prerequisites

- Node.js 18+ 
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
│   └── Editor/         # Main editor component
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
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
- [ ] 📋 Copy/Paste enhancements
- [x] 🔗 Link insertion and management
- [ ] 🖼️ Image upload and embedding
- [ ] 📝 Markdown support
- [ ] 🔍 Find and replace
- [ ] 📊 Table support
- [ ] 🎯 Vue.js integration
- [ ] 🅰️ Angular integration
- [ ] 🔌 Plugin system
- [ ] 📱 Mobile optimizations
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