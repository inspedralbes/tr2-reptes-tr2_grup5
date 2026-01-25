<template>
  <div class="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
    
    <!-- 1. Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <div class="flex items-center gap-2 mb-2">
           <ShieldAlert class="text-[#fb6107]" :size="20" />
           <span class="text-[10px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Administració</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-black text-[#022B3A] tracking-tighter leading-none mb-3">
          Validació <span class="text-[#1F7A8C]">Registres</span>
        </h1>
        <p class="text-[#022B3A]/40 text-[10px] font-black uppercase tracking-[0.2em] max-w-lg">
          Gestiona les sol·licituds d'alta de nous centres educatius a la plataforma.
        </p>
      </div>
      
      <!-- Date Widget -->
      <div class="bg-white px-5 py-3 rounded-xl border border-[#BFDBF7]/60 shadow-sm flex items-center gap-3">
         <div class="p-2 bg-[#E1E5F2]/30 rounded-lg text-[#022B3A]/60">
            <Calendar :size="16" />
         </div>
         <div class="text-right">
            <p class="text-[9px] font-black text-[#022B3A]/30 uppercase tracking-widest">Data d'avui</p>
            <p class="text-xs font-bold text-[#022B3A] capitalize">{{ currentDate }}</p>
         </div>
      </div>
    </div>

    <!-- 2. KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
       <div class="bg-white p-6 rounded-2xl border border-[#BFDBF7] shadow-sm flex items-center gap-5">
          <div class="w-12 h-12 rounded-xl bg-[#fb6107]/10 text-[#fb6107] flex items-center justify-center">
             <Clock :size="24" />
          </div>
          <div>
             <p class="text-3xl font-black text-[#022B3A] leading-none">{{ solicitudes.filter(s => (s.estat || '').toLowerCase() === 'pendent').length }}</p>
             <p class="text-[10px] font-bold text-[#022B3A]/40 uppercase tracking-widest mt-1">Pendents de validar</p>
          </div>
       </div>
       
       <div class="bg-white p-6 rounded-2xl border border-[#BFDBF7] shadow-sm flex items-center gap-5">
          <div class="w-12 h-12 rounded-xl bg-[#1F7A8C]/10 text-[#1F7A8C] flex items-center justify-center">
             <Check :size="24" :strokeWidth="3" />
          </div>
          <div>
             <p class="text-3xl font-black text-[#022B3A] leading-none">{{ solicitudes.filter(s => (s.estat || '').toLowerCase() === 'acceptada').length }}</p>
             <p class="text-[10px] font-bold text-[#022B3A]/40 uppercase tracking-widest mt-1">Acceptats Total</p>
          </div>
       </div>

       <div class="bg-white p-6 rounded-2xl border border-[#BFDBF7] shadow-sm flex items-center gap-5">
          <div class="w-12 h-12 rounded-xl bg-[#022B3A]/5 text-[#022B3A]/40 flex items-center justify-center">
             <FileText :size="24" />
          </div>
          <div>
             <p class="text-3xl font-black text-[#022B3A] leading-none">{{ solicitudes.length }}</p>
             <p class="text-[10px] font-bold text-[#022B3A]/40 uppercase tracking-widest mt-1">Total Sol·licituds</p>
          </div>
       </div>
    </div>

    <!-- 3. Control Bar -->
    <div class="bg-white p-2 rounded-xl border border-[#BFDBF7]/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="relative flex-1 max-w-lg group w-full ml-1">
        <Search :size="14" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
        <input 
          type="text" 
          placeholder="Cerca per nom, codi, email o coordinador..."
          v-model="searchQuery"
          class="w-full bg-[#E1E5F2]/10 border border-transparent rounded-lg pl-11 pr-4 py-2.5 text-[11px] font-bold focus:bg-white focus:border-[#BFDBF7] focus:ring-4 focus:ring-[#1F7A8C]/5 outline-none transition-all placeholder:text-[#022B3A]/20 text-[#022B3A]"
        />
      </div>

      <div class="flex items-center gap-2 bg-[#E1E5F2]/30 p-1 rounded-lg border border-[#BFDBF7]/20 w-full sm:w-auto justify-center sm:justify-end">
        <div class="flex items-center gap-1 pr-2 border-r border-[#BFDBF7]/30">
          <button 
            @click="viewMode = 'grid'"
            :class="[
              'p-2 rounded-md shadow-sm border transition-all',
              viewMode === 'grid' ? 'text-[#1F7A8C] bg-white border-[#BFDBF7]/40 shadow-sm' : 'text-[#022B3A]/20 border-transparent hover:text-[#022B3A]'
            ]"
          >
            <LayoutGrid :size="14" />
          </button>
          <button 
            @click="viewMode = 'list'"
            :class="[
              'p-2 rounded-md shadow-sm border transition-all',
              viewMode === 'list' ? 'text-[#1F7A8C] bg-white border-[#BFDBF7]/40 shadow-sm' : 'text-[#022B3A]/20 border-transparent hover:text-[#022B3A]'
            ]"
          >
            <List :size="14" />
          </button>
        </div>
        <button class="flex items-center gap-2 px-3 py-1.5 text-[#022B3A]/50 hover:text-[#022B3A] text-[9px] font-black uppercase tracking-widest transition-colors">
          <Filter :size="12" /> FILTRAR
        </button>
      </div>
    </div>

    <!-- 4. Requests Content -->
    <div :class="viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'flex flex-col gap-3'">
      <template v-for="req in filteredRequests" :key="req.id">
        
        <!-- GRID VIEW -->
        <div 
          v-if="viewMode === 'grid'"
          class="bg-white rounded-2xl border border-[#E1E5F2] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-400 group flex flex-col h-full overflow-hidden relative"
        >
          <!-- Status Line -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-[#fb6107]"></div>

          <div class="p-6 pb-4 flex justify-between items-start">
            <span class="px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-[0.1em] border bg-[#F4F7FB] text-[#022B3A]/60 border-[#E1E5F2]">
              {{ req.code }}
            </span>
            <div class="flex items-center gap-1.5 text-[#022B3A]/40">
              <Clock :size="12" />
              <span class="text-[9px] font-bold uppercase tracking-widest">{{ req.date }}</span>
            </div>
          </div>

          <div class="px-6 pb-6 flex-1">
            <h3 class="text-xl font-black text-[#022B3A] mb-2 leading-tight group-hover:text-[#1F7A8C] transition-colors">
              {{ req.centerName }}
            </h3>
            
            <div v-if="req.isFirstTime" class="inline-flex items-center gap-2 bg-[#fb6107]/10 px-3 py-1.5 rounded-lg border border-[#fb6107]/20 mb-6">
                 <Building2 :size="12" class="text-[#fb6107]" />
                 <span class="text-[9px] font-black text-[#fb6107] uppercase tracking-widest">Nou Registre</span>
            </div>

            <div class="space-y-4">
              <div class="flex items-center justify-between border-b border-[#F1F4F9] pb-2">
                <div class="flex items-center gap-2 text-[#B8C0CC]">
                  <User :size="14" />
                  <span class="text-[9px] font-black uppercase tracking-widest">COORDINADOR</span>
                </div>
                <span class="text-[11px] font-bold text-[#022B3A]">{{ req.coordinator }}</span>
              </div>
              <div class="flex items-center justify-between border-b border-[#F1F4F9] pb-2">
                <div class="flex items-center gap-2 text-[#B8C0CC]">
                  <Mail :size="14" />
                  <span class="text-[9px] font-black uppercase tracking-widest">EMAIL</span>
                </div>
                <span class="text-[11px] font-bold text-[#022B3A] lowercase">{{ req.email }}</span>
              </div>
              <div class="flex items-center justify-between border-b border-[#F1F4F9] pb-2">
                <div class="flex items-center gap-2 text-[#B8C0CC]">
                  <Phone :size="14" />
                  <span class="text-[9px] font-black uppercase tracking-widest">TELÈFON</span>
                </div>
                <span class="text-[11px] font-bold text-[#022B3A]">{{ req.phone }}</span>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 bg-[#F9FAFC] border-t border-[#F1F4F9] flex items-center gap-3 mt-auto">
            <button 
              @click="handleAccept(req.id)"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md bg-[#1F7A8C] text-white hover:bg-[#022B3A] shadow-[#1F7A8C]/20 hover:scale-[1.02]"
            >
              <Check :size="14" :strokeWidth="3" /> Validar
            </button>
            <button 
              @click="handleReject(req.id)"
              class="px-4 py-3 bg-white border border-[#FFECEC] text-[#FF4D4D] rounded-xl shadow-sm hover:bg-[#FF4D4D] hover:text-white transition-all flex items-center justify-center active:scale-95 group"
              title="Rebutjar"
            >
              <X :size="16" :strokeWidth="3" />
            </button>
          </div>
        </div>

        <!-- LIST VIEW -->
        <div 
          v-else
          class="bg-white rounded-xl border border-[#E1E5F2] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 hover:shadow-lg transition-all hover:border-[#BFDBF7] group relative overflow-hidden"
        >
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-[#fb6107]"></div>
          
          <div class="flex items-center gap-4 flex-1 min-w-0 pl-4">
            <div class="w-10 h-10 rounded-lg bg-[#fb6107]/10 text-[#fb6107] flex items-center justify-center font-black text-[10px] uppercase border border-[#fb6107]/20 shrink-0">
                <Building2 :size="16" />
            </div>
            <div class="min-w-0">
                <h3 class="text-base font-black text-[#022B3A] truncate">{{ req.centerName }}</h3>
                <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-medium text-[#8E9AAF] mt-0.5">
                   <span class="flex items-center gap-1"><User :size="12" /> {{ req.coordinator }}</span>
                   <span class="flex items-center gap-1"><Mail :size="12" /> {{ req.email }}</span>
                   <span class="flex items-center gap-1"><Phone :size="12" /> {{ req.phone }}</span>
                </div>
            </div>
          </div>

          <div class="hidden lg:flex items-center gap-8 flex-shrink-0">
            <div class="flex flex-col items-end min-w-[80px]">
              <span class="text-[9px] font-black text-[#B8C0CC] uppercase tracking-widest">Codi</span>
              <span class="text-xs font-bold text-[#022B3A]">{{ req.code }}</span>
            </div>
            <div class="flex flex-col items-end min-w-[100px]">
              <span class="text-[9px] font-black text-[#B8C0CC] uppercase tracking-widest">Sol·licitud</span>
              <span class="text-xs font-bold text-[#022B3A]">{{ req.date }}</span>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 md:border-l md:border-[#F1F4F9] md:pl-6">
            <button 
              @click="handleAccept(req.id)"
              class="flex items-center justify-center gap-2 px-4 py-2 bg-[#F0F7E9] text-[#7CB518] border border-[#7CB518]/20 rounded-lg hover:bg-[#7CB518] hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
            >
              <Check :size="14" :strokeWidth="3" /> Acceptar
            </button>
            <button 
              @click="handleReject(req.id)"
              class="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[#FFECEC] text-[#FF4D4D] rounded-lg shadow-sm hover:bg-[#FF4D4D] hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
            >
              <X :size="14" :strokeWidth="3" /> Rebutjar
            </button>
          </div>
        </div>

      </template>

      <!-- Empty State -->
      <div v-if="filteredRequests.length === 0" class="col-span-full p-16 text-center border-2 border-dashed border-[#BFDBF7] rounded-3xl bg-[#E1E5F2]/10 flex flex-col items-center justify-center">
         <div class="w-16 h-16 bg-[#BFDBF7]/30 rounded-full flex items-center justify-center mb-4 text-[#022B3A]/30">
            <ShieldAlert :size="32" />
         </div>
         <h3 class="text-lg font-black text-[#022B3A]">Tot al dia</h3>
         <p class="text-[#022B3A]/40 font-medium text-sm">No hi ha sol·licituds de registre pendents de validar.</p>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  ShieldAlert, 
  Calendar, 
  Clock, 
  Check, 
  FileText, 
  Search, 
  LayoutGrid, 
  List, 
  Filter, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  X 
} from 'lucide-vue-next';

// ======================================
// Importacions i Composables (Rutes, Cookies, Stores)
// ======================================
const token = useCookie('authToken').value;
const router = useRouter();

// ======================================
// Estat Reactiu i Refs (Variables i Formularis)
// ======================================
const solicitudes = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const viewMode = ref('grid');

const currentDate = computed(() => {
  return new Date().toLocaleDateString('ca-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
});

// Mapping API -> High Fidelity UI
const filteredRequests = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  
  // Filter for only 'pendent' status initially, or handle as needed
  // Based on old logic, we only show pending requests here.
  const pending = solicitudes.value.filter(s => (s.estat || '').toLowerCase() === 'pendent');

  return pending
    .filter(s => {
      const name = (s.nom_centre_manual || s.nom_centre || '').toLowerCase();
      const code = (s.codi_centre || '').toLowerCase();
      const coordinator = (s.nom_coordinador || '').toLowerCase();
      const email = (s.email_coordinador || '').toLowerCase();
      return name.includes(query) || code.includes(query) || coordinator.includes(query) || email.includes(query);
    })
    .map(s => ({
      id: s.id,
      code: s.codi_centre || 'SENSE CODI',
      date: formatDate(s.data_creacio),
      centerName: s.nom_centre_manual || s.nom_centre || 'Centre Sense Nom',
      isFirstTime: !!s.es_primera_vegada,
      coordinator: s.nom_coordinador || 'No assignat',
      email: s.email_coordinador || 'N/A',
      phone: s.telefon || 'N/A'
    }));
});

// ======================================
// Lògica i Funcions (Handlers i Lifecycle)
// ======================================

async function fetchSolicitudes() {
  loading.value = true;
  try {
    if (!token) {
      navigateTo('/login');
      return;
    }
    
    // API Call
    const res = await $fetch('/api/solicituds-registre', {
      headers: { Authorization: 'Bearer ' + token }
    });

    if (Array.isArray(res)) {
      solicitudes.value = res;
    } else if (res && res.data) {
      solicitudes.value = res.data;
    }
  } catch (err) {
    console.error('Error fetching registration requests:', err);
  } finally {
    loading.value = false;
  }
}

async function handleAccept(id) {
  if (!confirm('Vols validar aquest registre? Se li enviarà una notificació al centre.')) return;
  await updateEstado(id, 'acceptada');
}

async function handleReject(id) {
  if (!confirm('Segur que vols rebutjar aquesta sol·licitud?')) return;
  await updateEstado(id, 'rebutjada');
}

async function updateEstado(id, estado) {
  try {
    await $fetch('/api/solicituds-registre/' + id, {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + token },
      body: { estat: estado }
    });
    
    // Refresh list
    await fetchSolicitudes();
    alert(estado === 'acceptada' ? 'Sol·licitud acceptada correctament.' : 'Sol·licitud rebutjada.');
  } catch (err) {
    console.error('Error updating status:', err);
    alert('Error al processar la sol·licitud.');
  }
}

function formatDate(dateString) {
  if (!dateString) return 'Avui';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('ca-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

onMounted(() => {
  const header = useHeaderStore();
  header.setHeaderAdmin();
  fetchSolicitudes();
});
</script>

<style scoped>
/* Tailwind handles the core design */
.duration-400 { transition-duration: 400ms; }
</style>
