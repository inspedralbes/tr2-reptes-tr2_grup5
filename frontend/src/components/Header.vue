<template>
  <header v-if="header.showHeader">
    <h1>{{ header.title }}</h1>
    <div class="buttons">
      <button
        v-for="(btn, i) in header.buttons"
        :key="obtenirClauBoto(btn, i)"
        @click="navegar(btn)"
      >
        {{ btn.label }}
      </button>
    </div>
  </header>
</template>

<script setup>
// ======================================
// Importacions i Composables (Rutes, Cookies, Stores)
// ======================================
const header = useHeaderStore();

// ======================================
// Estat Reactiu i Refs (Variables i Formularis)
// ======================================

// ======================================
// Lògica i Funcions (Handlers i Lifecycle)
// ======================================

// A) --- Obtenir una clau única per al botó en el v-for ---
function obtenirClauBoto(btn, i) {
  // 1. Si el botó té route, la usem com a part de la clau.
  if (btn && btn.route) {
    return btn.route + '-' + String(i);
  }
  // 2. En cas contrari, usem l'índex.
  return 'btn-' + String(i);
}

// A) --- Navegar a la ruta del botó i gestionar logout ---
function navegar(btn) {
  // 1. Intentem processar la navegació i el logout si cal.
  try {
    if (btn && btn.route === '/login') {
      // 2. En logout, eliminem el token del localStorage (client).
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('authToken');
      }
      // 3. Amaguem el header.
      header.setHeader({ showHeader: false });
    }
  } catch (e) {
    // 4. Ignorem errors.
  }
  // 5. Navegem a la ruta del botó.
  navigateTo(btn.route);
}
</script>

<style scoped>
</style>
