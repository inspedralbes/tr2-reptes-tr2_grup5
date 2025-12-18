// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
  srcDir: 'app/',
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
  },
})
