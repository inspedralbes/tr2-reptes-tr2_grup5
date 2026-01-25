<template>
  <div 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#022B3A]/40 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#BFDBF7] bg-[#E1E5F2] shadow-2xl animate-in zoom-in-95 duration-300">
      
      <div class="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/80 border-b border-[#BFDBF7]/60 backdrop-blur-sm">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-[#1F7A8C]/10 flex items-center justify-center text-[#1F7A8C]">
            <Building2 :size="18" />
          </div>
          <div>
            <h2 class="text-lg font-black text-[#022B3A] tracking-tight">Editar Centre</h2>
            <p class="text-[10px] font-bold text-[#022B3A]/50 uppercase tracking-widest">Modificar dades del centre i del coordinador</p>
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
        <!-- SECCIÓ 1: DADES DEL CENTRE (mateixa estructura que FormCrearCentre) -->
        <div class="space-y-4">
          <h3 class="text-base font-black text-[#022B3A] tracking-tight flex items-center gap-2">
            <Building2 :size="16" class="text-[#1F7A8C]" />
            Dades del Centre
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label for="fe-codi" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Codi Centre</label>
              <input 
                id="fe-codi"
                v-model="form.codi_centre"
                type="text"
                maxlength="50"
                class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 shadow-sm"
                placeholder="Ex: 0800..."
                required
              />
            </div>

            <div class="space-y-1.5">
              <label for="fe-nomCentre" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Nom del Centre</label>
              <select 
                id="fe-nomCentre"
                v-model="form.nom_centre"
                class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none appearance-none cursor-pointer"
                required
              >
                <option value="" disabled>-- Selecciona un centre --</option>
                <option value="Institut Pedralbes">Institut Pedralbes</option>
                <option value="Institut Tecnològic de Barcelona">Institut Tecnològic de Barcelona</option>
                <option value="Institut TIC de Barcelona">Institut TIC de Barcelona</option>
                <option value="Altres">Altres</option>
              </select>
            </div>

            <div v-if="mostrarNomManual" class="md:col-span-2 space-y-1.5">
              <label for="fe-nomCentreManual" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Nom del centre (manual)</label>
              <input 
                id="fe-nomCentreManual"
                v-model="form.nom_centre_manual"
                type="text"
                maxlength="255"
                class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none placeholder:text-[#022B3A]/20 shadow-sm"
                placeholder="Introduïu el nom del centre"
                :required="form.nom_centre === 'Altres'"
              />
            </div>

            <div class="md:col-span-2 space-y-1.5">
              <label for="fe-adreca" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Adreça Completa</label>
              <div class="relative group">
                <MapPin :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                <input 
                  id="fe-adreca"
                  v-model="form.adreca"
                  type="text"
                  maxlength="255"
                  class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-10 pr-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none placeholder:text-[#022B3A]/20 shadow-sm"
                  placeholder="Carrer, número, codi postal..."
                />
              </div>
            </div>

            <div class="md:col-span-2 space-y-1.5">
              <label for="fe-email" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Email Oficial</label>
              <div class="relative group">
                <Mail :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                <input 
                  id="fe-email"
                  v-model="form.email_oficial"
                  type="email"
                  maxlength="255"
                  class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-10 pr-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none placeholder:text-[#022B3A]/20 shadow-sm"
                  placeholder="centre@xtec.cat"
                />
              </div>
            </div>

            <div class="space-y-1.5">
              <label for="fe-municipi" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Municipi</label>
              <div class="relative group">
                <Globe :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                <input 
                  id="fe-municipi"
                  v-model="form.municipi"
                  type="text"
                  maxlength="100"
                  class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-10 pr-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none placeholder:text-[#022B3A]/20 shadow-sm"
                  placeholder="Barcelona"
                />
              </div>
            </div>

            <div class="space-y-1.5">
              <label for="fe-telefon" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Telèfon</label>
              <div class="relative group">
                <Phone :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                <input 
                  id="fe-telefon"
                  v-model="form.telefon"
                  type="tel"
                  maxlength="20"
                  class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-10 pr-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none placeholder:text-[#022B3A]/20 shadow-sm"
                  placeholder="93 000 00 00"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="w-full h-px bg-[#BFDBF7]/40"></div>

        <!-- SECCIÓ 2: COORDINADOR -->
        <div class="space-y-4">
          <h3 class="text-base font-black text-[#022B3A] tracking-tight flex items-center gap-2">
            <User :size="16" class="text-[#1F7A8C]" />
            Coordinador
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label for="fe-nomCoordinador" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Nom Coordinador</label>
              <input 
                id="fe-nomCoordinador"
                v-model="form.nom_coordinador"
                type="text"
                maxlength="255"
                class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none placeholder:text-[#022B3A]/20 shadow-sm"
                placeholder="Nom i Cognoms"
              />
            </div>

            <div class="space-y-1.5">
              <label for="fe-emailCoordinador" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Email del Coordinador</label>
              <div class="relative group">
                <Mail :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                <input 
                  id="fe-emailCoordinador"
                  v-model="form.email_coordinador"
                  type="email"
                  maxlength="255"
                  class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-10 pr-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none placeholder:text-[#022B3A]/20 shadow-sm"
                  placeholder="coordinador@centre.cat"
                  required
                />
              </div>
            </div>

            <div class="md:col-span-2 space-y-1.5">
              <label for="fe-password" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Contrasenya (compte del centre)</label>
              <div class="relative group">
                <Lock :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                <input 
                  id="fe-password"
                  v-model="form.password"
                  type="password"
                  minlength="6"
                  class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-10 pr-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none placeholder:text-[#022B3A]/20 shadow-sm"
                  placeholder="Deixeu en blanc per no canviar-la"
                />
              </div>
            </div>
          </div>
        </div>

        <p v-if="message" class="text-sm text-green-600">{{ message }}</p>
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
  Building2,
  MapPin,
  Mail,
  Globe,
  Phone,
  User,
  Lock,
  ArrowLeft,
  Eraser,
  Pencil,
  X
} from 'lucide-vue-next';

const props = defineProps({
  centreId: { type: [Number, String], required: true }
});

const emit = defineEmits(['close', 'updated']);

const tokenRef = useCookie('authToken');

const OPCIONS_NOM = ['Institut Pedralbes', 'Institut Tecnològic de Barcelona', 'Institut TIC de Barcelona', 'Altres'];

const form = ref({
  codi_centre: '',
  nom_centre: '',
  nom_centre_manual: '',
  adreca: '',
  email_oficial: '',
  municipi: '',
  telefon: '',
  nom_coordinador: '',
  email_coordinador: '',
  password: ''
});

const loading = ref(false);
const loadingInitial = ref(true);
const message = ref('');
const error = ref('');

const mostrarNomManual = computed(() => form.value.nom_centre === 'Altres');

function omplirForm(d) {
  form.value.codi_centre = d.codi_centre || '';
  form.value.adreca = d.adreca || '';
  form.value.email_oficial = d.email_oficial || '';
  form.value.municipi = d.municipi || '';
  form.value.telefon = d.telefon || '';
  form.value.nom_coordinador = d.nom_coordinador || '';
  form.value.email_coordinador = d.email_coordinador || '';
  form.value.password = '';

  const nom = (d.nom_centre || '').trim();
  if (OPCIONS_NOM.includes(nom)) {
    form.value.nom_centre = nom;
    form.value.nom_centre_manual = '';
  } else {
    form.value.nom_centre = 'Altres';
    form.value.nom_centre_manual = nom;
  }
}

function resetForm() {
  if (dadesOriginals.value) {
    omplirForm(dadesOriginals.value);
  }
  message.value = '';
  error.value = '';
}

const dadesOriginals = ref(null);

async function carregarCentre() {
  if (!props.centreId) return;
  loadingInitial.value = true;
  error.value = '';
  try {
    const tok = tokenRef.value;
    const d = await $fetch('/api/admin/centres/' + props.centreId, {
      headers: tok ? { Authorization: 'Bearer ' + tok } : {}
    });
    dadesOriginals.value = d;
    omplirForm(d);
  } catch (err) {
    error.value = err?.data?.message || err?.message || 'Error en carregar el centre.';
  } finally {
    loadingInitial.value = false;
  }
}

watch(() => props.centreId, (id) => {
  if (id) carregarCentre();
}, { immediate: true });

async function submitForm() {
  error.value = '';
  message.value = '';

  const nomFinal = form.value.nom_centre === 'Altres' 
    ? (form.value.nom_centre_manual || '').trim() 
    : (form.value.nom_centre || '').trim();

  if (!form.value.codi_centre || !nomFinal) {
    error.value = 'El codi i el nom del centre són obligatoris.';
    return;
  }

  if (form.value.nom_centre === 'Altres' && !form.value.nom_centre_manual?.trim()) {
    error.value = 'Si seleccioneu "Altres", heu d\'introduir el nom del centre.';
    return;
  }

  const emailCoord = (form.value.email_coordinador || '').trim();
  if (!emailCoord) {
    error.value = "L'email del coordinador és obligatori.";
    return;
  }

  const pwd = (form.value.password || '').trim();
  if (pwd && pwd.length < 6) {
    error.value = 'La contrasenya ha de tenir almenys 6 caràcters.';
    return;
  }

  loading.value = true;
  try {
    const payload = {
      codi_centre: form.value.codi_centre.trim(),
      nom_centre: nomFinal,
      email_oficial: form.value.email_oficial?.trim() || null,
      adreca: form.value.adreca?.trim() || null,
      municipi: form.value.municipi?.trim() || null,
      telefon: form.value.telefon?.trim() || null,
      nom_coordinador: form.value.nom_coordinador?.trim() || null,
      email_coordinador: emailCoord
    };
    if (pwd) payload.password = pwd;

    const tok = tokenRef.value;
    await $fetch('/api/admin/centres/' + props.centreId, {
      method: 'PUT',
      headers: tok ? { Authorization: 'Bearer ' + tok } : {},
      body: payload
    });

    message.value = 'Centre actualitzat correctament.';
    emit('updated');
  } catch (err) {
    console.error('Error actualitzant centre:', err);
    error.value = err?.data?.message || err?.message || 'Error en desar els canvis.';
  } finally {
    loading.value = false;
  }
}
</script>
