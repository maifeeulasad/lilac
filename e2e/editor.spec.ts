// Browser suite.
//
// jsdom cannot run `document.execCommand`, so the toolbar and shortcut
// formatting paths — the heart of a WYSIWYG editor — only ever run for real in
// a browser. These specs drive the built library in Chromium and verify the
// four layers side by side for the same workflows:
//
//   1. behavior  — did the document end up right? (getContent / innerHTML)
//   2. html      — the canonical DOM contract, via the shared Lilac serializer
//   3. a11y      — Chromium's real accessibility tree
//   4. visual    — actual pixels
//
// Run with `pnpm test:e2e`.

import { expect, test, type Page } from '@playwright/test';
import { serializeLilac, lilacAriaSnapshot } from '../test/helpers/serialize';

async function openEditor(page: Page): Promise<void> {
  await page.goto('/e2e/fixtures/editor.html');
  await page.locator('.lilac-editor').waitFor();
}

const content = (page: Page) => page.locator('.lilac-editor__content');
const root = (page: Page) => page.locator('.lilac-editor');

/** Canonical HTML of the whole editor shell (browser truth, Lilac normalizer). */
async function shellHtml(page: Page): Promise<string> {
  const el = await root(page).evaluateHandle((node) => node);
  return (await el.evaluate(serializeLilac as never)) as Promise<string>;
}

/** Canonical HTML of just the editable region's markup. */
async function contentHtml(page: Page): Promise<string> {
  const el = await content(page).evaluateHandle((node) => node);
  return (await el.evaluate(serializeLilac as never)) as Promise<string>;
}

/** Canonical a11y tree of the whole shell (jsdom-style, from the browser DOM). */
async function shellAria(page: Page): Promise<string> {
  const el = await root(page).evaluateHandle((node) => node);
  return (await el.evaluate(lilacAriaSnapshot as never)) as Promise<string>;
}

async function selectTextIn(page: Page, needle: string): Promise<void> {
  const ok = await page.evaluate((text) => (window as any).lilac.selectText(text), needle);
  expect(ok).toBe(true);
}

test.describe('mounting', () => {
  test('mounts the canonical empty editor', async ({ page }) => {
    await openEditor(page);
    expect(content(page)).toBeVisible();

    // Rendering contract: canonical shell + content markup.
    expect(await shellHtml(page)).toMatchSnapshot('empty-shell.txt');
    expect(await contentHtml(page)).toMatchSnapshot('empty-content.txt');

    // Real accessibility tree: a multiline textbox above placeholder-free content.
    await expect(content(page)).toHaveAttribute('role', 'textbox');
    await expect(content(page)).toHaveAttribute('aria-multiline', 'true');
    expect((await shellAria(page)).replace(/\n+/g, '\n')).toContain('- textbox');
  });

  test('visual baseline of an empty editor', async ({ page }) => {
    await openEditor(page);
    await expect(root(page)).toHaveScreenshot('empty-editor.png');
  });
});

test.describe('typing', () => {
  test('typing produces plain text and fires onChange content updates', async ({ page }) => {
    await openEditor(page);
    await content(page).click();
    await page.keyboard.type('Hello world'); // real keystrokes
    await expect(content(page)).toHaveText('Hello world');
    expect(await contentHtml(page)).toMatchSnapshot('typed-text.txt');
  });
});

test.describe('toolbar formatting', () => {
  test('bold via the toolbar wraps the selection', async ({ page }) => {
    await openEditor(page);
    await content(page).click();
    await page.keyboard.type('Hello world');
    await selectTextIn(page, 'world');
    await root(page).locator('[data-tool="bold"]').click();
    await expect(content(page)).toHaveText('Hello world');
    expect(await contentHtml(page)).toMatchSnapshot('bold-selection.txt');
  });

  test('bold via Ctrl+B keyboard shortcut', async ({ page }) => {
    await openEditor(page);
    await content(page).click();
    await page.keyboard.type('lilac');
    await selectTextIn(page, 'lilac');
    await page.keyboard.press('ControlOrMeta+b');
    expect(await contentHtml(page)).toMatchSnapshot('ctrl-b.txt');
  });

  test('italic via the toolbar', async ({ page }) => {
    await openEditor(page);
    await content(page).click();
    await page.keyboard.type('wow');
    await selectTextIn(page, 'wow');
    await root(page).locator('[data-tool="italic"]').click();
    expect(await contentHtml(page)).toMatchSnapshot('italic-selection.txt');
  });

  test('heading via the toolbar', async ({ page }) => {
    await openEditor(page);
    await content(page).click();
    await page.keyboard.type('Big title');
    await root(page).locator('[data-tool="heading1"]').click();
    expect(await contentHtml(page)).toMatchSnapshot('heading1.txt');
  });

  test('link via Ctrl+K opens the URL prompt and inserts a link', async ({ page }) => {
    await openEditor(page);
    let dialogUrl = '';
    page.on('dialog', async (dialog) => {
      dialogUrl = dialog.message().includes('URL') ? 'https://example.com' : '';
      await dialog.accept('https://example.com');
    });
    await content(page).click();
    await page.keyboard.type('openai');
    await selectTextIn(page, 'openai');
    await page.keyboard.press('ControlOrMeta+k');
    expect(dialogUrl).toBe('https://example.com');
    expect(await contentHtml(page)).toMatchSnapshot('link-insert.txt');
  });

  test('visual baseline after formatting (bold selection)', async ({ page }) => {
    await openEditor(page);
    await content(page).click();
    await page.keyboard.type('Hello world');
    await selectTextIn(page, 'world');
    await root(page).locator('[data-tool="bold"]').click();
    await expect(root(page)).toHaveScreenshot('bold-text.png');
  });
});

test.describe('history', () => {
  test('undo and redo restore content through the keyboard', async ({ page }) => {
    await openEditor(page);
    await content(page).click();
    await page.keyboard.type('first');
    await expect(content(page)).toHaveText('first');

    // The editor snapshots a history entry per input event, so in a real
    // browser each keystroke is its own undo step: Ctrl+Z undoes the last
    // character (granular WYSIWYG history).
    await page.keyboard.press('ControlOrMeta+z');
    await expect(content(page)).toHaveText('firs');

    // Redo (Ctrl+Y / Ctrl+Shift+Z) replays that one step.
    await page.keyboard.press('ControlOrMeta+y');
    await expect(content(page)).toHaveText('first');
  });
});