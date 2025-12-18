<template>
  <Header />
  <div class="page">
    <h2>Panell de Centres</h2>
    <p>Aquesta és la pàgina principal de centres després del login.</p>
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
