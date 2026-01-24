// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: 'src/',

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