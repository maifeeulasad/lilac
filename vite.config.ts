import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
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
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
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
