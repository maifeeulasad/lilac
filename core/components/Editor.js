import { pluginManager } from '../plugins/PluginManager';
import { cn, executeFormatCommand, getActiveFormats, getShortcutKey, insertImage, insertLink, keyboardShortcuts } from '../utils/formatting';
import { Toolbar } from './Toolbar';
export class LilacEditor {
    constructor(props) {
        this.toolbar = null;
        this.lastContentRef = '';
        this.props = {
            initialContent: '',
            placeholder: 'Start writing...',
            readOnly: false,
            autoFocus: false,
            minHeight: 200,
            maxHeight: 600,
            theme: 'light',
            plugins: [],
            ...props,
        };
        this.container = props.container;
        this.state = {
            content: this.props.initialContent || '',
            selection: null,
            history: {
                undoStack: [],
                redoStack: [],
                maxHistorySize: 50,
            },
            isReadOnly: this.props.readOnly || false,
        };
        this.editorWrapper = this.createEditor();
        this.contentElement = this.editorWrapper.querySelector('.lilac-editor__content');
        this.container.appendChild(this.editorWrapper);
        this.initializePlugins();
        this.setupEventListeners();
        if (this.props.autoFocus) {
            setTimeout(() => this.focus(), 0);
        }
    }
    createEditor() {
        const wrapper = document.createElement('div');
        wrapper.className = cn('lilac-editor', `lilac-editor--${this.props.theme}`, {
            'lilac-editor--readonly': this.state.isReadOnly,
            'lilac-editor--empty': !this.state.content.trim(),
        }, this.props.className);
        // Toolbar
        if (this.props.toolbar?.show) {
            this.toolbar = new Toolbar({
                tools: this.props.toolbar.tools,
                onToolClick: (tool) => this.handleToolClick(tool),
                activeTools: new Set(),
                disabled: this.state.isReadOnly,
                pluginButtons: pluginManager.getToolbarButtons(),
                editorContext: this.getEditorContext(),
            });
            wrapper.appendChild(this.toolbar.getElement());
        }
        // Content wrapper
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'lilac-editor__content-wrapper';
        contentWrapper.style.minHeight = `${this.props.minHeight}px`;
        contentWrapper.style.maxHeight = `${this.props.maxHeight}px`;
        // Placeholder
        const placeholder = document.createElement('div');
        placeholder.className = 'lilac-editor__placeholder';
        placeholder.textContent = this.props.placeholder || 'Start writing...';
        placeholder.style.display = this.state.content.trim() ? 'none' : 'block';
        contentWrapper.appendChild(placeholder);
        // Content editable
        const content = document.createElement('div');
        content.className = 'lilac-editor__content';
        content.contentEditable = (!this.state.isReadOnly).toString();
        content.setAttribute('role', 'textbox');
        content.setAttribute('aria-multiline', 'true');
        content.setAttribute('aria-label', 'Text editor');
        content.setAttribute('data-testid', 'lilac-editor-content');
        if (this.props.toolbar?.show) {
            content.innerHTML = this.props.initialContent || '';
        }
        else {
            content.textContent = this.props.initialContent || '';
        }
        this.lastContentRef = this.props.initialContent || '';
        contentWrapper.appendChild(content);
        wrapper.appendChild(contentWrapper);
        // Footer with char count
        if (this.props.maxLength) {
            const footer = document.createElement('div');
            footer.className = 'lilac-editor__footer';
            footer.innerHTML = `
        <span class="lilac-editor__char-count">
          ${this.state.content.length}/${this.props.maxLength}
        </span>
      `;
            wrapper.appendChild(footer);
        }
        return wrapper;
    }
    getEditorContext() {
        return {
            state: this.state,
            setState: (newState) => {
                if (newState.content !== undefined) {
                    this.updateContent(newState.content);
                }
            },
            element: this.contentElement,
            focus: () => this.focus(),
            blur: () => this.blur(),
            insertContent: (content) => {
                if (this.contentElement) {
                    this.contentElement.focus();
                    document.execCommand('insertHTML', false, content);
                    setTimeout(() => this.updateContentFromDOM(), 0);
                }
            },
            formatSelection: (command, value) => {
                if (this.contentElement) {
                    document.execCommand(command, false, value);
                    setTimeout(() => this.updateContentFromDOM(), 0);
                }
            },
            getSelectedText: () => {
                const selection = window.getSelection();
                return selection ? selection.toString() : '';
            },
        };
    }
    initializePlugins() {
        const context = this.getEditorContext();
        pluginManager.setContext(context);
        this.props.plugins?.forEach((plugin) => {
            if (!pluginManager.isInstalled(plugin.id)) {
                pluginManager.install(plugin);
            }
        });
        // Update toolbar with plugin buttons
        if (this.toolbar) {
            const pluginButtons = pluginManager.getToolbarButtons();
            if (pluginButtons.length > 0) {
                // Recreate toolbar with plugin buttons
                const toolbarElement = this.toolbar.getElement();
                const newToolbar = new Toolbar({
                    tools: this.props.toolbar?.tools,
                    onToolClick: (tool) => this.handleToolClick(tool),
                    activeTools: new Set(),
                    disabled: this.state.isReadOnly,
                    pluginButtons: pluginButtons,
                    editorContext: this.getEditorContext(),
                });
                toolbarElement.replaceWith(newToolbar.getElement());
                this.toolbar = newToolbar;
            }
        }
        pluginManager.executeHook('onEditorMount', context);
    }
    setupEventListeners() {
        this.contentElement.addEventListener('input', (e) => this.handleInput(e));
        this.contentElement.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.contentElement.addEventListener('keyup', () => this.updateActiveTools());
        this.contentElement.addEventListener('mouseup', () => this.updateActiveTools());
        this.contentElement.addEventListener('focus', () => this.handleFocus());
        this.contentElement.addEventListener('blur', () => this.handleBlur());
        document.addEventListener('selectionchange', () => this.handleSelectionChange());
    }
    handleInput(event) {
        const target = event.target;
        const newContent = this.props.toolbar?.show
            ? (target.innerHTML || '')
            : (target.textContent || '');
        if (this.props.maxLength && !this.props.toolbar?.show && newContent.length > this.props.maxLength) {
            target.textContent = this.lastContentRef;
            return;
        }
        this.lastContentRef = newContent;
        this.updateContent(newContent);
        this.updatePlaceholder();
        this.updateActiveTools();
    }
    handleKeyDown(event) {
        // Plugin keyboard shortcuts
        const pluginShortcuts = pluginManager.getKeyboardShortcuts();
        for (const shortcut of pluginShortcuts) {
            const matches = event.key.toLowerCase() === shortcut.key.toLowerCase() &&
                !!event.ctrlKey === !!shortcut.ctrlKey &&
                !!event.shiftKey === !!shortcut.shiftKey &&
                !!event.altKey === !!shortcut.altKey &&
                !!event.metaKey === !!shortcut.metaKey;
            if (matches) {
                event.preventDefault();
                shortcut.action(this.getEditorContext());
                return;
            }
        }
        // Formatting shortcuts
        if (this.props.toolbar?.show) {
            const shortcutKey = getShortcutKey(event);
            if (shortcutKey && keyboardShortcuts[shortcutKey]) {
                const tool = keyboardShortcuts[shortcutKey];
                event.preventDefault();
                this.handleToolClick(tool);
                return;
            }
        }
        // Undo/Redo
        if (event.metaKey || event.ctrlKey) {
            if (event.key === 'z') {
                if (event.shiftKey) {
                    event.preventDefault();
                    this.redo();
                }
                else {
                    event.preventDefault();
                    this.undo();
                }
            }
            else if (event.key === 'y') {
                event.preventDefault();
                this.redo();
            }
        }
    }
    handleToolClick(tool) {
        if (!this.contentElement)
            return;
        this.contentElement.focus();
        if (tool === 'link') {
            const url = prompt('Enter URL:');
            if (url) {
                insertLink(url);
                this.updateContentFromDOM();
            }
        }
        else if (tool === 'image') {
            const src = prompt('Enter image URL:');
            if (src) {
                insertImage(src);
                this.updateContentFromDOM();
            }
        }
        else {
            executeFormatCommand(tool);
            this.updateContentFromDOM();
        }
        setTimeout(() => this.updateActiveTools(), 0);
    }
    handleFocus() {
        this.props.onFocus?.();
        this.updateActiveTools();
    }
    handleBlur() {
        this.props.onBlur?.();
    }
    handleSelectionChange() {
        if (!this.contentElement)
            return;
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            this.state.selection = null;
            return;
        }
        const range = selection.getRangeAt(0);
        if (!this.contentElement.contains(range.commonAncestorContainer)) {
            this.state.selection = null;
            return;
        }
        this.state.selection = {
            start: range.startOffset,
            end: range.endOffset,
        };
        this.props.onSelectionChange?.(this.state.selection);
    }
    updateContent(newContent, addToHistory = true) {
        if (addToHistory && this.state.content !== newContent) {
            const newHistory = {
                ...this.state.history,
                undoStack: [
                    ...this.state.history.undoStack.slice(-(this.state.history.maxHistorySize - 1)),
                    this.state.content,
                ],
                redoStack: [],
            };
            this.state.history = newHistory;
        }
        this.state.content = newContent;
        this.props.onChange?.(newContent);
        pluginManager.executeHook('onContentChange', newContent, this.getEditorContext());
        this.updateCharCount();
    }
    updateContentFromDOM() {
        if (!this.contentElement)
            return;
        const newContent = this.props.toolbar?.show
            ? (this.contentElement.innerHTML || '')
            : (this.contentElement.textContent || '');
        this.lastContentRef = newContent;
        this.updateContent(newContent);
    }
    updateActiveTools() {
        if (!this.toolbar || !this.props.toolbar?.tools)
            return;
        const tools = this.props.toolbar.tools.filter(t => t !== 'separator');
        const active = getActiveFormats(tools);
        this.toolbar.updateActiveTools(active);
    }
    updatePlaceholder() {
        const placeholder = this.editorWrapper.querySelector('.lilac-editor__placeholder');
        if (placeholder) {
            placeholder.style.display = this.state.content.trim() ? 'none' : 'block';
        }
    }
    updateCharCount() {
        const charCount = this.editorWrapper.querySelector('.lilac-editor__char-count');
        if (charCount && this.props.maxLength) {
            charCount.textContent = `${this.state.content.length}/${this.props.maxLength}`;
        }
    }
    // Public API
    getContent() {
        return this.state.content;
    }
    setContent(content) {
        this.updateContent(content);
        if (this.contentElement) {
            if (this.props.toolbar?.show) {
                this.contentElement.innerHTML = content;
            }
            else {
                this.contentElement.textContent = content;
            }
            this.lastContentRef = content;
        }
        this.updatePlaceholder();
    }
    focus() {
        this.contentElement?.focus();
    }
    blur() {
        this.contentElement?.blur();
    }
    undo() {
        const { undoStack, redoStack } = this.state.history;
        if (undoStack.length === 0)
            return;
        const previousContent = undoStack[undoStack.length - 1];
        const newUndoStack = undoStack.slice(0, -1);
        const newRedoStack = [...redoStack, this.state.content];
        this.state.history = {
            ...this.state.history,
            undoStack: newUndoStack,
            redoStack: newRedoStack,
        };
        this.state.content = previousContent;
        if (this.contentElement) {
            if (this.props.toolbar?.show) {
                this.contentElement.innerHTML = previousContent;
            }
            else {
                this.contentElement.textContent = previousContent;
            }
            this.lastContentRef = previousContent;
        }
        this.props.onChange?.(previousContent);
        this.updatePlaceholder();
    }
    redo() {
        const { undoStack, redoStack } = this.state.history;
        if (redoStack.length === 0)
            return;
        const nextContent = redoStack[redoStack.length - 1];
        const newRedoStack = redoStack.slice(0, -1);
        const newUndoStack = [...undoStack, this.state.content];
        this.state.history = {
            ...this.state.history,
            undoStack: newUndoStack,
            redoStack: newRedoStack,
        };
        this.state.content = nextContent;
        if (this.contentElement) {
            if (this.props.toolbar?.show) {
                this.contentElement.innerHTML = nextContent;
            }
            else {
                this.contentElement.textContent = nextContent;
            }
            this.lastContentRef = nextContent;
        }
        this.props.onChange?.(nextContent);
        this.updatePlaceholder();
    }
    get canUndo() {
        return this.state.history.undoStack.length > 0;
    }
    get canRedo() {
        return this.state.history.redoStack.length > 0;
    }
    setReadOnly(readOnly) {
        this.state.isReadOnly = readOnly;
        this.contentElement.contentEditable = (!readOnly).toString();
        this.editorWrapper.classList.toggle('lilac-editor--readonly', readOnly);
        this.toolbar?.setDisabled(readOnly);
    }
    destroy() {
        pluginManager.executeHook('onEditorUnmount', this.getEditorContext());
        this.editorWrapper.remove();
    }
}
