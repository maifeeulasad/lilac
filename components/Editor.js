import { PluginManager } from '../plugins/PluginManager.js';
import { imageFilesFrom, isEmbeddableImage, resolveImageSource } from '../utils/imageEmbed.js';
import { fromMarkdown, toMarkdown } from '../utils/markdown.js';
import { FindReplace } from './FindReplace.js';
import { cn, executeFormatCommand, getActiveFormats, getShortcutKey, insertImage, insertLink, keyboardShortcuts } from '../utils/formatting.js';
import { sanitizeContent } from '../utils/sanitize.js';
import { injectStyles } from '../utils/styles.js';
import { Toolbar } from './Toolbar.js';
export class LilacEditor {
    constructor(props) {
        this.toolbar = null;
        this.isDestroyed = false;
        // Kept as instance fields so destroy() can detach them again. The
        // selectionchange listener lives on `document`, so leaving it attached would
        // keep this editor (and its history) alive for the lifetime of the page.
        this.onBeforeInput = (e) => this.handleBeforeInput(e);
        this.onInput = (e) => this.handleInput(e);
        this.onKeyDown = (e) => this.handleKeyDown(e);
        this.onKeyUp = () => this.updateActiveTools();
        this.onMouseUp = () => this.updateActiveTools();
        this.onFocusIn = () => this.handleFocus();
        this.onFocusOut = () => this.handleBlur();
        this.onSelectionChange = () => this.handleSelectionChange();
        this.onDragOver = (e) => this.handleDragOver(e);
        this.onDrop = (e) => this.handleDrop(e);
        this.onPaste = (e) => this.handlePaste(e);
        // One manager per editor. A shared instance meant the last editor
        // constructed owned the context for every plugin on the page.
        this.pluginManager = new PluginManager();
        // Built on first use (Ctrl/Cmd+F) so editors that never search pay nothing.
        this.findReplace = null;
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
        // Idempotent, so calling it per instance is free. Without this the
        // framework adapters render a bare contenteditable with no toolbar chrome,
        // borders, theme or placeholder positioning — none of them injected the
        // stylesheet, and none shipped one.
        if (this.props.injectStyles !== false) {
            injectStyles();
        }
        this.container = props.container;
        this.state = {
            content: this.prepareContent(this.props.initialContent || ''),
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
                pluginButtons: this.pluginManager.getToolbarButtons(),
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
        // state.content was sanitized in the constructor.
        if (this.props.toolbar?.show) {
            content.innerHTML = this.state.content;
        }
        else {
            content.textContent = this.state.content;
        }
        contentWrapper.appendChild(content);
        wrapper.appendChild(contentWrapper);
        // Footer with char count
        if (this.props.maxLength) {
            const footer = document.createElement('div');
            footer.className = 'lilac-editor__footer';
            const count = document.createElement('span');
            count.className = 'lilac-editor__char-count';
            count.textContent = `${this.getTextLength()}/${this.props.maxLength}`;
            footer.appendChild(count);
            wrapper.appendChild(footer);
        }
        return wrapper;
    }
    /**
     * Content arriving from outside the editor is untrusted. Only rich-text mode
     * needs this — the plain-text path assigns via textContent, which cannot
     * execute anything.
     */
    prepareContent(content) {
        if (!this.props.toolbar?.show)
            return content;
        if (this.props.sanitize === false)
            return content;
        return sanitizeContent(content);
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
        this.pluginManager.setContext(context);
        this.props.plugins?.forEach((plugin) => {
            if (!this.pluginManager.isInstalled(plugin.id)) {
                this.pluginManager.install(plugin);
            }
        });
        // Update toolbar with plugin buttons
        if (this.toolbar) {
            const pluginButtons = this.pluginManager.getToolbarButtons();
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
        this.pluginManager.executeHook('onEditorMount', context);
    }
    setupEventListeners() {
        this.contentElement.addEventListener('beforeinput', this.onBeforeInput);
        this.contentElement.addEventListener('input', this.onInput);
        this.contentElement.addEventListener('keydown', this.onKeyDown);
        this.contentElement.addEventListener('keyup', this.onKeyUp);
        this.contentElement.addEventListener('mouseup', this.onMouseUp);
        this.contentElement.addEventListener('focus', this.onFocusIn);
        this.contentElement.addEventListener('blur', this.onFocusOut);
        this.contentElement.addEventListener('dragover', this.onDragOver);
        this.contentElement.addEventListener('drop', this.onDrop);
        this.contentElement.addEventListener('paste', this.onPaste);
        document.addEventListener('selectionchange', this.onSelectionChange);
    }
    teardownEventListeners() {
        this.contentElement.removeEventListener('beforeinput', this.onBeforeInput);
        this.contentElement.removeEventListener('input', this.onInput);
        this.contentElement.removeEventListener('keydown', this.onKeyDown);
        this.contentElement.removeEventListener('keyup', this.onKeyUp);
        this.contentElement.removeEventListener('mouseup', this.onMouseUp);
        this.contentElement.removeEventListener('focus', this.onFocusIn);
        this.contentElement.removeEventListener('blur', this.onFocusOut);
        this.contentElement.removeEventListener('dragover', this.onDragOver);
        this.contentElement.removeEventListener('drop', this.onDrop);
        this.contentElement.removeEventListener('paste', this.onPaste);
        document.removeEventListener('selectionchange', this.onSelectionChange);
    }
    /**
     * Enforce maxLength before the insertion lands, so an over-limit edit is
     * simply refused. Reverting afterwards (the previous approach) rewrote the
     * whole node and dropped the caret to the start of the field.
     */
    handleBeforeInput(event) {
        const maxLength = this.props.maxLength;
        if (!maxLength || !event.inputType?.startsWith('insert'))
            return;
        let inserted = event.data ?? event.dataTransfer?.getData('text/plain') ?? '';
        if (!inserted && (event.inputType === 'insertParagraph' || event.inputType === 'insertLineBreak')) {
            inserted = '\n';
        }
        if (!inserted)
            return;
        // The selection is about to be replaced, so it does not count against us.
        const replacing = window.getSelection()?.toString().length ?? 0;
        const current = this.contentElement.textContent?.length ?? 0;
        if (current - replacing + inserted.length > maxLength) {
            event.preventDefault();
        }
    }
    handleInput(event) {
        const target = event.target;
        const newContent = this.props.toolbar?.show
            ? (target.innerHTML || '')
            : (target.textContent || '');
        this.updateContent(newContent);
        this.updatePlaceholder();
        this.updateActiveTools();
    }
    handleKeyDown(event) {
        // Find & replace — override the browser's native find inside the editor.
        if ((event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey && event.key.toLowerCase() === 'f') {
            event.preventDefault();
            this.ensureFindReplace().toggle();
            return;
        }
        // Plugin keyboard shortcuts
        const pluginShortcuts = this.pluginManager.getKeyboardShortcuts();
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
    handleDragOver(event) {
        // Only claim the drop when image files are being dragged; leave text and
        // everything else to the browser's default handling.
        const items = event.dataTransfer?.items;
        if (items && Array.from(items).some((item) => item.kind === 'file' && item.type.startsWith('image/'))) {
            event.preventDefault();
        }
    }
    handleDrop(event) {
        const files = imageFilesFrom(event.dataTransfer?.files);
        if (files.length === 0)
            return;
        event.preventDefault();
        void this.embedImages(files);
    }
    handlePaste(event) {
        const files = imageFilesFrom(event.clipboardData?.files);
        if (files.length === 0)
            return; // let normal text/html paste through
        event.preventDefault();
        void this.embedImages(files);
    }
    async embedImages(files) {
        for (const file of files) {
            const check = isEmbeddableImage(file, this.props.maxImageSize);
            if (!check.ok) {
                console.warn(`Lilac: skipped image — ${check.reason}`);
                continue;
            }
            try {
                const src = await resolveImageSource(file, {
                    onImageUpload: this.props.onImageUpload,
                    maxImageSize: this.props.maxImageSize,
                });
                this.insertImageElement(src, file.name);
            }
            catch (error) {
                console.warn('Lilac: failed to embed image', error);
            }
        }
    }
    insertImageElement(src, alt = '') {
        const img = document.createElement('img');
        img.src = src;
        img.alt = alt;
        img.className = 'lilac-editor__image';
        this.contentElement.focus();
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0 && this.contentElement.contains(selection.anchorNode)) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(img);
            range.setStartAfter(img);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        else {
            this.contentElement.appendChild(img);
        }
        this.updateContentFromDOM();
    }
    ensureFindReplace() {
        if (!this.findReplace) {
            this.findReplace = new FindReplace({
                editor: this.editorWrapper,
                content: this.contentElement,
                onMutate: () => this.updateContentFromDOM(),
            });
        }
        return this.findReplace;
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
            this.setSelectionState(null);
            return;
        }
        const range = selection.getRangeAt(0);
        if (!this.contentElement.contains(range.commonAncestorContainer)) {
            this.setSelectionState(null);
            return;
        }
        this.setSelectionState({
            start: range.startOffset,
            end: range.endOffset,
        });
    }
    setSelectionState(selection) {
        // `selectionchange` fires on document, so selecting text anywhere else on
        // the page reaches us as null. Only notify on an actual change, otherwise
        // subscribers get a stream of redundant nulls.
        const previous = this.state.selection;
        const unchanged = previous === selection ||
            (previous != null && selection != null &&
                previous.start === selection.start && previous.end === selection.end);
        this.state.selection = selection;
        if (unchanged)
            return;
        this.props.onSelectionChange?.(selection);
        this.pluginManager.executeHook('onSelectionChange', selection, this.getEditorContext());
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
        this.pluginManager.executeHook('onContentChange', newContent, this.getEditorContext());
        this.updateCharCount();
    }
    updateContentFromDOM() {
        if (!this.contentElement)
            return;
        const newContent = this.props.toolbar?.show
            ? (this.contentElement.innerHTML || '')
            : (this.contentElement.textContent || '');
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
    /**
     * Length of the content as the user perceives it: visible text, not markup.
     *
     * Parsed via DOMParser rather than a scratch element's innerHTML, because
     * the latter loads resources — `<img src=x onerror=...>` in stored content
     * would fire just from measuring it.
     */
    getTextLength(content = this.state.content) {
        if (!this.props.toolbar?.show)
            return content.length;
        const parsed = new DOMParser().parseFromString(content, 'text/html');
        return (parsed.body.textContent || '').length;
    }
    updateCharCount() {
        const charCount = this.editorWrapper.querySelector('.lilac-editor__char-count');
        if (charCount && this.props.maxLength) {
            charCount.textContent = `${this.getTextLength()}/${this.props.maxLength}`;
        }
    }
    // Public API
    getContent() {
        return this.state.content;
    }
    setContent(rawContent) {
        const content = this.prepareContent(rawContent);
        this.updateContent(content);
        if (this.contentElement) {
            // A controlled wrapper echoes our own onChange back to us. Comparing
            // against the DOM rather than state.content catches that echo even when
            // the browser has normalized the markup on the way out, so we skip a
            // rewrite that would only serve to destroy the selection.
            if (this.readContentFromDOM() !== content) {
                this.writeContentToDOM(content);
            }
        }
        this.updatePlaceholder();
    }
    readContentFromDOM() {
        return this.props.toolbar?.show
            ? (this.contentElement.innerHTML || '')
            : (this.contentElement.textContent || '');
    }
    writeContentToDOM(content) {
        // Only worth restoring if the caret was actually in here.
        const offset = this.contentElement.contains(document.activeElement) ||
            this.contentElement === document.activeElement
            ? this.getCaretOffset()
            : null;
        if (this.props.toolbar?.show) {
            this.contentElement.innerHTML = content;
        }
        else {
            this.contentElement.textContent = content;
        }
        if (offset !== null)
            this.setCaretOffset(offset);
    }
    /**
     * Caret position as a character offset into the element's text, which
     * survives the node identities being replaced.
     */
    getCaretOffset() {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0)
            return null;
        const range = selection.getRangeAt(0);
        if (!this.contentElement.contains(range.startContainer))
            return null;
        const measure = range.cloneRange();
        measure.selectNodeContents(this.contentElement);
        measure.setEnd(range.startContainer, range.startOffset);
        return measure.toString().length;
    }
    setCaretOffset(offset) {
        const walker = document.createTreeWalker(this.contentElement, NodeFilter.SHOW_TEXT);
        let remaining = offset;
        let node = walker.nextNode();
        let target = null;
        while (node) {
            const length = node.length;
            if (remaining <= length) {
                target = node;
                break;
            }
            remaining -= length;
            node = walker.nextNode();
        }
        const selection = window.getSelection();
        if (!selection)
            return;
        const range = document.createRange();
        if (target) {
            range.setStart(target, Math.min(remaining, target.length));
            range.collapse(true);
        }
        else {
            // Offset ran past the end of the new content — park at the end.
            range.selectNodeContents(this.contentElement);
            range.collapse(false);
        }
        selection.removeAllRanges();
        selection.addRange(range);
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
    /** Current content serialized to Markdown (headings, emphasis, lists, code, links, images, quotes). */
    getMarkdown() {
        return toMarkdown(this.getContent());
    }
    /** Replace the content from a Markdown string. */
    setMarkdown(markdown) {
        this.setContent(fromMarkdown(markdown));
    }
    /** Open the find & replace panel (also bound to Ctrl/Cmd+F). */
    openFind() {
        this.ensureFindReplace().show();
    }
    /** Close the find & replace panel if it is open. */
    closeFind() {
        if (this.findReplace?.isOpen())
            this.findReplace.hide();
    }
    destroy() {
        if (this.isDestroyed)
            return;
        this.isDestroyed = true;
        this.pluginManager.executeHook('onEditorUnmount', this.getEditorContext());
        // Plugins installed by this editor are owned by this editor. Uninstalling
        // runs their onUninstall hooks and releases their injected stylesheets.
        for (const plugin of this.pluginManager.getAllPlugins()) {
            this.pluginManager.uninstall(plugin.id);
        }
        this.findReplace?.destroy();
        this.teardownEventListeners();
        this.editorWrapper.remove();
    }
}
