<template>
  <div 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#022B3A]/40 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div class="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#BFDBF7] bg-white shadow-2xl animate-in zoom-in-95 duration-300">
      
      <!-- STICKY HEADER -->
      <div class="sticky top-0 z-20 flex items-center justify-between px-8 py-6 bg-white/90 border-b border-[#BFDBF7]/40 backdrop-blur-md">
        <div v-if="assignacio" class="flex items-center gap-5">
          <div :class="['w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg', getHeaderGradient]">
            {{ assignacio.modalitat }}
          </div>
          <div>
            <h2 class="text-2xl font-black text-[#022B3A] tracking-tight leading-tight">{{ assignacio.titol }}</h2>
            <div class="flex items-center gap-3 mt-1.5 font-bold text-[10px] uppercase tracking-widest text-[#022B3A]/40">
              <span class="px-2 py-0.5 rounded bg-[#E1E5F2] text-[#022B3A]">{{ assignacio.trimestre }} Trimestre</span>
              <span class="flex items-center gap-1"><MapPin :size="12" /> {{ assignacio.ubicacio || 'Per confirmar' }}</span>
            </div>
          </div>
        </div>
        <button 
          @click="emit('close')"
          class="p-2.5 rounded-xl text-[#022B3A]/30 hover:text-[#022B3A] hover:bg-[#E1E5F2]/50 border border-transparent hover:border-[#BFDBF7]/40 transition-all"
        >
          <X :size="24" />
        </button>
      </div>

      <!-- LOADING STATE -->
      <div v-if="pending" class="p-24 flex flex-col items-center justify-center gap-5 text-center">
        <div class="w-12 h-12 border-[5px] border-[#E1E5F2] border-t-[#1F7A8C] rounded-full animate-spin"></div>
        <p class="text-[#022B3A]/40 text-xs font-black uppercase tracking-[0.2em]">Sincronitzant dades assignades...</p>
      </div>

      <!-- ERROR STATE -->
      <div v-else-if="error" class="p-20 flex flex-col items-center justify-center gap-4 text-center">
        <div class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2">
          <AlertCircle :size="32" />
        </div>
        <h3 class="text-lg font-black text-[#022B3A]">Error en carregar els detalls</h3>
        <p class="text-sm text-[#022B3A]/50 max-w-xs">{{ error.message || 'No s\'ha pogut connectar amb el servidor.' }}</p>
      </div>

      <!-- MAIN CONTENT -->
      <div v-else-if="assignacio" class="p-8 lg:p-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <!-- LEFT COLUMN: Main Info -->
          <div class="lg:col-span-12 xl:col-span-7 space-y-10">
            
            <!-- SECTION: GENERAL INFO -->
            <section class="space-y-6">
              <h3 class="text-[10px] font-black text-[#022B3A]/40 uppercase tracking-[0.25em] flex items-center gap-3">
                <div class="w-1.5 h-1.5 rounded-full bg-[#1F7A8C]"></div> Informació de la Sol·licitud
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-[#F8FAFC] border border-[#BFDBF7]/30 p-6 rounded-2xl space-y-1">
                  <span class="text-[9px] font-black text-[#B8C0CC] uppercase tracking-widest block">Capacitat</span>
                  <p class="text-base font-black text-[#022B3A]">{{ assignacio.num_participants }} <span class="text-xs font-bold text-[#022B3A]/30">participants</span></p>
                </div>
                <div class="bg-[#F8FAFC] border border-[#BFDBF7]/30 p-6 rounded-2xl space-y-1">
                  <span class="text-[9px] font-black text-[#B8C0CC] uppercase tracking-widest block">Data d'Assignació</span>
                  <p class="text-base font-black text-[#022B3A]">{{ formatDateCompact(assignacio.data_creacio) }}</p>
                </div>
                <div class="md:col-span-2 bg-[#F8FAFC] border border-[#BFDBF7]/30 p-6 rounded-2xl">
                  <span class="text-[9px] font-black text-[#B8C0CC] uppercase tracking-widest block mb-2">Descripció del Centre</span>
                  <p class="text-sm font-medium text-[#022B3A]/70 leading-relaxed italic">
                    "{{ assignacio.descripcio || 'Sense descripció addicional proporcionada.' }}"
                  </p>
                </div>
              </div>
            </section>

            <!-- SECTION: TEACHER INFO -->
            <section class="space-y-6">
              <h3 class="text-[10px] font-black text-[#022B3A]/40 uppercase tracking-[0.25em] flex items-center gap-3">
                <div class="w-1.5 h-1.5 rounded-full bg-[#FB6107]"></div> Docent Referent
              </h3>
              
              <div class="bg-gradient-to-br from-[#022B3A] to-[#1F7A8C] p-8 rounded-3xl text-white shadow-xl shadow-[#022B3A]/10 relative overflow-hidden group">
                <div class="absolute -right-4 -bottom-4 text-white/5 group-hover:scale-110 transition-transform duration-700">
                  <Users :size="160" :strokeWidth="1" />
                </div>
                
                <div class="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                  <div class="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl font-black">
                    {{ getInitials(assignacio.docent_nom) }}
                  </div>
                  <div class="space-y-1">
                    <p class="text-lg font-black tracking-tight leading-none">{{ assignacio.docent_nom || 'Docent no assignat' }}</p>
                    <p v-if="assignacio.docent_email" class="text-xs font-bold text-white/60 tracking-wider flex items-center gap-1.5">
                      <Mail :size="12" /> {{ assignacio.docent_email }}
                    </p>
                    <p v-else class="text-xs font-bold text-white/40 tracking-wider">A l'espera de confirmació final</p>
                  </div>
                </div>
              </div>
            </section>

          </div>

          <!-- RIGHT COLUMN: Sessions -->
          <div class="lg:col-span-12 xl:col-span-5">
            <section class="space-y-6 h-full flex flex-col">
              <div class="flex items-center justify-between">
                <h3 class="text-[10px] font-black text-[#022B3A]/40 uppercase tracking-[0.25em] flex items-center gap-3">
                  <div class="w-1.5 h-1.5 rounded-full bg-[#7CB518]"></div> Sessions Programades
                </h3>
                <span class="px-3 py-1 bg-[#E1E5F2]/50 text-[#022B3A] rounded-full text-[9px] font-black uppercase tracking-widest border border-[#BFDBF7]">
                  {{ assignacio.sessions?.length || 0 }} totals
                </span>
              </div>

              <div class="flex-1 space-y-3">
                <div v-if="assignacio.sessions && assignacio.sessions.length > 0" class="space-y-3 overflow-y-visible">
                  <div 
                    v-for="(session, idx) in assignacio.sessions" 
                    :key="session.id"
                    class="group bg-white border border-[#E1E5F2] hover:border-[#1F7A8C] p-5 rounded-2xl flex items-center gap-5 transition-all hover:shadow-lg hover:shadow-[#1F7A8C]/5 active:scale-[0.98]"
                  >
                    <div class="w-10 h-10 rounded-xl bg-[#F8FAFC] flex flex-col items-center justify-center font-black group-hover:bg-[#1F7A8C]/5 transition-colors">
                      <span class="text-[9px] text-[#022B3A]/30 leading-none mb-1">MOV</span>
                      <span class="text-sm text-[#022B3A] leading-none">{{ idx + 1 }}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-black text-[#022B3A] uppercase tracking-tight">{{ formatDateNice(session.data) }}</p>
                    </div>
                    <ArrowRight :size="16" class="text-[#022B3A]/10 group-hover:text-[#1F7A8C] transition-colors" />
                  </div>
                </div>

                <div v-else class="flex flex-col items-center justify-center py-20 border-2 border-dashed border-[#BFDBF7]/40 rounded-3xl bg-[#F8FAFC]/50 text-center px-6">
                  <Calendar :size="32" class="text-[#022B3A]/10 mb-4" />
                  <p class="text-xs font-bold text-[#022B3A]/40 uppercase tracking-widest leading-relaxed">
                    Les dates de les sessions apareixeran aquí un cop siguin planificades.
                  </p>
                </div>
              </div>
            </section>
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
  X, 
  MapPin, 
  Users, 
  Calendar, 
  Mail, 
  ArrowRight,
  AlertCircle
} from 'lucide-vue-next';

// ======================================
// Definició de l'Esquema
// ======================================

// 1. Propietats que rep el component
const props = defineProps({
  assignacioId: { type: [Number, String], required: true }
});

// 2. Esdeveniments que emet el component
const emit = defineEmits(['close']);

// 3. Cookie d'autenticació
const tokenCookie = useCookie('authToken');

// 4. Carreguem les dades de l'assignació (sense desestructuració)
const resultatFeth = await useFetch('/api/centre/assignacions/' + props.assignacioId, {
  headers: {
    Authorization: tokenCookie.value ? 'Bearer ' + tokenCookie.value : ''
  },
  key: 'modal-assignacio-' + props.assignacioId
});

const assignacio = resultatFeth.data;
const pending = resultatFeth.pending;
const error = resultatFeth.error;

// 5. Propietat computada per al fons de la capçalera segons modalitat
const getHeaderGradient = computed(function () {
  let modStr = '';
  if (assignacio.value) {
    if (assignacio.value.modalitat) {
      modStr = assignacio.value.modalitat.toUpperCase();
    }
  }
  
  if (modStr.includes('A')) {
    return 'bg-gradient-to-br from-[#3b82f6] to-[#2563eb]';
  }
  if (modStr.includes('B')) {
    return 'bg-gradient-to-br from-[#10b981] to-[#059669]';
  }
  if (modStr.includes('C')) {
    return 'bg-gradient-to-br from-[#f59e0b] to-[#d97706]';
  }
  
  return 'bg-[#022B3A]';
});

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Obtenir les inicials d'un nom ---
function getInitials(name) {
  if (!name) {
    return '??';
  }
  
  const net = name.trim();
  const parts = net.split(' ');
  
  if (parts.length >= 2) {
    const l1 = parts[0].charAt(0);
    const l2 = parts[1].charAt(0);
    return (l1 + l2).toUpperCase();
  }
  
  return parts[0].charAt(0).toUpperCase();
}

// B) --- Formatar la data de forma compacta (numerica) ---
function formatDateCompact(dateStr) {
  if (!dateStr) {
    return '—';
  }
  const dataObject = new Date(dateStr);
  const opcions = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return dataObject.toLocaleDateString('ca-ES', opcions);
}

// C) --- Formatar la data de forma textual i bonica ---
function formatDateNice(dateStr) {
  if (!dateStr) {
    return 'Pendent de data';
  }
  const dataObject = new Date(dateStr);
  const opcions = { weekday: 'long', day: 'numeric', month: 'long' };
  return dataObject.toLocaleDateString('ca-ES', opcions);
}
</script>

<style scoped>
/* Scrollbar personalitzada per al modal */
.max-h-\[90vh\] {
  scrollbar-width: thin;
  scrollbar-color: #BFDBF7 transparent;
}

.max-h-\[90vh\]::-webkit-scrollbar {
  width: 6px;
}

.max-h-\[90vh\]::-webkit-scrollbar-thumb {
  background-color: #BFDBF7;
  border-radius: 10px;
}
</style>
