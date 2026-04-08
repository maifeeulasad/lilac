/// <reference types="node" />

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const OUTPUT_PATH = path.join('snap', 'screenshot.png');

async function waitForEditorReady(page: any): Promise<void> {
    await page.waitForSelector('#editor-root .lilac-editor', { state: 'visible', timeout: 60000 });

    await page.waitForFunction(() => {
        const editor = document.querySelector('#editor-root .lilac-editor');
        const content = document.querySelector('#editor-root .lilac-editor__content');
        const toolbarButtons = document.querySelectorAll('#editor-root .lilac-toolbar__button');

        if (!editor || !content || toolbarButtons.length < 8) {
            return false;
        }

        const text = (content.textContent || '').trim();
        return text.length > 80;
    }, { timeout: 60000 });

    await page.evaluate(async () => {
        if (document.fonts && document.fonts.ready) {
            await document.fonts.ready;
        }
    });

    // Wait two frames so async mount/layout work settles before capture.
    await page.evaluate(() => new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    }));
}

(async () => {
    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });

    const browser = await chromium.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
        const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
        await page.goto('http://127.0.0.1:3000/', {
            waitUntil: 'domcontentloaded',
            timeout: 45000,
        });

        await waitForEditorReady(page);
        await page.screenshot({ path: OUTPUT_PATH, fullPage: true });
    } finally {
        await browser.close();
    }
})().catch((error: Error) => {
    console.error(error);
    process.exit(1);
});
