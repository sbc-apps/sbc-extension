import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
export default defineConfig({
  plugins: [react()],
  base: './',
  // Only the extension's new tab is bundled. The landing page (index.html + site/) is static and needs no build.
  build: { rollupOptions: { input: { newtab: resolve(import.meta.dirname, 'newtab.html') } } }
});
