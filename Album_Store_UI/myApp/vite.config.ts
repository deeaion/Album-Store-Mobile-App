/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite';
import { defineConfig } from 'vite'
const mode = process.env.NODE_ENV || 'development';
const env = loadEnv(mode, process.cwd(), '');
export default defineConfig({
  define:{
     global:{},
'process.env.REACT_APP_SERVER_HTTP': JSON.stringify(env.REACT_APP_SERVER_HTTP),
'process.env.REACT_APP_SERVER_HTTPS': JSON.stringify(env.REACT_APP_SERVER_HTTPS),
'process.env.REACT_APP_SERVER_WS': JSON.stringify(env.REACT_APP_SERVER_WS),
'process.env.REACT_APP_SERVER_WSS': JSON.stringify(env.REACT_APP_SERVER_WSS),
  },
  plugins: [
    react(),
    legacy()
  ],

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
