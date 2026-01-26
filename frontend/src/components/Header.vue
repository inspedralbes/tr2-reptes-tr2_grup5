<template>
  <aside
    v-if="header.showHeader"
    class="fixed top-0 left-0 bottom-0 w-[280px] bg-[#022B3A] z-50 flex flex-col shadow-2xl overflow-hidden border-r border-white/5 font-sans"
  >
    <!-- 1. Logo & Brand -->
    <header class="p-8 pb-6 flex flex-col items-start">
      <div class="w-full max-w-[210px]">
        <p class="text-[9px] font-black text-[#1F7A8C] uppercase tracking-widest opacity-80 mb-3 ml-1">
          {{ roleLabel }}
        </p>
        <img src="/logo_v_white.png" alt="Logo Enginy" class="w-full h-auto object-contain" />
      </div>
    </header>

    <!-- 2. Menu Navigation -->
    <nav class="flex-1 px-4 mt-4 space-y-4 overflow-y-auto scrollbar-hide">
      <div>
        <p class="px-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Menú Principal</p>
        <ul class="space-y-1.5">
          <li v-for="(btn, i) in menuItems" :key="obtenirClauBoto(btn, i)">
            <NuxtLink
              :to="btn.route"
              :class="[
                'relative w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group overflow-hidden no-underline',
                isActive(btn)
                  ? 'bg-gradient-to-r from-[#1F7A8C] to-[#1A6B7A] text-white shadow-lg shadow-[#1F7A8C]/25 translate-x-1'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              ]"
            >
              <div
                v-if="isActive(btn)"
                class="absolute left-0 top-0 bottom-0 w-1 bg-white shadow-[2px_0_15px_rgba(255,255,255,0.6)]"
              />
              <div :class="['flex items-center gap-4 relative z-10 transition-all', isActive(btn) ? 'pl-3' : '']">
                <component
                  :is="getIcon(btn)"
                  :size="20"
                  :strokeWidth="isActive(btn) ? 2.5 : 1.5"
                  :class="isActive(btn) ? 'text-white drop-shadow-sm' : 'text-white/40 group-hover:text-white transition-colors'"
                />
                <span :class="['text-sm tracking-tight', isActive(btn) ? 'font-black' : 'font-medium']">
                  {{ btn.label }}
                </span>
              </div>
              <div
                v-if="isActive(btn)"
                class="relative z-10 w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]"
              />
            </NuxtLink>
          </li>
        </ul>
      </div>
    </nav>

    <!-- 3. User Profile & Logout -->
    <footer class="mt-auto p-4 space-y-2 bg-black/10 border-t border-white/5">
      <div class="flex items-center gap-3 px-4 py-2">
        <div class="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white font-black text-xs border border-white/10">
          {{ userInitials }}
        </div>
        <div class="overflow-hidden">
          <p class="text-sm font-black text-white truncate">{{ userName }}</p>
          <p class="text-[9px] font-bold text-white/30 uppercase truncate tracking-wider">{{ userRoleDisplay }}</p>
        </div>
      </div>
      <button
        @click="handleLogout"
        class="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all font-black text-[10px] uppercase tracking-[0.2em]"
      >
        <LogOut :size="14" />
        SORTIR
      </button>
    </footer>
  </aside>
</template>

<script setup>
// ======================================
// Importem les dependències
// ======================================
import {
  Library,
  Users,
  BarChart3,
  MessageSquare,
  History,
  UserCheck,
  List,
  GraduationCap,
  BookOpen,
  LogOut,
  Calendar,
  Menu
} from 'lucide-vue-next';

// ======================================
// Definició de l'Esquema
// ======================================

// 1. Accés a les stores i composables
const header = useHeaderStore();
const route = useRoute();
const tokenCookie = useCookie('authToken');
const menuOpen = ref(false);

const allMenuItemsForMobile = computed(() => header.buttons || []);

// 2. Elements del menú filtrats (sense "Sortir")
const menuItems = computed(function () {
  const b = header.buttons;
  let buttonsArray = [];
  if (b) {
    buttonsArray = b;
  }
  
  const result = [];
  for (let i = 0; i < buttonsArray.length; i++) {
    const item = buttonsArray[i];
    if (item.label !== 'Sortir') {
      if (item.route !== '/login') {
        result.push(item);
      }
    }
  }
  return result;
});

// 3. Etiqueta informativa del rol actiu
const roleLabel = computed(function () {
  const items = menuItems.value;
  if (items.length === 0) {
    let t = 'PANEL';
    if (header.title) {
      t = header.title.toUpperCase();
    }
    return t;
  }
  
  const r = items[0].route;
  let routeStr = '';
  if (r) {
    routeStr = r;
  }
  
  if (routeStr.startsWith('/admin')) {
    return 'ADMIN PANEL';
  }
  if (routeStr.startsWith('/centres')) {
    return 'CENTRE PANEL';
  }
  if (routeStr.startsWith('/professors')) {
    return 'DOCENT PANEL';
  }
  if (routeStr.startsWith('/alumnes')) {
    return 'ALUMNE PANEL';
  }
  
  let finalTitle = 'PANEL';
  if (header.title) {
    finalTitle = header.title.toUpperCase();
  }
  return finalTitle;
});

// 4. Inicials de l'usuari pel cercle del perfil
const userInitials = computed(function () {
  const name = userName.value;
  if (!name || name === 'Usuari') {
    return '—';
  }
  
  const segments = name.split(' ');
  const parts = [];
  for (let j = 0; j < segments.length; j++) {
    if (segments[j].length > 1) {
      parts.push(segments[j]);
    }
  }
  
  if (parts.length >= 2) {
    const l1 = parts[0][0];
    const l2 = parts[1][0];
    return (l1 + l2).toUpperCase();
  }
  
  return name.substring(0, 2).toUpperCase();
});

// 5. Nom de l'usuari actual
const userName = computed(function () {
  let nameStr = 'Usuari';
  if (header.userName) {
    nameStr = header.userName;
  }
  return nameStr;
});

// 6. Text descriptiu del rol de l'usuari
const userRoleDisplay = computed(function () {
  const role = header.userRole;
  if (role === 'ADMIN') {
    return 'Administrador';
  }
  if (role === 'CENTRE') {
    return 'Gestió de Centre';
  }
  if (role === 'PROFESSOR') {
    return 'Docent Referent';
  }
  if (role === 'ALUMNE') {
    return 'Portal Alumne';
  }
  
  let fallback = '—';
  if (header.title) {
    fallback = header.title;
  }
  return fallback;
});

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Obtenir la clau única per al bucle v-for ---
function obtenirClauBoto(btn, i) {
  if (btn) {
    if (btn.route) {
      return btn.route + '-' + String(i);
    }
  }
  return 'btn-' + String(i);
}

// B) --- Comprovar si una ruta del menú és l'activa ---
function isActive(btn) {
  const path = route.path;
  if (path === btn.route) {
    return true;
  }
  if (btn.route) {
    if (btn.route !== '/') {
      if (path.startsWith(btn.route + '/')) {
        return true;
      }
    }
  }
  return false;
}

// C) --- Mapatge de rutes a icones del menú ---
function getIcon(btn) {
  const r = (btn && btn.route) || '';
  if (r === '/admin/tallers') return Library;
  if (r === '/admin/calendari') return Calendar;
  if (r === '/admin/peticions') return MessageSquare;
  if (r === '/admin/assignacions') return List;
  if (r === '/admin/usuaris') return Users;
  if (r === '/admin/estadistiques') return BarChart3;
  if (r === '/admin/auditoria') return History;
  if (r === '/centres/peticions') return UserCheck;
  if (r === '/centres/assignacions') return List;
  if (r === '/centres/professorat') return GraduationCap;
  if (r === '/professors/tallers') return BookOpen;
  if (r === '/professors/assistencia') return List;
  if (r === '/professors/avaluacions') return BarChart3;
  if (r.startsWith('/alumnes/enquesta')) return MessageSquare;
  if (r.startsWith('/alumnes/info')) return Library;
  
  return List;
}

// D) --- Funció per gestionar l'acció de sortir de l'app ---
function handleLogout() {
  // 1. Busquem el botó de sortida o logout
  const b = header.buttons;
  let buttonsArray = [];
  if (b) {
    buttonsArray = b;
  }
  
  let sortirBtn = null;
  for (let k = 0; k < buttonsArray.length; k++) {
    const item = buttonsArray[k];
    if (item.route === '/login' || item.label === 'Sortir') {
      sortirBtn = item;
      break;
    }
  }
  
  // 2. Si el trobem, naveguem a la ruta de login
  let rutaDesti = '/login';
  if (sortirBtn) {
    rutaDesti = sortirBtn.route;
  }
  
  // 3. Netegem la sessió i naveguem
  header.setHeader({ showHeader: false });
  navigateTo(rutaDesti);
}

// E) --- Ganxo de muntatge per carregar el perfil ---
onMounted(function () {
  // 1. Carreguem les dades de l'usuari al iniciar el component
  header.fetchUserProfile();
});
</script>

<style scoped>
.nav-bar {
  width: 280px;
}

.nav-bar-mobile {
  display: none;
}

/* A partir de 1066px: la nav bar i el logo es van reduint */
@media (max-width: 1066px) {
  .nav-bar {
    width: clamp(180px, calc(180px + 100 * (100vw - 480px) / 586), 280px);
  }
  .logo-container {
    max-width: clamp(100px, calc(100px + 110 * (100vw - 480px) / 586), 210px);
  }
}

/* A 692px o menys: barra horitzontal dalt, logo esquerra + hamburger dreta */
@media (max-width: 692px) {
  .nav-bar {
    width: 100%;
    height: 56px;
    bottom: auto;
    flex-direction: row;
    align-items: center;
    padding: 0;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  .nav-bar-desktop {
    display: none !important;
  }
  .nav-bar-mobile {
    display: flex !important;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    padding: 0 1rem;
  }
}

/* Dropdown mòbil: amagat en desktop */
@media (min-width: 693px) {
  .mobile-dropdown {
    display: none !important;
  }
}

.mobile-dropdown {
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  bottom: 0;
  background: #022B3A;
  z-index: 49;
  overflow-y: auto;
  padding: 1rem;
}

.mobile-dropdown-inner {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
