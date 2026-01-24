<template>
  <div class="page">
    <div class="header-actions">
      <h2>Calendari de Tallers</h2>
      
      <div class="controls-group">
          <!-- Calendar Nav -->
          <div class="calendar-controls">
            <button class="btn-secondary" @click="changeMonth(-1)">←</button>
            <span class="current-month">{{ currentMonthName }} {{ currentYear }}</span>
            <button class="btn-secondary" @click="changeMonth(1)">→</button>
          </div>

          <!-- Enrollment Config Button -->
           <div class="enrollment-wrapper">
               <button class="btn-primary" @click="showConfig = !showConfig">
                   ⚙️ Període Inscripció
               </button>
               
               <div v-if="showConfig" class="config-popover">
                   <h4>Configurar Inscripcions</h4>
                   <label>Data Inici:</label>
                   <input type="date" v-model="enrollmentStart">
                   <label>Data Final:</label>
                   <input type="date" v-model="enrollmentEnd">
                   <div class="popover-actions">
                       <button class="btn-save" @click="saveEnrollmentDates">Desar</button>
                       <button class="btn-cancel" @click="showConfig = false">Tancar</button>
                   </div>
               </div>
           </div>
      </div>
    </div>

    <div v-if="pending" class="loading">Carregant tallers...</div>
    <div v-else-if="error" class="error">Error carregant els tallers: {{ error.message }}</div>
    
    <div v-else class="calendar-container">
      <div class="weekdays">
        <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
      </div>
      <div class="days-grid">
        <div 
          v-for="{ day, date, isCurrentMonth, events } in calendarDays" 
          :key="date" 
          class="day-cell" 
          :class="{ 
            'other-month': !isCurrentMonth, 
            'today': isToday(date),
            'enrollment-day': isInEnrollmentPeriod(date)
          }"
        >
          <div class="day-number">{{ day }}</div>
          <div class="events-list">
            <div 
              v-for="taller in events" 
              :key="taller.id" 
              class="event-item" 
              :class="'mod-' + taller.modalitat"
              :title="taller.titol"
            >
              {{ taller.titol }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useHeaderStore } from '@/stores/header'
import { useCookie, useFetch } from '#app'

const header = useHeaderStore()
header.setHeaderAdmin()

const token = useCookie('authToken');
const { data: tallers, pending, error, refresh } = await useFetch('http://localhost:1700/api/admin/tallers', {
  server: false,
  headers: {
    Authorization: token.value ? `Bearer ${token.value}` : ''
  }
})

// --- ENROLLMENT PERIOD LOGIC ---
const enrollmentStart = ref('');
const enrollmentEnd = ref('');
const showConfig = ref(false);

const fetchEnrollmentDates = async () => {
    try {
        const data = await $fetch('http://localhost:1700/api/admin/config/enrollment', {
             headers: { Authorization: token.value ? `Bearer ${token.value}` : '' }
        });
        enrollmentStart.value = data.startDate || '';
        enrollmentEnd.value = data.endDate || '';
    } catch (e) {
        console.error("Error fetching dates:", e);
    }
}

const saveEnrollmentDates = async () => {
    if (!enrollmentStart.value || !enrollmentEnd.value) {
        alert("Selecciona data d'inici i final.");
        return;
    }
    try {
        await $fetch('http://localhost:1700/api/admin/config/enrollment/dates', {
            method: 'POST',
            body: { start: enrollmentStart.value, end: enrollmentEnd.value },
            headers: { Authorization: token.value ? `Bearer ${token.value}` : '' }
        });
        showConfig.value = false;
        alert("Període d'inscripció actualitzat correctament.");
    } catch (e) {
        console.error("Error saving dates:", e);
        alert("Error al desar les dates.");
    }
}

const currentDate = ref(new Date())

const weekDays = ['Dm', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg']

const currentMonthName = computed(() => {
  return currentDate.value.toLocaleString('ca-ES', { month: 'long' }).replace(/^\w/, c => c.toUpperCase())
})

const currentYear = computed(() => {
  return currentDate.value.getFullYear()
})

const changeMonth = (offset) => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + offset)
  currentDate.value = newDate
}

const isToday = (dateStr) => {
  const today = new Date()
  return new Date(dateStr).toDateString() === today.toDateString()
}

const isInEnrollmentPeriod = (dateStr) => {
    if (!enrollmentStart.value || !enrollmentEnd.value) return false;
    
    // dateStr comes from our loop as 'YYYY-MM-DD' (local time constructed string)
    // enrollmentStart/End come from <input type="date"> as 'YYYY-MM-DD'
    
    // We can simply compare the strings directly since ISO format sorts lexicographically correctly
    return dateStr >= enrollmentStart.value && dateStr <= enrollmentEnd.value;
}

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  
  const daysInMonth = lastDayOfMonth.getDate()
  
  // Helper to ensure local YYYY-MM-DD format
  const getLocalYMD = (d) => {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  
  // 0 is Sunday, but we want Week to start on Monday (1). 
  // Adjust day index: 0(Sun)->6, 1(Mon)->0, ..., 6(Sat)->5
  let startDay = firstDayOfMonth.getDay() - 1
  if (startDay === -1) startDay = 6
  
  const days = []
  
  // Previous month days
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDay - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    const dateObj = new Date(year, month - 1, day);
    const date = getLocalYMD(dateObj);
    days.push({ day, date, isCurrentMonth: false, events: [] })
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateObj = new Date(year, month, i);
    const dateString = getLocalYMD(dateObj);
    
    // Find events
    const dayEvents = (tallers.value || []).filter(t => {
      if (!t.data_execucio) return false;
      return t.data_execucio.startsWith(dateString);
    });

    days.push({ 
      day: i, 
      date: dateString, 
      isCurrentMonth: true, 
      events: dayEvents 
    })
  }
  
  // Next month days to fill grid (42 cells usually covers all months)
  const remainingCells = 42 - days.length
  for (let i = 1; i <= remainingCells; i++) {
    const dateObj = new Date(year, month + 1, i);
    const date = getLocalYMD(dateObj);
    days.push({ day: i, date, isCurrentMonth: false, events: [] })
  }
  
  return days
})

onMounted(() => {
    fetchEnrollmentDates();
})
</script>

<style scoped>
/* Page expands to fill available height and width */
.page { 
  padding: 30px; 
  width: 100%; 
  height: calc(100vh - 60px); 
  display: flex; 
  flex-direction: column; 
  box-sizing: border-box;
}

.header-actions { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 30px; 
  position: relative; /* Context for popover */
}
.header-actions h2 { font-size: 1.8rem; color: #1a202c; font-weight: 700; margin: 0; }

.controls-group { display: flex; align-items: center; gap: 20px; }

.calendar-controls { display: flex; align-items: center; gap: 0.8rem; }
.btn-secondary { 
  background: white; border: 1px solid #e2e8f0; padding: 8px 16px; 
  border-radius: 8px; cursor: pointer; transition: all 0.2s; 
  font-weight: 600; color: #64748b; font-size: 0.9rem; 
}
.btn-secondary:hover { background: #f8fafc; color: #1a202c; }
.current-month { 
  font-size: 1.2rem; font-weight: 700; color: #1e293b; 
  min-width: 150px; text-align: center; 
}

.calendar-container { 
  background: white; 
  border-radius: 16px; 
  border: 1px solid #e2e8f0; 
  overflow: hidden; 
  display: flex; 
  flex-direction: column; 
  flex-grow: 1; /* Key change: fill vertical space */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.weekdays { 
  display: grid; 
  grid-template-columns: repeat(7, 1fr); 
  background: #f8fafc; 
  border-bottom: 1px solid #e2e8f0; 
}
.weekday { 
  padding: 14px; 
  text-align: center; font-weight: 600; color: #64748b; 
  font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; 
}

.days-grid { 
  display: grid; 
  grid-template-columns: repeat(7, 1fr); 
  grid-template-rows: repeat(6, 1fr); 
  flex-grow: 1; 
  height: 100%; 
}

.day-cell { 
  border-right: 1px solid #f1f5f9; 
  border-bottom: 1px solid #f1f5f9; 
  padding: 8px; 
  display: flex;
  flex-direction: column;
  transition: background 0.2s; 
}
.day-cell:nth-child(7n) { border-right: none; }
.day-cell:hover { background: #fbfbfb; }

.enrollment-day {
    background-color: #f0fdf4; /* Very light green */
    box-shadow: inset 0 0 0 2px #86efac; /* Subtle green border using box-shadow to prevent layout shift */
}

.enrollment-day::after {
    content: 'PERÍODE OBERT';
    display: block;
    font-size: 0.65rem;
    color: #15803d;
    background: #bbf7d0;
    font-weight: 700;
    text-align: center;
    padding: 2px 4px;
    border-radius: 4px;
    margin-top: auto; /* Pushes to bottom if flex container */
    margin-bottom: 2px;
    align-self: center;
    width: 90%;
}

.day-number { 
  font-weight: 600; color: #334155; 
  margin-bottom: 6px; text-align: right; 
  font-size: 0.95rem; 
}
.other-month { background: #fcfcfc; color: #cbd5e1; }
.other-month .day-number { color: #cbd5e1; }
.today { background: #f0f9ff; }
.today .day-number { color: #0284c7; font-weight: 800; }

.events-list { 
  display: flex; 
  flex-direction: column; 
  gap: 3px; 
  overflow-y: auto; 
  flex-grow: 1; 
}
.event-item { 
  font-size: 0.75rem; padding: 4px 8px; border-radius: 4px; 
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; 
  cursor: pointer; font-weight: 500; 
}

/* Modalitat Colors */
.mod-A { background: #dbeafe; color: #1e40af; border-left: 3px solid #2563eb; }
.mod-B { background: #fef3c7; color: #92400e; border-left: 3px solid #d97706; }
.mod-C { background: #dcfce7; color: #166534; border-left: 3px solid #16a34a; }

/* Config Popover */
.enrollment-wrapper { position: relative; }
.btn-primary { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 8px 16px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.9rem; }
.config-popover {
    position: absolute; top: 110%; right: 0;
    background: white; border: 1px solid #e2e8f0;
    padding: 20px; border-radius: 12px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
    z-index: 50; width: 300px;
}
.config-popover h4 { margin: 0 0 15px 0; color: #1e293b; }
.config-popover label { display: block; font-size: 0.85rem; color: #64748b; margin-bottom: 4px; font-weight: 600; }
.config-popover input { width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 12px; font-family: inherit; }
.popover-actions { display: flex; gap: 10px; margin-top: 10px; }
.btn-save { flex: 1; background: #10b981; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-cancel { flex: 1; background: #f1f5f9; color: #64748b; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-weight: 600; }

.loading, .error { text-align: center; padding: 40px; color: #64748b; }
.error { color: #ef4444; }
</style>
