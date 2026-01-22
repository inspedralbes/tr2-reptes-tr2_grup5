// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: 'src/',

  modules: [
    '@pinia/nuxt'
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
        port: 24678,
        clientPort: 24678,
      }
    }
  }
})