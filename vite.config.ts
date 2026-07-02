import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['music.mp3', 'favicon.ico', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: '俄罗斯方块 React Tetris',
        short_name: 'Tetris',
        description: '使用 React 18 + TypeScript + Vite 编写的俄罗斯方块，支持离线游玩',
        start_url: './index.html',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#009688',
        theme_color: '#009688',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,mp3,ico,woff,ttf}'],
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: /\.(?:mp3|png|ico|woff|ttf)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'game-assets',
              expiration: { maxEntries: 50 },
            },
          },
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'app-shell',
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }) as any,
  ],
  build: {
    target: 'es2020',
    outDir: 'dist',
  },
});
