<script setup>
// ======================================
// Configuració de la Pàgina
// ======================================

definePageMeta({
  // 1. Definim el middleware de redirecció
  middleware: [
    function (to, from) {
      // Redirigim l'administrador directament a la gestió de tallers
      return navigateTo('/admin/tallers');
    }
  ]
});
</script>

<template>
  <!-- Pàgina buida; el middleware gestiona la redirecció -->
  <div></div>
</template>
