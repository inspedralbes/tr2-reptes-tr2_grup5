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
import { useHeaderStore } from '@/stores/header';

onMounted(function () {
  const s = useHeaderStore();
  const path = useRoute().path;
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

.page-container {
  padding: 2.5rem;
  max-width: 1300px;
  margin: 0 auto;
}
</style>
