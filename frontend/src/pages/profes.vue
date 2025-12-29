<template>
  <div class="page">
    <h2>Panell de Profes</h2>
    <p>Benvingut/da al panell de profes.</p>
  </div>
</template>

<script setup>
const header = useHeaderStore()
header.setHeaderProfes()
</script>

<style scoped>
.page {
  text-align: center;
  margin-top: 50px;
}
</style>
