import { useRef, useState } from 'react';
import { Editor, type EditorRef } from './index';
import './App.css';

function App() {
  const editorRef = useRef<EditorRef>(null);
  const [content, setContent] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [readOnly, setReadOnly] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);

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

  const handleSetRichContent = () => {
    const richContent = `<h1>Welcome to Lilac Editor!</h1>
<p>This is a <strong>rich text</strong> example with <em>formatting</em>.</p>
<h2>Features:</h2>
<ul>
<li><strong>Bold</strong> and <em>italic</em> text</li>
<li>Headers and paragraphs</li>
<li>Lists and quotes</li>
</ul>
<blockquote>
<p>This is a beautiful quote with elegant styling.</p>
</blockquote>`;
    editorRef.current?.setContent(richContent);
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
            Set Plain Content
          </button>
          <button className="app__button" onClick={handleSetRichContent}>
            Set Rich Content
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

          <label className="app__checkbox">
            <input
              type="checkbox"
              checked={showToolbar}
              onChange={(e) => setShowToolbar(e.target.checked)}
            />
            Show Toolbar
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
            initialContent={`<h1>Welcome to Lilac Editor! 🌸</h1>

<p>This is a <strong>modern WYSIWYG text editor</strong> built with <em>React</em> and <em>TypeScript</em>.</p>

<h2>✨ Features</h2>
<ul>
<li><strong>Rich text formatting</strong> with toolbar</li>
<li>Clean, calming interface</li>
<li>Elegant typography</li>
<li>Smooth interactions</li>
<li>Undo/Redo support</li>
<li>Keyboard shortcuts</li>
<li>Responsive design</li>
<li>Dark mode support</li>
</ul>

<h3>🎨 Try the formatting tools!</h3>
<p>Select text and use the toolbar buttons or keyboard shortcuts:</p>
<ul>
<li><strong>Ctrl/Cmd + B</strong> for bold</li>
<li><strong>Ctrl/Cmd + I</strong> for italic</li>
<li><strong>Ctrl/Cmd + U</strong> for underline</li>
<li><strong>Ctrl/Cmd + K</strong> for links</li>
</ul>

<blockquote>
<p>"The best way to predict the future is to create it." - Peter Drucker</p>
</blockquote>

<p>Enjoy writing with Lilac! ✍️</p>`}
            placeholder="Start writing something beautiful..."
            theme={theme}
            readOnly={readOnly}
            autoFocus
            maxLength={10000}
            onChange={handleContentChange}
            onFocus={() => console.log('Editor focused')}
            onBlur={() => console.log('Editor blurred')}
            toolbar={{ 
              show: showToolbar,
              tools: [
                'bold',
                'italic', 
                'underline',
                'strikethrough',
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
              <strong>Words:</strong> {content.trim() ? content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length : 0}
            </div>
            <div className="app__info-item">
              <strong>Lines:</strong> {content.split('\n').length}
            </div>
            <div className="app__info-item">
              <strong>Format:</strong> {showToolbar ? 'Rich Text' : 'Plain Text'}
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
            {showToolbar && (
              <>
                <div className="app__shortcut">
                  <kbd>Ctrl/Cmd + B</kbd>
                  <span>Bold</span>
                </div>
                <div className="app__shortcut">
                  <kbd>Ctrl/Cmd + I</kbd>
                  <span>Italic</span>
                </div>
                <div className="app__shortcut">
                  <kbd>Ctrl/Cmd + U</kbd>
                  <span>Underline</span>
                </div>
                <div className="app__shortcut">
                  <kbd>Ctrl/Cmd + K</kbd>
                  <span>Link</span>
                </div>
              </>
            )}
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
