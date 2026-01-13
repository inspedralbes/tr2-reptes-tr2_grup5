<template>
  <header v-if="header.showHeader">
    <h1>{{ header.title }}</h1>
    <div class="buttons">
      <button v-for="(btn, i) in header.buttons" :key="i" @click="navigate(btn)">
        {{ btn.label }}
      </button>
    </div>
  </header>
</template>

<script setup>
const header = useHeaderStore()

// Navegar y manejar logout: si la ruta es /login ocultamos el header y limpiamos el token
const navigate = (btn) => {
  try {
    if (btn && btn.route === '/login') {
      // remove auth token on logout (client-side)
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('authToken')
      }
      // hide header
      header.setHeader({ showHeader: false })
    }
  } catch (e) {
    // ignore
  }
  navigateTo(btn.route)
}
</script>

