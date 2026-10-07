import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      {
        name: 'disable-vite-client-ws',
        enforce: 'post',
        transform(code, id) {
          if (id.includes('vite/dist/client/client.mjs')) {
            return code.replace(
              'const createWebSocketModuleRunnerTransport = (options) => {',
              'const createWebSocketModuleRunnerTransport = (_options) => ({ async connect() {}, async disconnect() {}, send() {} }); const _origCreateWS = (options) => {'
            );
          }
          return null;
        },
      },
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.svg', 'icon.svg'],
        manifest: {
          id: '/',
          name: 'YorVoca - Orientación Vocacional',
          short_name: 'YorVoca',
          description: 'Progressive Web App de orientación vocacional y exploración académica en Colombia.',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.svg',
              sizes: '192x192',
              type: 'image/svg+xml',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: false,
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
