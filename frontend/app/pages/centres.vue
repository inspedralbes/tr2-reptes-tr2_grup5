<template>
  <Header />
  <div class="page">
  </div>
  <NuxtPage />
</template>

<script setup>
const header = useHeaderStore()
header.setHeaderCentres()
</script>

<style scoped>
.page {
  text-align: center;
  margin-top: 50px;
}
</style>
