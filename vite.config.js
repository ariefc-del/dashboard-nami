import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['nami-192.png', 'nami-512.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Dashboard Keuangan Nami',
        short_name: 'Nami',
        description: 'Dashboard keuangan keluarga - dicatat Nami!',
        theme_color: '#1a3a5c',
        background_color: '#f0f4f8',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'nami-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'nami-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
})
