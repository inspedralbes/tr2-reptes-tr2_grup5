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

      <form v-else @submit.prevent="submitForm" class="p-6 space-y-8">
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
                required
              />
            </div>
            <div class="space-y-1.5">
              <label for="fet-sector" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Sector Professional *</label>
              <select 
                id="fet-sector"
                v-model="form.sector"
                class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none appearance-none cursor-pointer"
                required
              >
                <option value="" disabled>Selecciona un sector</option>
                <option v-for="s in sectors" :key="s" :value="s">{{ s }}</option>
              </select>
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
                <input type="radio" name="modalitat-edit" :value="mod.id" v-model="form.modalitat" class="peer sr-only" />
                <div class="flex flex-col items-center justify-center p-5 bg-white border border-[#BFDBF7]/60 rounded-xl peer-checked:bg-[#022B3A] peer-checked:border-[#022B3A] transition-all group-hover:border-[#1F7A8C]">
                  <div :class="['w-3 h-3 rounded-full mb-2', mod.colorClass]"></div>
                  <span class="text-[11px] font-black uppercase tracking-widest text-[#022B3A] peer-checked:text-white">Projecte {{ mod.id }}</span>
                </div>
              </label>
            </div>
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
                required
              />
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
                <input type="checkbox" :value="t" v-model="form.trimestres" class="peer sr-only" />
                <div class="flex items-center justify-center p-4 bg-white border border-[#BFDBF7]/60 rounded-xl peer-checked:bg-[#1F7A8C] peer-checked:border-[#1F7A8C] transition-all group-hover:border-[#1F7A8C]">
                  <span class="text-[11px] font-black uppercase tracking-widest text-[#022B3A] peer-checked:text-white">{{ t }} Trimestre</span>
                </div>
              </label>
            </div>
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

const props = defineProps({
  tallerId: { type: [Number, String], required: true }
});

const emit = defineEmits(['close', 'updated']);

const tokenRef = useCookie('authToken');

const sectors = ['Agroalimentari', 'Manufacturer', 'Energia i Aigua', 'Construcció', 'Comerç i Turisme', 'Transport', 'Hoteleria', 'Informació i Comunicació', 'Financer', 'Immobiliari', 'Professional'];
const modalities = [ { id: 'A', colorClass: 'bg-[#fb6107]' }, { id: 'B', colorClass: 'bg-[#7cb518]' }, { id: 'C', colorClass: 'bg-[#fbb02d]' } ];
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

const loading = ref(false);
const loadingInitial = ref(true);
const message = ref('');
const error = ref('');
const dadesOriginals = ref(null);

const duradaCalculada = computed(() => {
  if (form.value.modalitat === 'A' || form.value.modalitat === 'B') return '20 hores (10 sessions de 2 hores)';
  if (form.value.modalitat === 'C') return '30 hores (10 sessions de 3 hores)';
  return 'Selecciona una modalitat';
});

function parseTrimestres(val) {
  if (!val) return [];
  const parts = String(val).split(',').map(s => s.trim()).filter(Boolean);
  // Normalitzar: si ve "1r Trimestre" o similar, quedar-nos amb "1r", "2n", "3r"
  return parts.map((p) => {
    if (p === '1r' || p.startsWith('1r')) return '1r';
    if (p === '2n' || p.startsWith('2n')) return '2n';
    if (p === '3r' || p.startsWith('3r')) return '3r';
    return p;
  });
}

function formatDataExecucio(val) {
  if (val == null || val === '') return '';
  const s = String(val);
  // YYYY-MM-DD (input date) o ISO (YYYY-MM-DDTHH:mm:...)
  if (s.length >= 10) return s.slice(0, 10);
  return s;
}

function omplirForm(d) {
  if (!d || typeof d !== 'object') return;
  form.value.titol = (d.titol || '').trim();
  form.value.descripcio = (d.descripcio || '').trim();
  form.value.sector = (d.sector || '').trim();
  form.value.modalitat = (d.modalitat || '').trim();
  form.value.places_maximes = d.places_maximes !== undefined && d.places_maximes !== null ? Number(d.places_maximes) : 12;
  form.value.trimestres = parseTrimestres(d.trimestres_disponibles);
  form.value.ubicacio = (d.ubicacio || '').trim();
  form.value.adreca = (d.adreca || '').trim();
  form.value.data_execucio = formatDataExecucio(d.data_execucio);
}

function resetForm() {
  if (dadesOriginals.value) {
    omplirForm(dadesOriginals.value);
  }
  message.value = '';
  error.value = '';
}

async function carregarTaller() {
  if (!props.tallerId) {
    loadingInitial.value = false;
    return;
  }
  loadingInitial.value = true;
  error.value = '';
  try {
    const tok = tokenRef.value;
    const d = await $fetch('/api/admin/tallers/' + String(props.tallerId), {
      headers: tok ? { Authorization: 'Bearer ' + tok } : {}
    });
    dadesOriginals.value = d;
    omplirForm(d);
  } catch (err) {
    error.value = err?.data?.message || err?.message || 'Error en carregar el taller.';
  } finally {
    loadingInitial.value = false;
  }
}

watch(() => props.tallerId, (id) => {
  if (id) carregarTaller();
}, { immediate: true });

async function submitForm() {
  error.value = '';
  message.value = '';

  if (!form.value.titol || !form.value.sector || !form.value.modalitat) {
    error.value = 'Omple els camps obligatoris: títol, sector i modalitat.';
    return;
  }
  if (!form.value.trimestres || form.value.trimestres.length === 0) {
    error.value = 'Has de seleccionar almenys un trimestre.';
    return;
  }
  if (form.value.places_maximes < 1) {
    error.value = 'Les places màximes han de ser com a mínim 1.';
    return;
  }

  loading.value = true;
  try {
    const trimestresStr = (form.value.trimestres || []).join(', ');
    const payload = {
      titol: form.value.titol,
      descripcio: form.value.descripcio || null,
      sector: form.value.sector,
      modalitat: form.value.modalitat,
      places_maximes: Number(form.value.places_maximes) || 12,
      trimestres_disponibles: trimestresStr,
      ubicacio: form.value.ubicacio || null,
      adreca: form.value.adreca || null,
      data_execucio: form.value.data_execucio || null
    };
    const tok = tokenRef.value;
    await $fetch('/api/admin/tallers/' + props.tallerId, {
      method: 'PUT',
      headers: tok ? { Authorization: 'Bearer ' + tok } : {},
      body: payload
    });
    useSwal().fire({ title: 'Fet', text: 'Taller actualitzat correctament.', icon: 'success' }).then(() => { emit('updated'); });
  } catch (err) {
    console.error('Error actualitzant taller:', err);
    error.value = err?.data?.message || err?.message || 'Error en desar els canvis.';
  } finally {
    loading.value = false;
  }
}
</script>
