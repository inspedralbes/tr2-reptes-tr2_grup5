<template>
  <div class="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
    
    <!-- 1. Header & Controls (Simplified) -->
    <div class="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
      
      <!-- Left: Title & Subtitle -->
      <div>
        <h1 class="text-4xl md:text-5xl font-black text-[#022B3A] tracking-tighter leading-none mb-3">
          {{ pageContext.title }}
        </h1>
        <p class="text-[#022B3A]/40 text-[10px] font-black uppercase tracking-[0.2em]">
          {{ pageContext.subtitle }}
        </p>
      </div>

      <!-- Right: Navigation & Action -->
      <div class="flex flex-col sm:flex-row items-center gap-4">
         
         <!-- Month Navigator -->
         <div class="flex items-center bg-white p-1 rounded-xl border border-[#BFDBF7]/60 shadow-sm">
            <button @click="changeMonth(-1)" class="p-3 hover:bg-[#E1E5F2]/30 rounded-lg text-[#022B3A]/60 hover:text-[#022B3A] transition-colors">
               <ChevronLeft :size="18" />
            </button>
            <div class="px-6 flex flex-col items-center min-w-[140px]">
               <span class="text-sm font-black text-[#022B3A] uppercase tracking-wider">{{ currentMonthName }}</span>
            </div>
            <button @click="changeMonth(1)" class="p-3 hover:bg-[#E1E5F2]/30 rounded-lg text-[#022B3A]/60 hover:text-[#022B3A] transition-colors">
               <ChevronRight :size="18" />
            </button>
            <div class="w-px h-6 bg-[#BFDBF7]/60 mx-1"></div>
            <button @click="goToday" class="px-4 py-2 text-[10px] font-black text-[#022B3A]/60 hover:text-[#022B3A] uppercase tracking-widest hover:bg-[#E1E5F2]/30 rounded-lg transition-colors">
               Avui
            </button>
         </div>

         <!-- Single Action Button: Period Subscription -->
         <button @click="showConfig = true" class="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1F7A8C] text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#022B3A] transition-all shadow-lg shadow-[#1F7A8C]/20 whitespace-nowrap w-full sm:w-auto">
            <Settings :size="14" /> Període Inscripció
         </button>
      </div>
    </div>

    <!-- 1.1 Enrollment Modal (Overlay) -->
    <div v-if="showConfig" class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#022B3A]/40 backdrop-blur-sm animate-in fade-in duration-300">
       <div class="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 border border-[#BFDBF7]/40 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-[#1F7A8C]/5 rounded-full -mr-16 -mt-16"></div>
          
          <div class="flex items-center gap-4 mb-8">
             <div class="p-3 bg-[#1F7A8C]/10 rounded-2xl text-[#1F7A8C]">
                <CalendarIcon :size="24" />
             </div>
             <div>
                <h3 class="text-xl font-black text-[#022B3A]">Període Inscripció</h3>
                <p class="text-[10px] font-bold text-[#022B3A]/40 uppercase tracking-widest">Configuració global</p>
             </div>
          </div>

          <div class="space-y-6">
             <div class="space-y-2">
                <label class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1">Data d'inici</label>
                <input type="date" v-model="enrollmentStart" class="w-full bg-[#E1E5F2]/10 border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-[#1F7A8C]/10 outline-none transition-all">
             </div>
             <div class="space-y-2">
                <label class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1">Data finalització</label>
                <input type="date" v-model="enrollmentEnd" class="w-full bg-[#E1E5F2]/10 border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-[#1F7A8C]/10 outline-none transition-all">
             </div>
          </div>

          <div class="flex gap-3 mt-10">
             <button @click="showConfig = false" class="flex-1 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-[#E1E5F2]/40 text-[#022B3A]/60 hover:bg-[#E1E5F2] transition-colors">
                Cancel·lar
             </button>
             <button @click="saveEnrollmentDates" class="flex-[2] px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-[#1F7A8C] text-white shadow-lg shadow-[#1F7A8C]/20 hover:bg-[#022B3A] transition-all">
                Desar Canvis
             </button>
          </div>
       </div>
    </div>

    <!-- 2. Calendar Grid -->
    <div class="bg-white rounded-3xl border border-[#BFDBF7]/60 shadow-sm overflow-hidden flex flex-col min-h-[700px]">
      
      <!-- Days Header -->
      <div class="grid grid-cols-7 bg-[#F8FAFC] border-b border-[#BFDBF7]/30">
        <div v-for="day in daysOfWeek" :key="day" class="py-4 text-center text-[10px] font-black text-[#022B3A]/30 uppercase tracking-widest">
          {{ day }}
        </div>
      </div>

      <!-- Days Grid -->
      <div class="grid grid-cols-7 flex-1 auto-rows-fr bg-[#BFDBF7]/20 gap-px border-b border-[#BFDBF7]/20">
         <template v-for="(cell, idx) in calendarCells" :key="idx">
           <div 
             :class="[
               'relative bg-white min-h-[120px] p-2 transition-colors hover:bg-[#F8FAFC] group flex flex-col gap-1', 
               !cell.day ? 'bg-[#F8FAFC]/50' : '',
               cell.day && isInEnrollmentPeriod(cell.date) ? 'enrollment-day' : ''
             ]"
           >
             <template v-if="cell.day">
               <!-- Date Number -->
               <div class="flex justify-between items-start mb-1">
                  <span :class="['w-7 h-7 flex items-center justify-center rounded-lg text-xs font-black transition-all', isToday(cell.date) ? 'bg-[#1F7A8C] text-white shadow-md shadow-[#1F7A8C]/30' : 'text-[#022B3A]/40 group-hover:text-[#022B3A]']">
                     {{ cell.day }}
                  </span>
                  <!-- Highlight Today or specific date logic -->
                  <span v-if="getAssignmentsForDay(cell.date).length > 0" class="text-[9px] font-black text-[#022B3A]/20">
                    {{ getAssignmentsForDay(cell.date).length }}
                  </span>
               </div>

               <!-- Events Stack -->
               <div class="flex-1 flex flex-col gap-1.5 overflow-y-auto scrollbar-hide">
                  <div 
                    v-for="assign in getAssignmentsForDay(cell.date)" 
                    :key="assign.id" 
                    :class="['group/item relative p-2 rounded-lg border cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] z-10', getProjectStyles(assign.project).bg, getProjectStyles(assign.project).border]"
                  >
                     <div class="flex items-center gap-1.5 mb-0.5">
                        <div :class="['w-1.5 h-1.5 rounded-full', getProjectStyles(assign.project).dot]"></div>
                        <span :class="['text-[8px] font-black uppercase tracking-wider truncate', getProjectStyles(assign.project).text]">
                           {{ assign.project.replace('PROJECTE ', '') }}
                        </span>
                     </div>
                     <p class="text-[10px] font-bold text-[#022B3A] leading-tight line-clamp-1">
                        {{ assign.workshopTitle }}
                     </p>
                     
                     <!-- Tooltip -->
                     <div class="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 bg-[#022B3A] text-white p-4 rounded-xl shadow-2xl z-50 invisible opacity-0 group-hover/item:visible group-hover/item:opacity-100 transition-all duration-200 pointer-events-none origin-top">
                        <div class="flex items-start justify-between mb-2">
                           <span :class="['text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/10 text-white']">
                              {{ assign.project }}
                           </span>
                        </div>
                        <h4 class="text-sm font-black mb-1">{{ assign.workshopTitle }}</h4>
                        <div class="space-y-2 mt-3 pt-3 border-t border-white/10">
                           <div class="flex items-center gap-2 text-[10px] font-medium text-white/70">
                              <MapPin :size="12" /> {{ assign.centerName }}
                           </div>
                           <div class="flex items-center gap-2 text-[10px] font-medium text-white/70">
                              <Clock :size="12" /> 10:00h - 12:00h
                           </div>
                        </div>
                        <!-- Little Triangle -->
                        <div class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#022B3A] rotate-45"></div>
                     </div>
                  </div>
               </div>
             </template>
           </div>
         </template>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useHeaderStore } from '@/stores/header'
import { useCookie, useFetch } from '#app'
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  MapPin, 
  Clock, 
  Calendar as CalendarIcon 
} from 'lucide-vue-next'

// ======================================
// Importacions i Composables
// ======================================
const header = useHeaderStore()
header.setHeaderAdmin()

const token = useCookie('authToken');
const { data: assignments, pending, error } = await useFetch('/api/admin/tallers', {
  server: false,
  headers: {
    Authorization: token.value ? `Bearer ${token.value}` : ''
  }
})

// --- STATE ---
const currentDate = ref(new Date())
const pageContext = {
    title: 'Calendari de Tallers',
    subtitle: 'Visualització mensual de les sessions i tallers programats.'
}

const showConfig = ref(false)
const enrollmentStart = ref('')
const enrollmentEnd = ref('')

// --- CALENDAR LOGIC ---
const daysOfWeek = ['Dll', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg']

const currentMonthName = computed(() => {
  return currentDate.value.toLocaleString('ca-ES', { month: 'long' }).toUpperCase()
})

const changeMonth = (offset) => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + offset)
  currentDate.value = newDate
}

const goToday = () => {
  currentDate.value = new Date()
}

const isToday = (dateStr) => {
  const today = new Date().toISOString().split('T')[0]
  return dateStr === today
}

const isInEnrollmentPeriod = (dateStr) => {
    if (!enrollmentStart.value || !enrollmentEnd.value) return false;
    return dateStr >= enrollmentStart.value && dateStr <= enrollmentEnd.value;
}

const calendarCells = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  
  // Adjust Monday as start (0)
  let startDay = firstDayOfMonth.getDay() - 1
  if (startDay === -1) startDay = 6
  
  const cells = []
  
  // Helper for date string
  const getISO = (d) => d.toISOString().split('T')[0];
  
  // Empty space for previous month
  for (let i = 0; i < startDay; i++) {
    cells.push({ day: null, date: null })
  }
  
  // Current month days
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const d = new Date(year, month, i, 12, 0, 0); // Noon to avoid timezone shifts
    cells.push({ 
      day: i, 
      date: d.toISOString().split('T')[0] 
    })
  }
  
  // Fill remaining space (42 cells total)
  while (cells.length < 42) {
    cells.push({ day: null, date: null })
  }
  
  return cells
})

const getAssignmentsForDay = (dateStr) => {
  if (!dateStr) return []
  
  return (assignments.value || []).filter(t => {
    if (!t.data_execucio) return false;
    return t.data_execucio.startsWith(dateStr);
  }).map(t => ({
      id: t.id,
      workshopTitle: t.titol,
      project: t.sector || 'DESCONEGUT',
      centerName: t.nom_centre || 'Centre pendent'
  }))
}

// --- STYLING HELPERS ---
const getProjectStyles = (sector) => {
  const s = (sector || '').toUpperCase();
  if (s.includes('MANU')) {
    return {
       bg: 'bg-[#FFF0EB]',
       border: 'border-[#FB6107]/20',
       text: 'text-[#FB6107]',
       dot: 'bg-[#FB6107]'
    }
  }
  if (s.includes('ENER')) {
    return {
       bg: 'bg-[#F0F7E9]',
       border: 'border-[#7CB518]/20',
       text: 'text-[#7CB518]',
       dot: 'bg-[#7CB518]'
    }
  }
  if (s.includes('AGRO')) {
    return {
       bg: 'bg-[#FFF7E6]',
       border: 'border-[#FBB02D]/20',
       text: 'text-[#FBB02D]',
       dot: 'bg-[#FBB02D]'
    }
  }
  return {
     bg: 'bg-slate-50',
     border: 'border-slate-200',
     text: 'text-slate-600',
     dot: 'bg-slate-400'
  }
}

// --- ENROLLMENT ACTIONS ---
const fetchEnrollmentDates = async () => {
    try {
        const data = await $fetch('/api/admin/config/enrollment', {
             headers: { Authorization: token.value ? `Bearer ${token.value}` : '' }
        });
        enrollmentStart.value = data.startDate || '';
        enrollmentEnd.value = data.endDate || '';
    } catch (e) {
        console.error("Error fetching dates:", e);
    }
}

const saveEnrollmentDates = async () => {
    try {
        await $fetch('/api/admin/config/enrollment/dates', {
            method: 'POST',
            body: { start: enrollmentStart.value, end: enrollmentEnd.value },
            headers: { Authorization: token.value ? `Bearer ${token.value}` : '' }
        });
        showConfig.value = false;
        alert("Període d'inscripció actualitzat.");
    } catch (e) {
        alert("Error al desar.");
    }
}

onMounted(fetchEnrollmentDates);
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.animate-spin-slow { animation: spin 4s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* Enrollment highlighting */
.enrollment-day {
    background-color: #f0fdf4 !important;
    position: relative;
}
.enrollment-day::before {
    content: '';
    position: absolute;
    inset: 0;
    border: 2px solid #86efac;
    pointer-events: none;
    z-index: 5;
}
.enrollment-day::after {
    content: 'INSCRIPCIÓ';
    position: absolute;
    bottom: 4px;
    right: 4px;
    font-size: 7px;
    font-weight: 900;
    color: #15803d;
    background: #bbf7d0;
    padding: 1px 4px;
    border-radius: 4px;
    letter-spacing: 0.05em;
    font-family: inherit;
    z-index: 10;
}
</style>
