<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" :class="classePageExit">
    
    <!-- 1. CONTROL BAR -->
    <div class="bg-white p-2 rounded-xl border border-[#BFDBF7] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
      
      <!-- Tabs (Centres / Usuaris) -->
      <div class="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-1 scrollbar-hide">
        <button 
          @click="mostrarCentres = true"
          :class="classeTab('centres')"
        >
          Centres
        </button>
        <button 
          @click="mostrarCentres = false"
          :class="classeTab('usuaris')"
        >
          Usuaris
        </button>
      </div>

      <!-- Search Input -->
      <div class="relative flex-1 max-w-lg group w-full">
        <Search :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
        <input 
          type="text" 
          :placeholder="mostrarCentres ? 'Cercar centre educatiu...' : 'Cercar usuari del sistema...'"
          v-model="searchTerm"
          class="w-full bg-[#E1E5F2]/10 border border-[#BFDBF7] rounded-lg pl-10 pr-4 py-2.5 text-[11px] font-bold focus:ring-4 focus:ring-[#1F7A8C]/5 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20"
        />
      </div>

      <!-- View & Order Controls -->
      <div class="flex items-center gap-2 bg-[#E1E5F2]/30 p-1 rounded-lg border border-[#BFDBF7]/20 w-full md:w-auto justify-center">
        <div class="flex items-center gap-1">
          <button 
            @click="viewMode = 'grid'"
            :class="classeBotoView('grid')"
          >
            <LayoutGrid :size="14" />
          </button>
          <button 
            @click="viewMode = 'list'"
            :class="classeBotoView('list')"
          >
            <List :size="14" />
          </button>
        </div>
      </div>
    </div>

    <!-- 2. CONTENT AREA -->
    <div :class="viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-3'">
      
      <template v-for="(item, idx) in filteredItems" :key="mostrarCentres ? item.id : clauUsuari(item, idx)">
        
        <!-- LIST VIEW - CENTRES -->
        <div 
          v-if="viewMode === 'list' && mostrarCentres"
          @click="handleNavigation(item.id)"
          class="bg-white rounded-xl border border-[#E1E5F2] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 hover:shadow-lg transition-all hover:border-[#BFDBF7] group cursor-pointer"
        >
          <div class="flex items-center gap-4 flex-1 min-w-0">
            <div class="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center font-black text-[9px] uppercase border tracking-widest bg-white/40 text-[#022B3A] border-[#BFDBF7]/40 shadow-sm">
              {{ codiCentre(item).slice(-4) }}
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-3 mb-0.5">
                <h3 class="text-base font-black text-[#022B3A] truncate">{{ item.nom_centre }}</h3>
                <span v-if="teTallers(item)" class="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">{{ comptarTallers(item) }} tallers</span>
              </div>
              <p class="text-[11px] font-medium text-[#8E9AAF] truncate">{{ emailCentre(item) }}</p>
            </div>
          </div>
          <div class="hidden lg:flex items-center gap-8 flex-shrink-0">
            <div class="flex flex-col items-end min-w-[100px]">
              <span class="text-[9px] font-black text-[#B8C0CC] uppercase tracking-widest">Localització</span>
              <span class="text-xs font-bold text-[#022B3A]">{{ municipiCentre(item) }}</span>
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 md:border-l md:border-[#F1F4F9] md:pl-6">
            <span class="hidden md:block text-[9px] font-black text-[#B8C0CC] tracking-widest uppercase mr-2">REF-{{ codiCentre(item) }}</span>
            <button @click.stop="handleEdit(item.id)" class="p-2 text-[#B8C0CC] hover:text-[#1F7A8C] transition-all bg-white border border-transparent hover:border-[#BFDBF7] rounded-lg">
              <Edit3 :size="16" :strokeWidth="1.5" />
            </button>
            <button @click.stop="handleDelete(item.id)" class="p-2 bg-white border border-[#FFECEC] text-[#FF4D4D] rounded-lg shadow-sm hover:bg-[#FF4D4D] hover:text-white transition-all">
              <Trash2 :size="16" />
            </button>
          </div>
        </div>

        <!-- LIST VIEW - USUARIS -->
        <div 
          v-if="viewMode === 'list' && !mostrarCentres"
          class="bg-white rounded-xl border border-[#E1E5F2] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 hover:shadow-lg transition-all hover:border-[#BFDBF7] group"
        >
          <div class="flex items-center gap-4 flex-1 min-w-0">
            <div :class="['w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center font-black text-[9px] uppercase border tracking-widest', getRoleStyles(item.rol)]">
              {{ item.rol === 'ADMIN' ? 'AD' : item.rol === 'CENTRE' ? 'CE' : 'PR' }}
            </div>
            <div class="min-w-0">
              <h3 class="text-base font-black text-[#022B3A] truncate">{{ item.email }}</h3>
              <p class="text-[11px] font-medium text-[#8E9AAF] truncate">Centre: {{ nomCentreUsuari(item) }}</p>
            </div>
          </div>
          <div class="hidden lg:flex items-center gap-8 flex-shrink-0">
            <div class="flex flex-col items-end min-w-[100px]">
              <span class="text-[9px] font-black text-[#B8C0CC] uppercase tracking-widest">Últim Accés</span>
              <span class="text-xs font-bold text-[#022B3A]">{{ formatDate(item.ultim_acces) }}</span>
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 md:border-l md:border-[#F1F4F9] md:pl-6">
            <span class="hidden md:block text-[9px] font-black text-[#B8C0CC] tracking-widest uppercase mr-2">USR-{{ item.id }}</span>
            <button @click="handleEdit(item.id)" class="p-2 text-[#B8C0CC] hover:text-[#1F7A8C] transition-all bg-white border border-transparent hover:border-[#BFDBF7] rounded-lg">
              <Edit3 :size="16" :strokeWidth="1.5" />
            </button>
            <button v-if="(item.rol || '').toUpperCase() !== 'ADMIN'" @click="handleDelete(item.id)" class="p-2 bg-white border border-[#FFECEC] text-[#FF4D4D] rounded-lg shadow-sm hover:bg-[#FF4D4D] hover:text-white transition-all">
              <Trash2 :size="16" />
            </button>
          </div>
        </div>

        <!-- GRID VIEW - CENTRES -->
        <div 
          v-if="viewMode === 'grid' && mostrarCentres"
          @click="handleNavigation(item.id)"
          class="bg-white rounded-2xl border border-[#BFDBF7] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out group flex flex-col h-full overflow-hidden cursor-pointer relative"
        >
          <div class="p-6 flex justify-between items-start relative z-10">
            <span class="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.15em] border bg-white/40 text-[#022B3A] border-white/60">
              {{ codiCentre(item) }}
            </span>
            <div v-if="teTallers(item)" class="flex items-center gap-2 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/30">
              <div class="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              <span class="text-[9px] font-black text-blue-600 uppercase tracking-widest">{{ comptarTallers(item) }} tallers</span>
            </div>
          </div>
          <div class="px-6 pb-6 flex-1 relative z-10">
            <h3 class="text-xl font-black text-[#022B3A] mb-2 leading-tight group-hover:text-[#1F7A8C] transition-colors truncate">{{ item.nom_centre }}</h3>
            <p class="text-[#022B3A]/50 text-xs mb-6 font-medium truncate">{{ emailCentre(item) }}</p>
            <div class="space-y-3">
              <div class="flex items-center justify-between text-[11px] font-bold">
                <div class="flex items-center gap-2 text-[#022B3A]/40">
                  <MapPin :size="14" />
                  <span class="uppercase tracking-widest text-[8px]">Localització</span>
                </div>
                <span class="text-[#022B3A]/80">{{ municipiCentre(item) }}</span>
              </div>
            </div>
          </div>
          <div class="px-6 py-4 bg-[#E1E5F2]/10 border-t border-[#BFDBF7]/30 flex items-center justify-between mt-auto">
            <span class="text-[9px] font-black text-[#022B3A]/40 tracking-widest uppercase">REF-{{ codiCentre(item) }}</span>
            <div class="flex items-center gap-1.5">
              <button @click.stop="handleEdit(item.id)" class="p-2 text-[#022B3A]/30 hover:text-[#1F7A8C] hover:bg-white rounded-lg transition-all"><Edit3 :size="16" /></button>
              <button @click.stop="handleDelete(item.id)" class="p-2 text-red-400 hover:text-white hover:bg-red-500 rounded-lg transition-all"><Trash2 :size="16" /></button>
            </div>
          </div>
        </div>

        <!-- GRID VIEW - USUARIS -->
        <div 
          v-if="viewMode === 'grid' && !mostrarCentres"
          class="bg-white rounded-2xl border border-[#BFDBF7] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out group flex flex-col h-full overflow-hidden relative"
        >
          <div class="p-6 flex justify-between items-start relative z-10">
            <span :class="['px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.15em] border transition-all', getRoleStyles(item.rol)]">
              {{ item.rol }}
            </span>
          </div>
          <div class="px-6 pb-6 flex-1 relative z-10">
            <h3 class="text-xl font-black text-[#022B3A] mb-2 leading-tight group-hover:text-[#1F7A8C] transition-colors truncate">{{ item.email }}</h3>
            <p class="text-[#022B3A]/50 text-xs mb-6 font-medium truncate">Centre: {{ nomCentreUsuari(item) }}</p>
            <div class="space-y-3">
              <div class="flex items-center justify-between text-[11px] font-bold">
                <div class="flex items-center gap-2 text-[#022B3A]/40">
                  <Clock :size="14" />
                  <span class="uppercase tracking-widest text-[8px]">Últim Accés</span>
                </div>
                <span class="text-[#022B3A]/80">{{ formatDate(item.ultim_acces) }}</span>
              </div>
            </div>
          </div>
          <div class="px-6 py-4 bg-[#E1E5F2]/10 border-t border-[#BFDBF7]/30 flex items-center justify-between mt-auto">
            <span class="text-[9px] font-black text-[#022B3A]/40 tracking-widest uppercase">USR-{{ item.id }}</span>
            <div class="flex items-center gap-1.5">
              <button @click="handleEdit(item.id)" class="p-2 text-[#022B3A]/30 hover:text-[#1F7A8C] hover:bg-white rounded-lg transition-all"><Edit3 :size="16" /></button>
              <button v-if="(item.rol || '').toUpperCase() !== 'ADMIN'" @click="handleDelete(item.id)" class="p-2 text-red-400 hover:text-white hover:bg-red-500 rounded-lg transition-all"><Trash2 :size="16" /></button>
            </div>
          </div>
        </div>

      </template>

      <!-- Empty state -->
      <div v-if="filteredItems.length === 0" class="col-span-full text-center py-12 text-[#022B3A]/50 font-medium">
        No s'han trobat {{ mostrarCentres ? 'centres' : 'usuaris' }}
      </div>

      <!-- Add New Button (Only Grid View) -->
      <button 
        v-if="viewMode === 'grid'"
        @click="handleAddNew"
        class="group border-2 border-dashed border-[#BFDBF7]/60 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-[#022B3A]/20 hover:border-[#1F7A8C] hover:text-[#1F7A8C] hover:bg-white transition-all duration-300 min-h-[250px]"
      >
        <div class="w-10 h-10 rounded-lg border-2 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-all">
          <Plus :size="20" :strokeWidth="3" />
        </div>
        <p class="font-black text-xs uppercase tracking-widest">
          Afegir {{ mostrarCentres ? 'Centre' : 'Usuari' }}
        </p>
      </button>

    </div>

    <!-- Modal FormCrearCentre (només en pestanya Centres) -->
    <FormCrearCentre
      v-if="showFormCrearCentre && mostrarCentres"
      @close="showFormCrearCentre = false"
      @created="onCentreCreated"
    />

    <!-- Modal FormEditarCentre (només en pestanya Centres, al clicar lapis) -->
    <FormEditarCentre
      v-if="showFormEditarCentre && mostrarCentres && centreIdEditar"
      :centre-id="centreIdEditar"
      @close="showFormEditarCentre = false; centreIdEditar = null"
      @updated="onCentreUpdated"
    />

    <!-- Modal FormCrearUsuari (només en pestanya Usuaris, al clicar Afegir) -->
    <FormCrearUsuari
      v-if="showFormCrearUsuari && !mostrarCentres"
      :centres="centresList"
      @close="showFormCrearUsuari = false"
      @created="onUsuariCreated"
    />

    <!-- Modal FormEditarUsuari (només en pestanya Usuaris, al clicar lapis) -->
    <FormEditarUsuari
      v-if="showFormEditarUsuari && !mostrarCentres && usuariIdEditar"
      :user-id="usuariIdEditar"
      :centres="centresList"
      @close="showFormEditarUsuari = false; usuariIdEditar = null"
      @updated="onUsuariUpdated"
    />
  </div>
</template>

<script setup>
import { Search, LayoutGrid, List, Plus, MapPin, Clock, Edit3, Trash2 } from 'lucide-vue-next';

// ======================================
// Importacions i Composables (Rutes, Cookies, Stores)
// ======================================
const header = useHeaderStore();
header.setHeaderAdmin();

// ======================================
// Estat Reactiu i Refs (Variables i Formularis)
// ======================================
const mostrarCentres = ref(true);
const searchTerm = ref('');
const isExiting = ref(false);
const viewMode = ref('grid'); // 'grid' | 'list'
const showFormCrearCentre = ref(false);
const showFormCrearUsuari = ref(false);
const showFormEditarCentre = ref(false);
const showFormEditarUsuari = ref(false);
const centreIdEditar = ref(null);
const usuariIdEditar = ref(null);

const tokenRef = useCookie('authToken');

const respostaCentres = await useFetch('/api/admin/centres', {
  headers: tokenRef.value ? { Authorization: 'Bearer ' + tokenRef.value } : {}
});

const respostaUsuaris = await useFetch('/api/admin/usuaris', {
  headers: tokenRef.value ? { Authorization: 'Bearer ' + tokenRef.value } : {}
});

const centresList = computed(function () {
  let d = respostaCentres.data;
  if (!d || !d.value) return [];
  let arr = d.value;
  let resultat = [];
  for (let i = 0; i < arr.length; i++) {
    let c = arr[i];
    let ob = {};
    ob.id = c.id;
    ob.codi_centre = c.codi_centre;
    ob.nom_centre = c.nom_centre;
    ob.municipi = c.municipi;
    ob.email_oficial = c.email_oficial;
    if (c.tallers) {
      ob.tallers = c.tallers;
    } else {
      ob.tallers = [];
    }
    resultat.push(ob);
  }
  return resultat;
});

const usuarisList = computed(function () {
  let d = respostaUsuaris.data;
  if (!d || !d.value) return [];
  let arr = d.value;
  let resultat = [];
  for (let i = 0; i < arr.length; i++) {
    let u = arr[i];
    let ob = {};
    ob.id = u.id;
    ob.email = u.email;
    ob.rol = u.rol;
    ob.nom_centre = u.nom_centre;
    ob.ultim_acces = u.ultim_acces;
    resultat.push(ob);
  }
  return resultat;
});

const centresFiltrats = computed(function () {
  let q = searchTerm.value;
  if (q && q.toLowerCase) {
    q = q.toLowerCase().trim();
  } else {
    q = '';
  }
  let llista = centresList.value;
  let resultat = [];
  for (let i = 0; i < llista.length; i++) {
    let c = llista[i];
    let nom = c.nom_centre ? c.nom_centre.toLowerCase() : '';
    let codi = c.codi_centre ? c.codi_centre.toLowerCase() : '';
    if (nom.indexOf(q) >= 0 || codi.indexOf(q) >= 0) {
      resultat.push(c);
    }
  }
  return resultat;
});

const usuarisFiltrats = computed(function () {
  let q = searchTerm.value;
  if (q && q.toLowerCase) {
    q = q.toLowerCase().trim();
  } else {
    q = '';
  }
  let llista = usuarisList.value;
  let resultat = [];
  for (let i = 0; i < llista.length; i++) {
    let u = llista[i];
    let email = u.email ? u.email.toLowerCase() : '';
    if (email.indexOf(q) >= 0) {
      resultat.push(u);
    }
  }
  return resultat;
});

const filteredItems = computed(function () {
  if (mostrarCentres.value) return centresFiltrats.value;
  return usuarisFiltrats.value;
});

const centresFiltratsLength = computed(function () {
  return centresFiltrats.value.length;
});

const classePageExit = computed(function () {
  if (isExiting.value) {
    return 'page-exit';
  } else {
    return '';
  }
});

function classeTab(tipus) {
  const actiu = (tipus === 'centres' && mostrarCentres.value) || (tipus === 'usuaris' && !mostrarCentres.value);
  return [
    'px-5 py-2 rounded-lg text-[9px] font-black transition-all uppercase tracking-widest border',
    actiu ? 'bg-[#022B3A] text-white border-white/30 shadow-lg shadow-[#022B3A]/10' : 'text-[#022B3A]/30 border-transparent hover:text-[#022B3A] hover:bg-[#E1E5F2]/50'
  ].join(' ');
}

function classeBotoView(mode) {
  const actiu = viewMode.value === mode;
  return [
    'p-2 rounded-lg shadow-sm border transition-all',
    actiu ? 'text-[#1F7A8C] bg-white border-[#BFDBF7]/40 shadow-sm' : 'text-[#022B3A]/20 border-transparent hover:text-[#022B3A]'
  ].join(' ');
}

// ======================================
// Lògica i Funcions (Handlers i Lifecycle)
// ======================================

async function handleNavigation(id) {
  isExiting.value = true;
  await new Promise(function (resolve) {
    setTimeout(resolve, 100);
  });
  navigateTo('/admin/itemDetail/' + id);
}

function handleEdit(id) {
  if (mostrarCentres.value) {
    centreIdEditar.value = id;
    showFormEditarCentre.value = true;
  } else {
    usuariIdEditar.value = id;
    showFormEditarUsuari.value = true;
  }
}

async function handleDelete(id) {
  const isCentre = mostrarCentres.value;
  const txt = isCentre ? "Estàs segur que vols eliminar aquest centre?" : "Estàs segur que vols eliminar aquest usuari?";
  if (!confirm(txt)) return;

  const tok = tokenRef.value;

  try {
    if (isCentre) {
      await $fetch('/api/admin/centres/' + id, {
        method: 'DELETE',
        headers: tok ? { Authorization: 'Bearer ' + tok } : {}
      });
      await respostaCentres.refresh();
    } else {
      await $fetch('/api/admin/usuaris/' + id, {
        method: 'DELETE',
        headers: tok ? { Authorization: 'Bearer ' + tok } : {}
      });
      await respostaUsuaris.refresh();
    }
  } catch (e) {
    const msg = (e?.data?.message) || (e?.message) || 'Error en eliminar.';
    alert(msg);
  }
}

function handleAddNew() {
  if (mostrarCentres.value) {
    showFormCrearCentre.value = true;
  } else {
    showFormCrearUsuari.value = true;
  }
}

function onCentreCreated() {
  showFormCrearCentre.value = false;
  respostaCentres.refresh();
  respostaUsuaris.refresh();
}

function onCentreUpdated() {
  showFormEditarCentre.value = false;
  centreIdEditar.value = null;
  respostaCentres.refresh();
  respostaUsuaris.refresh();
}

function onUsuariCreated() {
  showFormCrearUsuari.value = false;
  respostaUsuaris.refresh();
}

function onUsuariUpdated() {
  showFormEditarUsuari.value = false;
  usuariIdEditar.value = null;
  respostaUsuaris.refresh();
}

function codiCentre(centre) {
  if (centre.codi_centre) {
    return centre.codi_centre;
  } else {
    return 'SENSE CODI';
  }
}

function teTallers(centre) {
  if (centre.tallers && centre.tallers.length > 0) {
    return true;
  } else {
    return false;
  }
}

function comptarTallers(centre) {
  if (centre.tallers) {
    return centre.tallers.length;
  } else {
    return 0;
  }
}

function municipiCentre(centre) {
  if (centre.municipi) {
    return centre.municipi;
  } else {
    return '—';
  }
}

function emailCentre(centre) {
  if (centre.email_oficial) {
    return centre.email_oficial;
  } else {
    return '—';
  }
}

function nomCentreUsuari(user) {
  if (user.nom_centre) {
    return user.nom_centre;
  } else {
    return '—';
  }
}

function ultimAcces(user) {
  if (user.ultim_acces) {
    return user.ultim_acces;
  } else {
    return 'Mai';
  }
}

function formatDate(dateString) {
  if (!dateString) return 'Mai';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Mai';
    return d.toLocaleDateString('ca-ES');
  } catch {
    return 'Mai';
  }
}

function getRoleStyles(role) {
  switch (role) {
    case 'ADMIN': return 'bg-[#fb6107]/10 backdrop-blur-xl text-[#fb6107] border-[#fb6107]/20 shadow-sm';
    case 'CENTRE': return 'bg-[#7cb518]/10 backdrop-blur-xl text-[#7cb518] border-[#7cb518]/20 shadow-sm';
    case 'PROFESSOR': return 'bg-[#fbb02d]/15 backdrop-blur-xl text-[#fbb02d] border-[#fbb02d]/30 shadow-sm';
    default: return 'bg-white/40 backdrop-blur-md text-[#022B3A] border-white/60 shadow-sm';
  }
}

function clauUsuari(user, idx) {
  if (user && user.id) {
    return user.id;
  } else {
    return 'user-' + String(idx);
  }
}
</script>

<style scoped>
.page-exit {
  opacity: 0.6;
  transform: scale(0.995);
  transition: opacity 0.2s ease, transform 0.2s ease;
}
</style>
