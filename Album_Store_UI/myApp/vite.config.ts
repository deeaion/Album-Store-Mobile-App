/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
export default defineConfig({
  plugins: [
    react(),
    legacy()
  ],
  define:{
    global:{},
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
  build: {
    sourcemap: true, // Enable source maps for your own code
    rollupOptions: {
      output: {
        sourcemapExcludeSources: true, // Exclude sources in the source maps
      },
    },
  },
});
