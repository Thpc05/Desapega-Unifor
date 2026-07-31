import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // PWA: gera o manifest + o Service Worker (Workbox) e registra sozinho.
    VitePWA({
      registerType: 'autoUpdate', // atualiza o app em segundo plano quando há versão nova
      injectRegister: 'auto', // injeta o registro do SW (sem código manual)
      manifest: {
        name: 'Hmm',
        short_name: 'Hmm',
        description: 'Hmmarket — a economia circular da vila. Anuncie, doe ou venda por esmeraldas.',
        lang: 'pt-BR',
        theme_color: '#17130d',
        background_color: '#17130d',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App shell no precache (JS/CSS/HTML + fontes + sprites do public).
        globPatterns: ['**/*.{js,css,html,png,svg,ico,ttf}'],
        // Deep links do React Router funcionam offline (cai no index.html).
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // Vitrine offline: cacheia a listagem pública (cross-origin, CORS aberto).
            urlPattern: ({ url }) => url.pathname === '/api/item/available',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-listing',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }, // 1 dia
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Fotos dos anúncios (Cloudinary) disponíveis offline.
            urlPattern: ({ url }) => url.hostname === 'res.cloudinary.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'cloudinary-imgs',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30 dias
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
