<template>
  <div class="page">
  </div>
  <NuxtPage />
</template>

<script setup>
// ======================================
// Importacions i Composables (Rutes, Cookies, Stores)
// ======================================
const header = useHeaderStore();


// ======================================
// Lògica i Funcions (Handlers i Lifecycle)
// ======================================
// 1. Configurem el header per a la secció de centres.
header.setHeaderCentres();
</script>

<style scoped>
.page {
  text-align: center;
  margin-top: 50px;
}
</style>
