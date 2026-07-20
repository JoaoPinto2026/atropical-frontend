import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png"],
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
            src: "favicon.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "favicon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        // Guarda em cache os ficheiros estáticos da app
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // Estratégia: tenta a rede primeiro, cai para cache se offline
        runtimeCaching: [
          {
            // Imagens do Unsplash (fotos das cidades)
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "unsplash-images",
              expiration: { maxEntries: 20, maxAgeSeconds: 7 * 24 * 60 * 60 }
            }
          },
          {
            // Logo e imagens do site A Tropical
            urlPattern: /^https:\/\/www\.atropical\.pt\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "atropical-assets",
              expiration: { maxEntries: 10, maxAgeSeconds: 30 * 24 * 60 * 60 }
            }
          },
          {
            // Taxa de câmbio — cache de 1 hora, depois tenta atualizar
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
