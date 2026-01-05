<template>
  <header v-if="header.showHeader">
    <h1>{{ header.title }}</h1>
    <div class="buttons">
      <button v-for="(btn, i) in header.buttons" :key="i" @click="navigate(btn.route)">
        {{ btn.label }}
      </button>
    </div>
  </header>
</template>

<script setup>
const header = useHeaderStore()

// Funció per navegar amb Nuxt
const navigate = (route) => {
  navigateTo(route)
}
</script>

