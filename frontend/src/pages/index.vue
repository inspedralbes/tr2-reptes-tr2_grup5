<template>
  <div class="page">
    <h1>Selecciona el teu rol</h1>
    <div class="buttons">
      <button @click="goTo('admin')">Admin</button>
      <button @click="goTo('centres')">Centres</button>
      <button @click="goTo('professors')">Professors</button>
      <button @click="goTo('alumnes')">Alumnes</button>
      <button @click="goTo('login')">Login</button>
    </div>
  </div>
</template>

<script setup>
const header = useHeaderStore()
header.resetHeader()

const goTo = (role) => {
  if (role === 'admin') navigateTo('/admin/tallers')
  else if (role === 'centres') navigateTo('/centres/peticions')
  else if (role === 'professors') navigateTo('/professors/tallers')
  else if (role === 'alumnes') navigateTo('/alumnes/info')
  else if (role === 'login') navigateTo('/login')
}
</script>
