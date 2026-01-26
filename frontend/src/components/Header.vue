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
  Calendar
} from 'lucide-vue-next';

const header = useHeaderStore();
const route = useRoute();
const tokenCookie = useCookie('authToken');

const menuItems = computed(function () {
  const b = header.buttons || [];
  const result = [];
  for (let i = 0; i < b.length; i++) {
    if (b[i].label !== 'Sortir' && b[i].route !== '/login') {
      result.push(b[i]);
    }
  }
  return result;
});

const roleLabel = computed(function () {
  const m = menuItems.value;
  if (m.length === 0) return (header.title || '').toUpperCase() || 'PANEL';
  const r = m[0].route || '';
  if (r.startsWith('/admin')) return 'ADMIN PANEL';
  if (r.startsWith('/centres')) return 'CENTRE PANEL';
  if (r.startsWith('/professors')) return 'DOCENT PANEL';
  if (r.startsWith('/alumnes')) return 'ALUMNE PANEL';
  return (header.title || 'PANEL').toUpperCase();
});

const userInitials = computed(function () {
  const name = userName.value;
  if (name === 'Usuari' || !name) return '—';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
});

const userName = computed(function () {
  return header.userName || 'Usuari';
});

const userRoleDisplay = computed(function () {
  const role = header.userRole;
  if (role === 'ADMIN') return 'Administrador';
  if (role === 'CENTRE') return 'Gestió de Centre';
  if (role === 'PROFESSOR') return 'Docent Referent';
  if (role === 'ALUMNE') return 'Portal Alumne';
  return header.title || '—';
});

onMounted(() => {
  header.fetchUserProfile();
});

function obtenirClauBoto(btn, i) {
  if (btn && btn.route) return btn.route + '-' + String(i);
  return 'btn-' + String(i);
}

function isActive(btn) {
  const path = route.path;
  if (path === btn.route) return true;
  if (btn.route && btn.route !== '/' && path.startsWith(btn.route + '/')) return true;
  return false;
}

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

function navegar(btn) {
  try {
    if (btn && btn.route === '/login') {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('authToken');
      }
      header.setHeader({ showHeader: false });
    }
  } catch (e) {}
  navigateTo(btn.route);
}

function handleLogout() {
  const sortirBtn = (header.buttons || []).find(function (b) {
    return b.route === '/login' || b.label === 'Sortir';
  });
  navegar(sortirBtn || { route: '/login' });
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
