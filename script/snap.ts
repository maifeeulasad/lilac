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

    await page.waitForFunction(() => {
        if (!('fonts' in document)) {
            return true;
        }

        const fonts = (document as Document & {
            fonts?: { status?: string };
        }).fonts;

        return !fonts || fonts.status === 'loaded';
    }, { timeout: 20000 });

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
        const browserErrors: string[] = [];

        page.on('pageerror', (error: Error) => {
            browserErrors.push(`[pageerror] ${error.message}`);
        });

        page.on('console', (message: any) => {
            if (message.type() === 'error') {
                browserErrors.push(`[console.error] ${message.text()}`);
            }
        });

        await page.goto('http://127.0.0.1:3000/', {
            waitUntil: 'domcontentloaded',
            timeout: 45000,
        });

        try {
            await waitForEditorReady(page);
        } catch (error) {
            if (browserErrors.length > 0) {
                console.error('Browser errors before snapshot:');
                browserErrors.forEach((entry) => console.error(entry));
            }
            throw error;
        }

        await page.screenshot({ path: OUTPUT_PATH, fullPage: true });
    } finally {
        await browser.close();
    }
})().catch((error: Error) => {
    console.error(error);
    process.exit(1);
});
