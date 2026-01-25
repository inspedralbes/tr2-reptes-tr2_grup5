<template>
  <div class="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 py-8">
    <div class="bg-white rounded-2xl border border-[#BFDBF7] shadow-xl shadow-[#022B3A]/5 overflow-hidden">
      
      <form @submit.prevent="submitForm" class="p-10 space-y-12" novalidate>
        
        <!-- SECCIÓ 1: Identificació i Contingut -->
        <section class="space-y-8">
          <header class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-[#1F7A8C]/10 text-[#1F7A8C] flex items-center justify-center">
              <FileText :size="18" />
            </div>
            <h3 class="text-[13px] font-black text-[#022B3A] uppercase tracking-widest">Identificació i Contingut</h3>
          </header>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Títol (form.titol) -->
            <div class="space-y-2">
              <label for="titol" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-[0.15em] ml-1">Títol del Taller *</label>
              <input 
                id="titol"
                v-model="form.titol"
                type="text"
                placeholder="Ex: Introducció a la Robòtica"
                class="w-full bg-[#E1E5F2]/20 border border-[#BFDBF7] rounded-xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 text-[#022B3A]"
                @input="validateField('titol')"
              />
              <p v-if="fieldErrors.titol" class="text-sm text-red-600 mt-1">{{ fieldErrors.titol }}</p>
            </div>

            <!-- Sector (form.sector) -->
            <div class="space-y-2">
              <label for="sector" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-[0.15em] ml-1">Sector Professional *</label>
              <select 
                id="sector"
                v-model="form.sector"
                class="w-full bg-[#E1E5F2]/20 border border-[#BFDBF7] rounded-xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] outline-none transition-all appearance-none cursor-pointer text-[#022B3A]"
                @change="validateField('sector')"
              >
                <option value="" disabled>Selecciona un sector</option>
                <option v-for="s in sectors" :key="s" :value="s">{{ s }}</option>
              </select>
              <p v-if="fieldErrors.sector" class="text-sm text-red-600 mt-1">{{ fieldErrors.sector }}</p>
            </div>

            <!-- Descripció (form.descripcio) -->
            <div class="md:col-span-2 space-y-2">
              <label for="descripcio" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-[0.15em] ml-1">Descripció Pedagògica</label>
              <textarea 
                id="descripcio"
                v-model="form.descripcio"
                rows="4"
                placeholder="Detalla els objectius, competències i continguts clau..."
                class="w-full bg-[#E1E5F2]/20 border border-[#BFDBF7] rounded-xl px-6 py-5 text-sm font-medium focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 resize-none text-[#022B3A]"
              ></textarea>
            </div>
          </div>
        </section>

        <!-- SECCIÓ 2: Modalitat i Logística -->
        <section class="space-y-8">
          <header class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-[#1F7A8C]/10 text-[#1F7A8C] flex items-center justify-center">
              <Settings :size="18" />
            </div>
            <h3 class="text-[13px] font-black text-[#022B3A] uppercase tracking-widest">Modalitat i Logística</h3>
          </header>

          <!-- Modalitat (form.modalitat) -->
          <div class="space-y-6">
            <span class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-[0.15em] ml-1 block">Modalitat del Projecte *</span>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label 
                v-for="mod in modalities" 
                :key="mod.id" 
                class="relative cursor-pointer group"
              >
                <input 
                  type="radio" 
                  name="modalitat" 
                  :value="mod.id" 
                  v-model="form.modalitat"
                  class="peer sr-only"
                  @change="validateField('modalitat')"
                />
                <div class="flex flex-col items-center justify-center p-6 bg-[#E1E5F2]/10 border border-[#BFDBF7] rounded-xl peer-checked:bg-[#022B3A] peer-checked:border-[#022B3A] peer-checked:shadow-xl transition-all group-hover:bg-white">
                  <div :class="['w-3 h-3 rounded-full mb-3 shadow-sm', mod.colorClass]"></div>
                  <span class="text-[11px] font-black uppercase tracking-widest text-[#022B3A] peer-checked:text-white transition-colors group-hover:text-[#1F7A8C]">
                    Projecte {{ mod.id }}
                  </span>
                  <p class="text-[9px] font-bold text-[#022B3A]/30 mt-1 uppercase peer-checked:text-white/40">Estructura Estàndard</p>
                </div>
                <div class="absolute inset-0 ring-2 ring-[#1F7A8C] rounded-xl opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></div>
              </label>
            </div>
            <p v-if="fieldErrors.modalitat" class="text-sm text-red-600 mt-1">{{ fieldErrors.modalitat }}</p>
          </div>

          <!-- Durada estimada (duradaCalculada) - lògica del Codi A -->
          <div v-if="form.modalitat" class="rounded-xl bg-[#FFF7E6] border border-[#FBB02D]/40 px-5 py-4">
            <p class="text-sm font-medium text-[#022B3A]"><strong>Durada estimada:</strong> {{ duradaCalculada }}</p>
          </div>

          <div class="space-y-8">
            <!-- Places Màximes (form.places_maximes) -->
            <div class="space-y-4">
              <label for="places" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                <Users :size="14" /> Places Màximes
              </label>
              <div class="flex items-center gap-4">
                <input 
                  id="places"
                  v-model.number="form.places_maximes"
                  type="number"
                  min="1"
                  class="w-full max-w-[200px] bg-[#E1E5F2]/20 border border-[#BFDBF7] rounded-xl px-5 py-4 text-sm font-black text-[#022B3A] focus:border-[#1F7A8C] outline-none"
                  @input="validateField('places_maximes')"
                />
                <span class="text-[10px] font-black text-[#022B3A]/30 uppercase tracking-widest whitespace-nowrap">Alumnes per sessió</span>
              </div>
              <p v-if="fieldErrors.places_maximes" class="text-sm text-red-600 mt-1">{{ fieldErrors.places_maximes }}</p>
            </div>

            <!-- Trimestres (form.trimestres) -->
            <div class="space-y-4">
              <span class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                <Calendar :size="14" /> Trimestres Disponibles *
              </span>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label v-for="t in quarters" :key="t" class="relative cursor-pointer group">
                  <input 
                    type="checkbox" 
                    :value="t" 
                    v-model="form.trimestres"
                    class="peer sr-only"
                    @change="validateField('trimestres')"
                  />
                  <div class="flex flex-col items-center justify-center p-6 bg-[#E1E5F2]/10 border border-[#BFDBF7] rounded-xl peer-checked:bg-[#1F7A8C] peer-checked:border-[#1F7A8C] peer-checked:shadow-xl transition-all group-hover:bg-white">
                    <span class="text-[11px] font-black uppercase tracking-widest text-[#022B3A] peer-checked:text-white transition-colors group-hover:text-[#1F7A8C]">
                      {{ t }} Trimestre
                    </span>
                    <p class="text-[9px] font-bold text-[#022B3A]/30 mt-1 uppercase peer-checked:text-white/40">Curs 2025/26</p>
                  </div>
                  <div class="absolute inset-0 ring-2 ring-[#1F7A8C] rounded-xl opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></div>
                </label>
              </div>
              <p v-if="fieldErrors.trimestres" class="text-sm text-red-600 mt-1">{{ fieldErrors.trimestres }}</p>
            </div>

            <!-- Data d'Execució (form.data_execucio) -->
            <div class="space-y-4">
               <label for="data_execucio" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                 <Calendar :size="14" /> Data d'Execució Prevista (Opcional)
               </label>
               <input 
                 id="data_execucio"
                 v-model="form.data_execucio"
                 type="date"
                 class="w-full bg-[#E1E5F2]/20 border border-[#BFDBF7] rounded-xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 text-[#022B3A]"
               />
               <p class="text-[9px] font-bold text-[#022B3A]/40 mt-1 italic">
                 Deixa en blanc si no hi ha data confirmada.
               </p>
            </div>

            <!-- Ubicació (form.ubicacio) -->
            <div class="space-y-4">
              <label for="ubicacio" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                <Building2 :size="14" /> Ubicació / Entitat
              </label>
              <input 
                id="ubicacio"
                v-model="form.ubicacio"
                type="text"
                placeholder="Ex: Biciclot"
                class="w-full bg-[#E1E5F2]/20 border border-[#BFDBF7] rounded-xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 text-[#022B3A]"
              />
            </div>

            <!-- Adreça (form.adreca) -->
            <div class="space-y-4">
              <label for="adreca" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                <MapPin :size="14" /> Adreça de l'Activitat
              </label>
              <input 
                id="adreca"
                v-model="form.adreca"
                type="text"
                placeholder="Carrer, número, ciutat..."
                class="w-full bg-[#E1E5F2]/20 border border-[#BFDBF7] rounded-xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 text-[#022B3A]"
              />
            </div>
          </div>
        </section>

        <!-- Peu: accions -->
        <div class="pt-10 border-t border-[#BFDBF7]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div class="flex items-center gap-2 text-[10px] font-bold text-[#022B3A]/30 italic">
            <Info :size="14" />
            Camps obligatoris marcats amb *
          </div>
          
          <div class="flex items-center gap-3 w-full sm:w-auto">
            <button 
              type="button"
              @click="cancelar"
              class="px-8 py-4 text-[11px] font-black text-[#022B3A]/40 uppercase tracking-widest hover:text-[#022B3A] transition-all"
            >
              Cancel·lar
            </button>
            <button 
              type="submit"
              :disabled="loading"
              class="flex flex-1 sm:flex-none items-center justify-center gap-3 px-10 py-4 bg-[#1F7A8C] text-white font-black text-[12px] uppercase tracking-[0.1em] rounded-xl hover:bg-[#022B3A] transition-all shadow-xl shadow-[#1F7A8C]/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Save :size="18" />
              {{ textBoto }}
            </button>
          </div>
        </div>
      </form>
    </div>

  </div>
</template>

<script setup>
import {
  Save,
  Info,
  FileText,
  Settings,
  Users,
  Calendar,
  MapPin,
  Building2
} from 'lucide-vue-next';

// ======================================
// Importacions i Composables (Rutes, Cookies, Stores)
// ======================================
const header = useHeaderStore();
header.setHeaderAdmin();

// ======================================
// Estat Reactiu i Refs (Variables i Formularis)
// ======================================
const loading = ref(false);
const fieldErrors = ref({});

function validateField(key) {
  const v = form.value;
  if (key === 'titol') {
    if (!(v.titol || '').trim()) { fieldErrors.value.titol = 'Introduïu un títol.'; return; }
    delete fieldErrors.value.titol;
    return;
  }
  if (key === 'sector') {
    if (!(v.sector || '').trim()) { fieldErrors.value.sector = 'Seleccioneu un sector.'; return; }
    delete fieldErrors.value.sector;
    return;
  }
  if (key === 'modalitat') {
    if (!(v.modalitat || '').trim()) { fieldErrors.value.modalitat = 'Seleccioneu una modalitat.'; return; }
    delete fieldErrors.value.modalitat;
    return;
  }
  if (key === 'trimestres') {
    if (!(v.trimestres || []).length) { fieldErrors.value.trimestres = 'Seleccioneu almenys un trimestre.'; return; }
    delete fieldErrors.value.trimestres;
    return;
  }
  if (key === 'places_maximes') {
    const n = Number(v.places_maximes);
    if (isNaN(n) || n < 1) { fieldErrors.value.places_maximes = 'Les places han de ser com a mínim 1.'; return; }
    delete fieldErrors.value.places_maximes;
    return;
  }
}

function validateAll() {
  validateField('titol');
  validateField('sector');
  validateField('modalitat');
  validateField('trimestres');
  validateField('places_maximes');
  return Object.keys(fieldErrors.value).length === 0;
}

const sectors = [
  'Agroalimentari', 'Manufacturer', 'Energia i Aigua', 'Construcció',
  'Comerç i Turisme', 'Transport', 'Hoteleria', 'Informació i Comunicació',
  'Financer', 'Immobiliari', 'Professional'
];

const modalities = [
  { id: 'A', colorClass: 'bg-[#fb6107]' },
  { id: 'B', colorClass: 'bg-[#7cb518]' },
  { id: 'C', colorClass: 'bg-[#fbb02d]' }
];

const quarters = ['1r', '2n', '3r'];

const form = ref({
  titol: '',
  descripcio: '',
  sector: '',
  modalitat: '',
  places_maximes: 12,
  trimestres: [],
  ubicacio: '',
  adreca: '',
  data_execucio: ''
});

const duradaCalculada = computed(function () {
  if (form.value.modalitat === 'A' || form.value.modalitat === 'B') {
    return '20 hores (10 sessions de 2 hores)';
  }
  if (form.value.modalitat === 'C') {
    return '30 hores (10 sessions de 3 hores)';
  }
  return 'Selecciona una modalitat';
});

const textBoto = computed(function () {
  if (loading.value) {
    return 'Creant Taller...';
  }
  return 'Crear Taller';
});

// ======================================
// Lògica i Funcions (Handlers i Lifecycle)
// ======================================

// A) --- Tornar al catàleg sense guardar (Cancel·lar) ---
function cancelar() {
  navigateTo('/admin/tallers');
}

// A) --- Enviar el formulari de crear taller ---
async function submitForm() {
  if (!validateAll()) return;

  loading.value = true;

  try {
    let trimestresStr = form.value.trimestres.join(', ');
    let payload = {};
    payload.titol = form.value.titol;
    payload.descripcio = form.value.descripcio;
    payload.sector = form.value.sector;
    payload.modalitat = form.value.modalitat;
    payload.places_maximes = form.value.places_maximes;
    payload.trimestres_disponibles = trimestresStr;
    payload.ubicacio = form.value.ubicacio;
    payload.adreca = form.value.adreca;
    payload.data_execucio = form.value.data_execucio ? form.value.data_execucio : null;

    let token = useCookie('authToken').value;
    await $fetch('/api/admin/tallers', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
      body: payload
    });

    useSwal().fire({ title: 'Fet', text: 'Taller creat correctament.', icon: 'success' }).then(() => { navigateTo('/admin/tallers'); });
  } catch (err) {
    let missatge = 'Error al crear el taller: ';
    if (err && err.response && err.response._data && err.response._data.message) {
      missatge = missatge + err.response._data.message;
    } else if (err && err.message) {
      missatge = missatge + err.message;
    } else {
      missatge = missatge + 'Error desconegut';
    }
    useSwal().fire({ title: 'Error', text: missatge, icon: 'error' });
  } finally {
    loading.value = false;
  }
}

</script>

<style scoped>
/* Estils específics si cal. */
</style>
