<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col min-h-[calc(100vh-200px)]">

    <div class="mb-8">
      <h1 class="text-4xl md:text-5xl font-black text-[#022B3A] tracking-tighter leading-none mb-3">
        Gestió de <span class="text-[#1F7A8C]">Peticions</span>
      </h1>
      <p class="text-[#022B3A]/40 text-[10px] font-black uppercase tracking-[0.2em]">
        Supervisió i assignació de tallers sol·licitats pels centres.
      </p>
    </div>



    <div class="bg-white p-2 rounded-lg border border-[#BFDBF7]/60 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
      
      <div class="flex flex-1 items-center bg-[#E1E5F2]/10 rounded-md border border-[#BFDBF7]/20 p-1 w-full max-w-3xl">
        <div class="relative flex-1 group">
          <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
          <input 
            type="text" 
            placeholder="Cerca per títol, centre o projecte..."
            v-model="searchQuery"
            class="w-full bg-transparent border-none rounded-md pl-10 pr-4 py-2 text-[11px] font-bold focus:ring-0 outline-none transition-all placeholder:text-[#022B3A]/20 text-[#022B3A]"
          />
        </div>

        <div class="flex items-center gap-1 border-l border-[#BFDBF7]/30 pl-2 pr-1">
          <button 
            @click="filterStatus = 'all'"
            :class="[
              'px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-[0.1em] transition-all duration-300 flex items-center gap-1.5',
              filterStatus === 'all' ? 'bg-[#022B3A] text-white shadow-sm' : 'text-[#022B3A]/40 hover:bg-[#022B3A]/5 hover:text-[#022B3A]'
            ]"
          >
            Totes
          </button>
          
          <button 
            @click="filterStatus = 'PENDENT'"
            :class="[
              'px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-[0.1em] transition-all duration-300 flex items-center gap-1.5',
              filterStatus === 'PENDENT' ? 'bg-[#022B3A] text-white shadow-sm' : 'text-[#022B3A]/40 hover:bg-[#022B3A]/5 hover:text-[#022B3A]'
            ]"
          >
            Pendents
          </button>

          <button 
            @click="filterStatus = 'ASSIGNADA'"
            :class="[
              'px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-[0.1em] transition-all duration-300 flex items-center gap-1.5',
              filterStatus === 'ASSIGNADA' ? 'bg-[#022B3A] text-white shadow-sm' : 'text-[#022B3A]/40 hover:bg-[#022B3A]/5 hover:text-[#022B3A]'
            ]"
          >
            Assignades
          </button>

          <button 
            @click="filterStatus = 'REBUTJADA'"
            :class="[
              'px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-[0.1em] transition-all duration-300 flex items-center gap-1.5',
              filterStatus === 'REBUTJADA' ? 'bg-[#022B3A] text-white shadow-sm' : 'text-[#022B3A]/40 hover:bg-[#022B3A]/5 hover:text-[#022B3A]'
            ]"
          >
            Rebutjades
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2 bg-[#E1E5F2]/30 p-1 rounded-md border border-[#BFDBF7]/20 w-full lg:w-auto justify-center">
        <div class="flex items-center gap-1">
          <button 
            @click="viewMode = 'grid'"
            :class="['p-2 rounded-md transition-all', viewMode === 'grid' ? 'text-[#1F7A8C] bg-white border border-[#BFDBF7]/40 shadow-sm' : 'text-[#022B3A]/20 border border-transparent hover:text-[#022B3A]']"
          >
            <LayoutGrid :size="14" />
          </button>
          <button 
            @click="viewMode = 'list'"
            :class="['p-2 rounded-md transition-all', viewMode === 'list' ? 'text-[#1F7A8C] bg-white border border-[#BFDBF7]/40 shadow-sm' : 'text-[#022B3A]/20 border border-transparent hover:text-[#022B3A]']"
          >
            <List :size="14" />
          </button>
        </div>
      </div>
    </div>

    <div class="flex justify-end -mt-4">
      <button 
        @click="executeAutoAssignment"
        :disabled="autoAssignLoading"
        class="flex items-center gap-2 px-6 py-3 bg-[#022B3A] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#1F7A8C] transition-all shadow-lg shadow-[#022B3A]/20 group disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Sparkles :size="16" class="text-[#fbb02d] group-hover:text-white transition-colors" />
        <span v-if="autoAssignLoading">Processant...</span>
        <span v-else>Assignar automàticament</span>
      </button>
    </div>

    <div v-if="mostraLoading" class="flex-1 flex flex-col items-center justify-center py-20">
      <div class="w-10 h-10 border-4 border-[#E1E5F2] border-t-[#1F7A8C] rounded-full animate-spin mb-4"></div>
      <p class="text-[#022B3A]/60 text-sm font-bold">Carregant peticions...</p>
    </div>

    <div v-else-if="errorFetch" class="flex-1 flex flex-col items-center justify-center py-20">
      <span class="text-4xl mb-4">⚠️</span>
      <p class="text-red-600 font-bold">Error carregant les peticions: {{ textError }}</p>
    </div>

    <div v-else class="flex-1">
      <div v-if="!hiHaDetalls" class="text-center py-20 text-[#022B3A]/50 font-medium">
        No hi ha detalls de peticions de tallers enregistrats.
      </div>

      <div v-else-if="filteredRequests.length === 0" class="text-center py-20 text-[#022B3A]/50 font-medium">
        No hi ha resultats per aquest estat o cerca.
      </div>

      <div v-else :class="viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-3'">
        
        <template v-for="req in currentRequests" :key="clauDetall(req)">
          
          <div 
            v-if="viewMode === 'list'"
            class="bg-white rounded-xl border border-[#E1E5F2] overflow-hidden flex flex-col md:flex-row md:items-center justify-between hover:shadow-lg transition-all hover:border-[#BFDBF7] group"
          >
            <div :class="['w-14 md:w-16 flex-shrink-0 flex items-center justify-center border-r py-6 md:py-0 self-stretch transition-all duration-300', getPriorityStyles(req.prioritat || 5)]">
              <span class="text-3xl font-black leading-none tracking-tighter">{{ req.prioritat ?? '—' }}</span>
            </div>

            <div class="flex items-center gap-4 flex-1 min-w-0 p-4">
              <div :class="['w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center font-black text-xs border tracking-widest transition-colors', getModalitatStyles(req.modalitat)]">
                {{ req.modalitat || '—' }}
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-black text-[#022B3A] truncate">{{ req.titol }}</h3>
                  <Star v-if="req.es_preferencia_referent" :size="12" class="text-[#fbb02d] fill-[#fbb02d]" />
                </div>
                <div class="flex items-center gap-2 mt-0.5">
                  <Building2 :size="12" class="text-[#022B3A]/20" />
                  <p class="text-[11px] font-medium text-[#8E9AAF] truncate">{{ req.nom_centre }}</p>
                </div>
                <div class="mt-2 lg:hidden">
                   <span :class="['px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border', getEstatStyles(req.estat)]">
                    {{ textEstat(req) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="hidden lg:flex items-center gap-8 flex-shrink-0 px-4">
              <div class="flex flex-col items-end min-w-[100px]">
                <span class="text-[9px] font-black text-[#B8C0CC] uppercase tracking-widest">Estat</span>
                <span :class="['text-[10px] font-black uppercase', getEstatTextColor(req.estat)]">{{ textEstat(req) }}</span>
              </div>
              <div class="flex flex-col items-end min-w-[80px]">
                <span class="text-[9px] font-black text-[#B8C0CC] uppercase tracking-widest">Data</span>
                <span class="text-xs font-bold text-[#022B3A]">{{ formatDate(req.data_creacio) }}</span>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 md:border-l md:border-[#F1F4F9] p-4 md:pl-6">
              <div v-if="esPendent(req)" class="flex gap-2">
                <button @click="handleApprove(req)" :disabled="actionLoading" class="p-2.5 bg-[#F0F7E9] text-[#7CB518] border border-[#7CB518]/20 rounded-lg hover:bg-[#7CB518] hover:text-white transition-all shadow-sm disabled:opacity-50">
                  <Check :size="16" :strokeWidth="2.5" />
                </button>
                <button @click="handleReject(req)" :disabled="actionLoading" class="p-2.5 bg-red-50 text-red-500 border border-red-200 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm disabled:opacity-50">
                  <X :size="16" :strokeWidth="2.5" />
                </button>
              </div>
              <span v-else class="text-[#94A3B8] text-sm italic">{{ textEstat(req) }}</span>
            </div>
          </div>

          <div 
            v-else
            class="bg-white rounded-2xl border border-[#BFDBF7] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out group flex flex-col h-full overflow-hidden relative"
          >
            <div :class="['absolute top-0 left-0 w-12 h-12 rounded-br-2xl border-b border-r flex items-center justify-center z-10 transition-all duration-300', getPriorityStyles(req.prioritat || 5)]">
              <span class="text-2xl font-black leading-none tracking-tighter">{{ req.prioritat ?? '—' }}</span>
            </div>

            <div class="p-6 pt-16 pb-4 flex justify-between items-center">
              <span :class="['px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.15em] border transition-colors', getModalitatStyles(req.modalitat)]">
                {{ req.modalitat || '—' }}
              </span>
              <span :class="['px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border', getEstatStyles(req.estat)]">
                {{ textEstat(req) }}
              </span>
            </div>

            <div class="px-6 pb-6 flex-1">
              <h3 class="text-xl font-black text-[#022B3A] mb-1 leading-tight group-hover:text-[#1F7A8C] transition-colors">
                {{ req.titol }}
              </h3>
              <div class="flex items-center gap-2 mb-4">
                <div class="w-1.5 h-1.5 bg-[#1F7A8C] rounded-full"></div>
                <p class="text-[10px] font-black text-[#022B3A]/40 uppercase tracking-widest">{{ req.num_participants ?? 0 }} Participants</p>
              </div>

              <div class="w-full h-px bg-[#F1F4F9] mb-6"></div>

              <div class="space-y-4 px-1">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3 text-[#022B3A]/30">
                    <Building2 :size="16" :strokeWidth="1.5" />
                    <span class="text-[9px] font-black uppercase tracking-[0.15em]">Centre</span>
                  </div>
                  <span class="text-[12px] font-black text-[#022B3A] text-right">{{ req.nom_centre }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3 text-[#022B3A]/30">
                    <Calendar :size="16" :strokeWidth="1.5" />
                    <span class="text-[9px] font-black uppercase tracking-[0.15em]">Trimestre</span>
                  </div>
                  <span class="text-[12px] font-black text-[#022B3A]">{{ req.trimestre || '—' }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3 text-[#022B3A]/30">
                    <Star :size="16" :strokeWidth="1.5" :class="req.es_preferencia_referent ? 'text-[#fbb02d] fill-[#fbb02d]' : ''" />
                    <span class="text-[9px] font-black uppercase tracking-[0.15em]">Referent</span>
                  </div>
                  <span :class="['text-[12px] font-black', req.es_preferencia_referent ? 'text-[#7CB518]' : 'text-[#022B3A]']">
                    {{ req.es_preferencia_referent ? 'Sí' : 'No' }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3 text-[#022B3A]/30">
                    <Clock :size="16" :strokeWidth="1.5" />
                    <span class="text-[9px] font-black uppercase tracking-[0.15em]">Sol·licitud</span>
                  </div>
                  <span class="text-[12px] font-black text-[#022B3A]">{{ formatDate(req.data_creacio) }}</span>
                </div>
              </div>
            </div>

            <div v-if="esPendent(req)" class="px-6 py-4 bg-[#E1E5F2]/5 border-t border-[#BFDBF7]/30 flex items-center gap-4">
              <button @click="handleApprove(req)" :disabled="actionLoading" class="flex-1 flex items-center justify-center py-3 bg-[#F0F7E9]/80 text-[#7CB518] border border-[#7CB518]/20 rounded-xl hover:bg-[#7CB518] hover:text-white transition-all shadow-sm active:scale-95 group disabled:opacity-50">
                <Check :size="20" :strokeWidth="2.5" class="group-hover:scale-110 transition-transform" />
              </button>
              <button @click="handleReject(req)" :disabled="actionLoading" class="flex-1 flex items-center justify-center py-3 bg-red-50/80 text-red-500 border border-red-200 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95 group disabled:opacity-50">
                <X :size="20" :strokeWidth="2.5" class="group-hover:scale-110 transition-transform" />
              </button>
            </div>
            <div v-else class="px-6 py-4 bg-[#E1E5F2]/5 border-t border-[#BFDBF7]/30 flex items-center justify-center">
              <span :class="['text-xs font-black uppercase tracking-widest', getEstatTextColor(req.estat)]">{{ textEstat(req) }}</span>
            </div>
          </div>
          
        </template>
      </div>
    </div>

    <div class="mt-8 flex justify-center">
      <Pagination :current-page="currentPage" :total-pages="totalPages" @go-to-page="goToPage" />
    </div>

    <div class="p-8 bg-white/50 rounded-2xl border border-dashed border-[#BFDBF7] flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
      <div class="flex items-center gap-3 text-[#022B3A]/40 text-[10px] font-bold italic uppercase tracking-widest">
        <Info :size="16" />
        Escala de color progressiva: Verds (prioritat inicial) fins a Vermells (prioritat crítica 10).
      </div>
      <div class="flex items-center gap-4">
        <span v-if="totalPages > 1" class="text-[9px] font-bold text-[#022B3A]/30 uppercase tracking-widest">
          Pàgina {{ currentPage }} de {{ totalPages }}
        </span>
        <div class="flex items-center gap-2">
          <span class="text-[9px] font-black text-[#022B3A]/30 uppercase tracking-widest">Detalls visibles:</span>
          <span class="px-3 py-1 bg-[#1F7A8C] text-white rounded-lg font-black text-xs shadow-sm">{{ filteredRequests.length }}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
// ======================================
// Importem les dependències
// ======================================
import { Search, LayoutGrid, List, Check, X, Calendar, Building2, Clock, Info, Star, Sparkles } from 'lucide-vue-next';

// ======================================
// Configuració i Serveis
// ======================================

// 1. Configurem la capçalera d'administrador
const headerStore = useHeaderStore();
headerStore.setHeaderAdmin();

// 2. Autenticació
const tokenCookie = useCookie('authToken');
const tokenRef = tokenCookie.value;

// ======================================
// Estat Reactiu del Component
// ======================================

const detallsPeticions = ref([]);
const pending = ref(true);
const error = ref(null);

const actionLoading = ref(false);
const autoAssignLoading = ref(false);

const searchQuery = ref('');
const filterStatus = ref('PENDENT'); 
const viewMode = ref('grid');
const currentPage = ref(1);
const itemsPerPage = 10;

// ======================================
// Propietats Computades
// ======================================

// 1. Estat de càrrega visual
const mostraLoading = computed(function () {
  const isPending = pending.value;
  const listLen = detallsPeticions.value.length;
  let charging = false;
  if (isPending === true) {
    if (listLen === 0) {
      charging = true;
    }
  }
  return charging;
});

// 2. Estat d'error de la petició
const errorFetch = computed(function () {
  let hiHaError = false;
  if (error.value !== null) {
    hiHaError = true;
  }
  return hiHaError;
});

// 3. Missatge d'error textual
const textError = computed(function () {
  let msg = '';
  const errObj = error.value;
  if (errObj) {
    if (errObj.message) {
      msg = errObj.message;
    }
  }
  return msg;
});

// 4. Comprovació de si hi ha dades originals
const hiHaDetalls = computed(function () {
  const llista = detallsPeticions.value;
  let existeixen = false;
  if (llista) {
    if (llista.length > 0) {
      existeixen = true;
    }
  }
  return existeixen;
});

// 5. Filtre de dades combinat (Cerca + Estat) - Sense .filter()
const filteredRequests = computed(function () {
  const query = searchQuery.value;
  let textBusca = '';
  if (query) { textBusca = query.toLowerCase().trim(); }
  
  const estatFiltre = filterStatus.value;
  const llistaDades = detallsPeticions.value;
  
  const resultatFiltrat = [];
  
  // A) --- Aplicació dels filtres amb bucle for ---
  for (let i = 0; i < llistaDades.length; i++) {
    const d = llistaDades[i];
    
    // Filtre d'estat
    let estatDada = d.estat;
    if (!estatDada) { estatDada = 'PENDENT'; }
    
    let passaFiltreEstat = false;
    if (estatFiltre === 'all') {
      passaFiltreEstat = true;
    } else if (estatDada === estatFiltre) {
      passaFiltreEstat = true;
    }
    
    if (passaFiltreEstat === true) {
      // Filtre de cerca
      let passaCerca = false;
      if (textBusca === '') {
        passaCerca = true;
      } else {
        let t = '';
        if (d.titol) { t = d.titol.toLowerCase(); }
        
        let c = '';
        if (d.nom_centre) { c = d.nom_centre.toLowerCase(); }
        
        if (t.indexOf(textBusca) !== -1) {
          passaCerca = true;
        } else if (c.indexOf(textBusca) !== -1) {
          passaCerca = true;
        }
      }
      
      if (passaCerca === true) {
        resultatFiltrat.push(d);
      }
    }
  }

  // B) --- Ordenació manual per prioritat (Bubble Sort simple) ---
  const n = resultatFiltrat.length;
  for (let x = 0; x < n - 1; x++) {
    for (let y = 0; y < n - x - 1; y++) {
      const p1 = resultatFiltrat[y].prioritat || 0;
      const p2 = resultatFiltrat[y+1].prioritat || 0;
      if (p1 > p2) {
        let temp = resultatFiltrat[y];
        resultatFiltrat[y] = resultatFiltrat[y+1];
        resultatFiltrat[y+1] = temp;
      }
    }
  }
  
  return resultatFiltrat;
});

// 6. Càlcul de pàgines totals
const totalPages = computed(function () {
  const totalItems = filteredRequests.value.length;
  let pagines = 1;
  if (totalItems > 0) {
    pagines = Math.ceil(totalItems / itemsPerPage);
  }
  return pagines;
});

// 7. Peticions de la pàgina actual (Sense .slice)
const currentRequests = computed(function () {
  const llistaCompleta = filteredRequests.value;
  const inici = (currentPage.value - 1) * itemsPerPage;
  const fi = inici + itemsPerPage;
  
  const llistaPagina = [];
  for (let k = 0; k < llistaCompleta.length; k++) {
    if (k >= inici) {
      if (k < fi) {
        llistaPagina.push(llistaCompleta[k]);
      }
    }
  }
  return llistaPagina;
});

// ======================================
// Vigilants (Watchers)
// ======================================

// 1. Reiniciar a la pàgina 1 si canvien filtres o cerca
watch([searchQuery, filterStatus], function () {
  currentPage.value = 1;
});

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Gestió d'estils visuals ---

function getModalitatStyles(modalitat) {
  return 'bg-[#E1E5F2]/40 text-[#022B3A]/50 border-[#BFDBF7]/40';
}

function getPriorityStyles(priority) {
  const p = Number(priority) || 5;
  if (p <= 2) { return 'bg-[#F0F7E9] text-[#7CB518] border-[#7CB518]/30'; }
  if (p <= 4) { return 'bg-[#FFF9EA] text-[#D4C51F] border-[#D4C51F]/30'; }
  if (p <= 6) { return 'bg-[#FFF4E0] text-[#FBB02D] border-[#FBB02D]/30'; }
  if (p <= 8) { return 'bg-[#FFECE2] text-[#FB6107] border-[#FB6107]/30'; }
  return 'bg-[#FFECEC] text-[#FF4D4D] border-[#FF4D4D]/30';
}

function getEstatStyles(estat) {
  const e = String(estat || 'PENDENT').toUpperCase();
  if (e === 'ASSIGNADA') { return 'bg-[#dcfce7]/80 text-[#15803d] border-[#22c55e]/30'; }
  if (e === 'REBUTJADA') { return 'bg-[#fee2e2]/80 text-[#b91c1c] border-[#ef4444]/30'; }
  return 'bg-[#fef3c7]/80 text-[#92400e] border-[#f59e0b]/30';
}

function getEstatTextColor(estat) {
  const e = String(estat || 'PENDENT').toUpperCase();
  if (e === 'ASSIGNADA') { return 'text-[#15803d]'; }
  if (e === 'REBUTJADA') { return 'text-[#b91c1c]'; }
  return 'text-[#92400e]';
}

// B) --- Gestió d'estat i format ---

function textEstat(detall) {
  let val = detall.estat;
  if (!val) { val = 'PENDENT'; }
  return val;
}

function esPendent(detall) {
  const e = String(detall.estat || 'PENDENT').toUpperCase();
  let pendentStatus = false;
  if (e === 'PENDENT') {
    pendentStatus = true;
  }
  return pendentStatus;
}

function formatDate(dateStr) {
  if (!dateStr) { return '—'; }
  const dataObj = new Date(dateStr);
  const opcions = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return dataObj.toLocaleDateString('ca-ES', opcions);
}

function clauDetall(detall) {
  const pId = String(detall.peticio_id);
  const tId = String(detall.taller_id);
  return pId + '-' + tId;
}

// C) --- Crides a l'API i accions ---

async function fetchPeticions() {
  pending.value = true;
  error.value = null;
  try {
    const headersPeticio = {};
    if (tokenRef) {
      headersPeticio.Authorization = 'Bearer ' + tokenRef;
    }

    const dadesAPI = await $fetch('/api/admin/peticions', { 
       headers: headersPeticio 
    });
    
    const llistaFinal = [];
    // Aplanem les peticions amb els seus detalls (sense .map ni .flatMap)
    for (let i = 0; i < dadesAPI.length; i++) {
        const peticio = dadesAPI[i];
        let d = peticio.detalls;
        if (!d) { d = []; }
        
        for (let j = 0; j < d.length; j++) {
            const item = d[j];
            const objecteRefet = {
              peticio_id: peticio.id,
              nom_centre: peticio.nom_centre,
              data_creacio: peticio.data_creacio,
              id: item.id,
              taller_id: item.taller_id,
              modalitat: item.modalitat,
              titol: item.titol,
              descripcio: item.descripcio,
              trimestre: item.trimestre,
              num_participants: item.num_participants,
              prioritat: item.prioritat,
              estat: item.estat,
              es_preferencia_referent: item.es_preferencia_referent,
              docent_nom: item.docent_nom,
              docent_email: item.docent_email
            };
            llistaFinal.push(objecteRefet);
        }
    }
    detallsPeticions.value = llistaFinal;
    
  } catch (errPeticio) {
    console.error('Error carregant peticions:', errPeticio);
    error.value = errPeticio;
  } finally {
    pending.value = false;
  }
}

async function updateTallerStatus(peticioId, tallerId, nouEstat) {
  const swal = useSwal();
  let missatgeConfirm = 'Vols REBUTJAR aquesta sol·licitud?';
  if (nouEstat === 'ASSIGNADA') {
    missatgeConfirm = 'Vols marcar aquest taller com a ASSIGNAT?';
  }

  const confirmResultArr = await swal.fire({ 
    title: 'Confirmar', 
    text: missatgeConfirm, 
    icon: 'question', 
    showCancelButton: true, 
    confirmButtonText: 'Sí' 
  });
  
  if (confirmResultArr.isConfirmed === false) {
    return;
  }

  actionLoading.value = true;
  try {
    const headersUpdate = {};
    if (tokenRef) {
      headersUpdate.Authorization = 'Bearer ' + tokenRef;
    }

    await $fetch('/api/admin/peticions/' + String(peticioId) + '/tallers/' + String(tallerId) + '/estat', {
      method: 'PUT',
      headers: headersUpdate,
      body: { estat: nouEstat }
    });
    
    swal.fire({ title: 'Fet', text: 'Estat actualitzat correctament.', icon: 'success' });
    await fetchPeticions();
    
  } catch (errUpd) {
    console.error('Error actualitzant estat:', errUpd);
    swal.fire({ title: 'Error', text: "No s'ha pogut actualitzar l'estat.", icon: 'error' });
  } finally {
    actionLoading.value = false;
  }
}

async function executeAutoAssignment() {
  const swalAuto = useSwal();
  const msgAuto = "Vols executar l'assignació automàtica de tallers? Això assignarà automàticament les peticions pendents segons prioritat i disponibilitat.";
  
  const resConfirm = await swalAuto.fire({ 
    title: 'Confirmar', 
    text: msgAuto, 
    icon: 'question', 
    showCancelButton: true, 
    confirmButtonText: 'Sí' 
  });
  
  if (resConfirm.isConfirmed === false) {
    return;
  }

  autoAssignLoading.value = true;
  try {
    const headerAuto = {};
    if (tokenRef) {
      headerAuto.Authorization = 'Bearer ' + tokenRef;
    }

    const rAPI = await $fetch('/api/admin/matching/auto', { 
       method: 'POST', 
       headers: headerAuto 
    });
    
    await fetchPeticions();
    
    let numS = 0;
    let numR = 0;
    let numE = 0;
    
    if (rAPI.summary) {
       const s = rAPI.summary;
       if (s.success !== undefined) { numS = s.success; }
       if (s.rejected !== undefined) { numR = s.rejected; }
       if (s.errors !== undefined) { numE = s.errors; }
    }
    
    await swalAuto.fire({
      title: 'Assignació automàtica completada!',
      html: 'Assignades: <strong>' + numS + '</strong> | Rebutjades: <strong>' + numR + '</strong> | Errors: <strong>' + numE + '</strong>',
      icon: 'success'
    });
    
  } catch (errAuto) {
    console.error('Error executant assignació automàtica:', errAuto);
    let errorMsgText = 'No s\'ha pogut executar l\'assignació automàtica.';
    if (errAuto.data) {
       if (errAuto.data.message) {
         errorMsgText = errAuto.data.message;
       }
    }
    await swalAuto.fire({
      title: 'Error',
      text: errorMsgText,
      icon: 'error'
    });
  } finally {
    autoAssignLoading.value = false;
  }
}

// D) --- Gestors d'esdeveniments ---

function handleApprove(detall) {
  updateTallerStatus(detall.peticio_id, detall.taller_id, 'ASSIGNADA');
}

function handleReject(detall) {
  updateTallerStatus(detall.peticio_id, detall.taller_id, 'REBUTJADA');
}

function goToPage(page) {
  const maxP = totalPages.value;
  if (page >= 1) {
    if (page <= maxP) {
      currentPage.value = page;
    }
  }
}

// E) --- Ganxo de muntatge ---
onMounted(function () { 
  fetchPeticions(); 
});
</script>