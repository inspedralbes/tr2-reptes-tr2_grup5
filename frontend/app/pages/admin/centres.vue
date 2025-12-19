<template>
  <div class="page">
    <h2>Llistat de centre</h2>
     <NuxtLink to="/admin/centres/FormCentres">
      <button>Crear centre</button>
    </NuxtLink>
  </div>
</template>

<script setup>
const header = useHeaderStore()
header.setHeaderAdmin()
</script>
