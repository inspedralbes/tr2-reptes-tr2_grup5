<template>
  <section class="animate-in fade-in slide-in-from-bottom-4 duration-500">
    
    <!-- Loading -->
    <div v-if="pendent" class="flex flex-col items-center justify-center py-20">
      <div class="w-10 h-10 border-4 border-[#E1E5F2] border-t-[#1F7A8C] rounded-full animate-spin mb-4"></div>
      <p class="text-[#022B3A]/60 text-sm font-bold">Carregant logs d'auditoria...</p>
    </div>

    <!-- Error -->
    <div v-else-if="errorFetch" class="flex flex-col items-center justify-center py-20">
      <p class="text-red-600 font-bold">Error carregant els logs: {{ textError }}</p>
    </div>

    <template v-else>
      
      <div class="mb-8">
        <h1 class="text-4xl md:text-5xl font-black text-[#022B3A] tracking-tighter leading-none mb-3">
          Registre d'<span class="text-[#1F7A8C]">Auditoria</span>
        </h1>
        <p class="text-[#022B3A]/40 text-[10px] font-black uppercase tracking-[0.2em]">
          Historial d'accions i canvis realitzats en la plataforma.
        </p>
      </div>

      <!-- Control Bar -->
      <div class="bg-white p-2 rounded-xl border border-[#BFDBF7]/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="relative flex-1 max-w-lg group w-full ml-1">
          <Search :size="14" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
          <input 
            type="text" 
            placeholder="Cerca per usuari, taula o acció..."
            v-model="searchQuery"
            class="w-full bg-[#E1E5F2]/10 border border-transparent rounded-lg pl-11 pr-4 py-2.5 text-[11px] font-bold focus:bg-white focus:border-[#BFDBF7] focus:ring-4 focus:ring-[#1F7A8C]/5 outline-none transition-all placeholder:text-[#022B3A]/20 text-[#022B3A]"
          />
        </div>
      </div>

      <!-- Audit Table -->
      <div class="bg-white rounded-2xl border border-[#BFDBF7]/60 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-[#E1E5F2]/10 border-b border-[#BFDBF7]/20">
                <th class="p-5 pl-8 text-[10px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Data</th>
                <th class="p-5 text-[10px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Acció</th>
                <th class="p-5 text-[10px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Taula</th>
                <th class="p-5 text-[10px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Usuari</th>
                <th class="p-5 text-[10px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Valor Anterior</th>
                <th class="p-5 pr-8 text-[10px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Valor Nou</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#BFDBF7]/10">
              <tr v-for="log in paginatedLogs" :key="log.id" class="hover:bg-[#E1E5F2]/5 transition-colors group">
                <td class="p-5 pl-8 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <History :size="14" class="text-[#022B3A]/20" />
                    <span class="text-xs font-bold text-[#022B3A]">{{ formatDate(log.data_registre) }}</span>
                  </div>
                </td>
                <td class="p-5">
                  <span :class="['px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border', getActionStyle(log.accio)]">
                    {{ log.accio }}
                  </span>
                </td>
                <td class="p-5">
                  <span class="text-xs font-bold text-[#022B3A]/60 bg-[#022B3A]/5 px-2 py-1 rounded uppercase tracking-wide">
                    {{ taulaLog(log) }}
                  </span>
                </td>
                <td class="p-5">
                  <span class="text-xs font-bold text-[#1F7A8C]">{{ usuariLog(log) }}</span>
                </td>
                <td class="p-5 max-w-[200px]">
                  <div v-if="log.valor_anterior" class="flex items-start gap-2 text-[#022B3A]/40">
                    <div class="min-w-0 break-words text-[11px] font-medium leading-snug" :title="log.valor_anterior">
                      {{ truncate(log.valor_anterior, 80) }}
                    </div>
                  </div>
                  <span v-else class="text-[10px] font-bold text-[#022B3A]/20 uppercase tracking-widest">-</span>
                </td>
                <td class="p-5 pr-8 max-w-[250px]">
                  <div class="flex items-start gap-2">
                    <ArrowRight v-if="log.valor_anterior" :size="14" class="text-[#022B3A]/20 mt-0.5 shrink-0" />
                    <span class="text-[11px] font-bold text-[#022B3A] break-words leading-snug" :title="log.valor_nou">
                      {{ truncate(log.valor_nou, 80) }}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="filteredLogs.length === 0" class="p-12 text-center text-[#022B3A]/40">
          <p class="text-sm font-bold">{{ hiHaLogs ? "No s'han trobat registres." : "No hi ha logs d'auditoria." }}</p>
        </div>
      </div>

      <div class="mt-8 flex justify-center">
        <Pagination :current-page="currentPage" :total-pages="totalPages" @go-to-page="goToPage" />
      </div>
    </template>

  </section>
</template>

<script setup>
// ======================================
// Importem les dependències
// ======================================
import { Search, History, ArrowRight } from 'lucide-vue-next';

// ======================================
// Configuració i Serveis
// ======================================

// 1. Dades d'autenticació
const tokenCookie = useCookie('authToken');
const tokenRef = tokenCookie.value;

// 2. Petició a l'API per obtenir els logs (sense desestructuració)
const opcionsCapçalera = {};
if (tokenRef) {
  opcionsCapçalera.Authorization = 'Bearer ' + tokenRef;
}

const resultatFetch = await useFetch('/api/admin/logs', {
  headers: opcionsCapçalera,
  initialCache: false
});

// ======================================
// Estat Reactiu del Component
// ======================================

const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

// ======================================
// Propietats Computades
// ======================================

// 1. Accés a la llista de logs reactiva
const llistaLogs = computed(function () {
  let dades = [];
  if (resultatFetch.data) {
    if (resultatFetch.data.value) {
      dades = resultatFetch.data.value;
    }
  }
  return dades;
});

// 2. Filtre de cerca (Bucle for en comptes de .filter)
const filteredLogs = computed(function () {
  const query = searchQuery.value;
  let tBusca = '';
  if (query) {
    tBusca = query.toLowerCase().trim();
  }
  
  const llistaOriginal = llistaLogs.value;
  const resultatFiltrat = [];
  
  for (let i = 0; i < llistaOriginal.length; i++) {
    const log = llistaOriginal[i];
    
    let coincideix = false;
    if (tBusca === '') {
      coincideix = true;
    } else {
      let u = '';
      if (log.usuari_email) { u = log.usuari_email.toLowerCase(); }
      
      let t = '';
      if (log.taula_afectada) { t = log.taula_afectada.toLowerCase(); }
      
      let a = '';
      if (log.accio) { a = log.accio.toLowerCase(); }
      
      if (u.indexOf(tBusca) !== -1) {
        coincideix = true;
      } else if (t.indexOf(tBusca) !== -1) {
        coincideix = true;
      } else if (a.indexOf(tBusca) !== -1) {
        coincideix = true;
      }
    }
    
    if (coincideix === true) {
      resultatFiltrat.push(log);
    }
  }
  return resultatFiltrat;
});

// 3. Paginació: Càlcul de pàgines totals
const totalPages = computed(function () {
  const totalElements = filteredLogs.value.length;
  let pagines = 1;
  if (totalElements > 0) {
    pagines = Math.ceil(totalElements / itemsPerPage);
  }
  return pagines;
});

// 4. Paginació: Logs de la pàgina actual (Sense .slice)
const paginatedLogs = computed(function () {
  const llistaF = filteredLogs.value;
  const inici = (currentPage.value - 1) * itemsPerPage;
  const fi = inici + itemsPerPage;
  
  const llistaPagina = [];
  for (let k = 0; k < llistaF.length; k++) {
    if (k >= inici) {
      if (k < fi) {
        llistaPagina.push(llistaF[k]);
      }
    }
  }
  return llistaPagina;
});

// 5. Estat de càrrega
const pendent = computed(function () {
  let estPendent = false;
  if (resultatFetch.pending) {
    if (resultatFetch.pending.value === true) {
      estPendent = true;
    }
  }
  return estPendent;
});

// 6. Estat d'error
const errorFetch = computed(function () {
  let hiHaError = false;
  if (resultatFetch.error) {
    if (resultatFetch.error.value) {
      hiHaError = true;
    }
  }
  return hiHaError;
});

// 7. Text de l'error
const textError = computed(function () {
  let msg = '';
  if (resultatFetch.error) {
    if (resultatFetch.error.value) {
      if (resultatFetch.error.value.message) {
        msg = resultatFetch.error.value.message;
      }
    }
  }
  return msg;
});

// 8. Comprovació de si hi ha logs per mostrar
const hiHaLogs = computed(function () {
  const ll = llistaLogs.value;
  let existeixen = false;
  if (ll) {
    if (ll.length > 0) {
      existeixen = true;
    }
  }
  return existeixen;
});

// ======================================
// Vigilants (Watchers)
// ======================================

// 1. Quan canviem la cerca, tornem a la pàgina 1
watch(searchQuery, function () {
  currentPage.value = 1;
});

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Estils visuals per tipus d'acció ---
function getActionStyle(accioIn) {
  let a = '';
  if (accioIn) { a = accioIn.toUpperCase(); }
  
  if (a === 'DELETE') { return 'bg-red-50 text-red-600 border-red-100'; }
  if (a === 'UPDATE') { return 'bg-[#BFDBF7]/20 text-[#1F7A8C] border-[#BFDBF7]/40'; }
  if (a === 'CREATE') { return 'bg-[#7cb518]/10 text-[#7cb518] border-[#7cb518]/20'; }
  if (a === 'LOGIN') { return 'bg-[#E1E5F2] text-[#022B3A]/60 border-[#BFDBF7]/20'; }
  if (a === 'EXPORT') { return 'bg-amber-50 text-amber-600 border-amber-100'; }
  
  return 'bg-gray-50 text-gray-500 border-gray-100';
}

// B) --- Helpers per al contingut de la taula ---
function formatDate(valorDada) {
  if (!valorDada) { return '—'; }
  const dObj = new Date(valorDada);
  const opc = { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  };
  return dObj.toLocaleString('ca-ES', opc);
}

function taulaLog(objecteLog) {
  if (objecteLog.taula_afectada) {
    return objecteLog.taula_afectada;
  }
  return '—';
}

function usuariLog(objecteLogU) {
  if (objecteLogU.usuari_email) {
    return objecteLogU.usuari_email;
  }
  return '—';
}

function truncate(textInput, maxChars) {
  if (!textInput) { return '—'; }
  const str = String(textInput);
  if (str.length <= maxChars) {
    return str;
  }
  return str.slice(0, maxChars) + '...';
}

// C) --- Navegació entre pàgines ---
function goToPage(pagNum) {
  const pagMaxim = totalPages.value;
  if (pagNum >= 1) {
    if (pagNum <= pagMaxim) {
      currentPage.value = pagNum;
    }
  }
}
</script>
