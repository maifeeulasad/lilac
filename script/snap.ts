declare const require: any;
declare const process: any;

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const OUTPUT_PATH = path.join('snap', 'screenshot.png');

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
        // wait for id "editor-root" to be visible
        await page.waitForSelector('#editor-root', { state: 'visible', timeout: 45000 });
        // delay 20 seconds for lazy loading for editor
        await page.waitForTimeout(20000);
        await page.screenshot({ path: OUTPUT_PATH, fullPage: true });
    } finally {
        await browser.close();
    }
})().catch((error: Error) => {
    console.error(error);
    process.exit(1);
});
