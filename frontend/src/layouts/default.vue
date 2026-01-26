<template>
  <div class="admin-layout">
    <Header />

    <main class="main-content">
      <div class="page-container">
        <NuxtPage />
      </div>
    </main>
  </div>
</template>

<script setup>
// ======================================
// Importem les dependències
// ======================================
import { useHeaderStore } from '@/stores/header';

// ======================================
// Definició de l'Esquema
// ======================================
// (Aquest component no requereix definitions d'estat local addicional)

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Ganxo de muntatge per configurar la capçalera ---
onMounted(function () {
  // 1. Obtenim la store de la capçalera
  const store = useHeaderStore();
  
  // 2. Obtenim la ruta actual
  const ruta = useRoute();
  const path = ruta.path;
  
  // 3. Configurem la capçalera basant-nos en el prefix de la ruta
  if (path.startsWith('/admin')) {
    store.setHeaderAdmin();
  } else if (path.startsWith('/centres')) {
    store.setHeaderCentres();
  } else if (path.startsWith('/professors')) {
    store.setHeaderProfessors();
  } else if (path.startsWith('/alumnes')) {
    store.setHeaderAlumnes();
  } else {
    // Si no coincideix amb cap, posem l'administrador per defecte
    store.setHeaderAdmin();
  }
});
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #ffffff;
}

.main-content {
  flex: 1;
  margin-left: 280px;
}

.page-container {
  padding: 1.5rem 2.5rem;
  max-width: 1300px;
  margin: 0 auto;
}
</style>
