<template>
  <div 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#022B3A]/40 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div class="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#BFDBF7] bg-white shadow-2xl animate-in zoom-in-95 duration-300">
      
      <!-- STICKY HEADER -->
      <div class="sticky top-0 z-20 flex items-center justify-between px-8 py-6 bg-white/80 border-b border-[#BFDBF7]/40 backdrop-blur-sm">
        <div v-if="centre" class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-[#1F7A8C]/10 flex items-center justify-center text-[#1F7A8C]">
            <Building2 :size="24" />
          </div>
          <div>
            <div class="flex items-center gap-3">
              <span class="px-2 py-0.5 rounded bg-[#022B3A] text-white text-[9px] font-black uppercase tracking-widest">{{ centre.codi_centre || 'SENSE CODI' }}</span>
              <h2 class="text-2xl font-black text-[#022B3A] tracking-tight">{{ centre.nom_centre }}</h2>
            </div>
            <p class="text-[10px] font-bold text-[#022B3A]/40 uppercase tracking-[0.2em] flex items-center gap-1.5 mt-1">
              <MapPin :size="12" /> {{ centre.municipi || '—' }}
            </p>
          </div>
        </div>
        <button 
          @click="emit('close')"
          class="p-2 rounded-lg text-[#022B3A]/40 hover:text-[#022B3A] hover:bg-[#E1E5F2]/50 border border-transparent hover:border-[#BFDBF7] transition-all"
        >
          <X :size="24" />
        </button>
      </div>

      <!-- LOADING STATE -->
      <div v-if="pendent" class="p-20 flex flex-col items-center justify-center gap-4">
        <div class="w-10 h-10 border-4 border-[#E1E5F2] border-t-[#1F7A8C] rounded-full animate-spin"></div>
        <p class="text-[#022B3A]/40 text-sm font-black uppercase tracking-widest">Carregant dades...</p>
      </div>

      <!-- MAIN CONTENT -->
      <div v-else-if="centre" class="p-8">
        
        <!-- TABS CONTROLS -->
        <div class="flex items-center gap-2 bg-[#E1E5F2]/30 p-1.5 rounded-xl border border-[#BFDBF7]/20 w-max mb-10">
          <button 
            @click="activeTab = 'info'"
            :class="[
              'px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
              activeTab === 'info' ? 'bg-[#022B3A] text-white shadow-lg' : 'text-[#022B3A]/40 hover:bg-white hover:text-[#022B3A]'
            ]"
          >
            <div class="flex items-center gap-2">
              <ClipboardList :size="14" /> Info i Tallers
            </div>
          </button>
          <button 
            @click="activeTab = 'personal'"
            :class="[
              'px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
              activeTab === 'personal' ? 'bg-[#022B3A] text-white shadow-lg' : 'text-[#022B3A]/40 hover:bg-white hover:text-[#022B3A]'
            ]"
          >
            <div class="flex items-center gap-2">
              <Users :size="14" /> Personal
            </div>
          </button>
        </div>

        <Transition name="fade" mode="out-in">
          <!-- INFO & TALLERS TAB -->
          <div v-if="activeTab === 'info'" key="info" class="space-y-10">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <!-- Contact Info -->
              <div class="lg:col-span-1 space-y-6">
                <h3 class="text-xs font-black text-[#022B3A] uppercase tracking-[0.2em] flex items-center gap-2">
                  <span class="w-1.5 h-1.5 bg-[#1F7A8C] rounded-full"></span> Dades de Contacte
                </h3>
                <div class="bg-[#E1E5F2]/10 border border-[#BFDBF7]/30 rounded-2xl p-6 space-y-5">
                  <div class="space-y-1">
                    <span class="text-[9px] font-black text-[#022B3A]/30 uppercase tracking-widest">Email Oficial</span>
                    <p class="text-sm font-bold text-[#022B3A] break-all">{{ centre.email_oficial || '—' }}</p>
                  </div>
                  <div class="space-y-1">
                    <span class="text-[9px] font-black text-[#022B3A]/30 uppercase tracking-widest">Telèfon</span>
                    <p class="text-sm font-bold text-[#022B3A]">{{ centre.telefon || '—' }}</p>
                  </div>
                  <div class="space-y-1">
                    <span class="text-[9px] font-black text-[#022B3A]/30 uppercase tracking-widest">Coordinador/a</span>
                    <p class="text-sm font-bold text-[#022B3A]">{{ centre.nom_coordinador || '—' }}</p>
                  </div>
                </div>
              </div>

              <!-- Tallers List -->
              <div class="lg:col-span-2 space-y-6">
                <div class="flex items-center justify-between">
                  <h3 class="text-xs font-black text-[#022B3A] uppercase tracking-[0.2em] flex items-center gap-2">
                    <span class="w-1.5 h-1.5 bg-[#7cb518] rounded-full"></span> Tallers Assignats ({{ compteTallers }})
                  </h3>
                </div>
                
                <div v-if="compteTallers > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    v-for="taller in centre.tallers" 
                    :key="taller.id" 
                    @click="openComments(taller)"
                    class="bg-white border border-[#E1E5F2] hover:border-[#1F7A8C] p-5 rounded-2xl flex items-center gap-4 group cursor-pointer transition-all hover:shadow-xl hover:shadow-[#1F7A8C]/5"
                  >
                    <div class="w-10 h-10 rounded-xl bg-[#E1E5F2]/40 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                      🎓
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="text-xs font-black text-[#022B3A] truncate uppercase tracking-widest">{{ taller.titol }}</p>
                      <span class="text-[9px] font-black text-[#1F7A8C] uppercase tracking-widest bg-[#1F7A8C]/5 px-2 py-0.5 rounded mt-1 inline-block">{{ taller.estat }}</span>
                    </div>
                    <ChevronRight :size="16" class="text-[#022B3A]/20" />
                  </div>
                </div>
                <div v-else class="p-12 border-2 border-dashed border-[#BFDBF7]/40 rounded-3xl flex flex-col items-center justify-center text-[#022B3A]/20">
                  <LayoutGrid :size="32" class="mb-2" />
                  <p class="text-[10px] font-bold uppercase tracking-widest">Sense tallers assignats</p>
                </div>
              </div>
            </div>
          </div>

          <!-- PERSONAL TAB -->
          <div v-else key="personal" class="space-y-10">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <!-- EQUIP DOCENT -->
              <div class="space-y-6">
                <h3 class="text-xs font-black text-[#022B3A] uppercase tracking-[0.2em] flex items-center gap-2">
                  <span class="w-1.5 h-1.5 bg-[#fb6107] rounded-full"></span> Equip Docent ({{ llistaProfessorsLength }})
                </h3>
                <div class="space-y-3">
                  <div 
                    v-for="profe in llistaProfessors" 
                    :key="profe.id" 
                    class="bg-white border-l-4 border-[#2b63b6] border-y border-r border-[#E1E5F2] p-5 rounded-xl flex items-center gap-4"
                  >
                    <div class="w-10 h-10 rounded-full bg-[#E1E5F2]/40 flex items-center justify-center text-[11px] font-black text-[#022B3A] border border-[#BFDBF7]">
                      {{ getInitials(profe.nom, profe.cognoms) }}
                    </div>
                    <div>
                      <p class="text-sm font-black text-[#022B3A] tracking-tight">{{ profe.nom }} {{ profe.cognoms }}</p>
                      <p class="text-[10px] font-bold text-[#022B3A]/40 uppercase tracking-widest">Professor/a del centre</p>
                    </div>
                  </div>
                  <div v-if="llistaProfessorsLength === 0" class="bg-white border-l-4 border-[#BFDBF7] border-y border-r border-[#E1E5F2] p-5 rounded-xl flex items-center gap-4 opacity-70">
                    <div class="w-10 h-10 rounded-full bg-[#E1E5F2]/40 flex items-center justify-center text-[11px] font-black text-[#022B3A] border border-[#BFDBF7]">
                      {{ getInitials(centre.nom_coordinador || 'Coordinador', 'General') }}
                    </div>
                    <div>
                      <p class="text-sm font-black text-[#022B3A] tracking-tight">{{ centre.nom_coordinador || 'Coordinador General' }}</p>
                      <p class="text-[10px] font-bold text-[#022B3A]/40 uppercase tracking-widest">Responsable de projectes</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- GRUPS I ALUMNAT -->
              <div class="space-y-6">
                <h3 class="text-xs font-black text-[#022B3A] uppercase tracking-[0.2em] flex items-center gap-2">
                  <span class="w-1.5 h-1.5 bg-[#1F7A8C] rounded-full"></span> Grups i Alumnat
                </h3>
                
                <!-- Stats Summary -->
                <div class="grid grid-cols-2 gap-4 mb-6">
                  <div class="bg-[#022B3A] text-white p-6 rounded-2xl shadow-lg shadow-[#022B3A]/10">
                    <span class="text-[32px] font-black leading-none block mb-1">{{ totalAlumnes }}</span>
                    <span class="text-[9px] font-bold uppercase tracking-widest opacity-60">Alumnes totals</span>
                  </div>
                  <div class="bg-[#E1E5F2]/30 border border-[#BFDBF7]/40 p-6 rounded-2xl">
                    <span class="text-[32px] font-black leading-none block mb-1 text-[#022B3A]">{{ compteGrups }}</span>
                    <span class="text-[9px] font-bold uppercase tracking-widest text-[#022B3A]/40">Grups actius</span>
                  </div>
                </div>

                <!-- Groups List -->
                <div class="space-y-3">
                  <div 
                    v-for="(grup, index) in llistaGrups" 
                    :key="'grup-'+index" 
                    class="bg-[#F8FAFC] border-l-4 border-[#64748B] border-y border-r border-[#E1E5F2] p-5 rounded-xl flex items-center gap-4"
                  >
                    <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg shadow-sm">👥</div>
                    <div>
                      <p class="text-sm font-black text-[#022B3A] tracking-tight">Grup de {{ grup.nom }}</p>
                      <p class="text-[10px] font-bold text-[#022B3A]/40 uppercase tracking-widest">{{ grup.n_alumnes }} alumnes • {{ grup.taller }}</p>
                    </div>
                  </div>
                  <div v-if="llistaGrupsLength === 0" class="p-8 text-center text-[#022B3A]/30 italic text-xs">
                    No hi ha grups assignats actualment.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- COMUNS SUB-MODAL LOGIC (Simplified as overlay within main modal) -->
      <div v-if="showCommentsModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#022B3A]/60 backdrop-blur-md" @click.self="closeCommentsModal">
        <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div class="px-6 py-4 bg-[#E1E5F2]/20 border-b border-[#BFDBF7]/40 flex items-center justify-between">
            <h4 class="text-sm font-black text-[#022B3A] uppercase tracking-widest">Comentaris: {{ selectedTallerName }}</h4>
            <button @click="closeCommentsModal" class="p-1 hover:bg-white rounded-lg transition-colors"><X :size="18" /></button>
          </div>
          <div class="p-6 max-h-[50vh] overflow-y-auto">
            <ul v-if="selectedTallerComments.length > 0" class="space-y-3">
              <li v-for="(comment, idx) in selectedTallerComments" :key="idx" class="p-4 bg-[#F8FAFC] border-l-4 border-[#3b82f6] rounded-r-xl text-xs font-medium italic text-[#475569] leading-relaxed">
                "{{ comment }}"
              </li>
            </ul>
            <div v-else class="text-center py-10 text-[#022B3A]/30 font-bold italic text-xs uppercase tracking-widest">
              No hi ha comentaris registrats.
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
// ======================================
// Importem les dependències
// ======================================
import { 
  Building2, 
  MapPin, 
  X, 
  ClipboardList, 
  Users, 
  LayoutGrid, 
  ChevronRight,
  ChevronLeft
} from 'lucide-vue-next';

// ======================================
// Definició de l'Esquema
// ======================================

// 1. Propietats que rep el component
const props = defineProps({
  centreId: { type: [Number, String], required: true }
});

// 2. Esdeveniments que emet el component
const emit = defineEmits(['close']);

// 3. Estat local per a la navegació de pestanyes
const activeTab = ref('info');

// 4. Estat local per als comentaris i sub-modal
const usersComments = ref([]);
const showCommentsModal = ref(false);
const selectedTallerName = ref("");
const selectedTallerComments = ref([]);

// 5. Autenticació
const tokenCookie = useCookie('authToken');
const tokenValue = tokenCookie.value;

// 6. Carreguem les dades del centre (sense desestructuració)
const resultatRespuesta = await useFetch('/api/admin/centres/' + props.centreId, {
  headers: tokenValue ? { Authorization: 'Bearer ' + tokenValue } : {},
  key: 'modal-centre-' + props.centreId
});

const centreRaw = resultatRespuesta.data;
const pendent = resultatRespuesta.pending;

// 7. Propietat computada per accedir a les dades reactives del centre
const centre = computed(function () {
   return centreRaw.value;
});

// ======================================
// Propietats Computades (Mètriques i Llistes)
// ======================================

// 1. Número total de tallers assignats
const compteTallers = computed(function () {
  let total = 0;
  if (centre.value) {
    if (centre.value.tallers) {
      total = centre.value.tallers.length;
    }
  }
  return total;
});

// 2. Llista de professors del centre
const llistaProfessors = computed(function () {
  let professors = [];
  if (centre.value) {
    if (centre.value.professors) {
      professors = centre.value.professors;
    }
  }
  return professors;
});

// 3. Longitud de la llista de professors
const llistaProfessorsLength = computed(function () {
  return llistaProfessors.value.length;
});

// 4. Llista de grups de risc / responsables
const llistaGrups = computed(function () {
  let grups = [];
  if (centre.value) {
    if (centre.value.responsables_grups) {
      grups = centre.value.responsables_grups;
    }
  }
  return grups;
});

// 5. Longitud de la llista de grups
const llistaGrupsLength = computed(function () {
  return llistaGrups.value.length;
});

// 6. Número total de grups assignats
const compteGrups = computed(function () {
  return llistaGrups.value.length;
});

// 7. Càlcul total d'alumnes sumant els participants de cada grup
const totalAlumnes = computed(function () {
  const grups = llistaGrups.value;
  let suma = 0;
  for (let i = 0; i < grups.length; i++) {
    const g = grups[i];
    if (g.n_alumnes) {
      suma = suma + g.n_alumnes;
    }
  }
  return suma;
});

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Càrrega de comentaris dels tallers ---
async function fetchComments() {
  const idC = props.centreId;
  const tkn = tokenValue;
  try {
    const capçaleres = {};
    if (tkn) {
      capçaleres.Authorization = 'Bearer ' + tkn;
    }

    const dadesAPI = await $fetch('/api/admin/centres/' + idC + '/comments', {
       headers: capçaleres
    });
    
    if (dadesAPI) {
      usersComments.value = dadesAPI;
    } else {
      usersComments.value = [];
    }
    
  } catch (errComm) {
    console.error("Error carregant comentaris:", errComm);
  }
}

// B) --- Obrir sub-modal de comentaris per a un taller ---
function openComments(taller) {
  if (!taller) {
    return;
  }
  
  selectedTallerName.value = taller.titol;
  
  // Filtrem comentaris manualment (sense .filter ni .map)
  const llistaTots = usersComments.value;
  const comentarisFiltrats = [];
  
  for (let j = 0; j < llistaTots.length; j++) {
    const c = llistaTots[j];
    let coincideix = false;
    if (c.taller_detall_id === taller.id) {
       coincideix = true;
    } else if (c.nom_taller === taller.titol) {
       coincideix = true;
    }
    
    if (coincideix === true) {
      if (c.comentarios) {
        comentarisFiltrats.push(c.comentarios);
      }
    }
  }
  
  selectedTallerComments.value = comentarisFiltrats;
  showCommentsModal.value = true;
}

// C) --- Tancar sub-modal de comentaris ---
function closeCommentsModal() {
  showCommentsModal.value = false;
  selectedTallerName.value = "";
  selectedTallerComments.value = [];
}

// D) --- Obtenir les inicials d'una persona ---
function getInitials(nom, cognom) {
  let initials = '';
  if (nom) {
    initials = initials + nom.charAt(0);
  }
  if (cognom) {
    initials = initials + cognom.charAt(0);
  }
  
  let resultat = '??';
  if (initials.length > 0) {
    resultat = initials.toUpperCase();
  }
  return resultat;
}

// E) --- Ganxo de muntatge per disparar accions inicials ---
onMounted(function () {
  fetchComments();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from { opacity: 0; transform: translateY(10px); }
.fade-leave-to { opacity: 0; transform: translateY(-10px); }

/* Custom scrollbar for content */
.max-h-\[90vh\] {
  scrollbar-width: thin;
  scrollbar-color: #BFDBF7 transparent;
}

.max-h-\[90vh\]::-webkit-scrollbar {
  width: 6px;
}

.max-h-\[90vh\]::-webkit-scrollbar-track {
  background: transparent;
}

.max-h-\[90vh\]::-webkit-scrollbar-thumb {
  background-color: #BFDBF7;
  border-radius: 20px;
}
</style>
