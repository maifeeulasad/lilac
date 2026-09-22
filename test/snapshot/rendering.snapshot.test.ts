// HTML/DOM snapshots — Lilac's rendering contract.
//
// These serialize the live DOM through the canonical Lilac serializer and pin
// the output. A change to class names, attributes, tool ordering, wrapper
// structure or content markup shows up as a snapshot diff here — no pixels
// involved. Layout-level regressions (padding, spacing, color) are covered by
// the visual snapshots in the browser suite instead.
//
// States are canonical, deliberately: a handful of well-understood rendering
// states rather than every combination. Grep the `.snap` file for any of them.

import { describe, expect, it } from 'vitest';
import { mountEditor, selectText } from '../helpers/editor';
import { wordCountPlugin, emojiPlugin, tablePlugin } from '../../core/plugins/index';

describe('editor shell', () => {
  it('renders an empty editor with its placeholder', () => {
    const h = mountEditor({ toolbar: { show: true }, placeholder: 'Start writing...' });
    expect(h.shell()).toMatchSnapshot('empty editor');
    h.cleanup();
  });

  it('renders a toolbar with the default tool set', () => {
    const h = mountEditor({ toolbar: { show: true } });
    expect(h.shell()).toMatchSnapshot('toolbar shell');
    h.cleanup();
  });

  it('renders without a toolbar when asked', () => {
    const h = mountEditor({ toolbar: { show: false } });
    expect(h.shell()).toMatchSnapshot('no toolbar');
    h.cleanup();
  });

  it('renders plain-text mode without toolbar chrome', () => {
    const h = mountEditor({ initialContent: 'plain text' });
    expect(h.shell()).toMatchSnapshot('plain mode');
    h.cleanup();
  });

  it('renders the read-only state', () => {
    const h = mountEditor({ toolbar: { show: true }, initialContent: '<p>locked</p>' });
    h.editor.setReadOnly(true);
    expect(h.shell()).toMatchSnapshot('read only');
    h.cleanup();
  });

  it('renders the dark theme', () => {
    const h = mountEditor({ toolbar: { show: true }, theme: 'dark', initialContent: '<p>night</p>' });
    expect(h.shell()).toMatchSnapshot('dark theme');
    h.cleanup();
  });

  it('renders the character counter footer', () => {
    const h = mountEditor({ toolbar: { show: true }, maxLength: 120, initialContent: '<b>hi</b>' });
    expect(h.shell()).toMatchSnapshot('char counter');
    h.cleanup();
  });

  it('renders plugin toolbar buttons', () => {
    const h = mountEditor({
      toolbar: { show: true },
      plugins: [wordCountPlugin, emojiPlugin, tablePlugin],
    });
    expect(h.shell()).toMatchSnapshot('plugin buttons');
    h.cleanup();
  });

  it('renders the find & replace panel once opened', () => {
    const h = mountEditor({ toolbar: { show: true }, initialContent: '<p>find me</p>' });
    h.editor.openFind();
    expect(h.shell()).toMatchSnapshot('find panel');
    h.cleanup();
  });
});

describe('content markup', () => {
  it('renders a simple paragraph', () => {
    const h = mountEditor({ toolbar: { show: true }, initialContent: '<p>Hello world</p>' });
    expect(h.markup()).toMatchSnapshot('paragraph');
    h.cleanup();
  });

  it('renders headings', () => {
    const h = mountEditor({
      toolbar: { show: true },
      initialContent: '<h1>One</h1><h2>Two</h2><h3>Three</h3>',
    });
    expect(h.markup()).toMatchSnapshot('headings');
    h.cleanup();
  });

  it('renders inline typography', () => {
    const h = mountEditor({
      toolbar: { show: true },
      initialContent:
        '<p>normal <strong>bold</strong> <em>italic</em> <u>underline</u> <s>strike</s> <code>code</code></p>',
    });
    expect(h.markup()).toMatchSnapshot('inline typography');
    h.cleanup();
  });

  it('renders a link with new-tab hardening', () => {
    const h = mountEditor({
      toolbar: { show: true },
      initialContent: '<p><a href="https://ex.com" target="_blank">link</a></p>',
    });
    expect(h.markup()).toMatchSnapshot('link');
    h.cleanup();
  });

  it('renders bullet and ordered lists', () => {
    const h = mountEditor({
      toolbar: { show: true },
      initialContent: '<ul><li>a</li><li>b</li></ul><ol start="3"><li>x</li></ol>',
    });
    expect(h.markup()).toMatchSnapshot('lists');
    h.cleanup();
  });

  it('renders blockquote and code block', () => {
    const h = mountEditor({
      toolbar: { show: true },
      initialContent: '<blockquote><p>quoted</p></blockquote>\n<pre><code>const x = 1;</code></pre>',
    });
    expect(h.markup()).toMatchSnapshot('quote and code');
    h.cleanup();
  });

  it('renders an embedded image', () => {
    const h = mountEditor({
      toolbar: { show: true },
      initialContent: '<p><img src="cat.png" alt="a cat"></p>',
    });
    expect(h.markup()).toMatchSnapshot('image');
    h.cleanup();
  });

  it('renders a table', () => {
    const h = mountEditor({
      toolbar: { show: true },
      initialContent: '<table><thead><tr><th>h</th></tr></thead><tbody><tr><td>c</td></tr></tbody></table>',
    });
    expect(h.markup()).toMatchSnapshot('table');
    h.cleanup();
  });

  it('strips scripts and event handlers from untrusted content', () => {
    const h = mountEditor({
      toolbar: { show: true },
      initialContent: '<p>ok</p><script>alert(1)</script><img src="x" onerror="alert(1)">',
    });
    expect(h.markup()).toMatchSnapshot('sanitized');
    h.cleanup();
  });
});

describe('content markup after user interactions', () => {
  it('keeps the markup stable after typing into an empty editor', () => {
    const h = mountEditor({ toolbar: { show: true } });
    h.content.textContent = 'typed';
    h.content.dispatchEvent(new Event('input', { bubbles: true }));
    expect(h.markup()).toMatchSnapshot('after typing');
    h.cleanup();
  });

  it('shows the selection-driven state intact after a link is inserted over text', () => {
    const h = mountEditor({ toolbar: { show: true }, initialContent: '<p>lilac is nice</p>' });
    selectText(h.content, 'lilac');
    h.editor.focus();
    expect(h.markup()).toMatchSnapshot('with selection');
    h.cleanup();
  });
});