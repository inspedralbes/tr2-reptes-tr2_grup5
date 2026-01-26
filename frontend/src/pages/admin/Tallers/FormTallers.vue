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
// ======================================
// Importem les dependències
// ======================================
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
// Configuració del Component
// ======================================

// 1. Configurem la capçalera de l'administració
const headerStore = useHeaderStore();
headerStore.setHeaderAdmin();

// ======================================
// Constants i Configuració (Dades Estàtiques)
// ======================================

const llistaSectors = [
  'Agroalimentari', 'Manufacturer', 'Energia i Aigua', 'Construcció',
  'Comerç i Turisme', 'Transport', 'Hoteleria', 'Informació i Comunicació',
  'Financer', 'Immobiliari', 'Professional'
];

const opcionsModalitat = [
  { id: 'A', colorClass: 'bg-[#fb6107]' },
  { id: 'B', colorClass: 'bg-[#7cb518]' },
  { id: 'C', colorClass: 'bg-[#fbb02d]' }
];

const opcionsTrimestres = ['1r', '2n', '3r'];

// ======================================
// Estat Reactiu (Esquema del Formulari)
// ======================================

const dadesNouTaller = ref({
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

const isCreantTaller = ref(false);
const errorsCamps = ref({});

// ======================================
// Propietats Computades (UI Dinàmica)
// ======================================

// 1. Càlcul informatiu de la durada segons modalitat
const msgDuradaEstimada = computed(function () {
  const mod = dadesNouTaller.value.modalitat;
  if (mod === 'A') {
    return '20 hores (10 sessions de 2 hores)';
  }
  if (mod === 'B') {
    return '20 hores (10 sessions de 2 hores)';
  }
  if (mod === 'C') {
    return '30 hores (10 sessions de 3 hores)';
  }
  return 'Selecciona una modalitat';
});

// 2. Text del botó d'enviament
const textBotoAccio = computed(function () {
  if (isCreantTaller.value === true) {
    return 'Creant Taller...';
  }
  return 'Crear Taller';
});

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Validacions ---

function executarValidacioCamp(nomC) {
  const d = dadesNouTaller.value;
  
  if (nomC === 'titol') {
    const textT = d.titol || '';
    if (textT.trim() === '') {
      errorsCamps.value.titol = 'Introduïu un títol per al taller.';
    } else {
      errorsCamps.value.titol = null;
    }
  }

  if (nomC === 'sector') {
    if (d.sector === '') {
      errorsCamps.value.sector = 'Seleccioneu un sector professional.';
    } else {
      errorsCamps.value.sector = null;
    }
  }

  if (nomC === 'modalitat') {
    if (d.modalitat === '') {
      errorsCamps.value.modalitat = 'La modalitat és obligatòria.';
    } else {
      errorsCamps.value.modalitat = null;
    }
  }

  if (nomC === 'trimestres') {
    const llistaT = d.trimestres || [];
    if (llistaT.length === 0) {
      errorsCamps.value.trimestres = 'Seleccioneu almenys un trimestre.';
    } else {
      errorsCamps.value.trimestres = null;
    }
  }

  if (nomC === 'places_maximes') {
    const nP = Number(d.places_maximes);
    if (isNaN(nP) === true || nP < 1) {
      errorsCamps.value.places_maximes = 'Mínim 1 plaça.';
    } else {
      errorsCamps.value.places_maximes = null;
    }
  }
}

function validarFormulariComplet() {
  executarValidacioCamp('titol');
  executarValidacioCamp('sector');
  executarValidacioCamp('modalitat');
  executarValidacioCamp('trimestres');
  executarValidacioCamp('places_maximes');
  
  let valid = true;
  if (errorsCamps.value.titol) { valid = false; }
  if (errorsCamps.value.sector) { valid = false; }
  if (errorsCamps.value.modalitat) { valid = false; }
  if (errorsCamps.value.trimestres) { valid = false; }
  if (errorsCamps.value.places_maximes) { valid = false; }
  
  return valid;
}

// B) --- Handlers d'accions ---

function handleCancellar() {
  navigateTo('/admin/tallers');
}

async function handleSubmitCrearTaller() {
  // 1. Validació inicial
  const esValid = validarFormulariComplet();
  if (esValid === false) { return; }

  isCreantTaller.value = true;

  try {
    // 2. Preparem dades per a l'enviament (Loop pel string de trimestres)
    let trimestresText = "";
    const selQuarters = dadesNouTaller.value.trimestres;
    for (let i = 0; i < selQuarters.length; i++) {
        trimestresText = trimestresText + selQuarters[i];
        if (i < selQuarters.length - 1) {
            trimestresText = trimestresText + ", ";
        }
    }

    const cosTaller = {
      titol: dadesNouTaller.value.titol,
      descripcio: dadesNouTaller.value.descripcio,
      sector: dadesNouTaller.value.sector,
      modalitat: dadesNouTaller.value.modalitat,
      places_maximes: dadesNouTaller.value.places_maximes,
      trimestres_disponibles: trimestresText,
      ubicacio: dadesNouTaller.value.ubicacio,
      adreca: dadesNouTaller.value.adreca,
      data_execucio: dadesNouTaller.value.data_execucio || null
    };

    // 3. Executem la petició
    const tokenSession = useCookie('authToken').value;
    const headersAPI = { Authorization: 'Bearer ' + tokenSession };

    await $fetch('/api/admin/tallers', {
      method: 'POST',
      headers: headersAPI,
      body: cosTaller
    });

    // 4. Feedback positiu i redirecció
    const swalInst = useSwal();
    swalInst.fire({ 
      title: 'Taller Creat', 
      text: 'El taller ja està disponible al catàleg.', 
      icon: 'success' 
    }).then(function() {
      navigateTo('/admin/tallers');
    });

  } catch (errorPet) {
    // 5. Gestió d'errors
    console.error('Error al crear taller:', errorPet);
    let msgE = 'Error desconegut al crear el taller';
    if (errorPet.data) {
      if (errorPet.data.message) {
        msgE = errorPet.data.message;
      }
    }
    useSwal().fire({ title: 'Error', text: msgE, icon: 'error' });
  } finally {
    isCreantTaller.value = false;
  }
}
</script>


<style scoped>
/* Estils específics si cal. */
</style>
