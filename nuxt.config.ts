import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-05-01", 

  devtools: { enabled: true },

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL
  },

  modules: [
    // REMOVIDO: '@nuxthub/core'  ← era esse o culpado
    '@nuxt/icon'
  ],

  css: ['~/assets/css/main.css'],

  icon: {
    serverBundle: 'local',
  },

  app: {
    head: {
      htmlAttrs: {
        'data-theme': 'nostalgia'
      }
    }
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
      ]
    },
    server: {
      watch: {
        usePolling: true
      }
    }
  },
});