<script setup>
import { ref, computed, watch } from 'vue';
import { 
  Search, 
  CheckCircle2, 
  BarChart3, 
  Save, 
  GraduationCap,
  ChevronRight,
  User,
  MessageSquare
} from 'lucide-vue-next';

// ======================================
// Importacions i Composables
// ======================================
const header = useHeaderStore();
header.setHeaderProfessors();
const token = useCookie('authToken').value;

// --- STATE ---
const searchQuery = ref('');
const selectedWorkshopId = ref(null);
const students = ref([]);
const loadingStudents = ref(false);
const savingStatus = ref({}); // { [studentId]: boolean }
const itemsPerPage = 10;
const currentPageWorkshops = ref(1);
const currentPageStudents = ref(1);

// --- FETCH DATA (Workshops) ---
const { data: tallersRaw, pending: loadingWorkshops, error: workshopError } = await useFetch('/api/professor/tallers', {
  headers: token ? { Authorization: 'Bearer ' + token } : {},
  key: 'professor-tallers-evaluations'
});

const allTallers = computed(() => tallersRaw.value || []);

// Filtrem només els que pot gestionar
const assignedTallers = computed(() => {
  if (!Array.isArray(allTallers.value)) return [];
  return allTallers.value.filter(t => t && t.permissions && t.permissions.canManageList);
});

// Mapping filtrat per la UI (Left Column)
const filteredWorkshops = computed(() => {
  const query = (searchQuery.value || '').toLowerCase();
  const list = assignedTallers.value || [];
  
  return list
    .filter(t => {
      const titol = (t.titol || '').toLowerCase();
      const municipi = (t.municipi || '').toLowerCase();
      return titol.includes(query) || municipi.includes(query);
    })
    .map(t => ({
      id: t.detall_id,
      title: t.titol || 'Taller',
      project: t.sector || 'PROJECTE',
      group: t.municipi || 'Grup General',
      trimestre: t.trimestre || '1r',
      evaluatedStudents: 0, 
      totalStudents: t.places_maximes || 12
    }));
});

const selectedWorkshop = computed(() => {
  return filteredWorkshops.value.find(w => w.id === selectedWorkshopId.value);
});

const totalPagesWorkshops = computed(() => Math.max(1, Math.ceil((filteredWorkshops.value || []).length / itemsPerPage)));
const paginatedWorkshops = computed(() => {
  const list = filteredWorkshops.value || [];
  const start = (currentPageWorkshops.value - 1) * itemsPerPage;
  return list.slice(start, start + itemsPerPage);
});
function goToPageWorkshops(p) { if (p >= 1 && p <= totalPagesWorkshops.value) currentPageWorkshops.value = p; }

const totalPagesStudents = computed(() => Math.max(1, Math.ceil((students.value || []).length / itemsPerPage)));
const paginatedStudents = computed(() => {
  const list = students.value || [];
  const start = (currentPageStudents.value - 1) * itemsPerPage;
  return list.slice(start, start + itemsPerPage);
});
function goToPageStudents(p) { if (p >= 1 && p <= totalPagesStudents.value) currentPageStudents.value = p; }

// --- METHODS ---
const fetchStudents = async (detallId) => {
    if (!detallId) return;
    loadingStudents.value = true;
    try {
        const data = await $fetch(`/api/professor/tallers/${detallId}/alumnes`, {
           headers: { Authorization: `Bearer ${token}` } 
        });
        // Adaptem els camps per la UI
        students.value = (data || []).map(s => ({
            id: s.id,
            name: `${s.nom} ${s.cognoms}`,
            avatar: (s.nom ? s.nom[0] : '?') + (s.cognoms ? s.cognoms[0] : ''),
            email: s.email,
            status: (s.ha_avaluat || s.comentarios) ? 'done' : 'pending',
            techScore: s.nota_tecnica || 0,
            softScore: s.nota_actitud || 0,
            comment: s.comentarios || ''
        }));
    } catch (err) {
        console.error("Error carregant alumnes:", err);
        students.value = [];
    } finally {
        loadingStudents.value = false;
    }
};

const handleUpdateScore = (studentId, field, value) => {
    const student = students.value.find(s => s.id === studentId);
    if (student) {
        student[field] = value;
    }
};

const saveEvaluation = async (studentId) => {
    const student = students.value.find(s => s.id === studentId);
    if (!student || !selectedWorkshopId.value) return;

    savingStatus.value[studentId] = true;
    try {
        await $fetch(`/api/professor/tallers/${selectedWorkshopId.value}/alumnes/${studentId}/avaluacio`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: { 
                comentarios: student.comment 
            }
        });
        student.status = 'done';
    } catch (err) {
        console.error("Error guardant avaluació:", err);
        useSwal().fire({ title: 'Error', text: "No s'ha pogut guardar l'avaluació de " + student.name, icon: 'error' });
    } finally {
        savingStatus.value[studentId] = false;
    }
};

const getProjectStyles = (project) => {
  if (!project) return 'bg-white/40 text-[#022B3A] border-white/60';
  const p = project.toUpperCase();
  if (p.includes('A') || p.includes('MANUF')) return 'bg-[#FFF0EB] text-[#FB6107] border-[#FB6107]/20';
  if (p.includes('B') || p.includes('ENER')) return 'bg-[#F0F7E9] text-[#7CB518] border-[#7CB518]/20';
  if (p.includes('C') || p.includes('AGRO')) return 'bg-[#FFF7E6] text-[#FBB02D] border-[#FBB02D]/20';
  return 'bg-white/40 text-[#022B3A] border-white/60';
};

// Observar canvis en el taller seleccionat
watch(selectedWorkshopId, (newId) => {
    if (newId) { fetchStudents(newId); currentPageStudents.value = 1; }
});
watch(searchQuery, () => { currentPageWorkshops.value = 1; });
</script>

<template>
  <div class="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-160px)] flex flex-col">
    
    <!-- HEADER -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 flex-shrink-0">
      <div>
        <h1 class="text-4xl md:text-5xl font-black text-[#022B3A] tracking-tighter leading-none mb-3">
          Avaluacions de <span class="text-[#1F7A8C]">Tallers</span>
        </h1>
        <p class="text-[#022B3A]/40 text-[10px] font-black uppercase tracking-[0.2em]">
          Qualifica les competències tècniques i actitudinals dels alumnes.
        </p>
      </div>
    </div>

    <!-- MAIN CONTENT SPLIT -->
    <div class="flex-1 flex gap-8 overflow-hidden">
      
      <!-- LEFT COLUMN: WORKSHOP LIST -->
      <aside class="w-1/3 flex flex-col gap-4 min-w-[340px]">
        
        <!-- Search -->
        <div class="bg-white p-1.5 rounded-2xl border border-[#BFDBF7]/60 shadow-sm flex items-center gap-2">
          <div class="relative flex-1 group">
              <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
              <input 
                type="text" 
                v-model="searchQuery"
                placeholder="Cercar taller per títol o municipi..."
                class="w-full md:w-auto flex-1 bg-[#E1E5F2]/10 border border-transparent rounded-xl pl-9 pr-4 py-2.5 text-[11px] font-bold focus:bg-white focus:ring-2 focus:ring-[#1F7A8C]/20 outline-none transition-all placeholder:text-[#022B3A]/20 text-[#022B3A]"
              />
          </div>
        </div>

        <!-- List -->
        <div class="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          <div v-if="loadingWorkshops" class="p-8 text-center text-[#022B3A]/20 italic text-xs uppercase font-bold tracking-widest animate-pulse">Carregant tallers...</div>
          
          <template v-else-if="filteredWorkshops.length > 0">
            <div 
              v-for="workshop in paginatedWorkshops" 
              :key="workshop.id"
              @click="selectedWorkshopId = workshop.id"
              :class="[
                'p-5 rounded-2xl border cursor-pointer transition-all duration-300 group relative overflow-hidden',
                selectedWorkshopId === workshop.id 
                  ? 'bg-white border-[#1F7A8C] shadow-lg shadow-[#1F7A8C]/10 scale-[1.02]' 
                  : 'bg-white border-[#BFDBF7]/40 hover:border-[#1F7A8C]/50 hover:shadow-md'
              ]"
            >
              <!-- Status Indicator Stripe -->
              <div :class="['absolute left-0 top-0 bottom-0 w-1.5 transition-colors', selectedWorkshopId === workshop.id ? 'bg-[#1F7A8C]' : 'bg-transparent group-hover:bg-[#1F7A8C]/30']"></div>

              <div class="flex justify-between items-start mb-2 pl-2">
                <span :class="['px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border', getProjectStyles(workshop.project)]">
                    {{ workshop.project }}
                </span>
                <div v-if="workshop.evaluatedStudents === workshop.totalStudents" class="text-[#7CB518] bg-[#7CB518]/10 p-1 rounded-full">
                  <CheckCircle2 :size="12" />
                </div>
              </div>

              <div class="pl-2">
                <h3 :class="['text-base font-black mb-1 leading-tight', selectedWorkshopId === workshop.id ? 'text-[#1F7A8C]' : 'text-[#022B3A]']">
                  {{ workshop.title }}
                </h3>
                <p class="text-[10px] text-[#022B3A]/40 font-bold uppercase tracking-wider mb-4">
                  {{ workshop.group }} · {{ workshop.trimestre }} Trimestre
                </p>
                
                <!-- Progress Bar Placeholder -->
                <div class="flex items-center justify-between text-[9px] font-bold text-[#022B3A]/40 mb-1.5">
                   <span>Resum Avaluació</span>
                   <span class="text-[#022B3A]/20">Ref: {{ workshop.id }}</span>
                </div>
                <div class="h-1 w-full bg-[#E1E5F2] rounded-full overflow-hidden">
                   <div class="h-full bg-[#022B3A]/20 w-1/3"></div>
                </div>
              </div>
            </div>
          </template>
          
          <div v-else class="p-12 text-center border-2 border-dashed border-[#E1E5F2] rounded-3xl text-[#022B3A]/20 text-xs font-bold uppercase tracking-widest">
             No hi ha tallers per avaluar
          </div>
        </div>
        <div v-if="filteredWorkshops.length > 0" class="flex-shrink-0 pt-3 flex justify-center">
          <Pagination :current-page="currentPageWorkshops" :total-pages="totalPagesWorkshops" @go-to-page="goToPageWorkshops" />
        </div>
      </aside>

      <!-- RIGHT COLUMN: EVALUATION FORM -->
      <main class="flex-1 bg-white rounded-3xl border border-[#BFDBF7]/60 shadow-sm overflow-hidden flex flex-col relative">
        
        <template v-if="selectedWorkshop">
          <!-- Context Header -->
          <div class="p-8 border-b border-[#BFDBF7]/20 bg-[#E1E5F2]/5 flex justify-between items-center">
             <div class="flex items-center gap-5">
                <div class="w-12 h-12 rounded-2xl bg-[#022B3A] text-white flex items-center justify-center shadow-lg shadow-[#022B3A]/10">
                   <BarChart3 :size="24" />
                </div>
                <div>
                   <h2 class="text-xl font-black text-[#022B3A] leading-none mb-1.5">{{ selectedWorkshop.title }}</h2>
                   <p class="text-[10px] font-bold text-[#022B3A]/40 uppercase tracking-widest flex items-center gap-2">
                       Avaluant alumnes inscrits <ChevronRight :size="10" /> {{ selectedWorkshop.group }}
                   </p>
                </div>
             </div>
             <div class="bg-[#1F7A8C]/5 px-4 py-2 rounded-xl border border-[#1F7A8C]/10">
                <span class="text-[10px] font-black text-[#1F7A8C] uppercase tracking-[0.2em]">Sessió de Qualificació</span>
             </div>
          </div>

          <!-- Students List Area -->
          <div class="flex-1 overflow-y-auto p-8 bg-[#F9FAFC] custom-scrollbar">
             
             <div v-if="loadingStudents" class="h-full flex items-center justify-center">
                <div class="text-center space-y-4">
                   <div class="w-12 h-12 border-4 border-[#1F7A8C]/20 border-t-[#1F7A8C] rounded-full animate-spin mx-auto"></div>
                   <p class="text-[10px] font-black text-[#022B3A]/40 uppercase tracking-widest">Recuperant llistat d'alumnes...</p>
                </div>
             </div>

             <div v-else-if="students.length > 0" class="grid grid-cols-1 gap-6">
                <div 
                  v-for="student in paginatedStudents" 
                  :key="student.id"
                  :class="[
                    'bg-white rounded-2xl border transition-all duration-300 relative overflow-hidden',
                    student.status === 'done' ? 'border-[#7CB518]/30 shadow-sm' : 'border-[#BFDBF7]/40 shadow-sm hover:shadow-lg'
                  ]"
                >
                   <!-- Success Indicator Pill -->
                   <div v-if="student.status === 'done'" class="absolute -right-8 -top-8 w-16 h-16 bg-[#7CB518]/10 rounded-full flex items-center justify-center pt-8 pr-8 text-[#7CB518]">
                      <CheckCircle2 :size="14" />
                   </div>

                   <!-- Card Content -->
                   <div class="p-6 flex flex-col lg:flex-row lg:items-center gap-8">
                      
                      <!-- Student Identity -->
                      <div class="flex items-center gap-5 min-w-[240px]">
                         <div :class="[
                           'w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm border shadow-inner transition-colors',
                           student.status === 'done' ? 'bg-[#7CB518]/10 text-[#7CB518] border-[#7CB518]/20' : 'bg-[#E1E5F2]/20 text-[#022B3A]/60 border-[#BFDBF7]/20'
                         ]">
                            {{ student.avatar }}
                         </div>
                         <div class="space-y-0.5">
                            <h4 class="text-base font-black text-[#022B3A]">{{ student.name }}</h4>
                            <div class="flex items-center gap-2">
                               <div :class="['w-2 h-2 rounded-full', student.status === 'done' ? 'bg-[#7CB518]' : 'bg-[#FBB02D] animate-pulse']"></div>
                               <span class="text-[9px] font-black text-[#022B3A]/30 uppercase tracking-[0.15em]">
                                 {{ student.status === 'done' ? 'Avaluat' : 'Pendent de qualificació' }}
                               </span>
                            </div>
                         </div>
                      </div>

                      <div class="hidden lg:block w-px h-12 bg-[#BFDBF7]/20"></div>

                      <!-- Inputs Container -->
                      <div class="flex-1 flex flex-col md:flex-row md:items-center gap-8">
                         
                         <!-- Observations (Expanded) -->
                         <div class="flex-1 relative group">
                            <label class="text-[9px] font-black text-[#022B3A]/40 uppercase tracking-widest mb-2 block">Observacions sobre l'alumne</label>
                            <div class="relative">
                                <MessageSquare :size="14" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#022B3A]/20 transition-colors group-focus-within:text-[#1F7A8C]" />
                                <input 
                                  type="text" 
                                  placeholder="Escriu aquí les teves observacions o feedback..."
                                  :value="student.comment"
                                  @input="(e) => handleUpdateScore(student.id, 'comment', e.target.value)"
                                  class="w-full bg-[#E1E5F2]/20 border border-[#BFDBF7]/40 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold focus:bg-white focus:border-[#1F7A8C] focus:ring-8 focus:ring-[#1F7A8C]/5 outline-none transition-all placeholder:text-[#022B3A]/20 text-[#022B3A]"
                                />
                            </div>
                         </div>

                         <!-- Save Action -->
                         <div class="flex items-end md:items-center">
                            <button 
                              @click="saveEvaluation(student.id)"
                              :disabled="savingStatus[student.id]"
                              :class="[
                                'px-6 py-3.5 rounded-2xl transition-all flex items-center gap-3 border shadow-sm font-black text-[10px] uppercase tracking-widest',
                                student.status === 'done' 
                                  ? 'bg-[#7CB518] text-white border-[#7CB518]/20 shadow-[#7CB518]/20 hover:bg-[#689914]' 
                                  : 'bg-white text-[#BFDBF7] border-[#BFDBF7]/60 hover:text-[#1F7A8C] hover:border-[#1F7A8C]'
                              ]"
                            >
                               <Save v-if="!savingStatus[student.id]" :size="16" />
                               <div v-else class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                               {{ student.status === 'done' ? 'Actualitzar' : 'Guardar' }}
                            </button>
                         </div>

                      </div>
                   </div>
                </div>
             </div>
             
             <div v-else class="h-full flex flex-col items-center justify-center text-center opacity-30">
                <User :size="48" :strokeWidth="1.5" />
                <p class="text-sm font-black uppercase mt-4 tracking-widest">No hi ha alumnes en aquest taller</p>
             </div>
          </div>

          <!-- Final Action Bar -->
          <div v-if="!loadingStudents && students.length > 0" class="p-6 bg-white border-t border-[#BFDBF7]/20 flex justify-between items-center flex-wrap gap-4">
             <Pagination :current-page="currentPageStudents" :total-pages="totalPagesStudents" @go-to-page="goToPageStudents" />
             <div class="text-[9px] font-black text-[#022B3A]/30 uppercase tracking-[0.2em] flex items-center gap-4">
                Els canvis es guarden per alumne individualment
                <div class="h-4 w-px bg-[#BFDBF7]/40"></div>
                Total Alumnes: {{ students.length }}
             </div>
          </div>
        </template>

        <!-- EMPTY STATE -->
        <template v-else>
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-12 bg-white">
             <div class="w-32 h-32 bg-[#E1E5F2]/40 rounded-[2.5rem] flex items-center justify-center mb-8 text-[#022B3A]/10 animate-pulse transition-transform hover:scale-105 duration-700">
                <GraduationCap :size="64" :strokeWidth="1" />
             </div>
             <h3 class="text-3xl font-black text-[#022B3A] mb-4 tracking-tight">Cap Taller Seleccionat</h3>
             <p class="text-[#022B3A]/40 text-sm font-medium max-w-sm leading-relaxed mb-8">
                Tria un taller del llistat lateral per començar a qualificar les competències tècniques i transversals de l'alumnat.
             </p>
             <div class="flex items-center gap-3 bg-[#E1E5F2]/20 px-5 py-2.5 rounded-2xl border border-[#E1E5F2]/40">
                <BarChart3 :size="16" class="text-[#1F7A8C]" />
                <span class="text-[10px] font-black text-[#022B3A]/40 uppercase tracking-widest">Mòdul d'Avaluació Docent</span>
             </div>
          </div>
        </template>

      </main>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #E1E5F2;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #BFDBF7;
}

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
