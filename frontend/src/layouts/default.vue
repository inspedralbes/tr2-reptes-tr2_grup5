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
          <span class="nav-icon">{{ getIcon(item.label) }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </NuxtLink>

        <div class="nav-divider"></div>

        <NuxtLink :to="logoutItem?.route || '/login'" class="nav-link logout-link">
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
import { computed } from 'vue'
import { useHeaderStore } from '@/stores/header' 

const headerStore = useHeaderStore()
headerStore.setHeaderAdmin()

const navItems = computed(() => headerStore.buttons.filter(b => b.label !== 'Sortir'))
const logoutItem = computed(() => headerStore.buttons.find(b => b.label === 'Sortir'))

const getIcon = (label) => {
  const emojis = { 
    'Catàleg': '📂', 
    'Assignacions': '📅', 
    'Usuaris/Centres': '👥', 
    'Estadístiques': '📈', 
    'Auditoria': '🛡️' 
  }
  return emojis[label] || '•'
}
</script>

<style scoped>
body{
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

/* El canvi clau: Estil per al botó sortir */
.nav-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 1rem 0.5rem;
}

.logout-link {
  color: #f87171 !important; /* Color vermellós suau */
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