<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" :class="classePageExit">
    


    <!-- HEADER -->
    <div class="mb-8">
      <h1 class="text-4xl md:text-5xl font-black text-[#022B3A] tracking-tighter leading-none mb-3">
        Gestió d'<span class="text-[#1F7A8C]">Usuaris</span>
      </h1>
      <p class="text-[#022B3A]/40 text-[10px] font-black uppercase tracking-[0.2em]">
        Administració de centres educatius i usuaris del sistema.
      </p>
    </div>

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
      
      <template v-for="(item, idx) in paginatedItems" :key="mostrarCentres ? item.id : clauUsuari(item, idx)">
        
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

      <div class="mt-8 flex justify-center col-span-full">
        <Pagination :current-page="currentPage" :total-pages="totalPages" @go-to-page="goToPage" />
      </div>
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

    <!-- Modal Detall Centre (Pop-up de dades del centre) -->
    <ModalDetallCentre
      v-if="showModalDetall && idDetallForModal"
      :centre-id="idDetallForModal"
      @close="showModalDetall = false; idDetallForModal = null"
    />
  </div>
</template>

<script setup>
// ======================================
// Importem les dependències
// ======================================
import { Search, LayoutGrid, List, Plus, MapPin, Clock, Edit3, Trash2 } from 'lucide-vue-next';

// ======================================
// Configuració i Serveis
// ======================================

// 1. Configuració de la capçalera d'administrador
const headerStore = useHeaderStore();
headerStore.setHeaderAdmin();

// 2. Cookie d'autenticació
const tokenCookie = useCookie('authToken');
const tokenRef = tokenCookie.value;

// 3. Petició a l'API per obtenir centres (sense desestructuració)
const opcionsCapçalera = {};
if (tokenRef) {
  opcionsCapçalera.Authorization = 'Bearer ' + tokenRef;
}

const resultatCentres = await useFetch('/api/admin/centres', {
  headers: opcionsCapçalera
});

// 4. Petició a l'API per obtenir usuaris (sense desestructuració)
const resultatUsuaris = await useFetch('/api/admin/usuaris', {
  headers: opcionsCapçalera
});

// ======================================
// Estat Reactiu del Component
// ======================================

const mostrarCentres = ref(true);
const searchTerm = ref('');
const isExiting = ref(false);
const viewMode = ref('grid'); 
const currentPage = ref(1);
const itemsPerPage = 10;

// Estats per als modals de creació i edició
const showFormCrearCentre = ref(false);
const showFormCrearUsuari = ref(false);
const showFormEditarCentre = ref(false);
const showFormEditarUsuari = ref(false);
const centreIdEditar = ref(null);
const usuariIdEditar = ref(null);
const showModalDetall = ref(false);
const idDetallForModal = ref(null);

// ======================================
// Propietats Computades (Tractament de dades)
// ======================================

// 1. Llista base de centres processada
const centresList = computed(function () {
  let llistaOriginal = [];
  if (resultatCentres.data) {
    if (resultatCentres.data.value) {
      llistaOriginal = resultatCentres.data.value;
    }
  }
  
  const resultat = [];
  for (let i = 0; i < llistaOriginal.length; i++) {
    const c = llistaOriginal[i];
    const ob = {
      id: c.id,
      codi_centre: c.codi_centre,
      nom_centre: c.nom_centre,
      municipi: c.municipi,
      email_oficial: c.email_oficial,
      tallers: []
    };
    if (c.tallers) {
      ob.tallers = c.tallers;
    }
    resultat.push(ob);
  }
  return resultat;
});

// 2. Llista base d'usuaris processada
const usuarisList = computed(function () {
  let llistaOriginalUsuaris = [];
  if (resultatUsuaris.data) {
    if (resultatUsuaris.data.value) {
      llistaOriginalUsuaris = resultatUsuaris.data.value;
    }
  }
  
  const resultatU = [];
  for (let j = 0; j < llistaOriginalUsuaris.length; j++) {
    const u = llistaOriginalUsuaris[j];
    const obU = {
      id: u.id,
      email: u.email,
      rol: u.rol,
      nom_centre: u.nom_centre,
      ultim_acces: u.ultim_acces
    };
    resultatU.push(obU);
  }
  return resultatU;
});

// 3. Filtre de centres segons cerca (Bucle for)
const centresFiltrats = computed(function () {
  const query = searchTerm.value;
  let tNeta = '';
  if (query) {
    tNeta = query.toLowerCase().trim();
  }
  
  const llistaC = centresList.value;
  const resultatC = [];
  
  for (let k = 0; k < llistaC.length; k++) {
    const ct = llistaC[k];
    let nom = '';
    if (ct.nom_centre) { nom = ct.nom_centre.toLowerCase(); }
    
    let codi = '';
    if (ct.codi_centre) { codi = ct.codi_centre.toLowerCase(); }
    
    let coincideixC = false;
    if (tNeta === '') {
      coincideixC = true;
    } else {
      if (nom.indexOf(tNeta) !== -1) {
        coincideixC = true;
      } else if (codi.indexOf(tNeta) !== -1) {
        coincideixC = true;
      }
    }
    
    if (coincideixC === true) {
      resultatC.push(ct);
    }
  }
  return resultatC;
});

// 4. Filtre d'usuaris segons cerca (Bucle for)
const usuarisFiltrats = computed(function () {
  const queryU = searchTerm.value;
  let tNetaU = '';
  if (queryU) {
    tNetaU = queryU.toLowerCase().trim();
  }
  
  const llistaU = usuarisList.value;
  const resultatU = [];
  
  for (let m = 0; m < llistaU.length; m++) {
    const us = llistaU[m];
    let email = '';
    if (us.email) { email = us.email.toLowerCase(); }
    
    let coincideixU = false;
    if (tNetaU === '') {
      coincideixU = true;
    } else {
      if (email.indexOf(tNetaU) !== -1) {
        coincideixU = true;
      }
    }
    
    if (coincideixU === true) {
      resultatU.push(us);
    }
  }
  return resultatU;
});

// 5. Llista final d'ítems segons la pestanya activa
const filteredItems = computed(function () {
  if (mostrarCentres.value === true) {
    return centresFiltrats.value;
  } else {
    return usuarisFiltrats.value;
  }
});

// 6. Càlcul del total de pàgines
const totalPages = computed(function () {
  const llistaFinal = filteredItems.value;
  const total = llistaFinal.length;
  let pagines = 1;
  if (total > 0) {
    pagines = Math.ceil(total / itemsPerPage);
  }
  return pagines;
});

// 7. Ítems de la pàgina actual (Sense .slice)
const paginatedItems = computed(function () {
  const llistaF = filteredItems.value;
  const inici = (currentPage.value - 1) * itemsPerPage;
  const fi = inici + itemsPerPage;
  
  const llistaPaginada = [];
  for (let x = 0; x < llistaF.length; x++) {
    if (x >= inici) {
      if (x < fi) {
        llistaPaginada.push(llistaF[x]);
      }
    }
  }
  return llistaPaginada;
});

// 8. Classe per a l'animació de sortida
const classePageExit = computed(function () {
  if (isExiting.value === true) {
    return 'page-exit';
  }
  return '';
});

// ======================================
// Vigilants (Watchers)
// ======================================

// 1. Reiniciem a la pàgina 1 si canvia el filtre o la cerca
watch([searchTerm, mostrarCentres], function () {
  currentPage.value = 1;
});

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Gestió d'estils i classes visuals ---

function classeTab(tabActiu) {
  let esAquestaTaba = false;
  if (tabActiu === 'centres') {
    if (mostrarCentres.value === true) {
      esAquestaTaba = true;
    }
  } else if (tabActiu === 'usuaris') {
    if (mostrarCentres.value === false) {
      esAquestaTaba = true;
    }
  }
  
  let classes = 'px-5 py-2 rounded-lg text-[9px] font-black transition-all uppercase tracking-widest border ';
  if (esAquestaTaba === true) {
    classes = classes + 'bg-[#022B3A] text-white border-white/30 shadow-lg shadow-[#022B3A]/10';
  } else {
    classes = classes + 'text-[#022B3A]/30 border-transparent hover:text-[#022B3A] hover:bg-[#E1E5F2]/50';
  }
  return classes;
}

function classeBotoView(modeRef) {
  let esActiu = false;
  if (viewMode.value === modeRef) {
    esActiu = true;
  }
  
  let clasesBoto = 'p-2 rounded-lg shadow-sm border transition-all ';
  if (esActiu === true) {
    clasesBoto = clasesBoto + 'text-[#1F7A8C] bg-white border-[#BFDBF7]/40 shadow-sm';
  } else {
    clasesBoto = clasesBoto + 'text-[#022B3A]/20 border border-transparent hover:text-[#022B3A]';
  }
  return clasesBoto;
}

function getRoleStyles(rol) {
  if (rol === 'ADMIN') { return 'bg-[#fb6107]/10 backdrop-blur-xl text-[#fb6107] border-[#fb6107]/20 shadow-sm'; }
  if (rol === 'CENTRE') { return 'bg-[#7cb518]/10 backdrop-blur-xl text-[#7cb518] border-[#7cb518]/20 shadow-sm'; }
  if (rol === 'PROFESSOR') { return 'bg-[#fbb02d]/15 backdrop-blur-xl text-[#fbb02d] border-[#fbb02d]/30 shadow-sm'; }
  return 'bg-white/40 backdrop-blur-md text-[#022B3A] border-white/60 shadow-sm';
}

// B) --- Helpers de dades per al template ---

function codiCentre(centreDada) {
  if (centreDada.codi_centre) {
    return centreDada.codi_centre;
  }
  return 'SENSE CODI';
}

function teTallers(centreO) {
  if (centreO.tallers) {
    if (centreO.tallers.length > 0) {
      return true;
    }
  }
  return false;
}

function comptarTallers(centreI) {
  if (centreI.tallers) {
    return centreI.tallers.length;
  }
  return 0;
}

function municipiCentre(cInput) {
  if (cInput.municipi) {
    return cInput.municipi;
  }
  return '—';
}

function emailCentre(ceInput) {
  if (ceInput.email_oficial) {
    return ceInput.email_oficial;
  }
  return '—';
}

function nomCentreUsuari(uInput) {
  if (uInput.nom_centre) {
    return uInput.nom_centre;
  }
  return '—';
}

function formatDate(dataStr) {
  if (!dataStr) {
    return 'Mai';
  }
  const dObject = new Date(dataStr);
  if (isNaN(dObject.getTime())) {
    return 'Mai';
  }
  return dObject.toLocaleDateString('ca-ES');
}

function clauUsuari(usuari, index) {
  if (usuari.id) {
    return usuari.id;
  }
  return 'usuari-index-' + String(index);
}

// C) --- Gestió d'accions (Navegació, Edició, Eliminació) ---

async function handleNavigation(idC) {
  idDetallForModal.value = idC;
  showModalDetall.value = true;
}

function handleEdit(id) {
  if (mostrarCentres.value === true) {
    centreIdEditar.value = id;
    showFormEditarCentre.value = true;
  } else {
    usuariIdEditar.value = id;
    showFormEditarUsuari.value = true;
  }
}

async function handleDelete(id) {
  const ésCentre = mostrarCentres.value;
  let textPregunta = "Estàs segur que vols eliminar aquest usuari?";
  if (ésCentre === true) {
    textPregunta = "Estàs segur que vols eliminar aquest centre?";
  }

  const swalAsk = useSwal();
  const resConfirm = await swalAsk.fire({ 
    title: 'Confirmar', 
    text: textPregunta, 
    icon: 'question', 
    showCancelButton: true, 
    confirmButtonText: 'Sí' 
  });
  
  if (resConfirm.isConfirmed === false) {
    return;
  }

  try {
    const headersDel = {};
    if (tokenRef) {
      headersDel.Authorization = 'Bearer ' + tokenRef;
    }

    if (ésCentre === true) {
      await $fetch('/api/admin/centres/' + id, {
        method: 'DELETE',
        headers: headersDel
      });
      swalAsk.fire({ title: 'Fet', text: 'Centre eliminat correctament.', icon: 'success' });
      resultatCentres.refresh();
    } else {
      await $fetch('/api/admin/usuaris/' + id, {
        method: 'DELETE',
        headers: headersDel
      });
      swalAsk.fire({ title: 'Fet', text: 'Usuari eliminat correctament.', icon: 'success' });
      resultatUsuaris.refresh();
    }
  } catch (errDel) {
    let msgErrorDel = 'Error en l\'eliminació.';
    if (errDel.data) {
      if (errDel.data.message) {
        msgErrorDel = errDel.data.message;
      }
    }
    swalAsk.fire({ title: 'Error', text: msgErrorDel, icon: 'error' });
  }
}

function handleAddNew() {
  if (mostrarCentres.value === true) {
    showFormCrearCentre.value = true;
  } else {
    showFormCrearUsuari.value = true;
  }
}

function onCentreCreated() {
  showFormCrearCentre.value = false;
  resultatCentres.refresh();
  resultatUsuaris.refresh();
}

function onCentreUpdated() {
  showFormEditarCentre.value = false;
  centreIdEditar.value = null;
  resultatCentres.refresh();
  resultatUsuaris.refresh();
}

function onUsuariCreated() {
  showFormCrearUsuari.value = false;
  resultatUsuaris.refresh();
}

function onUsuariUpdated() {
  showFormEditarUsuari.value = false;
  usuariIdEditar.value = null;
  resultatUsuaris.refresh();
}

function goToPage(p) {
  const maxP = totalPages.value;
  if (p >= 1) {
    if (p <= maxP) {
      currentPage.value = p;
    }
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
