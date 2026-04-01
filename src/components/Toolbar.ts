import type { EditorContext, ToolbarButton, ToolbarTool } from '../types';
import { cn } from '../utils/formatting.js';
import { icons } from '../utils/icons.js';

const toolIcons: Record<ToolbarTool, string> = {
  bold: icons.bold,
  italic: icons.italic,
  underline: icons.underline,
  strikethrough: icons.strikethrough,
  heading1: icons.heading1,
  heading2: icons.heading2,
  heading3: icons.heading3,
  paragraph: icons.paragraph,
  bulletList: icons.bulletList,
  orderedList: icons.orderedList,
  blockquote: icons.blockquote,
  codeBlock: icons.codeBlock,
  link: icons.link,
  image: icons.image,
  separator: '',
};

const toolLabels: Record<ToolbarTool, string> = {
  bold: 'Bold (Ctrl+B)',
  italic: 'Italic (Ctrl+I)',
  underline: 'Underline (Ctrl+U)',
  strikethrough: 'Strikethrough',
  heading1: 'Heading 1',
  heading2: 'Heading 2',
  heading3: 'Heading 3',
  paragraph: 'Paragraph',
  bulletList: 'Bullet List',
  orderedList: 'Numbered List',
  blockquote: 'Quote',
  codeBlock: 'Code Block',
  link: 'Link (Ctrl+K)',
  image: 'Image',
  separator: 'Separator',
};

const defaultTools: ToolbarTool[] = [
  'bold', 'italic', 'underline', 'separator',
  'heading1', 'heading2', 'heading3', 'paragraph', 'separator',
  'bulletList', 'orderedList', 'blockquote', 'separator',
  'link', 'codeBlock',
];

export interface ToolbarOptions {
  tools?: ToolbarTool[];
  onToolClick: (tool: ToolbarTool) => void;
  activeTools?: Set<ToolbarTool>;
  disabled?: boolean;
  pluginButtons?: ToolbarButton[];
  editorContext?: EditorContext;
}

export class Toolbar {
  private element: HTMLElement;
  private options: ToolbarOptions;

  constructor(options: ToolbarOptions) {
    this.options = {
      tools: defaultTools,
      activeTools: new Set(),
      disabled: false,
      pluginButtons: [],
      ...options,
    };
    this.element = this.createElement();
  }

  private createElement(): HTMLElement {
    const toolbar = document.createElement('div');
    toolbar.className = cn('lilac-toolbar', { 'lilac-toolbar--disabled': !!this.options.disabled });

    const tools = this.options.tools || defaultTools;

    tools.forEach((tool, index) => {
      if (tool === 'separator') {
        const separator = document.createElement('div');
        separator.className = 'lilac-toolbar__separator';
        separator.setAttribute('aria-hidden', 'true');
        toolbar.appendChild(separator);
      } else {
        const button = this.createButton(tool, index);
        toolbar.appendChild(button);
      }
    });

    // Plugin buttons
    if (this.options.pluginButtons && this.options.pluginButtons.length > 0) {
      const separator = document.createElement('div');
      separator.className = 'lilac-toolbar__separator';
      separator.setAttribute('aria-hidden', 'true');
      toolbar.appendChild(separator);

      this.options.pluginButtons.forEach((pluginBtn) => {
        const button = this.createPluginButton(pluginBtn);
        toolbar.appendChild(button);
      });
    }

    return toolbar;
  }

  private createButton(tool: ToolbarTool, _index: number): HTMLButtonElement {
    const button = document.createElement('button');
    const isActive = this.options.activeTools?.has(tool);

    button.type = 'button';
    button.className = cn('lilac-toolbar__button', {
      'lilac-toolbar__button--active': !!isActive,
      'lilac-toolbar__button--disabled': !!this.options.disabled,
    });
    button.innerHTML = toolIcons[tool];
    button.title = toolLabels[tool];
    button.setAttribute('aria-label', toolLabels[tool]);
    button.setAttribute('aria-pressed', String(isActive));
    button.disabled = this.options.disabled || false;
    button.dataset.tool = tool;

    button.addEventListener('click', () => {
      if (!this.options.disabled) {
        this.options.onToolClick(tool);
      }
    });

    return button;
  }

  private createPluginButton(pluginBtn: ToolbarButton): HTMLButtonElement {
    const button = document.createElement('button');
    const isActive = pluginBtn.isActive?.(this.options.editorContext!);

    button.type = 'button';
    button.className = cn('lilac-toolbar__button', 'lilac-toolbar__button--plugin', {
      'lilac-toolbar__button--active': !!isActive,
      'lilac-toolbar__button--disabled': !!this.options.disabled,
    });
    button.innerHTML = pluginBtn.icon;
    button.title = pluginBtn.tooltip || pluginBtn.label;
    button.setAttribute('aria-label', pluginBtn.label);
    button.setAttribute('data-tooltip', pluginBtn.tooltip || pluginBtn.label);
    button.disabled = this.options.disabled || false;

    button.addEventListener('click', () => {
      if (!this.options.disabled && this.options.editorContext) {
        pluginBtn.onClick(this.options.editorContext);
      }
    });

    return button;
  }

  getElement(): HTMLElement {
    return this.element;
  }

  updateActiveTools(activeTools: Set<ToolbarTool>): void {
    this.options.activeTools = activeTools;
    this.element.querySelectorAll('.lilac-toolbar__button').forEach((btn) => {
      const tool = (btn as HTMLElement).dataset.tool as ToolbarTool;
      if (tool) {
        const isActive = activeTools.has(tool);
        btn.classList.toggle('lilac-toolbar__button--active', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
      }
    });
  }

  setDisabled(disabled: boolean): void {
    this.options.disabled = disabled;
    this.element.classList.toggle('lilac-toolbar--disabled', disabled);
    this.element.querySelectorAll('button').forEach((btn) => {
      btn.disabled = disabled;
      btn.classList.toggle('lilac-toolbar__button--disabled', disabled);
    });
  }
}
