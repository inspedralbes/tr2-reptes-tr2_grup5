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

const props = defineProps({
  centreId: { type: [Number, String], required: true }
});

const emit = defineEmits(['close']);

const activeTab = ref('info');
const token = useCookie('authToken').value;

// FETCH DATA
const { data: centreRaw, pending: pendent } = await useFetch(`/api/admin/centres/${props.centreId}`, {
  headers: token ? { Authorization: 'Bearer ' + token } : {},
  key: `modal-centre-${props.centreId}`
});

const centre = computed(() => centreRaw.value);

// COMPLEMENTARY DATA FETCHING (COMMENTS)
const usersComments = ref([]);
const showCommentsModal = ref(false);
const selectedTallerName = ref("");
const selectedTallerComments = ref([]);

const fetchComments = async () => {
  try {
    const data = await $fetch(`/api/admin/centres/${props.centreId}/comments`, {
       headers: token ? { Authorization: 'Bearer ' + token } : {}
    });
    usersComments.value = data || [];
  } catch (e) {
    console.error("Error carregant comentaris:", e);
  }
};

onMounted(() => {
  fetchComments();
});

// COMPUTED WRAPPERS
const compteTallers = computed(() => centre.value?.tallers?.length || 0);
const llistaProfessors = computed(() => centre.value?.professors || []);
const llistaProfessorsLength = computed(() => llistaProfessors.value.length);
const llistaGrups = computed(() => centre.value?.responsables_grups || []);
const llistaGrupsLength = computed(() => llistaGrups.value.length);
const compteGrups = computed(() => llistaGrups.value.length);

const totalAlumnes = computed(() => {
  const grups = llistaGrups.value;
  return grups.reduce((acc, g) => acc + (g.n_alumnes || 0), 0);
});

// FUNCTIONS
function openComments(taller) {
  if (!taller) return;
  selectedTallerName.value = taller.titol;
  const commentsForThisTaller = usersComments.value.filter(c => 
    c.taller_detall_id === taller.id || c.nom_taller === taller.titol
  );
  selectedTallerComments.value = commentsForThisTaller.map(c => c.comentarios);
  showCommentsModal.value = true;
}

function closeCommentsModal() {
  showCommentsModal.value = false;
  selectedTallerName.value = "";
  selectedTallerComments.value = [];
}

function getInitials(nom, cognom) {
  const n = (nom || '').charAt(0);
  const c = (cognom || '').charAt(0);
  return (n + c).toUpperCase() || '??';
}
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
