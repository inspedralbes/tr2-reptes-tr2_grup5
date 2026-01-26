<script setup>
// ======================================
// Importem les dependències
// ======================================
import { ref, computed, watch } from 'vue';
import { 
  Search, 
  Filter, 
  Clock, 
  MapPin, 
  User, 
  ClipboardCheck 
} from 'lucide-vue-next';

// ======================================
// Configuració i Serveis
// ======================================

// 1. Configuració de la capçalera específica per a professors
const headerStore = useHeaderStore();
headerStore.setHeaderProfessors();

// 2. Control de rutes i autenticació
const routerInstancia = useRouter();
const tokenCookie = useCookie('authToken');
const tokenRef = tokenCookie.value;

// 3. Petició a l'API per obtenir el catàleg de tallers (sense desestructuració)
const headersAPI = {};
if (tokenRef) {
  headersAPI.Authorization = 'Bearer ' + tokenRef;
}

const resultatSessions = await useFetch('/api/professor/tallers', {
  headers: headersAPI,
  key: 'professor-tallers-attendance-secure'
});

// ======================================
// Estat Reactiu del Component
// ======================================

const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

// ======================================
// Propietats Computades (Tractament de dades)
// ======================================

// 1. Llista base de tallers (segura)
const tallersLlistaRaw = computed(function () {
  let llista = [];
  if (resultatSessions.data) {
    if (resultatSessions.data.value) {
      llista = resultatSessions.data.value;
    }
  }
  return llista;
});

// 2. Filtre de tallers on l'usuari té permís d'assistència (Bucle for)
const referentTallers = computed(function () {
  const llistaT = tallersLlistaRaw.value;
  const resultatReferent = [];
  for (let i = 0; i < llistaT.length; i++) {
    const t = llistaT[i];
    if (t) {
      if (t.permissions) {
        if (t.permissions.canTakeAttendance === true) {
          resultatReferent.push(t);
        }
      }
    }
  }
  return resultatReferent;
});

// 3. Filtre final per cerca i mapeig UI (Bucle for)
const filteredSessions = computed(function () {
  const queryRaw = searchQuery.value;
  let textBusca = '';
  if (queryRaw) {
    textBusca = queryRaw.toLowerCase().trim();
  }
  
  const llistaAssig = referentTallers.value;
  const resultatFiltrat = [];
  
  for (let j = 0; j < llistaAssig.length; j++) {
    const t = llistaAssig[j];
    let coincideix = false;
    
    if (textBusca === '') {
      coincideix = true;
    } else {
      let tTitol = '';
      if (t.titol) { tTitol = t.titol.toLowerCase(); }
      
      let tMuni = '';
      if (t.municipi) { tMuni = t.municipi.toLowerCase(); }
      
      if (tTitol.indexOf(textBusca) !== -1) {
        coincideix = true;
      } else if (tMuni.indexOf(textBusca) !== -1) {
        coincideix = true;
      }
    }
    
    if (coincideix === true) {
      // Mapegem manualment a l'estructura de la interfície
      const sessioUI = {
        id: t.detall_id || t.id,
        title: t.titol || 'Taller',
        project: t.sector || 'PROJECTE',
        date: 'Pendent de sessió',
        location: t.ubicacio || t.municipi || 'No especificada',
        trimestre: t.trimestre || '1r',
        docent: t.docent_nom || 'Pendent'
      };
      resultatFiltrat.push(sessioUI);
    }
  }
  return resultatFiltrat;
});

// 4. Càlcul del total de pàgines per a la paginació
const totalPages = computed(function () {
  const totalItems = filteredSessions.value.length;
  let nPagines = 1;
  if (totalItems > 0) {
    nPagines = Math.ceil(totalItems / itemsPerPage);
  }
  return nPagines;
});

// 5. Sessions que es mostren a la pàgina actual (Sense .slice)
const paginatedSessions = computed(function () {
  const llistaTota = filteredSessions.value;
  const inici = (currentPage.value - 1) * itemsPerPage;
  const fi = inici + itemsPerPage;
  
  const resultatPag = [];
  for (let k = 0; k < llistaTota.length; k++) {
    if (k >= inici) {
      if (k < fi) {
        resultatPag.push(llistaTota[k]);
      }
    }
  }
  return resultatPag;
});

// 6. Estats de càrrega i error (Sense desestructuració)
const isPendent = computed(function () {
  let p = false;
  if (resultatSessions.pending) {
    if (resultatSessions.pending.value === true) { p = true; }
  }
  return p;
});

const isError = computed(function () {
  let e = false;
  if (resultatSessions.error) {
    if (resultatSessions.error.value) { e = true; }
  }
  return e;
});

const textError = computed(function () {
  let text = 'Error de connexió';
  if (resultatSessions.error) {
    if (resultatSessions.error.value) {
      if (resultatSessions.error.value.message) {
        text = resultatSessions.error.value.message;
      }
    }
  }
  return text;
});

// ======================================
// Vigilants (Watchers)
// ======================================

// 1. Si canvia la cerca, tornem directament a la pàgina 1
watch(searchQuery, function () {
  currentPage.value = 1;
});

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Gestió d'estils visuals ---

function getProjectStyles(sectorNom) {
  if (!sectorNom) { return 'bg-white/40 text-[#022B3A] border-white/60'; }
  const sUpper = String(sectorNom).toUpperCase();
  
  if (sUpper.indexOf('A') !== -1 || sUpper.indexOf('MANUF') !== -1) { return 'bg-[#FFF0EB] text-[#FB6107] border-[#FB6107]/20'; }
  if (sUpper.indexOf('B') !== -1 || sUpper.indexOf('ENER') !== -1) { return 'bg-[#F0F7E9] text-[#7CB518] border-[#7CB518]/20'; }
  if (sUpper.indexOf('C') !== -1 || sUpper.indexOf('AGRO') !== -1) { return 'bg-[#FFF7E6] text-[#FBB02D] border-[#FBB02D]/20'; }
  
  return 'bg-white/40 text-[#022B3A] border-white/60';
}

function getDocentIconStyles(nomDocent) {
  if (nomDocent === 'Pendent') {
    return 'bg-amber-100 text-amber-600';
  }
  return 'bg-[#1F7A8C]/10 text-[#1F7A8C]';
}

function getDocentTextStyles(nomDocent) {
  if (nomDocent === 'Pendent') {
    return 'text-amber-600 italic';
  }
  return 'text-[#022B3A]';
}

// B) --- Navegació ---

function handleGoToAttendance(idSessio) {
  if (idSessio) {
    routerInstancia.push('/professors/assistencia/' + idSessio);
  }
}

function handleGoToPage(numP) {
  const maxP = totalPages.value;
  if (numP >= 1) {
    if (numP <= maxP) {
      currentPage.value = numP;
    }
  }
}
</script>

<template>
  <div class="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
    
    <!-- 1. CAPÇALERA I FILTRES -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <h1 class="text-4xl md:text-5xl font-black text-[#022B3A] tracking-tighter leading-none mb-3">
          Control d'<span class="text-[#1F7A8C]">Assistència</span>
        </h1>
        <p class="text-[#022B3A]/40 text-[10px] font-black uppercase tracking-[0.2em]">
          Verifica l'assistència dels tallers on ets referent.
        </p>
      </div>

      <!-- Barra de cerca -->
      <div class="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-[#BFDBF7]/60 shadow-sm w-full md:w-auto">
        <div class="relative flex-1 group">
          <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="Cercar taller..."
            class="w-full md:w-64 bg-[#E1E5F2]/10 border border-transparent rounded-lg pl-9 pr-4 py-2 text-[11px] font-bold focus:bg-white focus:ring-2 focus:ring-[#1F7A8C]/20 outline-none transition-all placeholder:text-[#022B3A]/20 text-[#022B3A]"
          />
        </div>
        <div class="w-px h-6 bg-[#BFDBF7]/60"></div>
      </div>
    </div>

    <!-- 2. GESTIÓ D'ESTATS (ERROR/CÀRREGA) -->
    
    <div v-if="isError === true" class="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 text-sm italic">
        {{ textError }}
    </div>

    <div v-if="isPendent === true" class="p-20 text-center text-[#022B3A]/40 font-bold uppercase tracking-widest text-xs">
        Carregant sessions d'assistència...
    </div>

    <!-- 3. TAULA DE DADES -->
    <div v-else class="bg-white rounded-2xl border border-[#BFDBF7]/60 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#E1E5F2]/10 border-b border-[#BFDBF7]/20">
              <th class="p-5 pl-8 text-[10px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Detall Sessió</th>
              <th class="p-5 text-[10px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Ubicació</th>
              <th class="p-5 text-[10px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Trimestre</th>
              <th class="p-5 text-[10px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Docent</th>
              <th class="p-5 pr-8 text-right text-[10px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Accions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#BFDBF7]/10">
            <template v-if="paginatedSessions.length > 0">
                <tr v-for="session in paginatedSessions" :key="session.id" class="group hover:bg-[#E1E5F2]/5 transition-colors">
                  
                  <!-- Detall del taller -->
                  <td class="p-5 pl-8">
                    <div class="flex items-start gap-4">
                       <div class="w-10 h-10 rounded-lg bg-[#E1E5F2]/30 text-[#022B3A] flex items-center justify-center font-black text-[10px] border border-[#BFDBF7]/40 shrink-0">
                          {{ session.id }}
                       </div>
                       <div>
                          <h3 class="text-sm font-black text-[#022B3A] mb-1 group-hover:text-[#1F7A8C] transition-colors">
                            {{ session.title }}
                          </h3>
                          <div class="flex items-center gap-2">
                             <span :class="['px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border', getProjectStyles(session.project)]">
                                {{ session.project }}
                             </span>
                             <span class="text-[10px] text-[#022B3A]/40 font-bold flex items-center gap-1">
                                <Clock :size="10" /> {{ session.date }}
                             </span>
                          </div>
                       </div>
                    </div>
                  </td>

                  <!-- Ubicació de la sessió -->
                  <td class="p-5">
                     <div class="flex items-center gap-2 text-[#022B3A]/60">
                        <MapPin :size="14" />
                        <span class="text-[11px] font-bold">{{ session.location }}</span>
                     </div>
                  </td>

                  <!-- Trimestre assignat -->
                  <td class="p-5">
                     <span class="bg-[#F4F7FB] text-[#8E9AAF] text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border border-[#E1E5F2]/40">
                        {{ session.trimestre }}
                     </span>
                  </td>

                  <!-- Nom del docent -->
                  <td class="p-5">
                     <div class="flex items-center gap-2">
                        <div :class="['w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold', getDocentIconStyles(session.docent)]">
                           <User :size="12" />
                        </div>
                        <span :class="['text-[11px] font-bold', getDocentTextStyles(session.docent)]">
                           {{ session.docent }}
                        </span>
                     </div>
                  </td>

                  <!-- Botó de passar llista -->
                  <td class="p-5 pr-8 text-right">
                     <button 
                       @click="handleGoToAttendance(session.id)"
                       class="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all shadow-md bg-[#1F7A8C] text-white hover:bg-[#022B3A] shadow-[#1F7A8C]/20 hover:scale-105 active:scale-95"
                     >
                        <ClipboardCheck :size="14" :strokeWidth="2" />
                        PASSAR LLISTA
                     </button>
                  </td>

                </tr>
            </template>
            <tr v-else>
               <td colspan="5" class="p-20 text-center text-[#022B3A]/40 font-bold uppercase tracking-widest text-[10px] italic">
                   No hi ha sessions pendents per mostrar.
               </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Peu de taula amb paginació -->
      <div v-if="filteredSessions.length > 0" class="p-4 bg-[#E1E5F2]/10 border-t border-[#BFDBF7]/20 flex justify-between items-center px-8">
         <span class="text-[10px] font-bold text-[#022B3A]/30 uppercase tracking-widest">Mostrant {{ paginatedSessions.length }} de {{ filteredSessions.length }} sessions</span>
         <Pagination :current-page="currentPage" :total-pages="totalPages" @go-to-page="handleGoToPage" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estils gestionats globalment amb Tailwind */
</style>

<style scoped>
/* Tailwind handles the design */
</style>
