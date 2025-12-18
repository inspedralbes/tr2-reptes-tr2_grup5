<template>
  <Header />
  <div class="page">
    <h2>Àrea d'Administració</h2>
    <p>Benvingut/da al panell d'administració.</p>
  </div>
  <NuxtPage />
</template>

<script setup>
const header = useHeaderStore()
header.setHeaderAdmin()
</script>

<style scoped>
.page {
  text-align: center;
  margin-top: 0px;  
}
</style>
