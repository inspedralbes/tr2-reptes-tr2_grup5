<template>
  <div class="page">
    <p>Redirigint al panell...</p>
  </div>
</template>

<script setup>
// ======================================
// Importacions i Composables (Rutes, Cookies, Stores)
// ======================================
const router = useRouter();

// ======================================
// Lògica i Funcions (Handlers i Lifecycle)
// ======================================
// 1. Redirigim al panell principal de tallers.
router.replace('/professors/tallers');
</script>

<style scoped>
.page { padding: 50px; text-align: center; color: #666; }
</style>
