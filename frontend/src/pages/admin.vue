<template>
  <div class="admin-main-view">
    <!-- Header removed as per user request -->


    <section class="admin-body">
      <NuxtPage />
    </section>
  </div>
</template>

<script setup>
// ======================================
// Importacions i Dependències
// ======================================
// (No n'hi ha de moment)

// ======================================
// Estat Reactiu i Propietats Computades
// ======================================

// 1. Propietat computada per obtenir la data actual formatada
const currentDate = computed(function () {
  const data = new Date();
  const opcions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  // Retornem la data localitzada en català
  return data.toLocaleDateString('ca-ES', opcions);
});

// ======================================
// Declaracions de funcions
// ======================================
// (No n'hi ha de moment)
</script>

<style scoped>
/* Estils generals de la vista d'administració */
.admin-body {
  animation: slideUp 0.4s ease-out;
}

/* Animació d'entrada suau cap amunt */
@keyframes slideUp {
  from { 
    opacity: 0; 
    transform: translateY(15px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}
</style>
