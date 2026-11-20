import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { rollupOptions: { input: { newtab: resolve(import.meta.dirname, 'newtab.html'), landing: resolve(import.meta.dirname, 'landing.html') } } }
});
