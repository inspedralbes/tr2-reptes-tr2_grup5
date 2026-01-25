<template>
  <div class="min-h-screen">
    
    <!-- VIEW 1: SELECTION GRID -->
    <div v-if="step === 'selection'" class="animate-in fade-in slide-in-from-left-4 duration-500 pb-24 relative">
       
       <!-- 1. Header -->
       <div class="mb-10">
          <h1 class="text-4xl md:text-5xl font-black text-[#022B3A] tracking-tighter leading-none mb-3">
            Sol·licitud de <span class="text-[#1F7A8C]">Tallers</span>
          </h1>
          <p class="text-[#022B3A]/40 text-[10px] font-black uppercase tracking-[0.2em]">
            Selecciona els tallers que t'interessen per al teu centre.
          </p>
       </div>

      <!-- 2. Search & Filter Bar -->
      <div class="bg-white p-2 rounded-xl border border-[#BFDBF7]/60 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm relative z-20">
        <div class="relative flex-1 max-w-md group w-full ml-1">
          <Search :size="14" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
          <input 
            type="text" 
            placeholder="Cerca per títol, sector o projecte..."
            v-model="searchQuery"
            class="w-full bg-[#E1E5F2]/10 border border-transparent rounded-lg pl-11 pr-4 py-2.5 text-[11px] font-bold focus:bg-white focus:border-[#BFDBF7] focus:ring-4 focus:ring-[#1F7A8C]/5 outline-none transition-all placeholder:text-[#022B3A]/20"
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
          <button class="flex items-center gap-2 px-3 py-1.5 text-[#022B3A]/50 hover:text-[#022B3A] text-[9px] font-black uppercase tracking-widest">
            <Filter :size="12" /> ORDRE
          </button>
        </div>
      </div>

      <!-- CLOSED PERIOD WARNING BANNER (Placed below search as requested) -->
      <div v-if="!isRegistrationOpen" class="flex items-center gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl shadow-sm animate-in slide-in-from-top-2 duration-500 mb-8">
         <div class="bg-red-100 p-2 rounded-full text-red-500">
            <Ban :size="18" :strokeWidth="2.5" />
         </div>
         <div>
            <h4 class="text-sm font-black text-red-600 uppercase tracking-wide">Període d'inscripció tancat</h4>
            <p class="text-[11px] font-bold text-red-400 mt-0.5">{{ periodDates }}</p>
         </div>
      </div>

      <!-- OPEN PERIOD BANNER -->
      <div v-if="isRegistrationOpen" class="flex items-center gap-3 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-xl shadow-sm animate-in slide-in-from-top-2 duration-500 mb-8">
         <div class="bg-green-100 p-2 rounded-full text-green-500">
            <Check :size="18" :strokeWidth="2.5" />
         </div>
         <div>
            <h4 class="text-sm font-black text-green-600 uppercase tracking-wide">Període d'inscripció obert</h4>
            <p class="text-[11px] font-bold text-green-400 mt-0.5">{{ periodDates }}</p>
         </div>
      </div>

      <!-- 3. Workshops Container -->
      <div :class="viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'flex flex-col gap-3'">
        <template v-for="workshop in filteredWorkshops" :key="workshop.id">
          
          <!-- LIST VIEW -->
          <div 
            v-if="viewMode === 'list'"
            :class="[
              'bg-white rounded-xl border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 transition-all group',
              addedWorkshops.includes(workshop.id) ? 'border-[#1F7A8C] ring-1 ring-[#1F7A8C] shadow-[#1F7A8C]/5' : 'border-[#E1E5F2] hover:border-[#BFDBF7] hover:shadow-lg',
              !isRegistrationOpen ? 'opacity-75 grayscale-[0.5]' : ''
            ]"
          >
            <!-- Content -->
            <div class="flex items-center gap-4 flex-1 min-w-0">
                <div :class="['w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center font-black text-[9px] uppercase border tracking-widest', getProjectStyles(workshop.project)]">
                  {{ workshop.project.split(' ')[1] }}
                </div>
                <div class="min-w-0">
                  <h3 class="text-base font-black text-[#022B3A] truncate">{{ workshop.title }}</h3>
                  <p class="text-[11px] font-medium text-[#8E9AAF] truncate">{{ workshop.description }}</p>
                </div>
            </div>
            
            <div class="flex items-center justify-end gap-4 md:border-l md:border-[#F1F4F9] md:pl-6">
               <button 
                @click="toggleWorkshop(workshop.id)"
                :disabled="!isRegistrationOpen"
                :class="[
                  'flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all shadow-md',
                  !isRegistrationOpen 
                    ? 'bg-white border border-red-100 text-red-400 shadow-none cursor-not-allowed'
                    : addedWorkshops.includes(workshop.id) 
                      ? 'bg-[#022B3A] text-white shadow-[#022B3A]/20 hover:scale-105' 
                      : 'bg-[#1F7A8C] text-white shadow-[#1F7A8C]/20 hover:bg-[#166070] hover:scale-105'
                ]"
              >
                <template v-if="!isRegistrationOpen">
                   <Ban :size="12" :strokeWidth="3" /> Tancat
                </template>
                <template v-else-if="addedWorkshops.includes(workshop.id)">
                   <Check :size="12" :strokeWidth="3" /> SELECCIONAT
                </template>
                <template v-else>
                   <Plus :size="12" :strokeWidth="3" /> AFEGIR
                </template>
              </button>
            </div>
          </div>

          <!-- GRID VIEW CARD (Matches Style Requested) -->
          <div 
            v-else
            :class="[
              'bg-white rounded-2xl border shadow-sm transition-all duration-300 flex flex-col h-full overflow-hidden group',
              addedWorkshops.includes(workshop.id) ? 'border-[#1F7A8C] ring-1 ring-[#1F7A8C] shadow-[#1F7A8C]/10' : 'border-[#E1E5F2] hover:shadow-xl hover:-translate-y-1',
              !isRegistrationOpen ? 'opacity-75 grayscale-[0.5]' : ''
            ]"
          >
            <!-- Header Badges -->
            <div class="p-6 pb-4 flex justify-between items-center">
              <span :class="['px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.1em] border', getProjectStyles(workshop.project)]">
                {{ workshop.project }}
              </span>
              <div class="bg-[#F4F7FB] px-3 py-1.5 rounded-md border border-[#E1E5F2]/60 flex items-center gap-2">
                <span class="text-[9px] font-black text-[#022B3A]/50 uppercase tracking-widest">{{ workshop.sector }}</span>
              </div>
            </div>

            <!-- Title & Desc -->
            <div class="px-6 flex-1">
              <h3 class="text-[20px] font-black text-[#022B3A] mb-2 leading-tight tracking-tight">
                {{ workshop.title }}
              </h3>
              <p class="text-[#8E9AAF] text-[12px] leading-relaxed font-medium mb-6 line-clamp-2">
                {{ workshop.description }}
              </p>
              
              <!-- Metadata Rows (Style 2) -->
              <div class="space-y-3 mb-6">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2.5 text-[#B8C0CC]">
                    <Users :size="16" :strokeWidth="1.5" />
                    <span class="text-[9px] font-black uppercase tracking-widest">Places</span>
                  </div>
                  <span class="text-[12px] font-black text-[#022B3A]">{{ workshop.places }} alumnes</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2.5 text-[#B8C0CC]">
                    <CalendarDays :size="16" :strokeWidth="1.5" />
                    <span class="text-[9px] font-black uppercase tracking-widest">Trimestres</span>
                  </div>
                  <span class="text-[12px] font-black text-[#022B3A]">{{ workshop.trimestres.join(', ') }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2.5 text-[#B8C0CC]">
                    <Calendar :size="16" :strokeWidth="1.5" />
                    <span class="text-[9px] font-black uppercase tracking-widest">Data</span>
                  </div>
                  <span class="text-[12px] font-black text-[#022B3A]">{{ formatDate(workshop.raw.data_execucio) }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2.5 text-[#B8C0CC]">
                    <MapPin :size="16" :strokeWidth="1.5" />
                    <span class="text-[9px] font-black uppercase tracking-widest">Adreça</span>
                  </div>
                  <span class="text-[12px] font-black text-[#022B3A] truncate max-w-[150px] text-right">Campus ENGINY - Edif. B</span>
                </div>
              </div>
            </div>
            
            <!-- Footer Button -->
            <div class="px-6 py-4 bg-[#F9FAFC] border-t border-[#F1F4F9] flex items-center justify-between mt-auto">
              <span class="text-[10px] font-black text-[#B8C0CC] tracking-widest uppercase">
                REF-{{ workshop.index.toString().padStart(3, '0') }}
              </span>
              
              <button 
                @click="toggleWorkshop(workshop.id)"
                :disabled="!isRegistrationOpen"
                :class="[
                  'flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all shadow-lg hover:scale-105',
                  !isRegistrationOpen 
                    ? 'bg-white border border-red-100 text-red-400 shadow-none cursor-not-allowed'
                    : addedWorkshops.includes(workshop.id) 
                      ? 'bg-[#022B3A] text-white shadow-[#022B3A]/20' 
                      : 'bg-[#1F7A8C] text-white shadow-[#1F7A8C]/20 hover:bg-[#166070]'
                ]"
              >
                <template v-if="!isRegistrationOpen">
                   <Ban :size="14" :strokeWidth="3" /> Tancat
                </template>
                <template v-else-if="addedWorkshops.includes(workshop.id)">
                   <Check :size="14" :strokeWidth="3" /> SELECCIONAT
                </template>
                <template v-else>
                   <Plus :size="14" :strokeWidth="3" /> AFEGIR
                </template>
              </button>
            </div>
          </div>

        </template>
      </div>

      <!-- Fixed Bottom Bar -->
      <div v-if="addedWorkshops.length > 0 && isRegistrationOpen" class="fixed bottom-0 right-0 left-0 md:left-[280px] bg-white border-t border-[#BFDBF7] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] p-6 z-40 animate-in slide-in-from-bottom-10 duration-300">
        <div class="max-w-[1400px] mx-auto flex items-center justify-between px-8 md:px-12">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-[#1F7A8C] rounded-full flex items-center justify-center text-white font-black shadow-lg shadow-[#1F7A8C]/30">
              {{ addedWorkshops.length }}
            </div>
            <p class="text-sm font-black text-[#022B3A]">taller(s) seleccionats</p>
          </div>
          
          <button 
            @click="step = 'details'"
            class="flex items-center gap-3 px-8 py-3.5 bg-[#022B3A] text-white font-black text-[11px] uppercase tracking-[0.15em] rounded-xl hover:bg-[#1F7A8C] transition-colors shadow-xl shadow-[#022B3A]/20"
          >
            Continuar Sol·licitud
            <ArrowRight :size="16" />
          </button>
        </div>
      </div>
    </div>

    <!-- VIEW 2: DETAILS FORM -->
    <div v-else class="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      
      <!-- Header with Square Back Button -->
      <div class="mb-8">
         <button 
           @click="step = 'selection'"
           class="w-14 h-14 bg-white border border-[#BFDBF7] rounded-xl flex items-center justify-center text-[#022B3A]/40 hover:text-[#1F7A8C] hover:border-[#1F7A8C] transition-all shadow-sm group"
         >
            <ArrowLeft :size="24" class="group-hover:-translate-x-1 transition-transform" />
         </button>
      </div>

      <!-- Cards Area -->
      <div class="max-w-4xl mx-auto space-y-8"> 
        <div v-for="workshop in selectedWorkshopDetails" :key="workshop.id" class="bg-white rounded-2xl border border-[#BFDBF7] shadow-xl shadow-[#022B3A]/5 overflow-hidden">
             
             <!-- Card Header -->
             <div class="flex items-center gap-3 p-8 pb-0">
                <div class="w-10 h-10 rounded-xl bg-[#1F7A8C]/10 text-[#1F7A8C] flex items-center justify-center">
                   <FileText :size="20" />
                </div>
                <div>
                   <h3 class="text-[13px] font-black text-[#022B3A] uppercase tracking-widest">{{ workshop.title }}</h3>
                   <div class="flex items-center gap-2">
                      <span class="text-[10px] font-bold text-[#022B3A]/40 uppercase tracking-widest">Ref: {{ workshop.id }}</span>
                      <span :class="['px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border', getProjectStyles(workshop.project)]">{{ workshop.project }}</span>
                   </div>
                </div>
             </div>

             <!-- Form Content -->
             <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-8" :set="formModel = getFormModel(workshop.id)">
                
                <div class="space-y-6">
 <div class="space-y-2">
                    <label class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-[0.15em] ml-1">Trimestre Preferent *</label>
                    <div class="relative">
                      <select v-model="formModel.trimestre" class="w-full bg-[#E1E5F2]/20 border border-[#BFDBF7] rounded-xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] outline-none transition-all appearance-none cursor-pointer text-[#022B3A]">
                        <option value="" disabled>Selecciona un trimestre</option>
                        <option value="1r">1r Trimestre (Tardor)</option>
                        <option value="2n">2n Trimestre (Hivern)</option>
                        <option value="3r">3r Trimestre (Primavera)</option>
                      </select>
                      <div class="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#022B3A]/40">
                        <ArrowRight :size="14" class="rotate-90" />
                      </div>
                    </div>
                  </div>

                  <label class="flex items-center gap-3 cursor-pointer group select-none p-4 bg-[#E1E5F2]/10 border border-[#BFDBF7]/30 rounded-xl hover:bg-white hover:border-[#1F7A8C]/30 hover:shadow-md transition-all">
                      <div class="relative flex-shrink-0">
                        <input type="checkbox" v-model="formModel.es_preferencia_referent" class="peer sr-only" />
                        <div class="w-5 h-5 border-2 border-[#BFDBF7] rounded-md peer-checked:bg-[#1F7A8C] peer-checked:border-[#1F7A8C] transition-all bg-white group-hover:border-[#1F7A8C]/50"></div>
                        <Check :size="14" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity" :strokeWidth="4" />
                      </div>
                      <div>
                         <span class="text-xs font-bold text-[#022B3A] group-hover:text-[#1F7A8C] transition-colors block">Preferència Referent</span>
                         <span class="text-[10px] text-[#022B3A]/40 font-medium leading-tight block mt-0.5">Marca si voleu un docent concret com a referent.</span>
                      </div>
                   </label>
                </div>

                <div class="space-y-2">
                  <label class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-[0.15em] ml-1">Num. Participants (max 4) *</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="4"
                    v-model="formModel.num_participants"
                    class="w-full bg-[#E1E5F2]/20 border border-[#BFDBF7] rounded-xl px-5 py-4 text-sm font-bold text-[#022B3A] focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] outline-none transition-all"
                  />
                </div>

                <div class="md:col-span-2 grid grid-cols-1 md:grid-cols-12 gap-4 border-t border-[#BFDBF7]/10 pt-6">
                   <div class="md:col-span-7 space-y-2">
                     <label class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-[0.15em] ml-1">Docent Responsable *</label>
                     <div class="relative">
                        <select v-model="formModel.docent_nom" class="w-full bg-[#E1E5F2]/20 border border-[#BFDBF7] rounded-xl px-5 py-4 text-sm font-medium text-[#022B3A] focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] outline-none transition-all appearance-none">
                           <option value="" disabled>Selecciona un docent</option>
                           <option v-for="d in docents" :key="d" :value="d">{{ d }}</option>
                        </select>
                        <div class="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#022B3A]/40">
                           <ArrowRight :size="12" class="rotate-90" />
                        </div>
                     </div>
                   </div>
                   <!-- Optional: Button to add new docent could go here if implemented -->
                </div>

                <div class="md:col-span-2 space-y-2 border-t border-[#BFDBF7]/10 pt-4">
                  <label class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-[0.15em] ml-1">Prioritat (1-10) *</label>
                  <div class="max-w-[140px]">
                    <input 
                      type="number" 
                      min="1" 
                      max="10"
                      v-model="formModel.prioritat"
                      class="w-full bg-[#E1E5F2]/20 border border-[#BFDBF7] rounded-xl px-5 py-4 text-sm font-bold text-[#022B3A] focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] outline-none transition-all"
                    />
                  </div>
                  <p class="text-[9px] font-bold text-[#022B3A]/40 uppercase tracking-wider ml-1">1: Màxima — 10: Mínima</p>
                </div>

                <div class="md:col-span-2 space-y-2">
                   <label class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-[0.15em] ml-1">Observacions</label>
                   <textarea 
                      rows="3"
                      v-model="formModel.descripcio"
                      placeholder="Detalls específics..."
                      class="w-full bg-[#E1E5F2]/20 border border-[#BFDBF7] rounded-xl px-6 py-5 text-sm font-medium focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 resize-none"
                   ></textarea>
                </div>

             </div>
        </div>

        <!-- Footer Actions -->
        <div class="p-10 bg-white rounded-2xl border border-[#BFDBF7] shadow-xl shadow-[#022B3A]/5 flex items-center justify-between gap-6">
            <div class="flex items-center gap-2 text-[10px] font-bold text-[#022B3A]/30 italic">
              <Info :size="14" />
              Revisa les dades abans d'enviar la sol·licitud
            </div>
            
            <div class="flex items-center gap-3">
              <button 
                @click="step = 'selection'"
                class="px-8 py-4 text-[11px] font-black text-[#022B3A]/40 uppercase tracking-widest hover:text-[#022B3A] transition-all"
              >
                Cancel·lar
              </button>
              <button 
                @click="handleSubmit"
                class="flex items-center gap-3 px-10 py-4 bg-[#1F7A8C] text-white font-black text-[12px] uppercase tracking-[0.1em] rounded-xl hover:bg-[#022B3A] transition-all shadow-xl shadow-[#1F7A8C]/20 group"
              >
                <Save :size="18" />
                CONFIRMAR SOL·LICITUD
              </button>
            </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  MapPin, 
  Search, 
  LayoutGrid, 
  List, 
  Filter, 
  Ban, 
  Check, 
  Plus, 
  Users, 
  Calendar, // Changed from CalendarDays to match Lucide export if needed, usually Calendar or CalendarDays
  ArrowRight, 
  ArrowLeft, 
  FileText, 
  UserPlus, 
  Info, 
  Save,
  CalendarDays
} from 'lucide-vue-next';

// ======================================
// CONFIG & STATE
// ======================================
const tokenCookie = useCookie('authToken');
const centre = ref(null);
const tallers = ref([]);
const professors = ref([]);
const selectedTallers = ref([]); // Stores full objects

// UI State matching template
const step = ref('selection'); // 'selection' | 'details'
const viewMode = ref('grid');
const searchQuery = ref('');
const submitting = ref(false);

// Form data for submission
const form = ref({
  tallers: []
});

// ======================================
// COMPUTED PROPERTIES
// ======================================

// Helper for dates
const parseLocal = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  return new Date(parts[0], parts[1] - 1, parts[2]); 
};

const isRegistrationOpen = computed(() => {
  if (!centre.value?.config) return false;
  const now = new Date();
  const start = parseLocal(centre.value.config.enrollment_start);
  const end = parseLocal(centre.value.config.enrollment_end);
  if (!start || !end) return false;
  end.setHours(23, 59, 59, 999);
  return now >= start && now <= end;
});

const isEnrollmentOpen = isRegistrationOpen; // Alias for compatibility if needed

const periodDates = computed(() => {
  if (!centre.value?.config) return 'Dates no disponibles';
  const start = formatDate(centre.value.config.enrollment_start);
  const end = formatDate(centre.value.config.enrollment_end);
  return `${start} - ${end}`;
});

// Mapped workshops for UI
const filteredWorkshops = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  let list = tallers.value || [];
  
  // Filter
  if (query) {
    list = list.filter(t => 
      (t.titol || '').toLowerCase().includes(query) || 
      (t.sector || '').toLowerCase().includes(query) ||
      (t.modalitat || '').toLowerCase().includes(query)
    );
  }

  // Map to UI High Fidelity structure
  return list.map((t, idx) => ({
    id: t.id,
    index: idx + 1,
    title: t.titol,
    description: t.descripcio || 'Sense descripció disponible',
    project: `Projecte ${t.modalitat}`, // "Projecte A"
    sector: t.sector,
    places: t.places_maximes,
    trimestres: parseTrimestres(t.trimestres_disponibles),
    raw: t // Keep original data
  }));
});

const addedWorkshops = computed(() => {
  return selectedTallers.value.map(t => t.id);
});

// For Step 2: Form Details
// We map the selected tallers to the form structure if not already there, 
// or preserve existing form state if jumping back and forth.
const selectedWorkshopDetails = computed(() => {
  return selectedTallers.value.map(t => {
    // Find styled info
    const styled = filteredWorkshops.value.find(fw => fw.id === t.id);
    return {
      ...t, // Original ID and data
      title: t.titol,
      project: `Projecte ${t.modalitat || '?'}`,
      // Map properties for the form view display
    };
  });
});

const docents = computed(() => {
  return professors.value.map(p => `${p.nom} ${p.cognoms}`);
});

// ======================================
// METHODS
// ======================================

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-ES');
}

function parseTrimestres(val) {
  if (Array.isArray(val)) return val;
  if (!val) return [];
  return String(val).split(',').map(s => s.trim());
}

function getProjectStyles(projectString) {
  const p = (projectString || '').toUpperCase();
  if (p.includes('A') || p.includes('MANUF')) return 'bg-[#FFF0EB] text-[#FB6107] border-[#FB6107]/20';
  if (p.includes('B') || p.includes('ENER')) return 'bg-[#F0F7E9] text-[#7CB518] border-[#7CB518]/20';
  if (p.includes('C') || p.includes('AGRO')) return 'bg-[#FFF7E6] text-[#FBB02D] border-[#FBB02D]/20';
  return 'bg-white/40 text-[#022B3A] border-white/60';
}

function toggleWorkshop(id) {
  if (!isRegistrationOpen.value) {
    alert("El període d'inscripció està tancat.");
    return;
  }
  
  const existingIdx = selectedTallers.value.findIndex(t => t.id === id);
  if (existingIdx > -1) {
    // Remove
    selectedTallers.value.splice(existingIdx, 1);
    // Also remove from form state
    const formIdx = form.value.tallers.findIndex(ft => ft.taller_id === id);
    if (formIdx > -1) form.value.tallers.splice(formIdx, 1);
  } else {
    // Add
    const original = tallers.value.find(t => t.id === id);
    if (original) {
      selectedTallers.value.push(original);
      // Init form entry
      form.value.tallers.push({
        taller_id: original.id,
        trimestre: '',
        num_participants: 1,
        docent_nom: '',
        docent_email: '',
        prioritat: 1,
        es_preferencia_referent: false,
        descripcio: '',
        // Auxiliary for UI mapping if needed
        _title: original.titol
      });
    }
  }
}

// Ensure form data matches mapped objects in Step 2 loop
// The template iterates `selectedWorkshopDetails` but inputs bind to `?`
// We need to link the UI loop to the `form.tallers` state.
// Since the template uses `v-for="workshop in selectedWorkshopDetails"`, 
// we should probably iterate `form.tallers` and look up display info, OR 
// use a computed that merges both.
// Let's create a helper to get the specific form model for a workshop ID.
const getFormModel = (workshopId) => {
  return form.value.tallers.find(t => t.taller_id === workshopId);
};

// However, the template you provided has input bindings like `v-model="t.trimestre"` 
// inside a loop `v-for="(t, index) in form.tallers"`. 
// WAIT, the NEW template uses `v-for="workshop in selectedWorkshopDetails"`.
// I need to update the NEW template bindings to point to the `form` state object corresponding to that workshop.
// I will keep the loop as is but I will map the `selectedWorkshopDetails` to INCLUDE the form model directly so v-model works.

// We'll update `selectedWorkshopDetails` to wrap the form model.
// ACTUALLY, checking the template:
// It has inputs without v-model in some places (value="1").
// I need to bind these inputs to my `form.tallers` state.

async function handleSubmit() {
  if (!confirm('Segur que vols confirmar la sol·licitud?')) return;
  
  submitting.value = true;
  try {
    const token = tokenCookie.value;
    // Map form names to emails
    form.value.tallers.forEach(item => {
      const prof = professors.value.find(p => `${p.nom} ${p.cognoms}` === item.docent_nom);
      if (prof) item.docent_email = prof.email;
    });

    await $fetch('/api/centre/peticions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: form.value
    });
    alert('Sol·licitud enviada correctament!');
    window.location.reload();
  } catch (err) {
    console.error(err);
    alert('Error enviant la sol·licitud.');
  } finally {
    submitting.value = false;
  }
}

// FETCH DATA
async function fetchData() {
  try {
    const token = tokenCookie.value;
    const headers = { 'Authorization': 'Bearer ' + token };
    const [resTallers, resProfs, resProfile] = await Promise.all([
      $fetch('/api/centre/tallers', { headers }),
      $fetch('/api/centre/professors', { headers }),
      $fetch('/api/centre/perfil', { headers })
    ]);
    
    tallers.value = resTallers || [];
    professors.value = resProfs || [];
    centre.value = resProfile || {};
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

onMounted(fetchData);
</script>

<style scoped>
/* Tailwind handles most styles. Custom overrides if needed. */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
