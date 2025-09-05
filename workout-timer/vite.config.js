import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['public/favicon.svg', 'robots.txt', 'audio/*.wav'], // includi beep
            manifest: {
                name: 'Workout Timer',
                short_name: 'Timer',
                description: 'Timer per workout a corpo libero',
                theme_color: '#1f2937', // brand-dark
                background_color: '#1f2937',
                display: 'standalone',
                icons: [{
                        src: '/icons/icon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: '/icons/icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            },
            workbox: {
                runtimeCaching: [{
                    urlPattern: /audio\/.*\.wav/,
                    handler: 'CacheFirst',
                    options: {
                        cacheName: 'audio-cache',
                        expiration: {
                            maxEntries: 10,
                            maxAgeSeconds: 60 * 60 * 24, // 1 giorno
                        }
                    }
                }]
            }
        })
    ]
})