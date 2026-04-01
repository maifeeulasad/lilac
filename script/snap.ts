const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    // delay 3 seconds for lazy loading for editor
    await page.waitForTimeout(3000);
    // wait for id "editor-root" to be visible
    await page.waitForSelector('#editor-root', { state: 'visible' });
    await page.screenshot({ path: 'snap/screenshot.png' });
    await browser.close();
})()