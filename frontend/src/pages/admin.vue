<template>
  <div class="admin-main-view">
    <header class="admin-header">
      <div class="title-group">
        <h1 class="main-title">Gestió del Projecte</h1>
        <div class="title-underline"></div>
      </div>
      
      <div class="admin-meta d-none d-md-block">
        <span class="badge-date">{{ currentDate }}</span>
      </div>
    </header>

    <section class="admin-body">
      <NuxtPage />
    </section>
  </div>
</template>

<script setup>
// Per si vols mostrar la data actual al costat del títol
const currentDate = new Date().toLocaleDateString('ca-ES', { 
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
body {
  margin: 0;
}
.admin-main-view {
  font-family: 'Inter', sans-serif;
  padding: 1rem; /* Espaiat respecte a la sidebar */
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 3rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);
}

.main-title {
  font-weight: 800;
  font-size: 2rem;
  color: #0f172a;
  letter-spacing: -0.03em;
  margin: 0;
}

.title-underline {
  width: 60px;
  height: 5px;
  background: linear-gradient(90deg, #2563eb, #60a5fa);
  border-radius: 10px;
  margin-top: 8px;
}

.badge-date {
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
  box-shadow: 0 2px 5px rgba(0,0,0,0.02);
  text-transform: capitalize;
}

.admin-body {
  /* Animació perquè el contingut que canvia aparegui suau */
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>