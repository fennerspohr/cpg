import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  runtimeConfig: {
    // As variáveis aqui ficam disponíveis apenas no servidor
    databaseUrl: process.env.DATABASE_URL 
  },

  // 1. REGISTRE OS MÓDULOS AQUI PRIMEIRO
  modules: [
    '@nuxthub/core',
    '@nuxt/icon'
  ],

  css: ['~/assets/css/main.css'],

  // 2. AGORA O TS VAI RECONHECER O 'icon' AQUI EMBAIXO
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