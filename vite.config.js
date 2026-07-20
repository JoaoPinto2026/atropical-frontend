import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icon-192.png", "icon-512.png"],
      manifest: {
        name: "A Tropical — App de Viagem",
        short_name: "A Tropical",
        description: "A sua app de viagem A Tropical — itinerário, documentos, guia e suporte.",
        theme_color: "#976F32",
        background_color: "#F6F0E2",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "unsplash-images",
              expiration: { maxEntries: 20, maxAgeSeconds: 7 * 24 * 60 * 60 }
            }
          },
          {
            urlPattern: /^https:\/\/www\.atropical\.pt\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "atropical-assets",
              expiration: { maxEntries: 10, maxAgeSeconds: 30 * 24 * 60 * 60 }
            }
          },
          {
            urlPattern: /^https:\/\/open\.er-api\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "exchange-rates",
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 }
            }
          }
        ]
      }
    })
  ]
});
