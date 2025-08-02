const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/lilac/', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'snap/screenshot.png' });
    await browser.close();
})()