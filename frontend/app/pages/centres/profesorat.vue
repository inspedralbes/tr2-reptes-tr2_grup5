<template>
  <div class="page">

    <h2>Llistat de professors nena</h2>
    <NuxtLink to="/centres/Prof/Prof">
      <button>Afegir professor</button>
    </NuxtLink>
  </div>
</template>

<script setup>
const header = useHeaderStore()
header.setHeaderCentres()
</script>