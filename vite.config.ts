// vite.config.ts

/// <reference types="vitest" />  // <--- AÑADE ESTA LÍNEA AL PRINCIPIO

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {  // <--- AÑADE TODA ESTA SECCIÓN 'test'
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts', // Apunta al nuevo archivo que crearás
  },
});