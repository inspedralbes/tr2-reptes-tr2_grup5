<template>
  <div class="page">
    <NuxtPage />
  </div>
</template>

<script setup>
const header = useHeaderStore()
header.setHeaderProfessors()
</script>

<style scoped>
.page {
  /* Common styles for profes pages if any */
}
</style>
