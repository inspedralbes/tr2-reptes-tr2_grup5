<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo-shield">
          <span class="shield-inner">E</span>
        </div>
        <div class="brand-info">
          <h2 class="brand-name">ENGINY</h2>
          <p class="brand-tag">Admin Panel</p>
        </div>
      </div>

      <nav class="sidebar-nav">
        <NuxtLink
          v-for="item in navItems"
          :key="item.route"
          :to="item.route"
          class="nav-link"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </NuxtLink>

        <div class="nav-divider"></div>

        <NuxtLink :to="rutaLogout" class="nav-link logout-link">
          <span class="nav-icon">🚪</span>
          <span class="nav-label">Sortir</span>
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <p class="version">v1.2.0-stable</p>
      </div>
    </aside>

    <main class="main-content">
      <div class="page-container">
        <NuxtPage />
      </div>
    </main>
  </div>
</template>

<script setup>
// ======================================
// Importacions i Composables (Rutes, Cookies, Stores)
// ======================================
import { computed, onMounted, ref } from 'vue';
import { useHeaderStore } from '@/stores/header';

// ======================================
// Estat Reactiu i Refs (Variables i Formularis)
// ======================================
const storeRef = ref(null);

const navItems = computed(function () {
  // 1. Inicialitzem el resultat buit.
  let resultat = [];
  // 2. Obtenim els botons del store si existeixen.
  if (storeRef.value && storeRef.value.buttons) {
    let btons = storeRef.value.buttons;
    for (let i = 0; i < btons.length; i++) {
      if (btons[i].label !== 'Sortir') {
        let it = btons[i];
        let ic = '•';
        if (it.label === 'Catàleg') {
          ic = '📂';
        } else if (it.label === 'Assignacions') {
          ic = '📅';
        } else if (it.label === 'Usuaris/Centres') {
          ic = '👥';
        } else if (it.label === 'Estadístiques') {
          ic = '📈';
        } else if (it.label === 'Auditoria') {
          ic = '🛡️';
        }
        let ob = {};
        ob.route = it.route;
        ob.label = it.label;
        ob.icon = ic;
        resultat.push(ob);
      }
    }
  }
  return resultat;
});

const logoutItem = computed(function () {
  // 1. Inicialitzem a null.
  let trobat = null;
  // 2. Recorrem els botons amb un bucle for.
  if (storeRef.value && storeRef.value.buttons) {
    let btons = storeRef.value.buttons;
    for (let i = 0; i < btons.length; i++) {
      if (btons[i].label === 'Sortir') {
        trobat = btons[i];
        break;
      }
    }
  }
  return trobat;
});

const rutaLogout = computed(function () {
  let item = logoutItem.value;
  if (item && item.route) {
    return item.route;
  } else {
    return '/login';
  }
});

// ======================================
// Lògica i Funcions (Handlers i Lifecycle)
// ======================================

onMounted(function () {
  // 1. Obtenim el store del header i l'assignem a storeRef.
  const s = useHeaderStore();
  storeRef.value = s;
  // 2. Obtenim la ruta actual i configurem el header segons el camí.
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
body {
  margin: 0;
}
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
}

.sidebar {
  width: 260px;
  background-color: #0f172a;
  color: #f8fafc;
  position: fixed;
  height: 92vh;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border-radius: 7%;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1.5rem 0.5rem;
  margin-bottom: 1rem;
}

.logo-shield {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
}

.brand-name { font-size: 1rem; font-weight: 700; margin: 0; }
.brand-tag { font-size: 0.7rem; color: #64748b; margin: 0; }

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  color: #94a3b8;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.router-link-active {
  background: rgba(59, 130, 246, 0.1) !important;
  color: #3b82f6 !important;
}

.nav-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 1rem 0.5rem;
}

.logout-link {
  color: #f87171 !important;
}

.logout-link:hover {
  background: rgba(248, 113, 113, 0.1) !important;
}

.sidebar-footer {
  padding: 1rem 0.5rem;
  text-align: center;
}

.version { font-size: 0.65rem; color: #475569; margin: 0; }

.main-content {
  flex: 1;
  margin-left: 260px;
}

.page-container {
  padding: 2.5rem;
  max-width: 1300px;
  margin: 0 auto;
}
</style>
