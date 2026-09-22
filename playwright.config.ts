import { defineConfig } from '@playwright/test';

// Browser suite for the paths jsdom cannot cover — real execCommand formatting,
// selection, layout — plus the canonical HTML and real accessibility-tree
// snapshots. Requires the built library (dist/) and a static server; both are
// started here automatically.
//
//   pnpm test:e2e

export default defineConfig({
  testDir: './e2e',
  // Deterministic rendering only ever needs Chromium; the core is
  // framework-agnostic, not browser-agnostic.
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  // Run specs in parallel locally; keep the suite honest and reproducible in CI.
  fullyParallel: true,
  // A stray `test.only` narrows the run — fail the build instead of merging it.
  forbidOnly: !!process.env.CI,
  // Retries document flake rather than hiding it; none locally so failures bite.
  retries: process.env.CI ? 2 : 0,
  // Visual baselines are sensitive to resource contention during capture, so
  // pin CI to a single worker for pixel-stable screenshots; unbounded locally.
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    headless: true,
    viewport: { width: 1200, height: 700 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    // Escape hatch for machines whose headless-shell download is flaky:
    // point at a local full-Chromium build via LILAC_PW_CHROMIUM.
    launchOptions: process.env.LILAC_PW_CHROMIUM
      ? { executablePath: process.env.LILAC_PW_CHROMIUM }
      : undefined,
  },
  webServer: {
    command: 'pnpm build && pnpm dev:server',
    url: 'http://127.0.0.1:3000/e2e/fixtures/editor.html',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  reporter: [['list'], ['html', { open: 'never' }]],
  outputDir: 'test-results/',
  expect: {
    timeout: 10_000,
    // Baselines are generated in the pinned Playwright image (see the e2e CI
    // job) so they match byte-for-byte; a small pixel budget absorbs the
    // font anti-aliasing jitter that survives an identical environment.
    toHaveScreenshot: { maxDiffPixels: 100, animations: 'disabled' },
  },
});