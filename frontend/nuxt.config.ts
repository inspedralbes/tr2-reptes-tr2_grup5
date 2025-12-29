// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
  srcDir: 'src/',
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
