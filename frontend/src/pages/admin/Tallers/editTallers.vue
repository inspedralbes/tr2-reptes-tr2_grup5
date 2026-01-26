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
  Building2,
  ArrowLeft,
  Power
} from 'lucide-vue-next';

// ======================================
// Configuració del Component
// ======================================

// 1. Serveis de rutes, cookies i capçalera
const routeInstancia = useRoute();
const tokenCookie = useCookie('authToken');
const tokenRef = tokenCookie.value;

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
// Estat Reactiu i Dades (Esquema)
// ======================================

// 1. Dades carregades de l'API
const idTallerQuery = computed(function () {
  return routeInstancia.query.id;
});

const resultatApiDetall = await useFetch('/api/admin/tallers/' + idTallerQuery.value, {
  headers: { Authorization: 'Bearer ' + tokenRef }
});

const dadesTallerBase = computed(function () {
  const d = resultatApiDetall.data;
  if (d) {
    if (d.value) {
      return d.value;
    }
  }
  return null;
});

const isPendentApi = computed(function () {
  if (resultatApiDetall.pending) {
    if (resultatApiDetall.pending.value === true) {
      return true;
    }
  }
  return false;
});

const hiHaErrorApi = computed(function () {
  if (resultatApiDetall.error) {
    if (resultatApiDetall.error.value) {
      return true;
    }
  }
  return false;
});

// 2. Estat del formulari d'edició
const dadesEditTaller = ref({
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

const isGuardantCanvis = ref(false);
const errorsCamps = ref({});

// ======================================
// Propietats Computades (UI Dinàmica)
// ======================================

const msgDuradaEstimada = computed(function () {
  const m = dadesEditTaller.value.modalitat;
  if (m === 'A' || m === 'B') {
    return '20 hores (10 sessions de 2 hores)';
  }
  if (m === 'C') {
    return '30 hores (10 sessions de 3 hores)';
  }
  return 'Selecciona una modalitat';
});

const textBotoAccio = computed(function () {
  if (isGuardantCanvis.value === true) {
    return 'Guardant...';
  }
  return 'Actualitzar Taller';
});

// ======================================
// Observadors (Sincronització de Dades)
// ======================================

// 1. Mapegem dades de l'API al formulari quan estiguin disponibles
watch(
  function () { return dadesTallerBase.value; },
  function (nouValor) {
    if (nouValor) {
      dadesEditTaller.value.titol = nouValor.titol || '';
      dadesEditTaller.value.descripcio = nouValor.descripcio || '';
      dadesEditTaller.value.sector = nouValor.sector || '';
      dadesEditTaller.value.modalitat = nouValor.modalitat || '';
      
      let pMax = 12;
      if (nouValor.places_maximes !== undefined) {
        pMax = nouValor.places_maximes;
      }
      dadesEditTaller.value.places_maximes = pMax;
      
      dadesEditTaller.value.ubicacio = nouValor.ubicacio || '';
      dadesEditTaller.value.adreca = nouValor.adreca || '';
      dadesEditTaller.value.data_execucio = nouValor.data_execucio || '';

      // Conversió de string a array de trimestres (Bucle manual)
      if (nouValor.trimestres_disponibles) {
        const textT = String(nouValor.trimestres_disponibles);
        const llistaParts = textT.split(',');
        const llistaNeta = [];
        for (let i = 0; i < llistaParts.length; i++) {
          const item = llistaParts[i].trim();
          if (item !== '') {
            llistaNeta.push(item);
          }
        }
        dadesEditTaller.value.trimestres = llistaNeta;
      } else {
        dadesEditTaller.value.trimestres = [];
      }
    }
  },
  { immediate: true }
);

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Validacions ---

function executarValidacioCamp(nomC) {
  const d = dadesEditTaller.value;
  
  if (nomC === 'titol') {
    const vT = d.titol || '';
    if (vT.trim() === '') {
      errorsCamps.value.titol = 'El títol no pot estar buit.';
    } else {
      errorsCamps.value.titol = null;
    }
  }

  if (nomC === 'sector') {
    if (d.sector === '') {
      errorsCamps.value.sector = 'Trieu un sector.';
    } else {
      errorsCamps.value.sector = null;
    }
  }

  if (nomC === 'modalitat') {
    if (d.modalitat === '') {
      errorsCamps.value.modalitat = 'Trieu una modalitat.';
    } else {
      errorsCamps.value.modalitat = null;
    }
  }

  if (nomC === 'trimestres') {
    const llistaT = d.trimestres || [];
    if (llistaT.length === 0) {
      errorsCamps.value.trimestres = 'Seleccioneu un trimestre.';
    } else {
      errorsCamps.value.trimestres = null;
    }
  }

  if (nomC === 'places_maximes') {
    const n = Number(d.places_maximes);
    if (isNaN(n) || n < 1) {
      errorsCamps.value.places_maximes = 'Mínim 1 plaça.';
    } else {
      errorsCamps.value.places_maximes = null;
    }
  }
}

function validarTotElFormulari() {
  executarValidacioCamp('titol');
  executarValidacioCamp('sector');
  executarValidacioCamp('modalitat');
  executarValidacioCamp('trimestres');
  executarValidacioCamp('places_maximes');
  
  let esValid = true;
  if (errorsCamps.value.titol) { esValid = false; }
  if (errorsCamps.value.sector) { esValid = false; }
  if (errorsCamps.value.modalitat) { esValid = false; }
  if (errorsCamps.value.trimestres) { esValid = false; }
  if (errorsCamps.value.places_maximes) { esValid = false; }
  
  return esValid;
}

// B) --- Handlers d'accions ---

function handleCancellar() {
  navigateTo('/admin/tallers');
}

async function handleSubmitActualitzar() {
  // 1. Validacions
  const ok = validarTotElFormulari();
  if (ok === false) { return; }

  isGuardantCanvis.value = true;

  try {
    // 2. Generació del string de trimestres (Loop manual)
    const selQ = dadesEditTaller.value.trimestres;
    let sTrim = "";
    for (let j = 0; j < selQ.length; j++) {
      sTrim = sTrim + selQ[j];
      if (j < selQ.length - 1) {
        sTrim = sTrim + ", ";
      }
    }

    // 3. Payload de la petició
    const dadesForm = dadesEditTaller.value;
    const bodyEnv = {
      titol: dadesForm.titol,
      descripcio: dadesForm.descripcio,
      sector: dadesForm.sector,
      modalitat: dadesForm.modalitat,
      places_maximes: dadesForm.places_maximes,
      trimestres_disponibles: sTrim,
      ubicacio: dadesForm.ubicacio,
      adreca: dadesForm.adreca,
      data_execucio: dadesForm.data_execucio || null
    };

    // 4. Actualització a l'API
    await $fetch('/api/admin/tallers/' + idTallerQuery.value, {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + tokenRef },
      body: bodyEnv
    });

    const swalInst = useSwal();
    swalInst.fire({ 
      title: 'Actualitzat', 
      text: 'El taller ha estat modificat correctament.', 
      icon: 'success' 
    }).then(function() {
      navigateTo('/admin/tallers');
    });

  } catch (errP) {
    console.error('Error en actualitzar taller:', errP);
    let msgE = 'Error al guardar els canvis.';
    if (errP.data) {
       if (errP.data.message) {
         msgE = errP.data.message;
       }
    }
    useSwal().fire({ title: 'Error', text: msgE, icon: 'error' });
  } finally {
    isGuardantCanvis.value = false;
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 py-8">
    
    <!-- 1. CAPÇALERA DE NAVEGACIÓ -->
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink 
        to="/admin/tallers" 
        class="flex items-center gap-2 text-[#022B3A]/50 hover:text-[#1F7A8C] transition-all text-[11px] font-black uppercase tracking-widest"
      >
        <ArrowLeft :size="18" />
        Tornar al catàleg
      </NuxtLink>
      <h2 class="text-lg font-black text-[#022B3A]">Editar Taller #{{ idTallerQuery }}</h2>
    </div>

    <!-- 2. ESTATS DE CÀRREGA I ERROR -->
    <div v-if="isPendentApi === true" class="text-center py-16 text-[#022B3A]/60 font-medium">Carregant dades del taller...</div>

    <div v-else-if="hiHaErrorApi === true" class="text-center py-16 text-red-600 font-medium">Error: No s'ha pogut trobar el taller.</div>

    <!-- 3. FORMULARI D'EDICIÓ -->
    <div v-else class="bg-white rounded-2xl border border-[#BFDBF7] shadow-xl shadow-[#022B3A]/5 overflow-hidden">
      <form @submit.prevent="handleSubmitActualitzar" class="p-10 space-y-12" novalidate>
        
        <!-- SECCIÓ 1: Identificació i Contingut -->
        <section class="space-y-8">
          <header class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-[#1F7A8C]/10 text-[#1F7A8C] flex items-center justify-center">
              <FileText :size="18" />
            </div>
            <h3 class="text-[13px] font-black text-[#022B3A] uppercase tracking-widest">Identificació i Contingut</h3>
          </header>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Camp: Títol -->
            <div class="space-y-2">
              <label for="titol" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-[0.15em] ml-1">Títol del Taller *</label>
              <input 
                id="titol"
                v-model="dadesEditTaller.titol"
                type="text"
                placeholder="Ex: Introducció a la Robòtica"
                class="w-full bg-[#E1E5F2]/20 border border-[#BFDBF7] rounded-xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 text-[#022B3A]"
                @input="executarValidacioCamp('titol')"
              />
              <p v-if="errorsCamps.titol" class="text-sm text-red-600 mt-1">{{ errorsCamps.titol }}</p>
            </div>

            <!-- Camp: Sector -->
            <div class="space-y-2">
              <label for="sector" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-[0.15em] ml-1">Sector Professional *</label>
              <select 
                id="sector"
                v-model="dadesEditTaller.sector"
                class="w-full bg-[#E1E5F2]/20 border border-[#BFDBF7] rounded-xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] outline-none transition-all appearance-none cursor-pointer text-[#022B3A]"
                @change="executarValidacioCamp('sector')"
              >
                <option value="" disabled>Selecciona un sector</option>
                <option v-for="s in llistaSectors" :key="s" :value="s">{{ s }}</option>
              </select>
              <p v-if="errorsCamps.sector" class="text-sm text-red-600 mt-1">{{ errorsCamps.sector }}</p>
            </div>

            <!-- Camp: Descripció -->
            <div class="md:col-span-2 space-y-2">
              <label for="descripcio" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-[0.15em] ml-1">Descripció Pedagògica</label>
              <textarea 
                id="descripcio"
                v-model="dadesEditTaller.descripcio"
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

          <!-- Ràdios: Modalitat -->
          <div class="space-y-6">
            <span class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-[0.15em] ml-1 block">Modalitat del Projecte *</span>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label 
                v-for="mod in opcionsModalitat" 
                :key="mod.id" 
                class="relative cursor-pointer group"
              >
                <input 
                  type="radio" 
                  name="modalitat" 
                  :value="mod.id" 
                  v-model="dadesEditTaller.modalitat"
                  class="peer sr-only"
                  @change="executarValidacioCamp('modalitat')"
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
            <p v-if="errorsCamps.modalitat" class="text-sm text-red-600 mt-1">{{ errorsCamps.modalitat }}</p>
          </div>

          <!-- Informació de durada -->
          <div v-if="dadesEditTaller.modalitat" class="rounded-xl bg-[#FFF7E6] border border-[#FBB02D]/40 px-5 py-4">
            <p class="text-sm font-medium text-[#022B3A]"><strong>Durada estimada:</strong> {{ msgDuradaEstimada }}</p>
          </div>

          <div class="space-y-8">
            <!-- Camp: Places Màximes -->
            <div class="space-y-4">
              <label for="places" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                <Users :size="14" /> Places Màximes
              </label>
              <div class="flex items-center gap-4">
                <input 
                  id="places"
                  v-model.number="dadesEditTaller.places_maximes"
                  type="number"
                  min="1"
                  class="w-full max-w-[200px] bg-[#E1E5F2]/20 border border-[#BFDBF7] rounded-xl px-5 py-4 text-sm font-black text-[#022B3A] focus:border-[#1F7A8C] outline-none"
                  @input="executarValidacioCamp('places_maximes')"
                />
                <span class="text-[10px] font-black text-[#022B3A]/30 uppercase tracking-widest whitespace-nowrap">Alumnes per sessió</span>
              </div>
              <p v-if="errorsCamps.places_maximes" class="text-sm text-red-600 mt-1">{{ errorsCamps.places_maximes }}</p>
              <p class="text-[10px] font-medium text-[#022B3A]/40">Això no modificarà les places restants actuals a menys que s'indiqui.</p>
            </div>

            <!-- Checkboxes: Trimestres -->
            <div class="space-y-4">
              <span class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                <Calendar :size="14" /> Trimestres Disponibles *
              </span>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label v-for="t in opcionsTrimestres" :key="t" class="relative cursor-pointer group">
                  <input 
                    type="checkbox" 
                    :value="t" 
                    v-model="dadesEditTaller.trimestres"
                    class="peer sr-only"
                    @change="executarValidacioCamp('trimestres')"
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
              <p v-if="errorsCamps.trimestres" class="text-sm text-red-600 mt-1">{{ errorsCamps.trimestres }}</p>
            </div>

            <!-- Camp: Data d'Execució -->
            <div class="space-y-4">
               <label for="data_execucio" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                 <Calendar :size="14" /> Data d'Execució Prevista (Opcional)
               </label>
               <input 
                 id="data_execucio"
                 v-model="dadesEditTaller.data_execucio"
                 type="date"
                 class="w-full bg-[#E1E5F2]/20 border border-[#BFDBF7] rounded-xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 text-[#022B3A]"
               />
               <p class="text-[9px] font-bold text-[#022B3A]/40 mt-1 italic">
                 Deixa en blanc si no hi ha data confirmada.
               </p>
            </div>

            <!-- Camp: Ubicació -->
            <div class="space-y-4">
              <label for="ubicacio" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                <Building2 :size="14" /> Ubicació / Entitat
              </label>
              <input 
                id="ubicacio"
                v-model="dadesEditTaller.ubicacio"
                type="text"
                placeholder="Ex: Biciclot"
                class="w-full bg-[#E1E5F2]/20 border border-[#BFDBF7] rounded-xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 text-[#022B3A]"
              />
            </div>

            <!-- Camp: Adreça -->
            <div class="space-y-4">
              <label for="adreca" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                <MapPin :size="14" /> Adreça de l'Activitat
              </label>
              <input 
                id="adreca"
                v-model="dadesEditTaller.adreca"
                type="text"
                placeholder="Carrer, número, ciutat..."
                class="w-full bg-[#E1E5F2]/20 border border-[#BFDBF7] rounded-xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 text-[#022B3A]"
              />
            </div> 
          </div>
        </section>

        <!-- Barra d'accions -->
        <div class="pt-10 border-t border-[#BFDBF7]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div class="flex items-center gap-2 text-[10px] font-bold text-[#022B3A]/30 italic">
            <Info :size="14" />
            Camps obligatoris marcats amb *
          </div>
          
          <div class="flex items-center gap-3 w-full sm:w-auto">
            <button 
              type="button"
              @click="handleCancellar"
              class="px-8 py-4 text-[11px] font-black text-[#022B3A]/40 uppercase tracking-widest hover:text-[#022B3A] transition-all"
            >
              Cancel·lar
            </button>
            <button 
              type="submit"
              :disabled="isGuardantCanvis === true"
              class="flex flex-1 sm:flex-none items-center justify-center gap-3 px-10 py-4 bg-[#1F7A8C] text-white font-black text-[12px] uppercase tracking-[0.1em] rounded-xl hover:bg-[#022B3A] transition-all shadow-xl shadow-[#1F7A8C]/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Save :size="18" />
              {{ textBotoAccio }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Estils específics via Tailwind. */
</style>
