import React, { useRef, useState } from 'react';
import { Editor, type EditorRef } from './index';
import './App.css';

function App() {
  const editorRef = useRef<EditorRef>(null);
  const [content, setContent] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [readOnly, setReadOnly] = useState(false);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleUndo = () => {
    editorRef.current?.undo();
  };

  const handleRedo = () => {
    editorRef.current?.redo();
  };

  const handleFocus = () => {
    editorRef.current?.focus();
  };

  const handleSetContent = () => {
    editorRef.current?.setContent('This is some sample content set programmatically!');
  };

  const canUndo = editorRef.current?.canUndo ?? false;
  const canRedo = editorRef.current?.canRedo ?? false;

  return (
    <div className={`app app--${theme}`}>
      <header className="app__header">
        <h1 className="app__title">
          <span className="app__title-icon">🌸</span>
          Lilac Editor
        </h1>
        <p className="app__subtitle">
          A smooth, modern WYSIWYG text editor with a clean interface, elegant typography, and a calming editing experience.
        </p>
      </header>

      <div className="app__controls">
        <div className="app__control-group">
          <button
            className="app__button"
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            ↶ Undo
          </button>
          <button
            className="app__button"
            onClick={handleRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            ↷ Redo
          </button>
        </div>

        <div className="app__control-group">
          <button className="app__button" onClick={handleFocus}>
            Focus Editor
          </button>
          <button className="app__button" onClick={handleSetContent}>
            Set Sample Content
          </button>
        </div>

        <div className="app__control-group">
          <label className="app__checkbox">
            <input
              type="checkbox"
              checked={readOnly}
              onChange={(e) => setReadOnly(e.target.checked)}
            />
            Read Only
          </label>
          
          <label className="app__select">
            Theme:
            <select 
              value={theme} 
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </div>
      </div>

      <main className="app__main">
        <div className="app__editor-container">
          <Editor
            ref={editorRef}
            initialContent="Welcome to Lilac Editor! 🌸

This is a modern WYSIWYG text editor built with React and TypeScript. 

Features:
• Clean, calming interface
• Elegant typography
• Smooth interactions
• Undo/Redo support
• Keyboard shortcuts
• Responsive design
• Dark mode support

Try typing, selecting text, and using Ctrl+Z/Ctrl+Y for undo/redo!"
            placeholder="Start writing something beautiful..."
            theme={theme}
            readOnly={readOnly}
            autoFocus
            maxLength={5000}
            onChange={handleContentChange}
            onFocus={() => console.log('Editor focused')}
            onBlur={() => console.log('Editor blurred')}
            toolbar={{ show: true }}
            className="app__editor"
          />
        </div>

        <div className="app__sidebar">
          <div className="app__info-panel">
            <h3>Content Info</h3>
            <div className="app__info-item">
              <strong>Characters:</strong> {content.length}
            </div>
            <div className="app__info-item">
              <strong>Words:</strong> {content.trim() ? content.trim().split(/\s+/).length : 0}
            </div>
            <div className="app__info-item">
              <strong>Lines:</strong> {content.split('\n').length}
            </div>
          </div>

          <div className="app__info-panel">
            <h3>Keyboard Shortcuts</h3>
            <div className="app__shortcut">
              <kbd>Ctrl/Cmd + Z</kbd>
              <span>Undo</span>
            </div>
            <div className="app__shortcut">
              <kbd>Ctrl/Cmd + Y</kbd>
              <span>Redo</span>
            </div>
            <div className="app__shortcut">
              <kbd>Ctrl/Cmd + Shift + Z</kbd>
              <span>Redo (Alt)</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="app__footer">
        <p>Built with ❤️ using React, TypeScript, and modern web technologies.</p>
      </footer>
    </div>
  );
}

export default App;
