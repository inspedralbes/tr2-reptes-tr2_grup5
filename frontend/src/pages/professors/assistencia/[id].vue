<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  ArrowLeft,
  User,
  Mail,
  MapPin,
  Clock,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-vue-next';

// ======================================
// Importacions i Composables
// ======================================
const route = useRoute();
const router = useRouter();
const header = useHeaderStore();
header.setHeaderProfessors();
const token = useCookie('authToken').value;
const detallId = route.params.id;

// --- STATE ---
const loading = ref(true);
const error = ref(null);
const assistenciaList = ref([]);
const tallerInfo = ref(null);
const searchQuery = ref('');

// --- COMPUTED ---
const filteredStudents = computed(() => {
  const query = (searchQuery.value || '').toLowerCase();
  const list = assistenciaList.value || [];
  return list.filter(s => {
    const nom = (s.nom || '').toLowerCase();
    const cognoms = (s.cognoms || '').toLowerCase();
    const email = (s.email || '').toLowerCase();
    return nom.includes(query) || cognoms.includes(query) || email.includes(query);
  });
});

const stats = computed(() => {
  const list = assistenciaList.value || [];
  const present = list.filter(s => s.ha_assistit).length;
  const total = list.length;
  const percent = total > 0 ? Math.round((present / total) * 100) : 0;
  return { present, total, percent };
});

const getProjectStyles = (project) => {
  if (!project) return 'bg-white/40 text-[#022B3A] border-white/60';
  const p = project.toUpperCase();
  if (p.includes('A') || p.includes('MANUF')) return 'bg-[#FFF0EB] text-[#FB6107] border-[#FB6107]/20';
  if (p.includes('B') || p.includes('ENER')) return 'bg-[#F0F7E9] text-[#7CB518] border-[#7CB518]/20';
  if (p.includes('C') || p.includes('AGRO')) return 'bg-[#FFF7E6] text-[#FBB02D] border-[#FBB02D]/20';
  return 'bg-white/40 text-[#022B3A] border-white/60';
};

// --- METHODS ---
const goBack = () => router.push('/professors/assistencia');

const loadData = async () => {
  loading.value = true;
  error.value = null;
  try {
    // 1. Carregar llista d'assistència
    const data = await $fetch(`/api/professor/assistencia/${detallId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    assistenciaList.value = Array.isArray(data) ? data : [];

    // 2. Carregar info del taller
    const tallers = await $fetch('/api/professor/tallers', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    
    if (Array.isArray(tallers)) {
      tallerInfo.value = tallers.find(t => t.detall_id == detallId) || null;
    }
  } catch (err) {
    console.error('Error carregant dades:', err);
    error.value = "No s'han pogut carregar els alumnes d'aquest taller.";
  } finally {
    loading.value = false;
  }
};

const toggleAssistencia = async (student) => {
  const oldState = student.ha_assistit;
  try {
    // Optimistic update
    student.ha_assistit = !oldState;
    
    await $fetch(`/api/professor/assistencia/${student.id}`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: { ha_assistit: student.ha_assistit }
    });
  } catch (err) {
    console.error('Error actualitzant assistència:', err);
    student.ha_assistit = oldState; // rollback
    useSwal().fire({ title: 'Error', text: "Error al desar l'assistència.", icon: 'error' });
  }
};

onMounted(() => {
  if (detallId) loadData();
  else error.value = "Taller no identificat.";
});
</script>

<template>
  <div class="animate-in fade-in slide-in-from-bottom-4 duration-500 p-8 space-y-8">
    
    <!-- 1. HEADER NAVIGATION -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div class="space-y-4">
        <button 
          @click="goBack"
          class="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#022B3A]/40 hover:text-[#1F7A8C] transition-colors"
        >
          <ArrowLeft :size="14" class="group-hover:-translate-x-1 transition-transform" />
          Tornar a la llista
        </button>
        
        <div v-if="tallerInfo">
          <h1 class="text-4xl md:text-5xl font-black text-[#022B3A] tracking-tighter leading-none mb-3">
            Passar <span class="text-[#1F7A8C]">Llista</span>
          </h1>
          <div class="flex items-center gap-3">
            <span :class="['px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border', getProjectStyles(tallerInfo.sector)]">
               {{ tallerInfo.sector || 'PROJECTE' }}
            </span>
            <span class="text-sm font-bold text-[#022B3A]/60 flex items-center gap-1.5">
               <ChevronRight :size="14" class="text-[#BFDBF7]" />
               {{ tallerInfo.titol }}
            </span>
          </div>
        </div>
      </div>

      <!-- Stats Capsule -->
      <div v-if="!loading && !error" class="bg-white border border-[#BFDBF7]/60 rounded-2xl p-4 flex items-center gap-6 shadow-sm">
         <div class="flex flex-col">
            <span class="text-[9px] font-black text-[#022B3A]/30 uppercase tracking-widest">Alumnes Presents</span>
            <div class="flex items-end gap-1">
               <span class="text-2xl font-black text-[#1F7A8C] leading-none">{{ stats.present }}</span>
               <span class="text-xs font-bold text-[#022B3A]/20">/ {{ stats.total }}</span>
            </div>
         </div>
         <div class="w-12 h-12 rounded-full border-4 border-[#E1E5F2] flex items-center justify-center relative">
            <svg class="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
               <circle 
                 cx="18" cy="18" r="16" 
                 fill="none" 
                 class="stroke-[#1F7A8C]" 
                 stroke-width="4" 
                 stroke-dasharray="100" 
                 :stroke-dashoffset="100 - stats.percent"
               />
            </svg>
            <span class="text-[10px] font-black text-[#1F7A8C]">{{ stats.percent }}%</span>
         </div>
      </div>
    </div>

    <!-- 2. DATA AREA -->
    <div v-if="loading" class="p-20 text-center text-[#022B3A]/40 font-bold uppercase tracking-widest text-xs">
       Carregant llistat d'alumnes...
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-100 p-8 rounded-2xl text-red-600 text-center italic">
       {{ error }}
    </div>

    <div v-else class="space-y-6">
      
      <!-- Search & Utils Bar -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="relative flex-1 max-w-md group w-full">
          <Search :size="14" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
          <input 
            type="text" 
            placeholder="Cercar alumne per nom o email..."
            v-model="searchQuery"
            class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-11 pr-4 py-3 text-xs font-bold focus:ring-4 focus:ring-[#1F7A8C]/5 outline-none transition-all placeholder:text-[#022B3A]/20"
          />
        </div>
        
        <div class="flex items-center gap-3 w-full sm:w-auto">
           <div class="bg-[#F0F7E9] text-[#7CB518] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-[#7CB518]/10">
              <Clock :size="14" /> Sessió Activa
           </div>
        </div>
      </div>

      <!-- Students Table -->
      <div class="bg-white rounded-3xl border border-[#BFDBF7]/60 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-[#E1E5F2]/10 border-b border-[#BFDBF7]/20">
                <th class="p-6 pl-10 text-[10px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Alumne / ID</th>
                <th class="p-6 text-[10px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Dades de Contacte</th>
                <th class="p-6 text-center text-[10px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Estat Assistència</th>
                <th class="p-6 pr-10 text-right text-[10px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Accions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#BFDBF7]/10">
              <template v-if="filteredStudents.length > 0">
                <tr v-for="student in filteredStudents" :key="student.id" class="group hover:bg-[#E1E5F2]/5 transition-colors">
                  
                  <!-- Student Identity -->
                  <td class="p-6 pl-10">
                    <div class="flex items-center gap-4">
                       <div :class="['w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-colors border', student.ha_assistit ? 'bg-[#1F7A8C] text-white border-[#1F7A8C]' : 'bg-[#E1E5F2]/30 text-[#022B3A]/40 border-transparent']">
                          {{ (student.nom || '?')[0] }}{{ (student.cognoms || '?')[0] }}
                       </div>
                       <div>
                          <p class="text-sm font-black text-[#022B3A] group-hover:text-[#1F7A8C] transition-colors">{{ student.nom }} {{ student.cognoms }}</p>
                          <p class="text-[10px] font-bold text-[#022B3A]/30 uppercase tracking-widest">ID-ST-{{ student.id.toString().padStart(3,'0') }}</p>
                       </div>
                    </div>
                  </td>

                  <!-- Contact -->
                  <td class="p-6">
                    <div class="flex items-center gap-2 text-[#022B3A]/60 bg-[#E1E5F2]/20 border border-[#BFDBF7]/20 px-3 py-1.5 rounded-lg w-fit">
                      <Mail :size="12" />
                      <span class="text-[11px] font-bold">{{ student.email }}</span>
                    </div>
                  </td>

                  <!-- Toggle -->
                  <td class="p-6 text-center">
                    <button 
                      @click="toggleAssistencia(student)"
                      :class="['inline-flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm', 
                        student.ha_assistit 
                          ? 'bg-[#F0F7E9] text-[#7CB518] border-[#7CB518]/20 hover:scale-105 active:scale-95' 
                          : 'bg-white text-[#E1E5F2] border-[#E1E5F2] hover:text-[#022B3A]/40 hover:border-[#BFDBF7]'
                      ]"
                    >
                      <CheckCircle2 v-if="student.ha_assistit" :size="14" />
                      <XCircle v-else :size="14" class="opacity-20" />
                      {{ student.ha_assistit ? 'Assistit' : 'Falta' }}
                    </button>
                  </td>

                  <!-- Actions -->
                  <td class="p-6 pr-10 text-right">
                    <button class="p-2.5 rounded-xl bg-[#E1E5F2]/20 text-[#022B3A]/20 hover:bg-[#1F7A8C]/10 hover:text-[#1F7A8C] transition-all">
                       <ExternalLink :size="16" />
                    </button>
                  </td>

                </tr>
              </template>
              <tr v-else>
                 <td colspan="4" class="p-20 text-center text-[#022B3A]/40 font-bold uppercase tracking-widest text-[10px] italic">
                   No s'han trobat alumnes que coincideixin amb la cerca.
                 </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer Card Summary -->
        <div class="p-8 bg-[#E1E5F2]/10 border-t border-[#BFDBF7]/20 flex flex-col md:flex-row items-center justify-between gap-6">
           <div class="flex items-center gap-10">
              <div v-if="tallerInfo" class="flex items-center gap-3">
                 <div class="w-10 h-10 rounded-full bg-white border border-[#BFDBF7]/60 flex items-center justify-center text-[#1F7A8C]">
                    <MapPin :size="18" />
                 </div>
                 <div>
                    <p class="text-[9px] font-black text-[#022B3A]/30 uppercase tracking-widest">Ubicació Sessió</p>
                    <p class="text-xs font-black text-[#022B3A]">{{ tallerInfo.ubicacio || tallerInfo.municipi }}</p>
                 </div>
              </div>
              <div v-if="tallerInfo" class="flex items-center gap-3">
                 <div class="w-10 h-10 rounded-full bg-white border border-[#BFDBF7]/60 flex items-center justify-center text-[#1F7A8C]">
                    <Clock :size="18" />
                 </div>
                 <div>
                    <p class="text-[9px] font-black text-[#022B3A]/30 uppercase tracking-widest">Horari Previst</p>
                    <p class="text-xs font-black text-[#022B3A]">{{ tallerInfo.modalitat || 'Horari de taller' }}</p>
                 </div>
              </div>
           </div>

           <button 
             @click="goBack"
             class="flex items-center gap-2 px-8 py-3.5 bg-[#022B3A] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#1F7A8C] transition-all shadow-xl shadow-[#022B3A]/20"
           >
              <ClipboardCheck :size="16" />
              Finalitzar Control
           </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Tailwind handles the design */
</style>
