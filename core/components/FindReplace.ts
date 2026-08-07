// Find & replace panel for the editor.
//
// The matching itself lives in utils/findReplace (pure, unit-tested). This class
// is the DOM layer: it walks the contenteditable's text nodes, applies the
// engine per node, highlights the current match through the native selection,
// and rewrites node text on replace. Matching is per text node, so a phrase
// split across a formatting boundary (e.g. "ab<b>cd</b>") is not matched — a
// documented, predictable limitation rather than fragile cross-node surgery.

import { findMatches, replaceAll, type FindOptions } from '../utils/findReplace.js';

interface NodeMatch {
  node: Text;
  start: number;
  end: number;
}

interface FindReplaceOptions {
  /** Editor root the panel is appended to. */
  editor: HTMLElement;
  /** The contenteditable element to search within. */
  content: HTMLElement;
  /** Called after any replacement so the editor can sync content/history. */
  onMutate: () => void;
}

export class FindReplace {
  private readonly panel: HTMLElement;
  // Assigned in build(), which the constructor calls before anyone can use them.
  private findInput!: HTMLInputElement;
  private replaceInput!: HTMLInputElement;
  private countLabel!: HTMLElement;
  private readonly options: FindReplaceOptions;

  private matches: NodeMatch[] = [];
  private current = -1;
  private findOptions: FindOptions = {};
  private open = false;

  constructor(options: FindReplaceOptions) {
    this.options = options;
    this.panel = this.build();
    options.editor.appendChild(this.panel);
  }

  isOpen(): boolean {
    return this.open;
  }

  show(): void {
    this.open = true;
    this.panel.hidden = false;

    // Seed the query from the current selection when it is a single word.
    const selected = (window.getSelection()?.toString() ?? '').trim();
    if (selected && !selected.includes('\n')) {
      this.findInput.value = selected;
    }
    this.refresh();
    this.findInput.focus();
    this.findInput.select();
  }

  hide(): void {
    this.open = false;
    this.panel.hidden = true;
    this.clearMatches();
    this.options.content.focus();
  }

  toggle(): void {
    if (this.open) this.hide();
    else this.show();
  }

  destroy(): void {
    this.panel.remove();
  }

  // --- internals ---------------------------------------------------------

  private build(): HTMLElement {
    const panel = document.createElement('div');
    panel.className = 'lilac-find';
    panel.setAttribute('role', 'search');
    panel.hidden = true;

    const findRow = document.createElement('div');
    findRow.className = 'lilac-find__row';

    this.findInput = this.input('Find');
    this.findInput.addEventListener('input', () => this.refresh());

    this.countLabel = document.createElement('span');
    this.countLabel.className = 'lilac-find__count';
    this.countLabel.textContent = '0/0';

    const prev = this.button('↑', 'Previous match', () => this.step(-1));
    const next = this.button('↓', 'Next match', () => this.step(1));
    const caseToggle = this.toggleButton('Aa', 'Match case', () => {
      this.findOptions = { ...this.findOptions, caseSensitive: !this.findOptions.caseSensitive };
      return !!this.findOptions.caseSensitive;
    });
    const wordToggle = this.toggleButton('“W”', 'Whole word', () => {
      this.findOptions = { ...this.findOptions, wholeWord: !this.findOptions.wholeWord };
      return !!this.findOptions.wholeWord;
    });
    const close = this.button('✕', 'Close', () => this.hide());
    close.classList.add('lilac-find__close');

    findRow.append(this.findInput, this.countLabel, prev, next, caseToggle, wordToggle, close);

    const replaceRow = document.createElement('div');
    replaceRow.className = 'lilac-find__row';
    this.replaceInput = this.input('Replace');
    const replaceBtn = this.button('Replace', 'Replace current match', () => this.replaceCurrent());
    replaceBtn.classList.add('lilac-find__text-btn');
    const replaceAllBtn = this.button('All', 'Replace all matches', () => this.replaceEverything());
    replaceAllBtn.classList.add('lilac-find__text-btn');
    replaceRow.append(this.replaceInput, replaceBtn, replaceAllBtn);

    panel.append(findRow, replaceRow);

    panel.addEventListener('keydown', (event) => this.onKeyDown(event));
    // Clicks inside the panel must not steal/blur the editor unexpectedly.
    panel.addEventListener('mousedown', (event) => {
      if (event.target !== this.findInput && event.target !== this.replaceInput) {
        event.preventDefault();
      }
    });

    return panel;
  }

  private input(placeholder: string): HTMLInputElement {
    const el = document.createElement('input');
    el.type = 'text';
    el.className = 'lilac-find__input';
    el.placeholder = placeholder;
    el.setAttribute('aria-label', placeholder);
    return el;
  }

  private button(label: string, title: string, onClick: () => void): HTMLButtonElement {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'lilac-find__btn';
    el.textContent = label;
    el.title = title;
    el.setAttribute('aria-label', title);
    el.addEventListener('click', onClick);
    return el;
  }

  private toggleButton(label: string, title: string, onToggle: () => boolean): HTMLButtonElement {
    const el = this.button(label, title, () => {
      const active = onToggle();
      el.setAttribute('aria-pressed', String(active));
      el.classList.toggle('lilac-find__btn--active', active);
      this.refresh();
    });
    el.classList.add('lilac-find__toggle');
    el.setAttribute('aria-pressed', 'false');
    return el;
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.hide();
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (event.target === this.replaceInput) this.replaceCurrent();
      else this.step(event.shiftKey ? -1 : 1);
    }
  }

  /** Recompute matches for the current query and highlight the first one. */
  private refresh(): void {
    this.collect();
    this.current = this.matches.length > 0 ? 0 : -1;
    this.updateCount();
    this.highlight();
  }

  private collect(): void {
    this.matches = [];
    const query = this.findInput.value;
    if (!query) return;

    const walker = document.createTreeWalker(this.options.content, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode() as Text | null;
    while (node) {
      for (const { start, end } of findMatches(node.data, query, this.findOptions)) {
        this.matches.push({ node, start, end });
      }
      node = walker.nextNode() as Text | null;
    }
  }

  private step(delta: number): void {
    if (this.matches.length === 0) return;
    this.current = (this.current + delta + this.matches.length) % this.matches.length;
    this.updateCount();
    this.highlight();
  }

  private highlight(): void {
    const match = this.matches[this.current];
    if (!match) return;
    try {
      const range = document.createRange();
      range.setStart(match.node, match.start);
      range.setEnd(match.node, match.end);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
      match.node.parentElement?.scrollIntoView?.({ block: 'nearest' });
    } catch {
      // jsdom / detached nodes: highlighting is best-effort, never fatal.
    }
  }

  private clearMatches(): void {
    this.matches = [];
    this.current = -1;
  }

  private updateCount(): void {
    const total = this.matches.length;
    this.countLabel.textContent = total === 0 ? '0/0' : `${this.current + 1}/${total}`;
  }

  private replaceCurrent(): void {
    const match = this.matches[this.current];
    const replacement = this.replaceInput.value;
    if (!match) return;

    match.node.data = match.node.data.slice(0, match.start) + replacement + match.node.data.slice(match.end);
    this.options.onMutate();

    const previous = this.current;
    this.collect();
    this.current = this.matches.length === 0 ? -1 : Math.min(previous, this.matches.length - 1);
    this.updateCount();
    this.highlight();
  }

  private replaceEverything(): void {
    const query = this.findInput.value;
    const replacement = this.replaceInput.value;
    if (!query) return;

    let changed = 0;
    const walker = document.createTreeWalker(this.options.content, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode() as Text | null;
    while (node) {
      const { text, count } = replaceAll(node.data, query, replacement, this.findOptions);
      if (count > 0) {
        node.data = text;
        changed += count;
      }
      node = walker.nextNode() as Text | null;
    }

    if (changed > 0) this.options.onMutate();
    this.refresh();
  }
}
