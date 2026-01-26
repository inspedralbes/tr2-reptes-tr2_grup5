<template>
  <div class="admin-layout">
    <Header />

    <main class="main-content">
      <div class="page-container" :class="{ 'page-container--admin': isAdmin }">
        <NuxtPage />
      </div>
    </main>
  </div>
</template>

<script setup>
import { useHeaderStore } from '@/stores/header';

const route = useRoute();
const isAdmin = computed(() => route.path.startsWith('/admin'));

onMounted(function () {
  const s = useHeaderStore();
  const path = route.path;
  if (path.startsWith('/admin')) {
    s.setHeaderAdmin();
  } else if (path.startsWith('/centres')) {
    s.setHeaderCentres();
  } else if (path.startsWith('/professors')) {
    s.setHeaderProfessors();
  } else if (path.startsWith('/alumnes')) {
    s.setHeaderAlumnes();
  } else {
    s.setHeaderAdmin();
  }
});
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
}

.main-content {
  flex: 1;
  margin-left: 280px;
}

/* margin-left del main s'adapta a l'amplada de la nav bar quan viewport < 1066px */
@media (max-width: 1066px) {
  .main-content {
    margin-left: clamp(180px, calc(180px + 100 * (100vw - 480px) / 586), 280px);
  }
}

/* A ≤692px: header horitzontal dalt; main sense marge esquerre i margin-top per la barra */
@media (max-width: 692px) {
  .main-content {
    margin-left: 0;
    margin-top: 56px;
  }
}

.page-container {
  padding: 2.5rem;
  max-width: 1300px;
  margin: 0 auto;
}

/* Pàgines admin: sense marge lateral, 2.5rem amunt i avall */
.page-container.page-container--admin {
  padding-left: 0;
  padding-right: 0;
  padding-top: 2.5rem;
  padding-bottom: 2.5rem;
}

/* Marges laterals responsius: a partir de 1634px el marge disminueix progressivament fins a 20px. Afecta a totes les pàgines (admin, centres, professors, alumnes). */
@media (max-width: 1634px) {
  .page-container {
    padding-left: clamp(20px, calc(20px + 20 * (100vw - 480px) / 1154), 2.5rem);
    padding-right: clamp(20px, calc(20px + 20 * (100vw - 480px) / 1154), 2.5rem);
  }
}

/* A ≤362px: menys padding (5px) al contingut */
@media (max-width: 362px) {
  .page-container,
  .page-container.page-container--admin {
    padding: 5px;
  }
}
</style>
