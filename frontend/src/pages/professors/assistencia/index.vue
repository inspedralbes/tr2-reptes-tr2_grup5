<script setup>
import { ref, computed } from 'vue';
import { 
  Search, 
  Filter, 
  Clock, 
  MapPin, 
  User, 
  ClipboardCheck, 
  ChevronRight 
} from 'lucide-vue-next';

// ======================================
// Importacions i Composables
// ======================================
const header = useHeaderStore();
header.setHeaderProfessors();
const router = useRouter();
const token = useCookie('authToken').value;

// --- STATE ---
const searchQuery = ref('');

// --- FETCH DATA ---
const { data: tallersRaw, pending, error } = await useFetch('/api/professor/tallers', {
  headers: token ? { Authorization: 'Bearer ' + token } : {},
  key: 'professor-tallers-attendance-secure'
});

// Dades base sempre inicialitzades de forma segura
const tallers = computed(() => {
  return (tallersRaw && tallersRaw.value) ? tallersRaw.value : [];
});

// Llista de tallers on l'usuari és referent (canTakeAttendance)
const referentTallers = computed(() => {
  const list = tallers.value;
  if (!Array.isArray(list)) return [];
  return list.filter(t => t && t.permissions && t.permissions.canTakeAttendance);
});

// Mapping API -> High Fidelity UI for Attendance Sessions
const filteredSessions = computed(() => {
  const query = (searchQuery.value || '').toLowerCase();
  const baseList = referentTallers.value || [];
  
  return baseList
    .filter(t => {
      if (!t) return false;
      const titol = (t.titol || '').toLowerCase();
      const municipi = (t.municipi || '').toLowerCase();
      return titol.includes(query) || municipi.includes(query);
    })
    .map(t => ({
      id: t.detall_id || t.id,
      title: t.titol || 'Taller',
      project: t.sector || 'PROJECTE',
      date: 'Pendent de sessió',
      location: t.ubicacio || t.municipi || 'No especificada',
      trimestre: t.trimestre || '1r',
      docent: t.docent_nom || 'Pendent'
    }));
});

// --- METHODS ---
const getProjectStyles = (project) => {
  if (!project) return 'bg-white/40 text-[#022B3A] border-white/60';
  const p = project.toUpperCase();
  if (p.includes('A') || p.includes('MANUF')) return 'bg-[#FFF0EB] text-[#FB6107] border-[#FB6107]/20';
  if (p.includes('B') || p.includes('ENER')) return 'bg-[#F0F7E9] text-[#7CB518] border-[#7CB518]/20';
  if (p.includes('C') || p.includes('AGRO')) return 'bg-[#FFF7E6] text-[#FBB02D] border-[#FBB02D]/20';
  return 'bg-white/40 text-[#022B3A] border-white/60';
};

const goToAssistencia = (id) => {
  if (id) {
    router.push('/professors/assistencia/' + id);
  }
};

const missatgeError = computed(() => {
  return (error && error.value && error.value.message) ? error.value.message : 'Error de connexió';
});
</script>

<template>
  <div class="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
    
    <!-- 1. HEADER & CONTROLS -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <h1 class="text-4xl md:text-5xl font-black text-[#022B3A] tracking-tighter leading-none mb-3">
          Control d'<span class="text-[#1F7A8C]">Assistència</span>
        </h1>
        <p class="text-[#022B3A]/40 text-[10px] font-black uppercase tracking-[0.2em]">
          Verifica l'assistència dels tallers on ets referent.
        </p>
      </div>

      <!-- Search & Filter Capsule -->
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

    <!-- State Handlers -->
    <div v-if="error" class="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 text-sm italic">
        {{ missatgeError }}
    </div>

    <div v-if="pending" class="p-20 text-center text-[#022B3A]/40 font-bold uppercase tracking-widest text-xs">
        Carregant sessions d'assistència...
    </div>

    <!-- 2. DATA TABLE CARD -->
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
            <template v-if="(filteredSessions || []).length > 0">
                <tr v-for="session in (filteredSessions || [])" :key="session.id" class="group hover:bg-[#E1E5F2]/5 transition-colors">
                  
                  <!-- TALLER / PROJECTE / ID -->
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

                  <!-- UBICACIÓ -->
                  <td class="p-5">
                     <div class="flex items-center gap-2 text-[#022B3A]/60">
                        <MapPin :size="14" />
                        <span class="text-[11px] font-bold">{{ session.location }}</span>
                     </div>
                  </td>

                  <!-- TRIMESTRE -->
                  <td class="p-5">
                     <span class="bg-[#F4F7FB] text-[#8E9AAF] text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border border-[#E1E5F2]/40">
                        {{ session.trimestre }}
                     </span>
                  </td>

                  <!-- DOCENT -->
                  <td class="p-5">
                     <div class="flex items-center gap-2">
                        <div :class="['w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold', session.docent === 'Pendent' ? 'bg-amber-100 text-amber-600' : 'bg-[#1F7A8C]/10 text-[#1F7A8C]']">
                           <User :size="12" />
                        </div>
                        <span :class="['text-[11px] font-bold', session.docent === 'Pendent' ? 'text-amber-600 italic' : 'text-[#022B3A]']">
                           {{ session.docent }}
                        </span>
                     </div>
                  </td>

                  <!-- ACCIONS -->
                  <td class="p-5 pr-8 text-right">
                     <button 
                       @click="goToAssistencia(session.id)"
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

      <!-- Footer / Pagination placeholder -->
      <div v-if="(filteredSessions || []).length > 0" class="p-4 bg-[#E1E5F2]/10 border-t border-[#BFDBF7]/20 flex justify-between items-center px-8">
         <span class="text-[10px] font-bold text-[#022B3A]/30 uppercase tracking-widest">Mostrant {{ (filteredSessions || []).length }} sessions</span>
         <div class="flex gap-2">
            <button class="p-2 rounded-lg text-[#022B3A]/20 hover:bg-[#E1E5F2] hover:text-[#022B3A] transition-colors disabled:opacity-50">
               <ChevronRight :size="16" class="rotate-180" />
            </button>
            <button class="p-2 rounded-lg text-[#022B3A]/20 hover:bg-[#E1E5F2] hover:text-[#022B3A] transition-colors">
               <ChevronRight :size="16" />
            </button>
         </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Tailwind handles the design */
</style>
