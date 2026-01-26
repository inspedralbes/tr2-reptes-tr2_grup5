<template>
  <div class="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[80vh]">
    
    <!-- HEADER -->
    <div class="mb-8">
      <h1 class="text-4xl md:text-5xl font-black text-[#022B3A] tracking-tighter leading-none mb-3">
        Les meves <span class="text-[#1F7A8C]">Assignacions</span>
      </h1>
      <p class="text-[#022B3A]/40 text-[10px] font-black uppercase tracking-[0.2em]">
        Tallers confirmats i acceptats per al teu centre.
      </p>
    </div>

    <!-- ESTADO 1: LISTADO DE TARJETAS (SI HAY DATOS) -->
    <div v-if="assignments.length > 0" class="space-y-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      
      <div 
        v-for="assign in paginatedAssignments" 
        :key="assign.id" 
        class="bg-white rounded-2xl border border-[#E1E5F2] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col overflow-hidden"
      >
        <!-- 1. Header Badges -->
        <div class="px-6 pt-6 pb-4 flex justify-between items-start">
           <span :class="['px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border', getProjectStyles(assign.projectLetter)]">
              Projecte {{ assign.projectLetter }}
           </span>
           <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8FAFC] border border-[#E1E5F2]">
              <div class="w-1.5 h-1.5 rounded-full bg-[#022B3A]"></div>
              <span class="text-[9px] font-black text-[#64748B] uppercase tracking-wider">{{ assign.trimestre }}</span>
           </div>
        </div>

        <!-- 2. Content -->
        <div class="px-6 flex-1 flex flex-col">
           <div class="mb-6">
             <h3 class="text-xl font-black text-[#022B3A] leading-tight mb-2 tracking-tight">
               {{ assign.projectTitle }}
             </h3>
             <div class="flex items-center gap-2 text-[#8E9AAF] text-xs font-bold uppercase tracking-wider">
               <MapPin :size="14" />
               {{ assign.location }}
             </div>
           </div>
           
           <!-- Metadata Rows -->
           <div class="space-y-3 mb-6 mt-auto">
              <div class="flex items-center justify-between">
                <span class="text-[9px] font-black text-[#B8C0CC] uppercase tracking-widest flex items-center gap-2">
                  <Users :size="14" /> PARTICIPANTS
                </span>
                <span class="text-xs font-bold text-[#022B3A]">{{ assign.participants }} alumnes</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[9px] font-black text-[#B8C0CC] uppercase tracking-widest flex items-center gap-2">
                  <CalendarDays :size="14" /> DATA TALLER
                </span>
                <span class="text-xs font-bold text-[#022B3A]">{{ assign.executionDate }}</span>
              </div>
              <div class="w-full h-px bg-gradient-to-r from-[#F1F4F9] to-transparent"></div>
              <div class="flex items-center justify-between">
                <span class="text-[9px] font-black text-[#B8C0CC] uppercase tracking-widest flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-graduation-cap"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                  DOCENT
                </span>
                <div class="text-right">
                  <span class="text-xs font-bold text-[#022B3A] block">{{ assign.docentName }}</span>
                  <span class="text-[9px] font-medium text-[#1F7A8C] block" v-if="assign.docentEmail !== '—'">{{ assign.docentEmail }}</span>
                </div>
              </div>
           </div>
        </div>

        <!-- 3. Footer Actions -->
        <div class="px-6 py-4 bg-[#F9FAFC] border-t border-[#F1F4F9] flex items-center justify-between mt-auto">
           <span class="text-[10px] font-black text-[#CBD5E1] tracking-widest uppercase">
              REF-{{ assign.id.toString().padStart(3, '0') }}
           </span>
           
           <button 
              @click="navigateToDetails(assign.id)"
              class="flex items-center gap-2 px-4 py-2 bg-white border border-[#E1E5F2] rounded-lg shadow-sm text-[10px] font-black text-[#022B3A] uppercase tracking-widest hover:border-[#1F7A8C] hover:text-[#1F7A8C] transition-all"
           >
              Veure Detalls <ChevronRight :size="14" />
           </button>
        </div>
      </div>

    </div>
    <div class="flex justify-center">
      <Pagination :current-page="currentPage" :total-pages="totalPages" @go-to-page="goToPage" />
    </div>
    </div>

    <!-- ESTADO 2: BUIT (SI NO HAY DATOS) - CAPTURA 1 -->
    <div v-else class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
        
        <!-- Icon Gradient Box -->
        <div class="w-24 h-24 bg-gradient-to-br from-indigo-100 to-blue-50 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
            <CalendarDays :size="40" class="text-[#6366f1]" stroke-width="1.5" />
        </div>

        <h2 class="text-3xl font-black text-[#022B3A] mb-3 tracking-tight">Encara no tens cap taller assignat</h2>
        
        <p class="text-[#64748B] text-center max-w-md font-medium leading-relaxed mb-10">
            Quan l'administració accepti les teves sol·licituds, els tallers confirmats apareixeran aquí.
        </p>

        <button 
            @click="navigateToRequests"
            class="bg-[#3B82F6] text-white px-8 py-4 rounded-xl font-bold text-sm shadow-xl shadow-blue-200 hover:bg-[#2563EB] hover:scale-105 transition-all flex items-center gap-2"
        >
            Anar a Sol·licituds
        </button>

    </div>

  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { MapPin, ChevronRight, CalendarDays, Users } from 'lucide-vue-next';

// ======================================
// Importacions i Composables
// ======================================
const header = useHeaderStore();
header.setHeaderCentres();
const router = useRouter();

function getProjectStyles(letter) {
  const l = (letter || '').toUpperCase();
  if (l.includes('A')) return 'bg-[#FFF0EB] text-[#FB6107] border-[#FB6107]/20';
  if (l.includes('B')) return 'bg-[#F0F7E9] text-[#7CB518] border-[#7CB518]/20';
  if (l.includes('C')) return 'bg-[#FFF7E6] text-[#FBB02D] border-[#FBB02D]/20';
  return 'bg-white/40 text-[#022B3A] border-white/60';
}

// ======================================
// Estat Reactiu i Data Fetching
// ======================================
const tokenCookie = useCookie('authToken');
const headers = { Authorization: tokenCookie.value ? 'Bearer ' + tokenCookie.value : '' };

// 1. Fetch Assignments
const { data: rawAssignments, pending, error, refresh } = await useFetch('/api/centre/assignacions', {
  headers,
  key: 'centre-assignacions'
});

// 2. Fetch Center Profile (for email display)
const { data: centreProfile } = await useFetch('/api/centre/perfil', {
  headers,
  key: 'centre-perfil-assign'
});

// ======================================
// Computed UI Data
// ======================================
const currentPage = ref(1);
const itemsPerPage = 10;

const totalPages = computed(() => Math.max(1, Math.ceil((assignments.value || []).length / itemsPerPage)));
const paginatedAssignments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return (assignments.value || []).slice(start, start + itemsPerPage);
});
function goToPage(p) { if (p >= 1 && p <= totalPages.value) currentPage.value = p; }

const assignments = computed(() => {
  const list = rawAssignments.value || [];
  const centerEmail = centreProfile.value?.email_oficial || '';

  return list.map(a => ({
    id: a.id,
    trimestre: a.trimestre + ' TRIMESTRE', // "1r TRIMESTRE"
    projectLetter: (a.modalitat || '?').charAt(0).toUpperCase(), // "A", "B", "C"
    projectTitle: a.titol,
    location: a.ubicacio || 'Ubicació per confirmar',
    executionDate: a.data_execucio ? new Date(a.data_execucio).toLocaleDateString('es-ES') : 'Data pendent',
    participants: a.num_participants || 0,
    docentName: a.docent_nom || 'Docent no assignat',
    docentEmail: a.docent_email || '—',
    centerEmail: centerEmail
  }));
});

// ======================================
// Navigation Actions
// ======================================
function navigateToDetails(id) {
  router.push(`/centres/assignacions/${id}`);
}

function navigateToRequests() {
  router.push('/centres/peticions');
}
</script>

<style scoped>
/* Tailwind handles the styling */
</style>