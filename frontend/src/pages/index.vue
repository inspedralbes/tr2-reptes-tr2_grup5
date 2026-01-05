<template>
  <div class="page">
    <h1>Selecciona el teu rol</h1>
    <div class="buttons">
      <button @click="goTo('centres')">Centres</button>
      <button @click="goTo('admin')">Admin</button>
      <button @click="goTo('profes')">Profes</button>
    </div>
  </div>
</template>

<script setup>
const header = useHeaderStore()
header.resetHeader()

const goTo = (role) => {
  if (role === 'centres') navigateTo('/centres')
  else if (role === 'admin') navigateTo('/admin')
  else if (role === 'profes') navigateTo('/profes')
}
</script>
