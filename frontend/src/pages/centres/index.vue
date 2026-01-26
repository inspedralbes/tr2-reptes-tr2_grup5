<script setup>
// ======================================
// Configuració de la Pàgina
// ======================================

definePageMeta({
  // 1. Definim el middleware de redirecció
  middleware: [
    function (to, from) {
      // Redirigim el centre directament a la gestió de peticions
      return navigateTo('/centres/peticions');
    }
  ]
});
</script>

<template>
  <!-- Pàgina buida; el middleware gestiona la redirecció -->
  <div></div>
</template>
