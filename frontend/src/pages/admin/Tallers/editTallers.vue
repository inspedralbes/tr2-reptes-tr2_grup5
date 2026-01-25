<template>
  <div class="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 py-8">
    <!-- Capçalera: Tornar i títol -->
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink 
        to="/admin/tallers" 
        class="flex items-center gap-2 text-[#022B3A]/50 hover:text-[#1F7A8C] transition-all text-[11px] font-black uppercase tracking-widest"
      >
        <ArrowLeft :size="18" />
        Tornar al catàleg
      </NuxtLink>
      <h2 class="text-lg font-black text-[#022B3A]">Editar Taller #{{ idTaller }}</h2>
    </div>

    <!-- Estat: carregant -->
    <div v-if="pendent" class="text-center py-16 text-[#022B3A]/60 font-medium">Carregant dades del taller...</div>

    <!-- Estat: error -->
    <div v-else-if="errorFetch" class="text-center py-16 text-red-600 font-medium">Error: No s'ha pogut trobar el taller.</div>

    <!-- Formulari (mateixa estructura que FormTallers) -->
    <div v-else class="bg-white rounded-2xl border border-[#BFDBF7] shadow-xl shadow-[#022B3A]/5 overflow-hidden">
      <form @submit.prevent="handleUpdate" class="p-10 space-y-12">
        
        <!-- SECCIÓ 1: Identificació i Contingut -->
        <section class="space-y-8">
          <header class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-[#1F7A8C]/10 text-[#1F7A8C] flex items-center justify-center">
              <FileText :size="18" />
            </div>
            <h3 class="text-[13px] font-black text-[#022B3A] uppercase tracking-widest">Identificació i Contingut</h3>
          </header>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-2">
              <label for="titol" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-[0.15em] ml-1">Títol del Taller *</label>
              <input 
                id="titol"
                v-model="form.titol"
                type="text"
                placeholder="Ex: Introducció a la Robòtica"
                class="w-full bg-[#E1E5F2]/20 border border-[#BFDBF7] rounded-xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 text-[#022B3A]"
                required
              />
            </div>

            <div class="space-y-2">
              <label for="sector" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-[0.15em] ml-1">Sector Professional *</label>
              <select 
                id="sector"
                v-model="form.sector"
                class="w-full bg-[#E1E5F2]/20 border border-[#BFDBF7] rounded-xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] outline-none transition-all appearance-none cursor-pointer text-[#022B3A]"
                required
              >
                <option value="" disabled>Selecciona un sector</option>
                <option v-for="s in sectors" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>

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

          <!-- Modalitat -->
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
          </div>

          <!-- Durada estimada -->
          <div v-if="form.modalitat" class="rounded-xl bg-[#FFF7E6] border border-[#FBB02D]/40 px-5 py-4">
            <p class="text-sm font-medium text-[#022B3A]"><strong>Durada estimada:</strong> {{ duradaCalculada }}</p>
          </div>

          <div class="space-y-8">
            <!-- Places Màximes -->
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
                />
                <span class="text-[10px] font-black text-[#022B3A]/30 uppercase tracking-widest whitespace-nowrap">Alumnes per sessió</span>
              </div>
              <p class="text-[10px] font-medium text-[#022B3A]/40">Això no modificarà les places restants actuals a menys que s'indiqui.</p>
            </div>

            <!-- Trimestres -->
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
            </div>

            <!-- Ubicació -->
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

            <!-- Adreça -->
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

            <!-- Taller Actiu (només en edició) -->
            <div class="space-y-4">
              <span class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                <Power :size="14" /> Estat del taller
              </span>
              <label class="flex items-center gap-4 cursor-pointer group">
                <input 
                  type="checkbox" 
                  v-model="form.actiu" 
                  :true-value="1" 
                  :false-value="0"
                  class="peer sr-only" 
                />
                <div class="w-12 h-7 rounded-full bg-[#E1E5F2]/60 border border-[#BFDBF7] peer-checked:bg-[#1F7A8C] peer-checked:border-[#1F7A8C] transition-all relative">
                  <div class="absolute w-5 h-5 rounded-full bg-white shadow top-1 left-1 transition-all peer-checked:left-6 peer-checked:bg-white"></div>
                </div>
                <span class="text-sm font-bold text-[#022B3A]">Taller Actiu</span>
              </label>
            </div>
          </div>
        </section>

        <!-- Peu: accions (mateix que FormTallers) -->
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
              :disabled="saving"
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
  Building2,
  ArrowLeft,
  Power
} from 'lucide-vue-next';

// ======================================
// Importacions i Composables (Rutes, Cookies, Stores)
// ======================================
const route = useRoute();
const token = useCookie('authToken');
const header = useHeaderStore();
header.setHeaderAdmin();

// ======================================
// Estat Reactiu i Refs (Variables i Formularis)
// ======================================
const saving = ref(false);

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
  actiu: 1,
  data_execucio: ''
});

const idTaller = computed(function () {
  return route.query.id;
});

const respostaFetch = await useFetch('/api/admin/tallers/' + route.query.id, {
  headers: { Authorization: 'Bearer ' + token.value }
});

const taller = computed(function () {
  const d = respostaFetch.data;
  if (d && d.value) {
    return d.value;
  }
  return null;
});

const pendent = computed(function () {
  if (respostaFetch.pending) {
    return respostaFetch.pending.value;
  }
  return false;
});

const errorFetch = computed(function () {
  if (respostaFetch.error && respostaFetch.error.value) {
    return true;
  }
  return false;
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
  if (saving.value) {
    return 'Guardant...';
  }
  return 'Actualitzar Taller';
});

// Omplir el formulari quan les dades del taller arriben
watch(
  function () { return taller.value; },
  function (nou) {
    if (nou) {
      form.value.titol = nou.titol || '';
      form.value.descripcio = nou.descripcio || '';
      form.value.sector = nou.sector || '';
      form.value.modalitat = nou.modalitat || '';
      form.value.places_maximes = nou.places_maximes !== undefined ? nou.places_maximes : 12;
      form.value.ubicacio = nou.ubicacio || '';
      form.value.adreca = nou.adreca || '';
      form.value.actiu = nou.actiu !== undefined ? nou.actiu : 1;
      
      // Data execució
      if (nou.data_execucio) {
        form.value.data_execucio = new Date(nou.data_execucio).toISOString().split('T')[0];
      }

      // Convertir trimestres_disponibles (string) a array per als checkboxes
      if (nou.trimestres_disponibles) {
        const parts = String(nou.trimestres_disponibles).split(',');
        const arr = [];
        for (let i = 0; i < parts.length; i++) {
          const s = parts[i].trim();
          if (s) arr.push(s);
        }
        form.value.trimestres = arr;
      } else {
        form.value.trimestres = [];
      }
    }
  }
);

// ======================================
// Lògica i Funcions (Handlers i Lifecycle)
// ======================================

function cancelar() {
  navigateTo('/admin/tallers');
}

async function handleUpdate() {
  if (!form.value.titol || !form.value.sector || !form.value.modalitat) {
    alert('Si us plau, omple tots els camps obligatoris (*)');
    return;
  }
  if (form.value.trimestres.length === 0) {
    alert('Has de seleccionar almenys un trimestre.');
    return;
  }
  if (form.value.places_maximes < 1) {
    alert('Les places màximes han de ser com a mínim 1.');
    return;
  }

  saving.value = true;
  try {
    const trimestresStr = form.value.trimestres.join(', ');
    const payload = {};
    payload.titol = form.value.titol;
    payload.descripcio = form.value.descripcio;
    payload.sector = form.value.sector;
    payload.modalitat = form.value.modalitat;
    payload.places_maximes = form.value.places_maximes;
    payload.trimestres_disponibles = trimestresStr;
    payload.ubicacio = form.value.ubicacio;
    payload.adreca = form.value.adreca;
    payload.actiu = form.value.actiu;
    payload.data_execucio = form.value.data_execucio;

    await $fetch('/api/admin/tallers/' + route.query.id, {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + token.value },
      body: payload
    });
    alert('Taller actualitzat correctament!');
    navigateTo('/admin/tallers');
  } catch (err) {
    let msg = 'Error al guardar: ';
    if (err && err.message) {
      msg = msg + err.message;
    } else {
      msg = msg + 'Error desconegut';
    }
    alert(msg);
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
/* Estils específics si cal. */
</style>
