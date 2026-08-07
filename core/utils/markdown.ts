// Zero-dependency Markdown <-> HTML conversion for the editor's content subset.
//
// This is intentionally not a CommonMark implementation. It covers exactly the
// constructs the editor can produce — headings, bold/italic/strikethrough,
// inline code and code blocks, links, images, blockquotes, lists, horizontal
// rules and paragraphs — and documents the rest as out of scope. `toMarkdown`
// leans on the platform DOM parser (available in browsers and jsdom); no
// third-party parser is pulled in.

const INLINE_TAGS = new Set(['STRONG', 'B', 'EM', 'I', 'DEL', 'S', 'STRIKE', 'CODE', 'A', 'IMG', 'BR', 'U', 'SPAN']);
const HEADINGS: Record<string, number> = { H1: 1, H2: 2, H3: 3, H4: 4, H5: 5, H6: 6 };

// --- HTML -> Markdown ------------------------------------------------------

function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ');
}

function serializeInline(node: Node): string {
  if (node.nodeType === 3 /* text */) {
    return collapseWhitespace(node.textContent ?? '');
  }
  if (node.nodeType !== 1 /* element */) return '';

  const el = node as Element;
  const inner = (): string => Array.from(el.childNodes).map(serializeInline).join('');

  switch (el.tagName) {
    case 'STRONG':
    case 'B':
      return `**${inner()}**`;
    case 'EM':
    case 'I':
      return `*${inner()}*`;
    case 'DEL':
    case 'S':
    case 'STRIKE':
      return `~~${inner()}~~`;
    case 'CODE':
      return `\`${el.textContent ?? ''}\``;
    case 'A':
      return `[${inner()}](${el.getAttribute('href') ?? ''})`;
    case 'IMG':
      return `![${el.getAttribute('alt') ?? ''}](${el.getAttribute('src') ?? ''})`;
    case 'BR':
      return '\n';
    case 'U': // Markdown has no underline; keep the text, drop the styling.
    case 'SPAN':
    default:
      return inner();
  }
}

function serializeBlock(el: Element): string {
  const tag = el.tagName;

  if (tag in HEADINGS) {
    return `${'#'.repeat(HEADINGS[tag])} ${serializeInline(el).trim()}`;
  }
  if (tag === 'BLOCKQUOTE') {
    return serializeChildren(el)
      .split('\n')
      .map((line) => (line ? `> ${line}` : '>'))
      .join('\n');
  }
  if (tag === 'PRE') {
    const code = (el.textContent ?? '').replace(/\n$/, '');
    return `\`\`\`\n${code}\n\`\`\``;
  }
  if (tag === 'UL') {
    return Array.from(el.children)
      .filter((li) => li.tagName === 'LI')
      .map((li) => `- ${serializeInline(li).trim()}`)
      .join('\n');
  }
  if (tag === 'OL') {
    return Array.from(el.children)
      .filter((li) => li.tagName === 'LI')
      .map((li, i) => `${i + 1}. ${serializeInline(li).trim()}`)
      .join('\n');
  }
  if (tag === 'HR') {
    return '---';
  }
  // P, DIV and anything else: a paragraph of inline content (or nested blocks).
  const hasBlockChild = Array.from(el.childNodes).some(
    (n) => n.nodeType === 1 && !INLINE_TAGS.has((n as Element).tagName),
  );
  return hasBlockChild ? serializeChildren(el) : serializeInline(el).trim();
}

function serializeChildren(parent: Node): string {
  const blocks: string[] = [];
  let inlineBuffer = '';

  const flush = (): void => {
    if (inlineBuffer.trim()) blocks.push(inlineBuffer.trim());
    inlineBuffer = '';
  };

  for (const child of Array.from(parent.childNodes)) {
    if (child.nodeType === 1 && !INLINE_TAGS.has((child as Element).tagName)) {
      flush();
      blocks.push(serializeBlock(child as Element));
    } else {
      inlineBuffer += serializeInline(child);
    }
  }
  flush();

  return blocks.filter((b) => b !== '').join('\n\n');
}

/** Serialize the editor's HTML subset to Markdown. */
export function toMarkdown(html: string): string {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  return serializeChildren(doc.body).replace(/\n{3,}/g, '\n\n').trim();
}

// --- Markdown -> HTML ------------------------------------------------------

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Convert the inline Markdown of a single block to HTML. */
function renderInline(text: string): string {
  // Split on inline code spans and only format the non-code segments, so
  // markup inside `code` is left untouched. No sentinel placeholders needed.
  return escapeHtml(text)
    .split(/(`[^`]+`)/)
    .map((part) => {
      const code = /^`([^`]+)`$/.exec(part);
      if (code) return `<code>${code[1]}</code>`;
      return part
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/~~([^~]+)~~/g, '<del>$1</del>')
        .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
        .replace(/(^|[^_])_([^_]+)_/g, '$1<em>$2</em>');
    })
    .join('');
}

/** Parse the supported Markdown subset into the editor's HTML. */
export function fromMarkdown(markdown: string): string {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const html: string[] = [];
  let i = 0;

  const closeList = (stack: string[]): void => {
    while (stack.length) html.push(`</${stack.pop()}>`);
  };
  const listStack: string[] = [];

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block.
    if (/^```/.test(line)) {
      closeList(listStack);
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]);
      i++; // consume closing fence
      html.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }

    // Blank line: ends any open list.
    if (line.trim() === '') {
      closeList(listStack);
      i++;
      continue;
    }

    // Heading.
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      closeList(listStack);
      const level = heading[1].length;
      html.push(`<h${level}>${renderInline(heading[2].trim())}</h${level}>`);
      i++;
      continue;
    }

    // Horizontal rule.
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      closeList(listStack);
      html.push('<hr>');
      i++;
      continue;
    }

    // Blockquote (contiguous run of `>` lines).
    if (/^>\s?/.test(line)) {
      closeList(listStack);
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) quote.push(lines[i++].replace(/^>\s?/, ''));
      html.push(`<blockquote>${renderInline(quote.join(' ').trim())}</blockquote>`);
      continue;
    }

    // List item (unordered or ordered).
    const unordered = /^\s*[-*]\s+(.*)$/.exec(line);
    const ordered = /^\s*\d+\.\s+(.*)$/.exec(line);
    if (unordered || ordered) {
      const wanted = unordered ? 'ul' : 'ol';
      if (listStack[listStack.length - 1] !== wanted) {
        closeList(listStack);
        html.push(`<${wanted}>`);
        listStack.push(wanted);
      }
      const item = (unordered ? unordered[1] : ordered![1]).trim();
      html.push(`<li>${renderInline(item)}</li>`);
      i++;
      continue;
    }

    // Paragraph: gather consecutive plain lines.
    closeList(listStack);
    const para: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,6}\s|>|```|\s*[-*]\s|\s*\d+\.\s)/.test(lines[i]) &&
      !/^(-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim())
    ) {
      para.push(lines[i++]);
    }
    html.push(`<p>${renderInline(para.join(' ').trim())}</p>`);
  }

  closeList(listStack);
  return html.join('');
}
