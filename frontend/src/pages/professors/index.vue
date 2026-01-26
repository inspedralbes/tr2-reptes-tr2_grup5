<script setup>
// ======================================
// Configuració de la Pàgina
// ======================================

definePageMeta({
  // 1. Definim el middleware de redirecció
  middleware: [
    function (to, from) {
      // Redirigim el professor directament a la llista de tallers
      return navigateTo('/professors/tallers');
    }
  ]
});
</script>

<template>
  <!-- Pàgina buida; el middleware gestiona la redirecció -->
  <div></div>
</template>
