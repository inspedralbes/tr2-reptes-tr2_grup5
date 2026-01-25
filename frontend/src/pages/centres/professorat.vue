<template>
  <section class="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
    
    <!-- 1. HEADER SECTION -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <h1 class="text-4xl md:text-5xl font-black text-[#022B3A] tracking-tighter leading-none mb-3">
          Gestió del <span class="text-[#1F7A8C]">Professorat</span>
        </h1>
        <p class="text-[#022B3A]/40 text-[10px] font-black uppercase tracking-[0.2em]">
          Equip docent del centre educatiu.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button class="flex items-center gap-2 px-6 py-3.5 bg-white text-[#022B3A] font-black text-[10px] rounded-xl border border-[#BFDBF7] hover:shadow-lg transition-all uppercase tracking-widest shadow-sm hover:border-[#1F7A8C]">
          <CheckSquare :size="16" /> SELECCIONAR
        </button>
        <button 
          @click="handleAddTeacher"
          class="flex items-center gap-2 px-8 py-3.5 bg-[#1F7A8C] text-white font-black text-[11px] rounded-xl hover:bg-[#022B3A] shadow-xl shadow-[#1F7A8C]/20 transition-all uppercase tracking-[0.1em] group"
        >
          <Plus :size="16" class="group-hover:rotate-90 transition-transform duration-300" />
          AFEGIR DOCENT
        </button>
      </div>
    </div>

    <!-- 2. SEARCH BAR & FILTERS -->
    <div class="bg-white p-2 rounded-xl border border-[#BFDBF7]/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <!-- Search Input -->
        <div class="relative flex-1 max-w-lg group w-full ml-1">
          <Search :size="14" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
          <input 
            type="text" 
            placeholder="Cercar docent per nom o email..."
            v-model="searchQuery"
            class="w-full bg-[#E1E5F2]/10 border border-transparent rounded-lg pl-11 pr-4 py-2.5 text-[11px] font-bold focus:bg-white focus:border-[#BFDBF7] focus:ring-4 focus:ring-[#1F7A8C]/5 outline-none transition-all placeholder:text-[#022B3A]/20 text-[#022B3A]"
          />
        </div>

        <!-- View & Order Tools -->
        <div class="flex items-center gap-2 bg-[#E1E5F2]/30 p-1 rounded-lg border border-[#BFDBF7]/20 w-full sm:w-auto justify-center sm:justify-end">
          <div class="flex items-center gap-1 pr-2 border-r border-[#BFDBF7]/30">
            <button 
              @click="viewMode = 'grid'"
              :class="[
                'p-2 rounded-md shadow-sm border transition-all',
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
                'p-2 rounded-md shadow-sm border transition-all',
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

    <!-- 3. CONTENT AREA -->
    <div :class="viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'flex flex-col gap-3'">
      
      <template v-for="teacher in filteredTeachers" :key="teacher.id">
        
        <!-- LIST VIEW ROW -->
        <div 
          v-if="viewMode === 'list'"
          class="bg-white rounded-xl border border-[#E1E5F2] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 hover:shadow-lg transition-all hover:border-[#BFDBF7] group"
        >
          <!-- User Info -->
          <div class="flex items-center gap-4 flex-1 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-[#1F7A8C]/10 text-[#1F7A8C] flex items-center justify-center font-black text-xs border border-[#1F7A8C]/20 tracking-widest group-hover:bg-[#1F7A8C] group-hover:text-white transition-colors">
              {{ teacher.initials }}
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-3">
                <h4 class="text-sm font-black text-[#022B3A] truncate">{{ teacher.name }}</h4>
                <span :class="['px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border', getRoleStyles(teacher.role)]">
                  {{ teacher.role }}
                </span>
              </div>
              <div class="flex items-center gap-1.5 text-[#022B3A]/40 mt-0.5">
                 <Mail :size="10" />
                 <p class="text-[10px] font-bold truncate">{{ teacher.email }}</p>
              </div>
            </div>
          </div>

          <!-- Status Badge -->
          <div class="hidden md:flex items-center gap-8 flex-shrink-0">
             <span :class="['inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border', getStatusStyles(teacher.status)]">
                <div v-if="teacher.status === 'Actiu'" class="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
                {{ teacher.status }}
             </span>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-2 md:border-l md:border-[#F1F4F9] md:pl-6">
            <button @click="handleEdit(teacher.data)" class="p-2 text-[#B8C0CC] hover:text-[#1F7A8C] transition-all bg-white border border-transparent hover:border-[#BFDBF7] rounded-lg">
              <Edit3 :size="16" :strokeWidth="1.5" />
            </button>
            <button @click="handleDelete(teacher.id)" class="p-2 bg-white border border-[#FFECEC] text-[#FF4D4D] rounded-lg shadow-sm hover:bg-[#FF4D4D] hover:text-white transition-all">
              <Trash2 :size="16" />
            </button>
          </div>
        </div>

        <!-- GRID VIEW CARD -->
        <div 
          v-else
          class="bg-white rounded-2xl border border-[#E1E5F2] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col overflow-hidden h-full"
        >
          <!-- 1. Header Badges -->
          <div class="px-6 pt-6 pb-4 flex justify-between items-start">
             <span :class="['px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border', getRoleStyles(teacher.role)]">
                {{ teacher.role }}
             </span>
             <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8FAFC] border border-[#E1E5F2]">
                <div :class="['w-1.5 h-1.5 rounded-full', teacher.status === 'Actiu' ? 'bg-[#7CB518]' : 'bg-red-400']"></div>
                <span class="text-[9px] font-black text-[#64748B] uppercase tracking-wider">{{ teacher.status }}</span>
             </div>
          </div>

          <!-- 2. Content (Name & Email) -->
          <div class="px-6 flex-1 flex flex-col">
             <!-- Optional Avatar (Small) + Name -->
             <div class="mb-4">
               <h4 class="text-xl font-black text-[#022B3A] leading-tight mb-2 tracking-tight">
                 {{ teacher.name }}
               </h4>
               <p class="text-[#8E9AAF] text-sm font-medium break-all flex items-center gap-2">
                 <Mail :size="14" />
                 {{ teacher.email }}
               </p>
             </div>
             
             <!-- Decorative / Info lines (Mocking layout from reference) -->
             <div class="mt-auto space-y-3 pb-6">
                <!-- Example of extra info we might have in future, or just spacers -->
                <div class="w-full h-px bg-gradient-to-r from-[#F1F4F9] to-transparent"></div>
                <div class="flex items-center justify-between text-[10px] font-bold text-[#94A3B8]">
                   <span class="uppercase tracking-widest">DATA REGISTRE</span>
                   <span>{{ formatDate(new Date()) }}</span>
                </div>
             </div>
          </div>

          <!-- 3. Footer Actions -->
          <div class="px-6 py-4 bg-[#F9FAFC] border-t border-[#F1F4F9] flex items-center justify-between mt-auto">
             <span class="text-[10px] font-black text-[#CBD5E1] tracking-widest uppercase">
                ID-{{ teacher.id.toString().padStart(3, '0') }}
             </span>
             
             <div class="flex items-center gap-3">
                <button 
                  @click="handleEdit(teacher.data)" 
                  class="text-[#94A3B8] hover:text-[#1F7A8C] transition-colors p-1"
                  title="Editar"
                >
                   <Edit3 :size="18" />
                </button>
                <button 
                  @click="handleDelete(teacher.id)" 
                  class="w-8 h-8 rounded-lg flex items-center justify-center bg-[#FFF0F0] text-[#FF4D4D] border border-[#FFE0E0] hover:bg-[#FF4D4D] hover:text-white transition-all shadow-sm"
                  title="Eliminar"
                >
                   <Trash2 :size="14" />
                </button>
             </div>
          </div>
        </div>

      </template>

      <!-- Empty State -->
      <div v-if="filteredTeachers.length === 0" class="col-span-full p-12 text-center text-[#022B3A]/40 bg-[#E1E5F2]/10 rounded-2xl border-2 border-dashed border-[#BFDBF7]">
         <p class="text-sm font-bold">No s'han trobat docents.</p>
      </div>

    </div>

    <!-- 4. MODAL (Restored & Styled) -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#022B3A]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        <!-- Modal Header -->
        <div class="px-8 py-6 border-b border-[#F1F4F9] flex justify-between items-center bg-[#F9FAFC]">
          <div>
            <h3 class="text-lg font-black text-[#022B3A]">{{ editingId ? 'Editar Docent' : 'Nou Docent' }}</h3>
            <p class="text-[10px] uppercase tracking-widest text-[#022B3A]/40 font-bold">Introduïu les dades del professor</p>
          </div>
          <button @click="closeModal" class="w-8 h-8 rounded-full bg-white border border-[#E1E5F2] flex items-center justify-center text-[#022B3A]/40 hover:text-[#FF4D4D] hover:border-[#FF4D4D] transition-colors">
            <X :size="16" />
          </button>
        </div>

        <!-- Helper Alert -->
        <div class="bg-[#EFF6FF] border-b border-[#BFDBF7]/40 px-8 py-3 flex gap-3">
           <Info :size="14" class="text-[#3B82F6] shrink-0 mt-0.5" />
           <p class="text-[10px] font-medium text-[#1E40AF] leading-relaxed">
             El docent rebrà un correu (si el sistema de notificacions està actiu) per configurar la seva contrasenya.
           </p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSave" class="p-8 space-y-5">
           <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                 <label class="text-[10px] font-black uppercase tracking-widest text-[#022B3A]/50 ml-1">Nom</label>
                 <input 
                   v-model="form.nom" 
                   type="text" 
                   required
                   class="w-full bg-[#E1E5F2]/20 border border-[#CBD5E1] rounded-xl px-4 py-3 text-sm font-bold text-[#022B3A] focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20"
                   placeholder="Ex: Joan"
                 />
              </div>
              <div class="space-y-1.5">
                 <label class="text-[10px] font-black uppercase tracking-widest text-[#022B3A]/50 ml-1">Cognoms</label>
                 <input 
                   v-model="form.cognoms" 
                   type="text" 
                   required
                   class="w-full bg-[#E1E5F2]/20 border border-[#CBD5E1] rounded-xl px-4 py-3 text-sm font-bold text-[#022B3A] focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20"
                   placeholder="Ex: Garcia"
                 />
              </div>
           </div>

           <div class="space-y-1.5">
               <label class="text-[10px] font-black uppercase tracking-widest text-[#022B3A]/50 ml-1">Correu Electrònic corporatiu</label>
               <div class="relative">
                 <Mail :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#022B3A]/30" />
                 <input 
                   v-model="form.email" 
                   type="email" 
                   required
                   class="w-full bg-[#E1E5F2]/20 border border-[#CBD5E1] rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-[#022B3A] focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20"
                   placeholder="usuari@xtec.cat"
                 />
               </div>
           </div>

           <!-- Actions -->
           <div class="pt-4 flex gap-3">
              <button 
                type="button" 
                @click="closeModal" 
                class="flex-1 py-3.5 rounded-xl border border-[#E1E5F2] text-[#64748B] font-black text-[11px] uppercase tracking-widest hover:bg-[#F8FAFC] transition-colors"
              >
                Cancel·lar
              </button>
              <button 
                type="submit" 
                :disabled="loading"
                class="flex-1 py-3.5 rounded-xl bg-[#022B3A] text-white font-black text-[11px] uppercase tracking-widest hover:bg-[#1F7A8C] shadow-xl shadow-[#022B3A]/20 transition-all flex items-center justify-center gap-2 group"
              >
                <Save :size="14" class="group-hover:scale-110 transition-transform" />
                {{ editingId ? 'Desar Canvis' : 'Crear Docent' }}
              </button>
           </div>
        </form>

      </div>
    </div>

  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  Search, 
  LayoutGrid, 
  List, 
  Filter, 
  CheckSquare, 
  Plus, 
  Edit3, 
  Trash2, 
  Mail, 
  X, 
  Save,
  Info 
} from 'lucide-vue-next';

// ======================================
// CONFIG & STATE
// ======================================
const professors = ref([]);
const loading = ref(false);
const editingId = ref(null); // If null -> Create mode
const showModal = ref(false);
const tokenCookie = useCookie('authToken');
const searchQuery = ref('');
const viewMode = ref('grid'); // 'grid' | 'list'

const form = ref({ nom: '', cognoms: '', email: '' });

// ======================================
// COMPUTED UI
// ======================================
const filteredTeachers = computed(() => {
  let list = professors.value || [];
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(p => 
      (p.nom || '').toLowerCase().includes(q) || 
      (p.cognoms || '').toLowerCase().includes(q) || 
      (p.email || '').toLowerCase().includes(q)
    );
  }

  return list.map(p => ({
    id: p.id,
    initials: (p.nom?.[0] || '?') + (p.cognoms?.[0] || '?'),
    name: `${p.nom} ${p.cognoms}`,
    email: p.email,
    role: 'Professor',
    status: 'Actiu', // Mock status for UI
    data: p // Keep original object for editing
  }));
});

// ======================================
// METHODS
// ======================================

function getRoleStyles(role) {
  return 'bg-[#F5F3FF] text-[#7C3AED] border-[#7C3AED]/20';
}

function getStatusStyles(status) {
  if(status === 'Actiu') return 'bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/20';
  return 'bg-red-50 text-red-500 border-red-200';
}

function formatDate(date) {
  if (!date) return '';
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

function handleAddTeacher() {
  editingId.value = null;
  form.value = { nom: '', cognoms: '', email: '' };
  showModal.value = true;
}

function handleEdit(originalProf) {
  editingId.value = originalProf.id;
  form.value = { 
    nom: originalProf.nom, 
    cognoms: originalProf.cognoms, 
    email: originalProf.email 
  };
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingId.value = null;
}

// API ACTIONS
async function fetchProfessors() {
  try {
    const token = tokenCookie.value;
    professors.value = await $fetch('/api/centre/professors', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
  } catch (e) {
    console.error('Error carregant professors:', e);
  }
}

async function handleSave() {
  loading.value = true;
  try {
    const token = tokenCookie.value;
    const method = editingId.value ? 'PUT' : 'POST';
    const url = editingId.value 
      ? `/api/centre/professors/${editingId.value}`
      : '/api/centre/professors';

    await $fetch(url, { 
      method, 
      headers: { 'Authorization': 'Bearer ' + token }, 
      body: form.value 
    });

    useSwal().fire({ title: 'Fet', text: 'Docent desat correctament.', icon: 'success' }).then(() => { closeModal(); fetchProfessors(); });
  } catch (e) {
    console.error('Error desant docent:', e);
    useSwal().fire({ title: 'Error', text: 'Error en desar les dades.', icon: 'error' });
  } finally {
    loading.value = false;
  }
}

async function handleDelete(id) {
  const confirmResult = await useSwal().fire({ title: 'Confirmar', text: 'Esteu segur que voleu eliminar aquest docent?', icon: 'question', showCancelButton: true, confirmButtonText: 'Sí' });
  if (!confirmResult.isConfirmed) return;
  try {
    const token = tokenCookie.value;
    await $fetch(`/api/centre/professors/${id}`, { 
      method: 'DELETE', 
      headers: { 'Authorization': 'Bearer ' + token } 
    });
    useSwal().fire({ title: 'Fet', text: 'Docent eliminat.', icon: 'success' }).then(() => { fetchProfessors(); });
  } catch (e) {
    console.error('Error eliminant docent:', e);
    useSwal().fire({ title: 'Error', text: "No s'ha pogut eliminar.", icon: 'error' });
  }
}

onMounted(fetchProfessors);
</script>

<style scoped>
/* Tailwind handles styles */
</style>