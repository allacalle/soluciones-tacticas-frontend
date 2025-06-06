// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // <--- 1. IMPORTA 'path'

export default defineConfig({
  plugins: [react()],
  resolve: { // <--- 2. AÑADE LA SECCIÓN 'resolve'
    alias: {
      '@': path.resolve(__dirname, './src'), // <--- 3. DEFINE TU ALIAS
      // Puedes añadir más alias aquí si los necesitas, por ejemplo:
      // '@components': path.resolve(__dirname, './src/components'),
      // '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
});