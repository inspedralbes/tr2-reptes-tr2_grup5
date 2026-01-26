<template>
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
/* Estils unificats via layout global */
</style>
