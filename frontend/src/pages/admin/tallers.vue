<template>
  <section class="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1400px] mx-auto px-6 md:px-8 py-6">
    
    <!-- 1. Barra de control (Cerca, visualització, Crear Taller) -->
    <div class="bg-white p-2 rounded-xl border border-[#BFDBF7]/60 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
      
      <!-- Cerca -->
      <div class="relative flex-1 max-w-md group w-full ml-1">
        <Search :size="14" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
        <input 
          type="text" 
          placeholder="Cerca tallers per títol o sector..."
          v-model="searchQuery"
          class="w-full bg-[#E1E5F2]/10 border border-transparent rounded-lg pl-11 pr-4 py-2.5 text-[11px] font-bold focus:bg-white focus:border-[#BFDBF7] focus:ring-4 focus:ring-[#1F7A8C]/5 outline-none transition-all placeholder:text-[#022B3A]/20"
        />
      </div>

      <!-- Accions: vista i Crear Taller -->
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1 bg-[#E1E5F2]/30 p-1 rounded-lg border border-[#BFDBF7]/20">
          <button 
            type="button"
            @click="viewMode = 'grid'"
            :class="classeBotoView('grid')"
          >
            <LayoutGrid :size="14" />
          </button>
          <button 
            type="button"
            @click="viewMode = 'list'"
            :class="classeBotoView('list')"
          >
            <List :size="14" />
          </button>
        </div>
        <button 
          type="button"
          @click="crearTaller"
          class="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1F7A8C] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#022B3A] transition-all"
        >
          <Plus :size="14" />
          Crear Taller
        </button>
      </div>
    </div>

    <!-- Estat: carregant -->
    <div v-if="pendent" class="text-center py-16 text-[#022B3A]/60 font-medium">Carregant tallers...</div>

    <!-- Estat: error -->
    <div v-else-if="errorFetch" class="text-center py-16 text-red-600 font-medium">Error carregant els tallers: {{ textError }}</div>

    <!-- Contingut: llista / graella -->
    <div v-else>
      <!-- Sense tallers de l'API -->
      <p v-if="!hiHaTallers" class="text-center py-16 text-[#022B3A]/60 font-medium">No hi ha tallers disponibles actualment.</p>

      <!-- Hi ha tallers però la cerca no en mostra cap -->
      <p v-else-if="filteredTallers.length === 0" class="text-center py-16 text-[#022B3A]/60 font-medium">Cap taller coincideix amb la cerca.</p>

      <!-- Graella o llista + targeta "Nou Projecte" (només en graella) -->
      <div v-else :class="viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'flex flex-col gap-3'">
        
        <template v-for="taller in filteredTallers" :key="taller.id">
          
          <!-- Vista llista -->
          <div 
            v-if="viewMode === 'list'"
            class="bg-white rounded-xl border border-[#E1E5F2] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 hover:shadow-lg transition-all hover:border-[#BFDBF7] group"
          >
            <div class="flex items-center gap-4 flex-1 min-w-0">
              <div :class="['w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center font-black text-[9px] uppercase border tracking-widest transition-colors', getProjectStyles(taller.modalitat)]">
                {{ taller.modalitat }}
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-3 mb-0.5">
                  <h3 class="text-base font-black text-[#022B3A] truncate">{{ taller.titol }}</h3>
                  <span class="hidden sm:inline-block px-2 py-0.5 bg-[#F4F7FB] border border-[#E1E5F2] rounded text-[9px] font-black text-[#022B3A]/50 uppercase tracking-widest">{{ taller.sector }}</span>
                </div>
                <p class="text-[11px] font-medium text-[#8E9AAF] truncate">{{ descripcioTaller(taller) }}</p>
              </div>
            </div>

            <div class="hidden lg:flex items-center gap-8 flex-shrink-0">
              <div class="flex flex-col items-end min-w-[60px]">
                <span class="text-[9px] font-black text-[#B8C0CC] uppercase tracking-widest">Places</span>
                <span class="text-xs font-bold text-[#022B3A]">{{ taller.places_maximes }}</span>
              </div>
              <div class="flex flex-col items-end min-w-[80px]">
                <span class="text-[9px] font-black text-[#B8C0CC] uppercase tracking-widest">Trimestres</span>
                <span class="text-xs font-bold text-[#022B3A]">{{ trimestresText(taller) }}</span>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 md:border-l md:border-[#F1F4F9] md:pl-6">
              <span class="hidden md:block text-[9px] font-black text-[#B8C0CC] tracking-widest uppercase mr-2">
                REF-{{ refFormat(taller.id) }}
              </span>
              <button type="button" @click="editTaller(taller.id)" class="p-2 text-[#B8C0CC] hover:text-[#1F7A8C] transition-all bg-white border border-transparent hover:border-[#BFDBF7] rounded-lg">
                <Edit3 :size="16" :stroke-width="1.5" />
              </button>
              <button type="button" @click="deleteTaller(taller.id)" class="p-2 bg-white border border-[#FFECEC] text-[#FF4D4D] rounded-lg shadow-sm hover:bg-[#FF4D4D] hover:text-white transition-all">
                <Trash2 :size="16" />
              </button>
            </div>
          </div>

          <!-- Vista graella (targeta) -->
          <div 
            v-else
            class="bg-white rounded-2xl border border-[#E1E5F2] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-400 group flex flex-col h-full overflow-hidden"
          >
            <!-- Badges: projecte i estat -->
            <div class="p-6 pb-4 flex justify-between items-center">
              <span :class="['px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.1em] border transition-colors', getProjectStyles(taller.modalitat)]">
                Projecte {{ taller.modalitat }}
              </span>
              <div class="bg-[#F4F7FB] px-3 py-1.5 rounded-full border border-[#E1E5F2]/60 flex items-center gap-2">
                <div :class="['w-1.5 h-1.5 rounded-full', classePuntEstat(taller.actiu)]"></div>
                <span class="text-[9px] font-black text-[#8E9AAF] uppercase tracking-widest">{{ textEstat(taller) }}</span>
              </div>
            </div>

            <!-- Contingut -->
            <div class="px-6 flex-1">
              <h3 class="text-[20px] font-black text-[#022B3A] mb-2 leading-tight tracking-tight group-hover:text-[#1F7A8C] transition-colors">
                {{ taller.titol }}
              </h3>
              <p class="text-[#8E9AAF] text-[12px] leading-relaxed font-medium mb-6 line-clamp-2">
                {{ descripcioTaller(taller) }}
              </p>

              <!-- Metadades -->
              <div class="space-y-3 mb-6">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2.5 text-[#B8C0CC]">
                    <Briefcase :size="16" :stroke-width="1.5" />
                    <span class="text-[9px] font-black uppercase tracking-widest">SECTOR</span>
                  </div>
                  <span class="text-[12px] font-black text-[#022B3A]">{{ taller.sector }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2.5 text-[#B8C0CC]">
                    <Users :size="16" :stroke-width="1.5" />
                    <span class="text-[9px] font-black uppercase tracking-widest">CAPACITAT</span>
                  </div>
                  <span class="text-[12px] font-black text-[#022B3A]">{{ taller.places_maximes }} alumnes</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2.5 text-[#B8C0CC]">
                    <span class="text-[9px] font-black uppercase tracking-widest">RESTANTS</span>
                  </div>
                  <span class="text-[12px] font-black text-[#022B3A]">{{ placesRestants(taller) }}</span>
                </div>
              </div>

              <!-- Pills trimestres -->
              <div class="pt-4 border-t border-[#F1F4F9]">
                <div class="flex flex-wrap gap-2 mb-6">
                  <span 
                    v-for="t in trimestresArray(taller)" 
                    :key="t" 
                    class="bg-[#F4F7FB] text-[#8E9AAF] text-[8px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border border-[#E1E5F2]/40"
                  >
                    {{ t }} Trimestre
                  </span>
                </div>
              </div>
            </div>

            <!-- Peu de la targeta -->
            <div class="px-6 py-4 bg-[#F9FAFC] border-t border-[#F1F4F9] flex items-center justify-between mt-auto">
              <span class="text-[10px] font-black text-[#B8C0CC] tracking-widest uppercase">
                REF-{{ refFormat(taller.id) }}
              </span>
              <div class="flex items-center gap-2">
                <button type="button" @click="editTaller(taller.id)" class="p-2 text-[#B8C0CC] hover:text-[#1F7A8C] transition-all flex items-center justify-center">
                  <Edit3 :size="18" :stroke-width="1.5" />
                </button>
                <button 
                  type="button"
                  @click="deleteTaller(taller.id)"
                  class="p-3 bg-white border border-[#FFECEC] text-[#FF4D4D] rounded-xl shadow-sm hover:bg-[#FF4D4D] hover:text-white transition-all flex items-center justify-center active:scale-95"
                >
                  <Trash2 :size="18" />
                </button>
              </div>
            </div>
          </div>
        </template>

        <!-- Targeta "Nou Projecte" (només en vista graella) -->
        <button 
          v-if="viewMode === 'grid'"
          type="button"
          @click="crearTaller"
          class="group border-2 border-dashed border-[#BFDBF7]/40 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-[#022B3A]/20 hover:border-[#1F7A8C] hover:text-[#1F7A8C] hover:bg-white hover:-translate-y-1 transition-all duration-300 min-h-[300px]"
        >
          <div class="w-12 h-12 rounded-lg border-2 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-all">
            <Plus :size="24" :stroke-width="3" />
          </div>
          <div class="text-center">
            <p class="font-black text-xs uppercase tracking-widest">Nou Projecte</p>
            <p class="text-[10px] mt-1 opacity-60 font-medium italic">Fes créixer el catàleg</p>
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import {
  Search,
  LayoutGrid,
  List,
  Plus,
  Edit3,
  Trash2,
  Users,
  Briefcase
} from 'lucide-vue-next';

// ======================================
// Importacions i Composables (Rutes, Cookies, Stores)
// ======================================
const header = useHeaderStore();
header.setHeaderAdmin();

// ======================================
// Estat Reactiu i Refs (Variables i Formularis)
// ======================================
const token = useCookie('authToken').value;
const respostaFetch = await useFetch('/api/admin/tallers', {
  server: false,
  headers: {
    Authorization: token ? 'Bearer ' + token : ''
  }
});

const searchQuery = ref('');
const viewMode = ref('grid');

const tallers = computed(function () {
  if (respostaFetch.data && respostaFetch.data.value) {
    return respostaFetch.data.value;
  }
  return [];
});

// Filtre per cerca (bucle for, sense .filter())
const filteredTallers = computed(function () {
  const q = (searchQuery.value || '').toLowerCase();
  const arr = tallers.value;
  if (!arr) {
    return [];
  }
  const resultat = [];
  for (let i = 0; i < arr.length; i++) {
    const t = arr[i];
    const titol = (t.titol || '').toLowerCase();
    const sector = (t.sector || '').toLowerCase();
    if (q === '' || titol.indexOf(q) !== -1 || sector.indexOf(q) !== -1) {
      resultat.push(t);
    }
  }
  return resultat;
});

const pendent = computed(function () {
  if (respostaFetch.pending) {
    return respostaFetch.pending.value;
  }
  return false;
});

const errorFetch = computed(function () {
  if (respostaFetch.error && respostaFetch.error.value) {
    return true;
  }
  return false;
});

const textError = computed(function () {
  if (respostaFetch.error && respostaFetch.error.value && respostaFetch.error.value.message) {
    return respostaFetch.error.value.message;
  }
  return '';
});

const hiHaTallers = computed(function () {
  const t = tallers.value;
  if (t && t.length > 0) {
    return true;
  }
  return false;
});

// ======================================
// Lògica i Funcions (Handlers i Lifecycle)
// ======================================

// A) --- Estils del badge de projecte (modalitat A, B, C) ---
function getProjectStyles(modalitat) {
  if (modalitat === 'A') {
    return 'bg-[#FFF0EB] text-[#FB6107] border-[#FB6107]/20';
  }
  if (modalitat === 'B') {
    return 'bg-[#F0F7E9] text-[#7CB518] border-[#7CB518]/20';
  }
  if (modalitat === 'C') {
    return 'bg-[#FFF7E6] text-[#FBB02D] border-[#FBB02D]/20';
  }
  return 'bg-white/40 text-[#022B3A]/50 border-[#BFDBF7]/40';
}

// A) --- Classe del botó de vista (grid / list) ---
function classeBotoView(mode) {
  const base = 'p-2 rounded-md shadow-sm border transition-all';
  if (viewMode.value === mode) {
    return base + ' text-[#1F7A8C] bg-white border-[#BFDBF7]/40 shadow-sm';
  }
  return base + ' text-[#022B3A]/20 border-transparent hover:text-[#022B3A]';
}

// A) --- Retornar el text d'estat (Actiu / Arxivat) ---
function textEstat(taller) {
  if (taller.actiu) {
    return 'Actiu';
  }
  return 'Arxivat';
}

// A) --- Classe del punt d'estat (actiu = verd, inactiu = gris) ---
function classePuntEstat(actiu) {
  if (actiu) {
    return 'bg-[#7CB518]';
  }
  return 'bg-[#94a3b8]';
}

// A) --- Retornar la descripció o text per defecte ---
function descripcioTaller(taller) {
  if (taller.descripcio) {
    return taller.descripcio;
  }
  return 'Sense descripció disponible.';
}

// A) --- Retornar les places restants ---
function placesRestants(taller) {
  if (taller.places_restants !== undefined && taller.places_restants !== null) {
    return taller.places_restants;
  }
  return taller.places_maximes;
}

// A) --- Array de trimestres per al taller ---
function trimestresArray(taller) {
  const v = taller.trimestres_disponibles;
  if (!v) {
    return [];
  }
  if (Array.isArray(v)) {
    return v;
  }
  if (typeof v === 'string') {
    const parts = v.split(',');
    const out = [];
    for (let i = 0; i < parts.length; i++) {
      const s = String(parts[i] || '').trim();
      if (s) {
        out.push(s);
      }
    }
    return out;
  }
  return [];
}

// A) --- Text de trimestres per a la vista llista ---
function trimestresText(taller) {
  const arr = trimestresArray(taller);
  let s = '';
  for (let i = 0; i < arr.length; i++) {
    if (i > 0) s = s + ', ';
    s = s + arr[i];
  }
  return s;
}

// A) --- Format REF-XXX ---
function refFormat(id) {
  return String(id).padStart(3, '0');
}

// A) --- Navegar a crear un nou taller ---
function crearTaller() {
  navigateTo('/admin/tallers/FormTallers');
}

// A) --- Eliminar un taller ---
async function deleteTaller(id) {
  try {
    await $fetch('/api/admin/tallers/' + id, {
      method: 'DELETE',
      headers: {
        Authorization: token ? 'Bearer ' + token : ''
      }
    });
    respostaFetch.refresh();
  } catch (err) {
    console.error('Error eliminant taller:', err);
  }
}

// A) --- Navegar a l'edició del taller ---
function editTaller(id) {
  navigateTo('/admin/tallers/editTallers?id=' + id);
}
</script>

<style scoped>
/* Estils específics si cal. */
</style>
