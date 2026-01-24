<template>
  <div class="page">
    <NuxtPage />
  </div>
</template>

<script setup>
// ======================================
// Importacions i Composables (Rutes, Cookies, Stores)
// ======================================
const header = useHeaderStore();

// ======================================
// Lògica i Funcions (Handlers i Lifecycle)
// ======================================
// 1. Configurem el header per a la secció de professors.
header.setHeaderProfessors();
</script>


