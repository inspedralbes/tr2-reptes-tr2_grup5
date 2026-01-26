<template>
  <div 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#022B3A]/40 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div class="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#BFDBF7] bg-[#E1E5F2] shadow-2xl animate-in zoom-in-95 duration-300">
      
      <div class="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/80 border-b border-[#BFDBF7]/60 backdrop-blur-sm">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-[#1F7A8C]/10 flex items-center justify-center text-[#1F7A8C]">
            <Briefcase :size="18" />
          </div>
          <div>
            <h2 class="text-lg font-black text-[#022B3A] tracking-tight">Editar Taller</h2>
            <p class="text-[10px] font-bold text-[#022B3A]/50 uppercase tracking-widest">Modificar dades del taller i modalitat</p>
          </div>
        </div>
        <button 
          type="button"
          @click="emit('close')"
          class="p-2 rounded-lg text-[#022B3A]/40 hover:text-[#022B3A] hover:bg-white border border-transparent hover:border-[#BFDBF7] transition-all"
          aria-label="Tancar"
        >
          <X :size="20" />
        </button>
      </div>

      <div v-if="loadingInitial" class="p-12 text-center text-[#022B3A]/50">Carregant...</div>

      <form v-else @submit.prevent="submitForm" class="p-6 space-y-8" novalidate>
        <!-- SECCIÓ 1: Identificació i Contingut -->
        <div class="space-y-4">
          <h3 class="text-base font-black text-[#022B3A] tracking-tight flex items-center gap-2">
            <FileText :size="16" class="text-[#1F7A8C]" />
            Identificació i Contingut
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label for="fet-titol" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Títol del Taller *</label>
              <input 
                id="fet-titol"
                v-model="form.titol"
                type="text"
                placeholder="Ex: Introducció a la Robòtica"
                class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 shadow-sm"
                @input="validateField('titol')"
              />
              <p v-if="fieldErrors.titol" class="text-sm text-red-600 mt-1">{{ fieldErrors.titol }}</p>
            </div>
            <div class="space-y-1.5">
              <label for="fet-sector" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Sector Professional *</label>
              <select 
                id="fet-sector"
                v-model="form.sector"
                class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none appearance-none cursor-pointer"
                @change="validateField('sector')"
              >
                <option value="" disabled>Selecciona un sector</option>
                <option v-for="s in sectors" :key="s" :value="s">{{ s }}</option>
              </select>
              <p v-if="fieldErrors.sector" class="text-sm text-red-600 mt-1">{{ fieldErrors.sector }}</p>
            </div>
            <div class="md:col-span-2 space-y-1.5">
              <label for="fet-descripcio" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Descripció Pedagògica</label>
              <textarea 
                id="fet-descripcio"
                v-model="form.descripcio"
                rows="4"
                placeholder="Detalla els objectius, competències i continguts clau..."
                class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none resize-none placeholder:text-[#022B3A]/20 shadow-sm"
              />
            </div>
          </div>
        </div>

        <div class="w-full h-px bg-[#BFDBF7]/40"></div>

        <!-- SECCIÓ 2: Modalitat i Logística -->
        <div class="space-y-4">
          <h3 class="text-base font-black text-[#022B3A] tracking-tight flex items-center gap-2">
            <Settings :size="16" class="text-[#1F7A8C]" />
            Modalitat i Logística
          </h3>

          <div class="space-y-2">
            <span class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Modalitat del Projecte *</span>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label v-for="mod in modalities" :key="mod.id" class="relative cursor-pointer group">
                <input type="radio" name="modalitat-edit" :value="mod.id" v-model="form.modalitat" class="peer sr-only" @change="validateField('modalitat')" />
                <div class="flex flex-col items-center justify-center p-5 bg-white border border-[#BFDBF7]/60 rounded-xl peer-checked:bg-[#022B3A] peer-checked:border-[#022B3A] transition-all group-hover:border-[#1F7A8C]">
                  <div :class="['w-3 h-3 rounded-full mb-2', mod.colorClass]"></div>
                  <span 
                    class="text-[11px] font-black uppercase tracking-widest transition-colors duration-200"
                    :class="form.modalitat === mod.id ? 'text-white' : 'text-[#022B3A]'"
                  >
                    Projecte {{ mod.id }}
                  </span>
                </div>
              </label>
            </div>
            <p v-if="fieldErrors.modalitat" class="text-sm text-red-600 mt-1">{{ fieldErrors.modalitat }}</p>
          </div>

          <div v-if="form.modalitat" class="rounded-xl bg-[#FFF7E6] border border-[#FBB02D]/40 px-4 py-3">
            <p class="text-sm font-medium text-[#022B3A]"><strong>Durada estimada:</strong> {{ duradaCalculada }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label for="fet-places" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block flex items-center gap-2"><Users :size="14" /> Places Màximes *</label>
              <input 
                id="fet-places"
                v-model.number="form.places_maximes"
                type="number"
                min="1"
                class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none shadow-sm"
                @input="validateField('places_maximes')"
              />
              <p v-if="fieldErrors.places_maximes" class="text-sm text-red-600 mt-1">{{ fieldErrors.places_maximes }}</p>
            </div>
            <div class="space-y-1.5">
              <label for="fet-data" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block flex items-center gap-2"><Calendar :size="14" /> Data d'Execució (Opcional)</label>
              <input 
                id="fet-data"
                v-model="form.data_execucio"
                type="date"
                class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none shadow-sm"
              />
            </div>
          </div>

          <div class="space-y-2">
            <span class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block flex items-center gap-2"><Calendar :size="14" /> Trimestres Disponibles *</span>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label v-for="t in quarters" :key="t" class="relative cursor-pointer group">
                <input type="checkbox" :value="t" v-model="form.trimestres" class="peer sr-only" @change="validateField('trimestres')" />
                <div class="flex items-center justify-center p-4 bg-white border border-[#BFDBF7]/60 rounded-xl peer-checked:bg-[#1F7A8C] peer-checked:border-[#1F7A8C] transition-all group-hover:border-[#1F7A8C]">
                  <span class="text-[11px] font-black uppercase tracking-widest text-[#022B3A] peer-checked:text-white">{{ t }} Trimestre</span>
                </div>
              </label>
            </div>
            <p v-if="fieldErrors.trimestres" class="text-sm text-red-600 mt-1">{{ fieldErrors.trimestres }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label for="fet-ubicacio" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block flex items-center gap-2"><Building2 :size="14" /> Ubicació / Entitat</label>
              <input 
                id="fet-ubicacio"
                v-model="form.ubicacio"
                type="text"
                placeholder="Ex: Biciclot"
                class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none placeholder:text-[#022B3A]/20 shadow-sm"
              />
            </div>
            <div class="space-y-1.5">
              <label for="fet-adreca" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block flex items-center gap-2"><MapPin :size="14" /> Adreça de l'Activitat</label>
              <input 
                id="fet-adreca"
                v-model="form.adreca"
                type="text"
                placeholder="Carrer, número, ciutat..."
                class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none placeholder:text-[#022B3A]/20 shadow-sm"
              />
            </div>
          </div>
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <div class="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div class="flex gap-3">
            <button 
              type="button"
              @click="emit('close')"
              class="px-6 py-3 rounded-xl border border-[#BFDBF7]/60 bg-white text-[#022B3A]/40 hover:text-[#022B3A] hover:shadow-lg transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <ArrowLeft :size="14" /> Tornar
            </button>
            <button 
              type="button"
              @click="resetForm"
              class="px-6 py-3 rounded-xl border border-[#BFDBF7]/60 bg-white text-[#022B3A]/40 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Eraser :size="14" /> Netejar
            </button>
          </div>
          <button 
            type="submit"
            :disabled="loading"
            class="px-10 py-3 bg-[#1F7A8C] text-white rounded-xl shadow-lg shadow-[#1F7A8C]/20 hover:bg-[#022B3A] hover:shadow-2xl transition-all text-[11px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <template v-if="loading">Desant...</template>
            <template v-else><Pencil :size="14" /> Desar canvis</template>
          </button>
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
  Briefcase,
  FileText,
  Settings,
  Users,
  Calendar,
  MapPin,
  Building2,
  ArrowLeft,
  Eraser,
  Pencil,
  X
} from 'lucide-vue-next';

// ======================================
// Definició de l'Esquema
// ======================================

// 1. Propietats que rep el component
const props = defineProps({
  tallerId: { type: [Number, String], required: true }
});

// 2. Esdeveniments que emet el component
const emit = defineEmits(['close', 'updated']);

// 3. Cookie d'autenticació
const tokenCookie = useCookie('authToken');
const tokenRef = tokenCookie.value;

// 4. Dades estàtiques per a les opcions del formulari
const sectors = ['Agroalimentari', 'Manufacturer', 'Energia i Aigua', 'Construcció', 'Comerç i Turisme', 'Transport', 'Hoteleria', 'Informació i Comunicació', 'Financer', 'Immobiliari', 'Professional'];
const modalities = [ { id: 'A', colorClass: 'bg-[#fb6107]' }, { id: 'B', colorClass: 'bg-[#7cb518]' }, { id: 'C', colorClass: 'bg-[#fbb02d]' } ];
const quarters = ['1r', '2n', '3r'];

// 5. Estat reactiu del formulari
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

// 6. Estats de control i errors
const loading = ref(false);
const loadingInitial = ref(true);
const message = ref('');
const error = ref('');
const fieldErrors = ref({});
const dadesOriginals = ref(null);

// 7. Càlcul dinàmic de la durada segons la modalitat
const duradaCalculada = computed(function () {
  const mod = form.value.modalitat;
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

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Validació d'un camp específic ---
function validateField(key) {
  const dadesVal = form.value;
  const errors = fieldErrors.value;

  // 1. Validació del títol
  if (key === 'titol') {
    let titolStr = dadesVal.titol;
    if (!titolStr) {
      errors.titol = 'Introduïu un títol.';
    } else {
      let net = titolStr.trim();
      if (!net) {
        errors.titol = 'Introduïu un títol.';
      } else {
        delete errors.titol;
      }
    }
  } 
  
  // 2. Validació del sector
  else if (key === 'sector') {
    let secStr = dadesVal.sector;
    if (!secStr) {
      errors.sector = 'Seleccioneu un sector.';
    } else {
      delete errors.sector;
    }
  } 
  
  // 3. Validació de modalitat
  else if (key === 'modalitat') {
    if (!dadesVal.modalitat) {
      errors.modalitat = 'Seleccioneu una modalitat.';
    } else {
      delete errors.modalitat;
    }
  } 
  
  // 4. Validació dels trimestres seleccionats
  else if (key === 'trimestres') {
    const llista = dadesVal.trimestres;
    if (!llista) {
      errors.trimestres = 'Seleccioneu almenys un trimestre.';
    } else if (llista.length === 0) {
      errors.trimestres = 'Seleccioneu almenys un trimestre.';
    } else {
      delete errors.trimestres;
    }
  } 
  
  // 5. Validació del número de places
  else if (key === 'places_maximes') {
    const num = Number(dadesVal.places_maximes);
    if (isNaN(num) === true) {
      errors.places_maximes = 'Les places han de ser com a mínim 1.';
    } else if (num < 1) {
      errors.places_maximes = 'Les places han de ser com a mínim 1.';
    } else {
      delete errors.places_maximes;
    }
  }
}

// B) --- Validació completa del formulari ---
function validateAll() {
  validateField('titol');
  validateField('sector');
  validateField('modalitat');
  validateField('trimestres');
  validateField('places_maximes');
  
  const llistaClaus = Object.keys(fieldErrors.value);
  let esValid = false;
  if (llistaClaus.length === 0) {
    esValid = true;
  }
  return esValid;
}

// C) --- Tractament de la cadena de trimestres de l'API ---
function parseTrimestres(val) {
  if (!val) { return []; }
  
  // 1. Convertim la cadena en array per comes
  const partsRaw = String(val).split(',');
  const partsNetes = [];
  for (let i = 0; i < partsRaw.length; i++) {
    const p = partsRaw[i].trim();
    if (p !== '') {
      // 2. Normalitzem el format (ex: "1r Trimestre" -> "1r")
      let valorFinal = p;
      if (p === '1r' || p.startsWith('1r')) { valorFinal = '1r'; }
      else if (p === '2n' || p.startsWith('2n')) { valorFinal = '2n'; }
      else if (p === '3r' || p.startsWith('3r')) { valorFinal = '3r'; }
      partsNetes.push(valorFinal);
    }
  }
  return partsNetes;
}

// D) --- Neteja del format de data per a l'input type="date" ---
function formatDataExecucio(val) {
  if (val === null) { return ''; }
  if (val === undefined) { return ''; }
  
  const s = String(val);
  // 1. Ens quedem amb la part YYYY-MM-DD
  let resultat = s;
  if (s.length >= 10) {
    resultat = s.slice(0, 10);
  }
  return resultat;
}

// E) --- Assignació de dades al model del formulari ---
function omplirForm(d) {
  if (!d) { return; }
  
  // 1. Assignem cada camp directament
  form.value.titol = '';
  if (d.titol) { form.value.titol = d.titol.trim(); }
  
  form.value.descripcio = '';
  if (d.descripcio) { form.value.descripcio = d.descripcio.trim(); }
  
  form.value.sector = '';
  if (d.sector) { form.value.sector = d.sector.trim(); }
  
  form.value.modalitat = '';
  if (d.modalitat) { form.value.modalitat = d.modalitat.trim(); }
  
  form.value.places_maximes = 12;
  if (d.places_maximes !== undefined) {
    if (d.places_maximes !== null) {
      form.value.places_maximes = Number(d.places_maximes);
    }
  }
  
  // 2. Processament de dades complexes (trimestres i dates)
  form.value.trimestres = parseTrimestres(d.trimestres_disponibles);
  form.value.ubicacio = '';
  if (d.ubicacio) { form.value.ubicacio = d.ubicacio.trim(); }
  
  form.value.adreca = '';
  if (d.adreca) { form.value.adreca = d.adreca.trim(); }
  
  form.value.data_execucio = formatDataExecucio(d.data_execucio);
}

// F) --- Recuperació de les dades originals ---
function resetForm() {
  const originals = dadesOriginals.value;
  if (originals) {
    omplirForm(originals);
  }
  message.value = '';
  error.value = '';
  fieldErrors.value = {};
}

// G) --- Càrrega del taller des de l'API ---
async function carregarTaller() {
  const idTaller = props.tallerId;
  if (!idTaller) {
    loadingInitial.value = false;
    return;
  }
  
  loadingInitial.value = true;
  error.value = '';
  
  try {
    const tok = tokenRef;
    const opcionsCapçalera = {};
    if (tok) {
      opcionsCapçalera.Authorization = 'Bearer ' + tok;
    }

    const dadesAPI = await $fetch('/api/admin/tallers/' + String(idTaller), {
      headers: opcionsCapçalera
    });
    
    dadesOriginals.value = dadesAPI;
    omplirForm(dadesAPI);
    
  } catch (errCarrega) {
    console.error('Error carregant taller:', errCarrega);
    let msgErr = 'Error en carregar el taller.';
    if (errCarrega.data) {
      if (errCarrega.data.message) {
        msgErr = errCarrega.data.message;
      }
    }
    error.value = msgErr;
  } finally {
    loadingInitial.value = false;
  }
}

// H) --- Enviament de les actualitzacions al servidor ---
async function submitForm() {
  error.value = '';
  message.value = '';
  
  // 1. Validem el formulari complet
  const esValid = validateAll();
  if (esValid === false) {
    return;
  }

  loading.value = true;
  try {
    const model = form.value;
    
    // 2. Convertim els trimestres a cadena (sense .join)
    let trimestresStr = '';
    const llistaT = model.trimestres;
    for (let j = 0; j < llistaT.length; j++) {
      if (j > 0) { trimestresStr = trimestresStr + ', '; }
      trimestresStr = trimestresStr + llistaT[j];
    }
    
    // 3. Preparem l'objecte per enviar
    const payload = {
      titol: model.titol,
      descripcio: null,
      sector: model.sector,
      modalitat: model.modalitat,
      places_maximes: Number(model.places_maximes),
      trimestres_disponibles: trimestresStr,
      ubicacio: null,
      adreca: null,
      data_execucio: null
    };
    
    if (model.descripcio) { payload.descripcio = model.descripcio; }
    if (model.ubicacio) { payload.ubicacio = model.ubicacio; }
    if (model.adreca) { payload.adreca = model.adreca; }
    if (model.data_execucio) { payload.data_execucio = model.data_execucio; }

    const idAct = props.tallerId;
    const tok = tokenRef;
    const headers = {};
    if (tok) {
      headers.Authorization = 'Bearer ' + tok;
    }

    // 4. Petició PUT
    await $fetch('/api/admin/tallers/' + idAct, {
      method: 'PUT',
      headers: headers,
      body: payload
    });

    // 5. Confirmació i notificació
    const swal = useSwal();
    swal.fire({ 
      title: 'Fet', 
      text: 'Taller actualitzat correctament.', 
      icon: 'success' 
    }).then(function () { 
      emit('updated'); 
    });
    
  } catch (errSubmit) {
    console.error('Error actualitzant taller:', errSubmit);
    let msgError = 'Error en desar els canvis.';
    if (errSubmit.data) {
      if (errSubmit.data.message) {
        msgError = errSubmit.data.message;
      }
    }
    error.value = msgError;
  } finally {
    loading.value = false;
  }
}

// I) --- Vigilant de canvis a la ID del taller ---
watch(function () { return props.tallerId; }, function (nouId) {
  if (nouId) {
    carregarTaller();
  }
}, { immediate: true });
</script>
