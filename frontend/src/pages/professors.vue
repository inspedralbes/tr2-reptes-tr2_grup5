<template>
  <NuxtPage />
</template>

<script setup>
// ======================================
// Importacions i Dependències
// ======================================

// 1. Store de la capçalera
const headerStore = useHeaderStore();

// ======================================
// Configuració del Component
// ======================================

// 1. Establim la capçalera específica per als professors
headerStore.setHeaderProfessors();
</script>


