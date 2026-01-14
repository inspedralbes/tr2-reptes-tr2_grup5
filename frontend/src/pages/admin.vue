<template>
  <div class="page">
  </div>
  <NuxtPage />
</template>

<script setup>
const header = useHeaderStore()
header.setHeaderAdmin()
</script>

<style scoped>
.page {
  text-align: center;
  margin-top: 0px;  
}
</style>
