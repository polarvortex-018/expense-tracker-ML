import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'logo.svg', 'cashbuddy-logo.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Cash Buddy - Your Personal Expense Tracker',
        short_name: 'Cash Buddy',
        description: 'Personal Local-First Expense Tracker & Financial Vaults by Sajid',
        theme_color: '#0b111e',
        background_color: '#0b111e',
        display: 'fullscreen',
        display_override: ['fullscreen', 'standalone', 'minimal-ui'],
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm,webmanifest}'],
        navigateFallback: '/index.html',
        maximumFileSizeToCacheInBytes: 20000000,
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document' || request.destination === 'script',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'cashbuddy-offline-runtime-v3',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 31536000
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: ({ request }) => true,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'cashbuddy-offline-assets-v3',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 31536000
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
})
