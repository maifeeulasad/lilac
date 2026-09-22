// Canonical Lilac snapshot serializers.
//
// These are the "rendering contract" for the editor. Raw innerHTML is noisy —
// attribute order varies between engines, browsers normalize markup on the way
// out, and inline SVGs drown out meaning. So snapshots never compare raw
// markup; they compare the stable, pretty-printed canonical form below.
//
// The file is deliberately pure and dependency-free so the *same* functions can
// run inside jsdom unit tests and, passed through `page.evaluate`, inside the
// Playwright browser suite. One serializer, two environments, identical output.
//
// IMPORTANT: each exported function must be fully self-contained. Playwright
// ships a function to the browser via `Function.prototype.toString()`, so any
// helper referenced from module scope would not exist in the page context.
// Everything a function needs therefore lives inside its own body.

export interface SerializeOptions {
  /** Indentation unit for block layout. Defaults to two spaces. */
  indent?: string;
  /** Drop `style` attributes. Useful when only structure matters. Defaults to false. */
  stripStyle?: boolean;
}

/** Pretty-print a Lilac DOM subtree as deterministic, readable HTML. */
export function serializeLilac(root: Element | DocumentFragment, opts: SerializeOptions = {}): string {
  const VOID_TAGS = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link',
    'meta', 'source', 'track', 'wbr',
  ]);

  // Inline elements render flat on one line; anything else block-layouts.
  const INLINE_TAGS = new Set([
    'a', 'b', 'big', 'br', 'button', 'code', 'em', 'i', 'img', 'input', 'kbd',
    'label', 's', 'small', 'span', 'strike', 'strong', 'sub', 'sup', 'u',
  ]);

  const indentUnit = opts.indent ?? '  ';
  const stripStyle = opts.stripStyle ?? false;

  function escapeText(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escapeAttr(text: string): string {
    return escapeText(text).replace(/"/g, '&quot;');
  }

  function isWhitespaceOnly(text: string): boolean {
    return text.trim() === '';
  }

  /** SVG icons are decoration, not content — collapse them to their shell. */
  function isSvgElement(el: Element): boolean {
    return el.tagName.toLowerCase() === 'svg';
  }

  /**
   * `<tag k="v">` with attributes sorted by name so serialization is stable no
   * matter which engine produced the DOM. Empty attribute values render bare
   * (`hidden`) rather than `hidden=""`.
   */
  function openTag(el: Element): string {
    const attrs = Array.from(el.attributes)
      .filter((attr) => !(stripStyle && attr.name === 'style'))
      .map((attr) => ({ name: attr.name, value: attr.value }))
      .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    const head = attrs
      .map((attr) => (attr.value ? ` ${attr.name}="${escapeAttr(attr.value)}"` : ` ${attr.name}`))
      .join('');
    return `<${el.tagName.toLowerCase()}${head}>`;
  }

  function closeTag(el: Element): string {
    return `</${el.tagName.toLowerCase()}>`;
  }

  /** Verbatim content for PRE (code blocks) — whitespace is significant there. */
  function renderPre(el: Element): string {
    const text = el.textContent ?? '';
    const inner = escapeText(text === '' ? '' : text.replace(/\n$/, ''));
    return `${openTag(el)}${inner}${closeTag(el)}`.trim();
  }

  /** A compact, single-line rendering of an inline-only subtree. */
  function renderInline(node: Node): string {
    let out = '';
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === 3) {
        // Whitespace between inline siblings is significant ("bold italic");
        // only whitespace between *block* boundaries is an indentation artifact,
        // and that never reaches here (inline subtrees render flat).
        out += escapeText((child as Text).textContent ?? '');
      } else if (child.nodeType === 1) {
        const el = child as Element;
        const tag = el.tagName.toLowerCase();
        if (VOID_TAGS.has(tag)) {
          out += openTag(el);
        } else if (isSvgElement(el)) {
          out += '<svg></svg>';
        } else {
          out += openTag(el);
          out += renderInline(el);
          out += closeTag(el);
        }
      }
    }
    return out;
  }

  /** True when the subtree contains only text and other inline elements. */
  function isInlineSubtree(el: Element): boolean {
    if (isSvgElement(el)) return true;
    for (const child of Array.from(el.childNodes)) {
      if (child.nodeType === 3) continue;
      if (child.nodeType === 1) {
        const tag = (child as Element).tagName.toLowerCase();
        if (!INLINE_TAGS.has(tag) || !isInlineSubtree(child as Element)) return false;
      }
    }
    return true;
  }

  function renderBlock(el: Element, depth: number): string[] {
    const pad = indentUnit.repeat(depth);
    const tag = el.tagName.toLowerCase();

    if (tag === 'pre') return [pad + renderPre(el)];
    if (isSvgElement(el)) return [pad + '<svg></svg>'];
    if (VOID_TAGS.has(tag)) return [pad + openTag(el)];
    if (isInlineSubtree(el)) {
      // Trim the ragged edges of the flat rendering; interior word spaces stay.
      const inner = renderInline(el).trim();
      return [pad + openTag(el) + inner + closeTag(el)];
    }

    const lines = [pad + openTag(el)];
    for (const child of Array.from(el.childNodes)) {
      if (child.nodeType === 3) {
        const text = (child as Text).textContent ?? '';
        if (!isWhitespaceOnly(text)) lines.push(pad + '  ' + escapeText(text.trim()));
      } else if (child.nodeType === 1) {
        lines.push(...renderBlock(child as Element, depth + 1));
      }
    }
    lines.push(pad + closeTag(el));
    return lines;
  }

  // An Element serializes itself (and its subtree); a fragment serializes its
  // children. The latter matches "here is the innerHTML" semantics.
  if (root instanceof Element) {
    return renderBlock(root, 0).join('\n');
  }

  const lines: string[] = [];
  for (const child of Array.from(root.childNodes)) {
    if (child.nodeType === 3) {
      const text = (child as Text).textContent ?? '';
      if (!isWhitespaceOnly(text)) lines.push(indentUnit.repeat(0) + escapeText(text.trim()));
    } else if (child.nodeType === 1) {
      lines.push(...renderBlock(child as Element, 0));
    }
  }
  return lines.join('\n');
}

// --- ARIA snapshot ---------------------------------------------------------

/**
 * The accessibility surface of the element, as a stable indented tree.
 *
 * This is the jsdom-side analogue of Playwright's real accessibility snapshot
 * (`toMatchAriaSnapshot`), used by the browser suite. It captures roles,
 * aria-* attributes, contenteditable and disabled state, skips icon chrome
 * (SVG subtrees) and anything hidden/aria-hidden, and quotes visible text.
 * It is a best-effort model of the a11y *contract*, not a pixel of Chromium.
 */
export function lilacAriaSnapshot(root: Element | DocumentFragment): string {
  // Tags the ARIA dump treats as chrome rather than semantics (icons, decorations).
  const ARIA_SKIP_TAGS = new Set(['svg', 'path', 'g', 'circle', 'rect', 'polyline', 'defs']);

  function escapeText(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escapeAttr(text: string): string {
    return escapeText(text).replace(/"/g, '&quot;');
  }

  function isWhitespaceOnly(text: string): boolean {
    return text.trim() === '';
  }

  const lines: string[] = [];

  const push = (depth: number, line: string): void => {
    lines.push('  '.repeat(depth) + line);
  };

  const elementToken = (el: Element): string => {
    const role = el.getAttribute('role') ?? el.tagName.toLowerCase();
    const tokens = [role];
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name;
      if (name === 'contenteditable') tokens.push('[contenteditable]');
      else if (name === 'disabled') tokens.push('[disabled]');
      else if (name === 'hidden') tokens.push('[hidden]');
      else if (name.startsWith('aria-')) tokens.push(`[${name}="${escapeAttr(attr.value)}"]`);
    }
    return tokens.join(' ');
  };

  const visit = (node: Node, depth: number): void => {
    if (node.nodeType === 3) {
      const text = (node as Text).textContent ?? '';
      if (!isWhitespaceOnly(text)) push(depth, `- text: ${JSON.stringify(text.trim())}`);
      return;
    }
    if (node.nodeType !== 1) return;

    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    if (ARIA_SKIP_TAGS.has(tag)) return;
    if (el.hasAttribute('hidden') || el.getAttribute('aria-hidden') === 'true') return;
    // The editor hides the placeholder and toggles the find panel via
    // inline `display`, which is exactly how the real a11y tree drops them.
    if (el.style && el.style.display === 'none') return;

    push(depth, `- ${elementToken(el)}`);
    for (const child of Array.from(el.childNodes)) visit(child, depth + 1);
  };

  if (root instanceof Element) visit(root, 0);
  else {
    for (const child of Array.from(root.childNodes)) visit(child, 0);
  }
  return lines.join('\n');
}