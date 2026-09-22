import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';

// Client-side-rendering-only build: the optimizer runs (so the QRLs in the
// published adapter resolve), producing a static bundle we can drop onto GitHub
// Pages and embed via an iframe.
export default defineConfig({
  base: './',
  plugins: [qwikVite({ csr: true })],
  build: { outDir: 'dist' },
});
