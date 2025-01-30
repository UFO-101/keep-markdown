import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: 'src/content.js',
      output: {
        dir: 'extension/dist',
        entryFileNames: 'content.js',
        format: 'iife'
      }
    },
    minify: false,
    sourcemap: true
  }
}); 