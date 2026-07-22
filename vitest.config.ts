import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // The core is a DOM library end to end — contenteditable, Selection,
    // document.head. jsdom covers everything except execCommand, which it does
    // not implement; the toolbar formatting paths need a real browser and are
    // left to an end-to-end layer.
    environment: 'jsdom',
    include: ['test/**/*.test.ts'],
  },
});
