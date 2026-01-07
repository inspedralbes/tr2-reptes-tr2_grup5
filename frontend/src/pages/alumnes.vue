<template>
  <div class="page">
    <NuxtPage />
  </div>
</template>

<script setup>
const header = useHeaderStore()
header.setHeaderAlumnes()
</script>

<style scoped>
/* Page transition or common styles */
</style>
