<template>
  <div class="page">
    <h2>LListat de Tallers</h2>
    <NuxtLink to="/admin/tallers/FormTallers">
      <button>Crear Taller</button>
    </NuxtLink>
  </div>
</template>

<script setup>
const header = useHeaderStore()
header.setHeaderAdmin()
</script>
