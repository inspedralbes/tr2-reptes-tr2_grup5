// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: 'src/',

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Outfit:wght@100..900&display=swap' }
      ],
      style: [
        { children: 'body { font-family: "Inter", sans-serif; } .font-black { font-weight: 900 !important; }' }
      ]
    }
  },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],

  routeRules: {
    '/api/**': {
      proxy: `${process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:1700'}/api/**`
    }
  },

  vite: {
    server: {
      watch: {
        usePolling: true
      },
      hmr: {
        host: 'localhost',
        port: 24678,
        clientPort: 24678
      }
    }
  }
})