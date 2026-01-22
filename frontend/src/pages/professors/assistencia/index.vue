<template>
  <div class="page">
    <p>Redirigint al panell...</p>
  </div>
</template>

<script setup>
const router = useRouter();
// Redirigim automàticament al panell principal que té la vista separada
router.replace('/professors/tallers');
</script>

<style scoped>
.page { padding: 50px; text-align: center; color: #666; }
</style>
