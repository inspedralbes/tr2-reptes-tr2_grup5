
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
  Info
} from 'lucide-vue-next';

// --- MOCK DATA ---
const MY_WORKSHOPS = [
  {
    id: 'w1',
    ref: 'REF-024',
    project: 'PROJECTE A',
    title: 'Robòtica i IA',
    description: 'Disseny i programació de sistemes autònoms avançats utilitzant sensors i microcontroladors.',
    sector: 'Manufacturer',
    places: 12,
    trimestres: ['1r', '2n', '3r'],
    center: 'IES Joan Maragall',
    nextSession: 'Dimarts, 10:00h',
    studentsCount: 4 
  },
  {
    id: 'w2',
    ref: 'REF-031',
    project: 'PROJECTE C',
    title: 'Cuina Creativa',
    description: 'Taller de gastronomia i restauració focalitzat en tècniques modernes de fusió culinària.',
    sector: 'Agroalimentari',
    places: 15,
    trimestres: ['2n', '3r'],
    center: 'Escola El Bosc',
    nextSession: 'Dimecres, 11:30h',
    studentsCount: 14
  },
  {
    id: 'w3',
    ref: 'REF-045',
    project: 'PROJECTE B',
    title: 'Energia Solar',
    description: 'Instal·lació i manteniment de plaques solars en entorns urbans.',
    sector: 'Energètic',
    places: 10,
    trimestres: ['1r'],
    center: 'Institut La Mercè',
    nextSession: 'Dijous, 09:00h',
    studentsCount: 8
  }
];

const MOCK_STUDENTS_DATA = [
  { id: 1, nom: 'Anna', cognoms: 'Vila', email: 'anna.vila@alumne.cat', assistencia: true },
  { id: 2, nom: 'Marc', cognoms: 'Soler', email: 'marc.soler@alumne.cat', assistencia: true },
  { id: 3, nom: 'Laia', cognoms: 'Font', email: 'laia.font@alumne.cat', assistencia: false },
  { id: 4, nom: 'Pau', cognoms: 'Riera', email: 'pau.riera@alumne.cat', assistencia: true },
];

// --- STATE ---
const searchQuery = ref('');
const viewMode = ref('grid'); // 'grid' | 'list'
const selectedWorkshopId = ref(null);
const showAddModal = ref(false);
const newStudents = ref([]);
const mockStudents = ref([...MOCK_STUDENTS_DATA]);

// --- COMPUTED ---
const filteredWorkshops = computed(() => {
  return MY_WORKSHOPS.filter(w => 
    w.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    w.center.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const selectedWorkshop = computed(() => {
  return MY_WORKSHOPS.find(w => w.id === selectedWorkshopId.value);
});

// --- METHODS ---
const getProjectStyles = (project) => {
  switch (project) {
    case 'PROJECTE A': return 'bg-[#FFF0EB] text-[#FB6107] border-[#FB6107]/20';
    case 'PROJECTE B': return 'bg-[#F0F7E9] text-[#7CB518] border-[#7CB518]/20';
    case 'PROJECTE C': return 'bg-[#FFF7E6] text-[#FBB02D] border-[#FBB02D]/20';
    default: return 'bg-white/40 text-[#022B3A] border-white/60';
  }
};

const openAddModal = () => {
  if (!selectedWorkshop.value) return;
  const remainingSlots = selectedWorkshop.value.places - mockStudents.value.length;
  const count = remainingSlots > 0 ? remainingSlots : 1;
  
  newStudents.value = Array.from({ length: count }, (_, i) => ({
      id: i,
      nom: '', 
      cognoms: '', 
      email: ''
  }));
  showAddModal.value = true;
};

const handleBack = () => {
  selectedWorkshopId.value = null;
};

const handleSelectWorkshop = (id) => {
  selectedWorkshopId.value = id;
};

const handleSaveStudents = () => {
    // Logic to save would go here
    showAddModal.value = false;
    // alert('Alumnes registrats correctament');
};

</script>

<template>
  <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
    
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
                <tr v-for="student in mockStudents" :key="student.id" class="hover:bg-[#E1E5F2]/5 transition-colors group">
                    <td class="p-5 pl-8">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg bg-[#1F7A8C]/10 text-[#1F7A8C] flex items-center justify-center font-black text-xs">
                                {{ student.nom[0] }}{{ student.cognoms[0] }}
                            </div>
                            <div>
                                <p class="text-sm font-bold text-[#022B3A]">{{ student.nom }} {{ student.cognoms }}</p>
                                <p class="text-[10px] text-[#022B3A]/40 font-medium">ID: ST-{{ student.id.toString().padStart(3,'0') }}</p>
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
                        student.assistencia 
                          ? 'bg-[#F0F7E9] text-[#7CB518] border-[#7CB518]/20 hover:bg-[#7CB518] hover:text-white' 
                          : 'bg-red-50 text-red-400 border-red-200 hover:bg-red-400 hover:text-white'
                      ]">
                        <CheckCircle2 v-if="student.assistencia" :size="10" />
                        <X v-else :size="10" />
                        {{ student.assistencia ? 'Present' : 'Absent' }}
                      </button>
                    </td>
                    <td class="p-5 pr-8 text-right">
                      <button class="p-2 text-[#022B3A]/20 hover:text-[#1F7A8C] hover:bg-[#1F7A8C]/5 rounded-lg transition-colors">
                        <MoreVertical :size="16" />
                      </button>
                    </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Footer of Table -->
          <div class="p-4 bg-[#E1E5F2]/10 border-t border-[#BFDBF7]/20 flex justify-between items-center px-8">
             <span class="text-[10px] font-bold text-[#022B3A]/30 uppercase tracking-widest">Capacitat: {{ mockStudents.length }} / {{ selectedWorkshop.places }}</span>
             <div class="h-1.5 w-32 bg-[#BFDBF7]/20 rounded-full overflow-hidden">
                <div class="h-full bg-[#1F7A8C]" :style="{ width: `${(mockStudents.length / selectedWorkshop.places) * 100}%` }"></div>
             </div>
          </div>
        </div>

        <!-- MODAL: ADD STUDENTS -->
        <div v-if="showAddModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <div class="absolute inset-0 bg-[#022B3A]/60 backdrop-blur-sm animate-in fade-in duration-200" @click="showAddModal = false"></div>
             <div class="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 flex flex-col max-h-[85vh]">
                
                <!-- Modal Header -->
                <div class="p-8 border-b border-[#BFDBF7]/20 flex justify-between items-start bg-white">
                   <div>
                      <h2 class="text-2xl font-black text-[#022B3A] tracking-tight">Registrar Nous Alumnes</h2>
                      <p class="text-[#022B3A]/40 text-[11px] font-bold uppercase tracking-wider mt-1">
                         {{ selectedWorkshop.title }} — {{ selectedWorkshop.project }}
                      </p>
                   </div>
                   <button 
                    @click="showAddModal = false"
                    class="p-2 text-[#022B3A]/20 hover:text-[#022B3A] hover:bg-[#E1E5F2]/20 rounded-lg transition-all"
                   >
                      <X :size="20" />
                   </button>
                </div>

                <!-- Modal Body -->
                <div class="p-8 bg-[#F9FAFC] overflow-y-auto flex-1 space-y-4">
                   <div class="flex items-center gap-2 mb-4 p-4 bg-[#1F7A8C]/5 border border-[#1F7A8C]/10 rounded-xl text-[#1F7A8C]">
                      <Info :size="16" />
                      <span class="text-[11px] font-bold">Tens {{ newStudents.length }} places disponibles per assignar.</span>
                   </div>

                   <div v-for="(student, index) in newStudents" :key="index" class="flex flex-col md:flex-row gap-4 items-center bg-white p-5 rounded-xl border border-[#BFDBF7]/40 shadow-sm group hover:border-[#1F7A8C]/30 transition-all">
                         
                         <div class="hidden md:flex w-8 h-8 rounded-lg bg-[#E1E5F2]/20 text-[#022B3A]/30 items-center justify-center text-[10px] font-black border border-[#BFDBF7]/20 flex-shrink-0 group-hover:bg-[#1F7A8C]/10 group-hover:text-[#1F7A8C] transition-colors">
                            {{ index + 1 }}
                         </div>
                         
                         <div class="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                             <div class="space-y-1">
                                 <label class="text-[8px] font-black text-[#022B3A]/30 uppercase tracking-widest ml-1">Nom</label>
                                 <div class="relative">
                                     <User :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-[#022B3A]/20" />
                                     <input 
                                         type="text" 
                                         v-model="student.nom"
                                         class="w-full bg-[#E1E5F2]/5 border border-[#BFDBF7]/60 rounded-lg pl-9 pr-3 py-2.5 text-sm font-bold text-[#022B3A] focus:bg-white focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] outline-none transition-all"
                                         placeholder="Nom"
                                     />
                                 </div>
                             </div>

                             <div class="space-y-1">
                                 <label class="text-[8px] font-black text-[#022B3A]/30 uppercase tracking-widest ml-1">Cognoms</label>
                                 <input 
                                     type="text" 
                                     v-model="student.cognoms"
                                     class="w-full bg-[#E1E5F2]/5 border border-[#BFDBF7]/60 rounded-lg px-4 py-2.5 text-sm font-bold text-[#022B3A] focus:bg-white focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] outline-none transition-all"
                                     placeholder="Cognoms"
                                 />
                             </div>

                             <div class="space-y-1">
                                 <label class="text-[8px] font-black text-[#022B3A]/30 uppercase tracking-widest ml-1">Email</label>
                                 <div class="relative">
                                     <Mail :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-[#022B3A]/20" />
                                     <input 
                                         type="email" 
                                         v-model="student.email"
                                         class="w-full bg-[#E1E5F2]/5 border border-[#BFDBF7]/60 rounded-lg pl-9 pr-3 py-2.5 text-sm font-bold text-[#022B3A] focus:bg-white focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] outline-none transition-all"
                                         placeholder="alumne@centre.cat"
                                     />
                                 </div>
                             </div>
                         </div>
                      </div>
                </div>

                <!-- Modal Footer -->
                <div class="p-6 bg-white border-t border-[#BFDBF7]/20 flex justify-end gap-3 flex-shrink-0">
                   <button 
                     @click="showAddModal = false"
                     class="px-8 py-3 rounded-xl text-[10px] font-black text-[#022B3A]/40 uppercase tracking-widest hover:text-[#022B3A] hover:bg-[#E1E5F2]/20 transition-all"
                   >
                      Cancel·lar
                   </button>
                   <button 
                     @click="handleSaveStudents"
                     class="px-8 py-3 bg-[#1F7A8C] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#022B3A] shadow-lg shadow-[#1F7A8C]/20 transition-all flex items-center gap-2"
                   >
                      <Save :size="16" />
                      Guardar Registres
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
          <input 
            type="text" 
            placeholder="Cercar per títol o centre..."
            v-model="searchQuery"
            class="w-full bg-[#E1E5F2]/10 border border-transparent rounded-lg pl-11 pr-4 py-2.5 text-[11px] font-bold focus:bg-white focus:border-[#BFDBF7] focus:ring-4 focus:ring-[#1F7A8C]/5 outline-none transition-all placeholder:text-[#022B3A]/20"
          />
        </div>

        <div class="flex items-center gap-2 bg-[#E1E5F2]/30 p-1 rounded-lg border border-[#BFDBF7]/20 w-full sm:w-auto justify-center sm:justify-end">
          <div class="flex items-center gap-1 pr-2 border-r border-[#BFDBF7]/30">
            <button 
              @click="viewMode = 'grid'"
              :class="[
                'p-2 rounded-lg shadow-sm border transition-all',
                viewMode === 'grid' 
                  ? 'text-[#1F7A8C] bg-white border-[#BFDBF7]/40 shadow-sm' 
                  : 'text-[#022B3A]/20 border-transparent hover:text-[#022B3A]'
              ]"
            >
              <LayoutGrid :size="14" />
            </button>
            <button 
              @click="viewMode = 'list'"
              :class="[
                'p-2 rounded-lg shadow-sm border transition-all',
                viewMode === 'list' 
                  ? 'text-[#1F7A8C] bg-white border-[#BFDBF7]/40 shadow-sm' 
                  : 'text-[#022B3A]/20 border-transparent hover:text-[#022B3A]'
              ]"
            >
              <List :size="14" />
            </button>
          </div>
          <button class="flex items-center gap-2 px-3 py-1.5 text-[#022B3A]/50 hover:text-[#022B3A] text-[9px] font-black uppercase tracking-widest transition-colors">
            <Filter :size="12" /> ORDRE
          </button>
        </div>
      </div>

      <div :class="viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'flex flex-col gap-3'">
        <template v-for="workshop in filteredWorkshops" :key="workshop.id">
          
          <!-- LIST VIEW CARD -->
          <div 
            v-if="viewMode === 'list'"
            class="bg-white rounded-xl border border-[#E1E5F2] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 hover:shadow-lg transition-all hover:border-[#BFDBF7] group"
          >
             <div class="flex items-center gap-4 flex-1 min-w-0">
                <div :class="['w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center font-black text-[9px] uppercase border tracking-widest', getProjectStyles(workshop.project)]">
                    {{ workshop.project.split(' ')[1] }}
                </div>
                <div class="min-w-0">
                    <div class="flex items-center gap-3 mb-0.5">
                      <h3 class="text-base font-black text-[#022B3A] truncate">{{ workshop.title }}</h3>
                      <span class="hidden sm:inline-block px-2 py-0.5 bg-[#F4F7FB] border border-[#E1E5F2] rounded text-[9px] font-black text-[#022B3A]/50 uppercase tracking-widest">{{ workshop.center }}</span>
                    </div>
                    <p class="text-[11px] font-medium text-[#8E9AAF] truncate">{{ workshop.description }}</p>
                </div>
             </div>

             <div class="hidden lg:flex items-center gap-8 flex-shrink-0">
                <div class="flex flex-col items-end min-w-[60px]">
                  <span class="text-[9px] font-black text-[#B8C0CC] uppercase tracking-widest">Alumnes</span>
                  <span class="text-xs font-bold text-[#022B3A]">{{ workshop.studentsCount }} / {{ workshop.places }}</span>
                </div>
                <div class="flex flex-col items-end min-w-[80px]">
                  <span class="text-[9px] font-black text-[#B8C0CC] uppercase tracking-widest">Sessió</span>
                  <span class="text-xs font-bold text-[#022B3A]">{{ workshop.nextSession }}</span>
                </div>
             </div>

             <div class="flex items-center justify-end gap-3 md:border-l md:border-[#F1F4F9] md:pl-6">
                <span class="hidden md:block text-[9px] font-black text-[#B8C0CC] tracking-widest uppercase mr-2">
                  {{ workshop.ref }}
                </span>
                <button 
                  @click="handleSelectWorkshop(workshop.id)"
                  class="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all shadow-md bg-[#1F7A8C] text-white hover:bg-[#022B3A] shadow-[#1F7A8C]/20 hover:scale-105"
                >
                   <ClipboardList :size="14" :strokeWidth="2" />
                   LLISTAT
                </button>
             </div>
          </div>

          <!-- GRID VIEW CARD -->
          <div 
            v-else
            class="bg-white rounded-2xl border border-[#E1E5F2] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden group"
          >
            
            <div class="p-6 pb-4 flex justify-between items-center">
              <span :class="['px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.1em] border', getProjectStyles(workshop.project)]">
                {{ workshop.project }}
              </span>
              <div class="flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-[#7CB518] animate-pulse"></div>
                <span class="text-[9px] font-black text-[#022B3A]/40 uppercase tracking-widest">En Curs</span>
              </div>
            </div>

            <div class="px-6 flex-1">
              <h3 class="text-xl font-black text-[#022B3A] mb-2 leading-tight group-hover:text-[#1F7A8C] transition-colors">
                {{ workshop.title }}
              </h3>
              <p class="text-[#022B3A]/50 text-xs font-medium leading-relaxed mb-6 line-clamp-2">
                {{ workshop.description }}
              </p>

              <div class="space-y-3 mb-6">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 text-[#022B3A]/30">
                    <School :size="14" />
                    <span class="text-[9px] font-black uppercase tracking-widest">Centre Assignat</span>
                  </div>
                  <span class="text-[11px] font-bold text-[#022B3A]">{{ workshop.center }}</span>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 text-[#022B3A]/30">
                    <Clock :size="14" />
                    <span class="text-[9px] font-black uppercase tracking-widest">Propera Sessió</span>
                  </div>
                  <span class="text-[11px] font-bold text-[#022B3A]">{{ workshop.nextSession }}</span>
                </div>

                <div class="flex items-center justify-between">
                   <div class="flex items-center gap-2 text-[#022B3A]/30">
                    <Users :size="14" />
                    <span class="text-[9px] font-black uppercase tracking-widest">Alumnes</span>
                  </div>
                  <div class="flex items-center gap-2">
                      <div class="w-16 h-1.5 bg-[#E1E5F2] rounded-full overflow-hidden">
                          <div class="h-full bg-[#1F7A8C]" :style="{ width: `${(workshop.studentsCount / workshop.places) * 100}%` }"></div>
                      </div>
                      <span class="text-[11px] font-bold text-[#022B3A]">{{ workshop.studentsCount }}/{{ workshop.places }}</span>
                  </div>
                </div>
              </div>

              <div class="flex flex-wrap gap-2 mb-6">
                 <span v-for="t in workshop.trimestres" :key="t" class="px-2 py-1 bg-[#E1E5F2]/20 border border-[#BFDBF7]/30 rounded-md text-[9px] font-bold text-[#022B3A]/60 uppercase">
                    {{ t }} Trimestre
                 </span>
              </div>
            </div>

            <div class="px-6 py-4 bg-[#F9FAFC] border-t border-[#F1F4F9] flex items-center justify-between mt-auto">
               <span class="text-[10px] font-black text-[#B8C0CC] tracking-widest uppercase">
                {{ workshop.ref }}
              </span>
              
               <button 
                 @click="handleSelectWorkshop(workshop.id)"
                 class="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all shadow-lg bg-[#1F7A8C] text-white shadow-[#1F7A8C]/20 hover:bg-[#166070] hover:scale-105"
               >
                 <ClipboardList :size="14" :strokeWidth="2" />
                 LLISTAT
               </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
