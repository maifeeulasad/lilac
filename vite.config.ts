import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      outDir: 'dist',
      include: ['src/index.ts', 'src/components/Editor/**', 'src/plugins/**'],
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: mode === 'lib' ? {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LilacEditor',
      formats: ['es', 'umd'],
      fileName: (format) => `lilac-editor.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'ReactJsxRuntime',
        },
      },
    },
  } : {
    outDir: 'dist',
  },
  server: {
    port: 3000,
    // open: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
  base: mode === 'lib' ? './' : '/lilac/',
}))
