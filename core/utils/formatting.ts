import type { FormatCommand, ToolbarTool } from '../types/index';

export const formatCommands: Record<ToolbarTool, FormatCommand | null> = {
  bold: { command: 'bold' },
  italic: { command: 'italic' },
  underline: { command: 'underline' },
  strikethrough: { command: 'strikeThrough' },
  heading1: { command: 'formatBlock', value: 'h1' },
  heading2: { command: 'formatBlock', value: 'h2' },
  heading3: { command: 'formatBlock', value: 'h3' },
  paragraph: { command: 'formatBlock', value: 'p' },
  bulletList: { command: 'insertUnorderedList' },
  orderedList: { command: 'insertOrderedList' },
  blockquote: { command: 'formatBlock', value: 'blockquote' },
  codeBlock: { command: 'formatBlock', value: 'pre' },
  link: null, // Custom implementation needed
  image: null, // Custom implementation needed
  separator: null, // Not a command
};

export function executeFormatCommand(tool: ToolbarTool, value?: string): boolean {
  const formatCommand = formatCommands[tool];

  if (!formatCommand) {
    return false;
  }

  try {
    if (formatCommand.value !== undefined) {
      return document.execCommand(formatCommand.command, false, value || formatCommand.value as string);
    } else {
      return document.execCommand(formatCommand.command, false);
    }
  } catch (error) {
    console.warn(`Failed to execute format command for ${tool}:`, error);
    return false;
  }
}

export function isFormatActive(tool: ToolbarTool): boolean {
  const formatCommand = formatCommands[tool];

  if (!formatCommand) {
    return false;
  }

  try {
    if (formatCommand.command === 'formatBlock') {
      return document.queryCommandValue('formatBlock').toLowerCase() === (formatCommand.value as string).toLowerCase();
    } else {
      return document.queryCommandState(formatCommand.command);
    }
  } catch (error) {
    console.warn(`Failed to query format state for ${tool}:`, error);
    return false;
  }
}

export function getActiveFormats(tools: ToolbarTool[]): Set<ToolbarTool> {
  const activeFormats = new Set<ToolbarTool>();

  for (const tool of tools) {
    if (tool !== 'separator' && isFormatActive(tool)) {
      activeFormats.add(tool);
    }
  }

  return activeFormats;
}

export function insertLink(url: string, text?: string): boolean {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return false;
  }

  try {
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    const linkText = text || selectedText || url;

    if (selectedText) {
      // Replace selected text with link
      const link = document.createElement('a');
      link.href = url;
      link.textContent = linkText;

      range.deleteContents();
      range.insertNode(link);

      // Clear selection
      selection.removeAllRanges();
      return true;
    } else {
      // Insert link at cursor position
      const link = document.createElement('a');
      link.href = url;
      link.textContent = linkText;

      range.insertNode(link);

      // Clear selection
      selection.removeAllRanges();
      return true;
    }
  } catch (error) {
    console.warn('Failed to insert link:', error);
    return false;
  }
}

export function insertImage(src: string, alt?: string): boolean {
  try {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt || 'Image';
    img.style.maxWidth = '100%';
    img.style.height = 'auto';

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.insertNode(img);

      // Move cursor after the image
      range.setStartAfter(img);
      range.setEndAfter(img);
      selection.removeAllRanges();
      selection.addRange(range);

      return true;
    }

    return false;
  } catch (error) {
    console.warn('Failed to insert image:', error);
    return false;
  }
}

// Custom keyboard shortcuts
export const keyboardShortcuts: Record<string, ToolbarTool> = {
  'ctrl+b': 'bold',
  'cmd+b': 'bold',
  'ctrl+i': 'italic',
  'cmd+i': 'italic',
  'ctrl+u': 'underline',
  'cmd+u': 'underline',
  'ctrl+k': 'link',
  'cmd+k': 'link',
};

export function getShortcutKey(event: KeyboardEvent): string | null {
  const key = event.key.toLowerCase();
  const ctrl = event.ctrlKey || event.metaKey;
  const shift = event.shiftKey;
  const alt = event.altKey;

  if (!ctrl) return null;

  let shortcut = '';
  if (event.metaKey) shortcut += 'cmd+';
  if (event.ctrlKey) shortcut += 'ctrl+';
  if (alt) shortcut += 'alt+';
  if (shift) shortcut += 'shift+';
  shortcut += key;

  return shortcut;
}

export function cn(...classes: (string | boolean | undefined | null | Record<string, boolean>)[]): string {
  const result: string[] = [];
  for (const cls of classes) {
    if (!cls) continue;
    if (typeof cls === 'string') {
      result.push(cls);
    } else if (typeof cls === 'object') {
      for (const [key, value] of Object.entries(cls)) {
        if (value) result.push(key);
      }
    }
  }
  return result.join(' ');
}

// Performance optimization utilities
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// URL validation utility
export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// HTML sanitization utility
export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - you might want to use a library like DOMPurify in production
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

// Extract text from HTML
export function extractTextFromHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}
