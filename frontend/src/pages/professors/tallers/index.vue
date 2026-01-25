<script setup>
import { ref, computed } from 'vue';
import { 
  Search, 
  LayoutGrid, 
  List, 
  Filter, 
  Users, 
  MapPin, 
  Clock, 
  School, 
  UserPlus, 
  ArrowLeft,
  Mail,
  MoreVertical,
  ClipboardList,
  X,
  Save,
  User,
  CheckCircle2,
  Calendar,
  Info,
  Trash2
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
const viewMode = ref('grid'); // 'grid' | 'list'
const selectedWorkshopId = ref(null);
const showAddModal = ref(false);
const newStudents = ref([]);
const studentsList = ref([]); 

// --- FETCH DATA ---
const { data: tallersRaw, pending, error } = await useFetch('/api/professor/tallers', {
  headers: token ? { Authorization: 'Bearer ' + token } : {},
  key: 'professor-tallers-catalog'
});

const tallers = computed(() => {
  return tallersRaw.value || [];
});

// Filtrem només els que pot gestionar (docent/referent)
const assignedTallers = computed(() => {
  if (!Array.isArray(tallers.value)) return [];
  return tallers.value.filter(t => t && t.permissions && t.permissions.canManageList);
});

// Mapping filtrat per la UI
const filteredWorkshops = computed(() => {
  const query = searchQuery.value ? searchQuery.value.toLowerCase() : '';
  const list = assignedTallers.value || [];
  
  return list
    .filter(t => {
      if (!t) return false;
      const titol = t.titol ? t.titol.toLowerCase() : '';
      const centre = t.nom_centre ? t.nom_centre.toLowerCase() : '';
      return titol.includes(query) || centre.includes(query);
    })
    .map(t => {
      if (!t) return null;
      return {
        id: t.detall_id,
        ref: `REF-${t.id}`,
        project: t.sector || 'PROJECTE',
        title: t.titol || 'Taller',
        description: t.descripcio || 'Sense descripció disponible.',
        sector: t.sector,
        places: t.num_participants || t.places_maximes || 12,
        trimestres: t.trimestre ? [t.trimestre] : ['1r', '2n', '3r'],
        center: t.nom_centre || 'Centre Educatiu',
        nextSession: 'Pendent',
        studentsCount: 0 
      };
    }).filter(w => w !== null);
});

const selectedWorkshop = computed(() => {
  return filteredWorkshops.value.find(w => w.id === selectedWorkshopId.value);
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

const handleBack = () => {
  selectedWorkshopId.value = null;
  studentsList.value = [];
};

const handleSelectWorkshop = async (id) => {
  selectedWorkshopId.value = id;
  try {
    const data = await $fetch(`/api/professor/tallers/${id}/alumnes`, {
      headers: token ? { Authorization: 'Bearer ' + token } : {}
    });
    studentsList.value = data || [];
  } catch (e) {
    console.error("Error carregant alumnes:", e);
    studentsList.value = [];
  }
};

const openAddModal = () => {
  if (!selectedWorkshop.value) return;
  // Comencem amb una sola fila per millor UX
  newStudents.value = [{
      id: Date.now(),
      nom: '', 
      cognoms: '', 
      email: ''
  }];
  showAddModal.value = true;
};

const addNewRow = () => {
  if (studentsList.value.length + newStudents.value.length >= selectedWorkshop.value.places) {
      useSwal().fire({ title: 'Atenció', text: "S'ha arribat al límit de places del taller.", icon: 'warning' });
      return;
  }
  newStudents.value.push({
      id: Date.now(),
      nom: '', 
      cognoms: '', 
      email: ''
  });
};

const removeRow = (index) => {
    if (newStudents.value.length > 1) {
        newStudents.value.splice(index, 1);
    }
};

const isSaving = ref(false);

const handleSaveStudents = async () => {
    if (!selectedWorkshopId.value) return;
    
    // Filtrem alumnes que tinguin almenys el nom
    const validStudents = newStudents.value.filter(s => s.nom && s.nom.trim() !== '');
    
    if (validStudents.length === 0) {
        useSwal().fire({ title: 'Atenció', text: "Siusplau, omple almenys el nom d'un alumne.", icon: 'warning' });
        return;
    }

    isSaving.value = true;
    try {
        await $fetch(`/api/professor/tallers/${selectedWorkshopId.value}/alumnes`, {
            method: 'POST',
            headers: token ? { Authorization: 'Bearer ' + token } : {},
            body: { alumnes: validStudents }
        });
        
        showAddModal.value = false;
        // Refresquem la llista d'alumnes
        await handleSelectWorkshop(selectedWorkshopId.value);
    } catch (e) {
        console.error("Error guardant alumnes:", e);
        const errorMsg = e.data?.message || "No s'han pogut registrar els alumnes. Revisa els límits de places.";
        useSwal().fire({ title: 'Error', text: errorMsg, icon: 'error' });
    } finally {
        isSaving.value = false;
    }
};

const handleDeleteStudent = async (studentId) => {
    const confirmResult = await useSwal().fire({ title: 'Confirmar', text: "Estàs segur que vols eliminar aquest alumne de la llista?", icon: 'question', showCancelButton: true, confirmButtonText: 'Sí' });
    if (!confirmResult.isConfirmed) return;

    try {
        await $fetch(`/api/professor/tallers/${selectedWorkshopId.value}/alumnes/${studentId}`, {
            method: 'DELETE',
            headers: token ? { Authorization: 'Bearer ' + token } : {}
        });
        await handleSelectWorkshop(selectedWorkshopId.value);
    } catch (e) {
        console.error("Error eliminant alumne:", e);
        useSwal().fire({ title: 'Error', text: "No s'ha pogut eliminar l'alumne.", icon: 'error' });
    }
};

</script>

<template>
  <div class="animate-in fade-in slide-in-from-bottom-4 duration-500 p-8">
    
    <!-- Loading/Error Global States -->
    <div v-if="pending" class="p-20 text-center text-[#022B3A]/40 font-bold uppercase tracking-widest text-xs">
        Carregant catàleg...
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-100 p-8 rounded-2xl text-red-600 text-center italic">
        Error al carregar les dades: {{ error.message }}
    </div>

    <div v-else>
        <!-- DETAIL VIEW (STUDENTS LIST) -->
        <section v-if="selectedWorkshopId && selectedWorkshop" class="relative">
            <!-- Header Navigation -->
            <header class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <button 
                  @click="handleBack"
                  class="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#022B3A]/40 hover:text-[#1F7A8C] transition-colors mb-3"
                >
                  <ArrowLeft :size="14" class="group-hover:-translate-x-1 transition-transform" />
                  Tornar al catàleg
                </button>
                <h1 class="text-4xl font-black text-[#022B3A] tracking-tight leading-none">
                  {{ selectedWorkshop.title }}
                </h1>
                <div class="flex items-center gap-3 mt-2">
                    <span :class="['px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border', getProjectStyles(selectedWorkshop.project)]">
                        {{ selectedWorkshop.project }}
                    </span>
                    <span class="text-[#022B3A]/40 text-xs font-medium flex items-center gap-1">
                        <School :size="12" /> {{ selectedWorkshop.center }}
                    </span>
                </div>
              </div>
              
              <button 
                @click="openAddModal"
                class="flex items-center gap-2 px-6 py-3 bg-[#022B3A] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#1F7A8C] transition-all shadow-xl shadow-[#022B3A]/10 group"
              >
                <UserPlus :size="16" class="text-[#1F7A8C] group-hover:text-white transition-colors" />
                Afegir Alumnes
              </button>
            </header>

            <!-- Table Container -->
            <div class="bg-white rounded-2xl border border-[#BFDBF7]/60 shadow-sm overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-[#E1E5F2]/20 border-b border-[#BFDBF7]/20">
                      <th class="p-6 pl-8 text-[9px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Nom Complet</th>
                      <th class="p-6 text-[9px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Contacte</th>
                      <th class="p-6 text-[9px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em] text-center">Assistència</th>
                      <th class="p-6 pr-8 text-right text-[9px] font-black text-[#022B3A]/40 uppercase tracking-[0.2em]">Accions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#BFDBF7]/10">
                    <template v-if="studentsList && studentsList.length > 0">
                        <tr v-for="student in studentsList" :key="student.id" class="hover:bg-[#E1E5F2]/5 transition-colors group">
                            <td class="p-5 pl-8">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-lg bg-[#1F7A8C]/10 text-[#1F7A8C] flex items-center justify-center font-black text-xs">
                                        {{ (student.nom || '?')[0] }}{{ (student.cognoms || '?')[0] }}
                                    </div>
                                    <div>
                                        <p class="text-sm font-bold text-[#022B3A]">{{ student.nom }} {{ student.cognoms }}</p>
                                        <p class="text-[10px] text-[#022B3A]/40 font-medium">ID: ST-{{ student.id ? student.id.toString().padStart(3,'0') : '???' }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="p-5">
                              <div class="flex items-center gap-2 text-[#022B3A]/60 bg-white border border-[#BFDBF7]/40 px-3 py-1.5 rounded-lg w-fit">
                                <Mail :size="12" />
                                <span class="text-[11px] font-medium">{{ student.email }}</span>
                              </div>
                            </td>
                            <td class="p-5 text-center">
                              <button :class="['inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all', 
                                student.ha_assistit 
                                  ? 'bg-[#F0F7E9] text-[#7CB518] border-[#7CB518]/20 hover:bg-[#7CB518] hover:text-white' 
                                  : 'bg-red-50 text-red-400 border-red-200 hover:bg-red-400 hover:text-white'
                              ]">
                                <CheckCircle2 v-if="student.ha_assistit" :size="10" />
                                <X v-else :size="10" />
                                {{ student.ha_assistit ? 'Present' : 'Absent' }}
                              </button>
                            </td>
                            <td class="p-5 pr-8 text-right">
                              <button 
                                @click="handleDeleteStudent(student.id)"
                                class="p-2 text-[#022B3A]/20 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Eliminar alumne"
                              >
                                <Trash2 :size="16" />
                              </button>
                            </td>
                        </tr>
                    </template>
                    <tr v-else>
                        <td colspan="4" class="p-10 text-center text-[#022B3A]/40 text-sm italic">
                            No hi ha alumnes registrats en aquest taller.
                        </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-if="selectedWorkshop" class="p-4 bg-[#E1E5F2]/10 border-t border-[#BFDBF7]/20 flex justify-between items-center px-8">
                 <span class="text-[10px] font-bold text-[#022B3A]/30 uppercase tracking-widest">Capacitat: {{ studentsList.length }} / {{ selectedWorkshop.places }}</span>
                 <div class="h-1.5 w-32 bg-[#BFDBF7]/20 rounded-full overflow-hidden">
                    <div class="h-full bg-[#1F7A8C]" :style="{ width: `${(studentsList.length / selectedWorkshop.places) * 100}%` }"></div>
                 </div>
              </div>
            </div>

            <!-- MODAL: ADD STUDENTS -->
            <div v-if="showAddModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
                 <div class="absolute inset-0 bg-[#022B3A]/60 backdrop-blur-sm animate-in fade-in duration-200" @click="showAddModal = false"></div>
                 <div class="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 flex flex-col max-h-[85vh]">
                    <div class="p-8 border-b border-[#BFDBF7]/20 flex justify-between items-start bg-white">
                       <div>
                          <h2 class="text-2xl font-black text-[#022B3A] tracking-tight">Registrar Nous Alumnes</h2>
                          <p class="text-[#022B3A]/40 text-[11px] font-bold uppercase tracking-wider mt-1">
                             {{ selectedWorkshop.title }} — {{ selectedWorkshop.project }}
                          </p>
                       </div>
                       <button @click="showAddModal = false" class="p-2 text-[#022B3A]/20 hover:text-[#022B3A] hover:bg-[#E1E5F2]/20 rounded-lg transition-all">
                          <X :size="20" />
                       </button>
                    </div>
                    <div class="p-8 bg-[#F9FAFC] overflow-y-auto flex-1 space-y-4">
                       <div class="flex items-center justify-between mb-4 p-4 bg-[#1F7A8C]/5 border border-[#1F7A8C]/10 rounded-xl text-[#1F7A8C]">
                          <div class="flex items-center gap-2">
                             <Info :size="16" />
                             <span class="text-[11px] font-bold">Places restants: {{ selectedWorkshop.places - studentsList.length }}</span>
                          </div>
                          <button @click="addNewRow" class="text-[10px] font-black uppercase tracking-widest bg-white px-4 py-2 rounded-lg border border-[#1F7A8C]/30 hover:bg-[#1F7A8C] hover:text-white transition-all">
                             + Afegir Fila
                          </button>
                       </div>
                       <div v-for="(student, index) in newStudents" :key="student.id" class="flex flex-col md:flex-row gap-4 items-center bg-white p-5 rounded-xl border border-[#BFDBF7]/40 shadow-sm group hover:border-[#1F7A8C]/30 transition-all relative">
                              <div class="hidden md:flex w-8 h-8 rounded-lg bg-[#E1E5F2]/20 text-[#022B3A]/30 items-center justify-center text-[10px] font-black border border-[#BFDBF7]/20 flex-shrink-0 group-hover:bg-[#1F7A8C]/10 group-hover:text-[#1F7A8C] transition-colors">{{ index + 1 }}</div>
                              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                                  <div class="space-y-1">
                                      <label class="text-[8px] font-black text-[#022B3A]/30 uppercase tracking-widest ml-1">Nom</label>
                                      <div class="relative">
                                          <User :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-[#022B3A]/20" />
                                          <input type="text" v-model="student.nom" class="w-full bg-[#E1E5F2]/5 border border-[#BFDBF7]/60 rounded-lg pl-9 pr-3 py-2.5 text-sm font-bold text-[#022B3A] focus:bg-white focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] outline-none transition-all" placeholder="Nom" />
                                      </div>
                                  </div>
                                  <div class="space-y-1">
                                      <label class="text-[8px] font-black text-[#022B3A]/30 uppercase tracking-widest ml-1">Cognoms</label>
                                      <input type="text" v-model="student.cognoms" class="w-full bg-[#E1E5F2]/5 border border-[#BFDBF7]/60 rounded-lg px-4 py-2.5 text-sm font-bold text-[#022B3A] focus:bg-white focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] outline-none transition-all" placeholder="Cognoms" />
                                  </div>
                                  <div class="space-y-1">
                                      <label class="text-[8px] font-black text-[#022B3A]/30 uppercase tracking-widest ml-1">Email</label>
                                      <div class="relative">
                                          <Mail :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-[#022B3A]/20" />
                                          <input type="email" v-model="student.email" class="w-full bg-[#E1E5F2]/5 border border-[#BFDBF7]/60 rounded-lg pl-9 pr-3 py-2.5 text-sm font-bold text-[#022B3A] focus:bg-white focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] outline-none transition-all" placeholder="alumne@centre.cat" />
                                      </div>
                                  </div>
                              </div>
                              <button v-if="newStudents.length > 1" @click="removeRow(index)" class="absolute -right-2 -top-2 md:relative md:right-0 md:top-0 p-2 text-red-400 hover:text-red-600 bg-white md:bg-transparent rounded-full shadow-sm md:shadow-none border border-red-100 md:border-none">
                                 <X :size="16" />
                              </button>
                       </div>
                    </div>
                    <div class="p-6 bg-white border-t border-[#BFDBF7]/20 flex justify-end gap-3 flex-shrink-0">
                       <button @click="showAddModal = false" :disabled="isSaving" class="px-8 py-3 rounded-xl text-[10px] font-black text-[#022B3A]/40 uppercase tracking-widest hover:text-[#022B3A] hover:bg-[#E1E5F2]/20 transition-all disabled:opacity-50">Cancel·lar</button>
                       <button @click="handleSaveStudents" :disabled="isSaving" class="px-8 py-3 bg-[#1F7A8C] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#022B3A] shadow-lg shadow-[#1F7A8C]/20 transition-all flex items-center gap-2 disabled:bg-[#022B3A]/30">
                          <template v-if="!isSaving">
                             <Save :size="16" />Guardar Registres
                          </template>
                          <template v-else>
                             <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                             Guardant...
                          </template>
                       </button>
                    </div>
                 </div>
              </div>
        </section>

        <!-- CATALOG VIEW -->
        <div v-else class="space-y-8">
          <!-- Search & Control Bar -->
          <div class="bg-white p-2 rounded-xl border border-[#BFDBF7]/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="relative flex-1 max-w-md group w-full ml-1">
              <Search :size="14" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
              <input type="text" placeholder="Cercar per títol o centre..." v-model="searchQuery" class="w-full bg-[#E1E5F2]/10 border border-transparent rounded-lg pl-11 pr-4 py-2.5 text-[11px] font-bold focus:bg-white focus:border-[#BFDBF7] focus:ring-4 focus:ring-[#1F7A8C]/5 outline-none transition-all placeholder:text-[#022B3A]/20" />
            </div>
            <div class="flex items-center gap-2 bg-[#E1E5F2]/30 p-1 rounded-lg border border-[#BFDBF7]/20 w-full sm:w-auto justify-center sm:justify-end">
              <div class="flex items-center gap-1 pr-2 border-r border-[#BFDBF7]/30">
                <button @click="viewMode = 'grid'" :class="['p-2 rounded-lg shadow-sm border transition-all', viewMode === 'grid' ? 'text-[#1F7A8C] bg-white border-[#BFDBF7]/40 shadow-sm' : 'text-[#022B3A]/20 border-transparent hover:text-[#022B3A]']"><LayoutGrid :size="14" /></button>
                <button @click="viewMode = 'list'" :class="['p-2 rounded-lg shadow-sm border transition-all', viewMode === 'list' ? 'text-[#1F7A8C] bg-white border-[#BFDBF7]/40 shadow-sm' : 'text-[#022B3A]/20 border-transparent hover:text-[#022B3A]']"><List :size="14" /></button>
              </div>
              <button class="flex items-center gap-2 px-3 py-1.5 text-[#022B3A]/50 hover:text-[#022B3A] text-[9px] font-black uppercase tracking-widest transition-colors"><Filter :size="12" /> ORDRE</button>
            </div>
          </div>

          <div v-if="filteredWorkshops && filteredWorkshops.length > 0" :class="viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'flex flex-col gap-3'">
            <template v-for="workshop in filteredWorkshops" :key="workshop.id">
              <!-- LIST VIEW CARD -->
              <div v-if="viewMode === 'list'" class="bg-white rounded-xl border border-[#E1E5F2] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 hover:shadow-lg transition-all hover:border-[#BFDBF7] group">
                 <div class="flex items-center gap-4 flex-1 min-w-0">
                    <div :class="['w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center font-black text-[9px] uppercase border tracking-widest', getProjectStyles(workshop.project)]">{{ (workshop.project.split(' ')[1] || workshop.project) }}</div>
                    <div class="min-w-0">
                        <div class="flex items-center gap-3 mb-0.5"><h3 class="text-base font-black text-[#022B3A] truncate">{{ workshop.title }}</h3><span class="hidden sm:inline-block px-2 py-0.5 bg-[#F4F7FB] border border-[#E1E5F2] rounded text-[9px] font-black text-[#022B3A]/50 uppercase tracking-widest">{{ workshop.center }}</span></div>
                        <p class="text-[11px] font-medium text-[#8E9AAF] truncate">{{ workshop.description }}</p>
                    </div>
                 </div>
                 <div class="hidden lg:flex items-center gap-8 flex-shrink-0">
                    <div class="flex flex-col items-end min-w-[60px]"><span class="text-[9px] font-black text-[#B8C0CC] uppercase tracking-widest">Alumnes</span><span class="text-xs font-bold text-[#022B3A]">{{ workshop.studentsCount }} / {{ workshop.places }}</span></div>
                    <div class="flex flex-col items-end min-w-[80px]"><span class="text-[9px] font-black text-[#B8C0CC] uppercase tracking-widest">Sessió</span><span class="text-xs font-bold text-[#022B3A]">{{ workshop.nextSession }}</span></div>
                 </div>
                 <div class="flex items-center justify-end gap-3 md:border-l md:border-[#F1F4F9] md:pl-6">
                    <span class="hidden md:block text-[9px] font-black text-[#B8C0CC] tracking-widest uppercase mr-2">{{ workshop.ref }}</span>
                    <button @click="handleSelectWorkshop(workshop.id)" class="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all shadow-md bg-[#1F7A8C] text-white hover:bg-[#022B3A] shadow-[#1F7A8C]/20 hover:scale-105"><ClipboardList :size="14" :strokeWidth="2" />LLISTAT</button>
                 </div>
              </div>

              <!-- GRID VIEW CARD -->
              <div v-else class="bg-white rounded-2xl border border-[#E1E5F2] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden group">
                <div class="p-6 pb-4 flex justify-between items-center"><span :class="['px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.1em] border', getProjectStyles(workshop.project)]">{{ workshop.project }}</span><div class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-[#7CB518] animate-pulse"></div><span class="text-[9px] font-black text-[#022B3A]/40 uppercase tracking-widest">En Curs</span></div></div>
                <div class="px-6 flex-1"><h3 class="text-xl font-black text-[#022B3A] mb-2 leading-tight group-hover:text-[#1F7A8C] transition-colors">{{ workshop.title }}</h3><p class="text-[#022B3A]/50 text-xs font-medium leading-relaxed mb-6 line-clamp-2">{{ workshop.description }}</p>
                  <div class="space-y-3 mb-6">
                    <div class="flex items-center justify-between"><div class="flex items-center gap-2 text-[#022B3A]/30"><School :size="14" /><span class="text-[9px] font-black uppercase tracking-widest">Centre Assignat</span></div><span class="text-[11px] font-bold text-[#022B3A]">{{ workshop.center }}</span></div>
                    <div class="flex items-center justify-between"><div class="flex items-center gap-2 text-[#022B3A]/30"><Clock :size="14" /><span class="text-[9px] font-black uppercase tracking-widest">Propera Sessió</span></div><span class="text-[11px] font-bold text-[#022B3A]">{{ workshop.nextSession }}</span></div>
                    <div class="flex items-center justify-between"><div class="flex items-center gap-2 text-[#022B3A]/30"><Users :size="14" /><span class="text-[9px] font-black uppercase tracking-widest">Alumnes</span></div><div class="flex items-center gap-2"><div class="w-16 h-1.5 bg-[#E1E5F2] rounded-full overflow-hidden"><div class="h-full bg-[#1F7A8C]" :style="{ width: `${(workshop.studentsCount / workshop.places) * 100}%` }"></div></div><span class="text-[11px] font-bold text-[#022B3A]">{{ (workshop.studentsCount || 0) }}/{{ workshop.places }}</span></div></div>
                  </div>
                  <div class="flex flex-wrap gap-2 mb-6"><span v-for="t in workshop.trimestres" :key="t" class="px-2 py-1 bg-[#E1E5F2]/20 border border-[#BFDBF7]/30 rounded-md text-[9px] font-bold text-[#022B3A]/60 uppercase">{{ t }} Trimestre</span></div>
                </div>
                <div class="px-6 py-4 bg-[#F9FAFC] border-t border-[#F1F4F9] flex items-center justify-between mt-auto"><span class="text-[10px] font-black text-[#B8C0CC] tracking-widest uppercase">{{ workshop.ref }}</span><button @click="handleSelectWorkshop(workshop.id)" class="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all shadow-lg bg-[#1F7A8C] text-white shadow-[#1F7A8C]/20 hover:bg-[#166070] hover:scale-105"><ClipboardList :size="14" :strokeWidth="2" />LLISTAT</button></div>
              </div>
            </template>
          </div>
          <div v-else class="p-20 text-center text-[#022B3A]/40 font-bold uppercase tracking-widest text-xs italic border-2 border-dashed border-[#E1E5F2] rounded-3xl">No s'han trobat tallers assignats.</div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
  line-clamp: 2;
}
</style>
