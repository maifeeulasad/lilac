// HTML sanitization for content entering the editor.
//
// The editor round-trips user-authored HTML through a server, so anything
// coming back in via `initialContent` / `setContent` is untrusted by default.
// The allowlist below covers what the toolbar and the bundled plugins can
// actually produce — anything else is unwrapped or dropped.

/** Elements the editor itself can produce, plus the usual inline formatting. */
const ALLOWED_TAGS = new Set([
  'a', 'b', 'blockquote', 'br', 'button', 'code', 'div', 'em', 'h1', 'h2', 'h3',
  'h4', 'h5', 'h6', 'hr', 'i', 'img', 'li', 'ol', 'p', 'pre', 's', 'span',
  'strike', 'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th',
  'thead', 'tr', 'u', 'ul',
]);

/** Dropped along with their contents rather than unwrapped. */
const DROPPED_TAGS = new Set([
  'script', 'style', 'iframe', 'object', 'embed', 'noscript', 'template',
  'link', 'meta', 'base', 'form', 'input', 'textarea', 'select', 'option',
  'svg', 'math', 'audio', 'video', 'source',
]);

const GLOBAL_ATTRS = new Set(['class', 'title', 'dir', 'lang', 'contenteditable']);

const TAG_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'target', 'rel']),
  img: new Set(['src', 'alt', 'width', 'height']),
  td: new Set(['colspan', 'rowspan', 'headers']),
  th: new Set(['colspan', 'rowspan', 'scope', 'headers']),
  ol: new Set(['start', 'type', 'reversed']),
  button: new Set(['type']),
};

/** Attributes carrying a URL, checked against the scheme allowlist. */
const URL_ATTRS = new Set(['href', 'src']);

const SAFE_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:']);

/** data: images that cannot themselves carry script. Excludes svg+xml. */
const SAFE_DATA_IMAGE = /^data:image\/(png|jpe?g|gif|webp|avif);base64,/;

/**
 * Drop the whitespace and control characters a browser ignores when resolving
 * a URL. Without this, a tab or newline smuggled into the scheme — the classic
 * "java\tscript:alert(1)" — would sail past the scheme check below and still
 * execute once the browser normalized it.
 */
function stripUrlNoise(url: string): string {
  let out = '';
  for (const ch of url) {
    const code = ch.codePointAt(0) as number;
    if (code <= 0x20) continue;                     // C0 controls and space
    if (code === 0xa0 || code === 0x1680) continue; // NBSP, Ogham space mark
    if (code >= 0x2000 && code <= 0x200d) continue; // en/em spaces, zero-width
    if (code === 0x2028 || code === 0x2029) continue;
    if (code === 0x205f || code === 0x3000) continue;
    if (code === 0xfeff) continue;                  // BOM
    out += ch;
  }
  return out;
}

/**
 * Whether a URL is safe to place in an href or src.
 *
 * Relative URLs (no scheme) are allowed. Absolute URLs must use a known-safe
 * scheme — this is what keeps `javascript:` out.
 */
export function isSafeUrl(url: string, allowDataImage = false): boolean {
  const normalized = stripUrlNoise(url).toLowerCase();

  if (allowDataImage && SAFE_DATA_IMAGE.test(normalized)) return true;

  const scheme = normalized.match(/^([a-z][a-z0-9+.-]*):/);
  if (!scheme) return true; // relative URL

  return SAFE_SCHEMES.has(`${scheme[1]}:`);
}

function isAllowedAttribute(tag: string, name: string): boolean {
  if (name.startsWith('on')) return false; // onerror, onclick, ...
  if (/^data-[a-z0-9-]+$/.test(name)) return true;
  if (GLOBAL_ATTRS.has(name)) return true;
  return TAG_ATTRS[tag]?.has(name) ?? false;
}

function sanitizeElement(root: Element): void {
  for (const child of Array.from(root.children)) {
    const tag = child.tagName.toLowerCase();

    if (DROPPED_TAGS.has(tag)) {
      child.remove();
      continue;
    }

    if (!ALLOWED_TAGS.has(tag)) {
      // Unknown wrapper: keep the text inside, discard the element.
      sanitizeElement(child);
      child.replaceWith(...Array.from(child.childNodes));
      continue;
    }

    for (const attr of Array.from(child.attributes)) {
      const name = attr.name.toLowerCase();

      if (!isAllowedAttribute(tag, name)) {
        child.removeAttribute(attr.name);
        continue;
      }

      if (URL_ATTRS.has(name) && !isSafeUrl(attr.value, tag === 'img')) {
        child.removeAttribute(attr.name);
      }
    }

    // Links opening in a new tab get the opener severed.
    if (tag === 'a' && child.getAttribute('target') === '_blank') {
      child.setAttribute('rel', 'noopener noreferrer');
    }

    sanitizeElement(child);
  }
}

/**
 * Strip anything that could execute from an HTML fragment.
 *
 * Parsed with DOMParser, which builds an inert document — no scripts run and
 * no resources load while we inspect it, unlike assigning to innerHTML.
 */
export function sanitizeContent(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  sanitizeElement(doc.body);
  return doc.body.innerHTML;
}
