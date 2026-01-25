<template>
  <div 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#022B3A]/40 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#BFDBF7] bg-[#E1E5F2] shadow-2xl animate-in zoom-in-95 duration-300">
      
      <!-- Capçalera del modal -->
      <div class="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/80 border-b border-[#BFDBF7]/60 backdrop-blur-sm">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-[#1F7A8C]/10 flex items-center justify-center text-[#1F7A8C]">
            <Building2 :size="18" />
          </div>
          <div>
            <h2 class="text-lg font-black text-[#022B3A] tracking-tight">Crear Centre</h2>
            <p class="text-[10px] font-bold text-[#022B3A]/50 uppercase tracking-widest">Dades del centre i del coordinador</p>
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

      <form @submit.prevent="submitForm" class="p-6 space-y-8" novalidate>
            
        <!-- SECCIÓ 1: DADES DEL CENTRE -->
        <div class="space-y-4">
          <h3 class="text-base font-black text-[#022B3A] tracking-tight flex items-center gap-2">
            <Building2 :size="16" class="text-[#1F7A8C]" />
            Dades del Centre
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Codi Centre -->
            <div class="space-y-1.5">
              <label for="fc-codi" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Codi Centre *</label>
              <input 
                id="fc-codi"
                v-model="form.codi_centre"
                type="text"
                maxlength="50"
                @input="validateField('codi_centre')"
                class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 shadow-sm"
                placeholder="Ex: 0800..."
              />
              <p v-if="fieldErrors.codi_centre" class="text-sm text-red-600 mt-1">{{ fieldErrors.codi_centre }}</p>
            </div>

            <!-- Nom del Centre (select) -->
            <div class="space-y-1.5">
              <label for="fc-nomCentre" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Nom del Centre *</label>
              <select 
                id="fc-nomCentre"
                v-model="form.nom_centre"
                @change="validateField('nom_centre'); validateField('nom_centre_manual')"
                class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none appearance-none cursor-pointer"
              >
                <option value="" disabled>-- Selecciona un centre --</option>
                <option value="Institut Pedralbes">Institut Pedralbes</option>
                <option value="Institut Tecnològic de Barcelona">Institut Tecnològic de Barcelona</option>
                <option value="Institut TIC de Barcelona">Institut TIC de Barcelona</option>
                <option value="Altres">Altres</option>
              </select>
              <p v-if="fieldErrors.nom_centre" class="text-sm text-red-600 mt-1">{{ fieldErrors.nom_centre }}</p>
            </div>

            <!-- Nom del centre (manual) - només quan nom_centre === Altres -->
            <div v-if="mostrarNomManual" class="md:col-span-2 space-y-1.5">
              <label for="fc-nomCentreManual" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Nom del centre (manual) *</label>
              <input 
                id="fc-nomCentreManual"
                v-model="form.nom_centre_manual"
                type="text"
                maxlength="255"
                class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none placeholder:text-[#022B3A]/20 shadow-sm"
                placeholder="Introduïu el nom del centre"
                @input="validateField('nom_centre_manual')"
              />
              <p v-if="fieldErrors.nom_centre_manual" class="text-sm text-red-600 mt-1">{{ fieldErrors.nom_centre_manual }}</p>
            </div>

            <!-- Adreça -->
            <div class="md:col-span-2 space-y-1.5">
              <label for="fc-adreca" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Adreça Completa</label>
              <div class="relative group">
                <MapPin :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                <input 
                  id="fc-adreca"
                  v-model="form.adreca"
                  type="text"
                  maxlength="255"
                  class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-10 pr-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none placeholder:text-[#022B3A]/20 shadow-sm"
                  placeholder="Carrer, número, codi postal..."
                />
              </div>
            </div>

            <!-- Email oficial -->
            <div class="md:col-span-2 space-y-1.5">
              <label for="fc-email" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Email Oficial</label>
              <div class="relative group">
                <Mail :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                <input 
                  id="fc-email"
                  v-model="form.email_oficial"
                  type="email"
                  maxlength="255"
                  class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-10 pr-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none placeholder:text-[#022B3A]/20 shadow-sm"
                  placeholder="centre@xtec.cat"
                />
              </div>
            </div>

            <!-- Municipi -->
            <div class="space-y-1.5">
              <label for="fc-municipi" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Municipi</label>
              <div class="relative group">
                <Globe :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                <input 
                  id="fc-municipi"
                  v-model="form.municipi"
                  type="text"
                  maxlength="100"
                  class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-10 pr-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none placeholder:text-[#022B3A]/20 shadow-sm"
                  placeholder="Barcelona"
                />
              </div>
            </div>

            <!-- Telèfon -->
            <div class="space-y-1.5">
              <label for="fc-telefon" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Telèfon</label>
              <div class="relative group">
                <Phone :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                <input 
                  id="fc-telefon"
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

        <!-- Línia separadora -->
        <div class="w-full h-px bg-[#BFDBF7]/40"></div>

        <!-- SECCIÓ 2: COORDINADOR -->
        <div class="space-y-4">
          <h3 class="text-base font-black text-[#022B3A] tracking-tight flex items-center gap-2">
            <User :size="16" class="text-[#1F7A8C]" />
            Coordinador
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Nom Coordinador -->
            <div class="space-y-1.5">
              <label for="fc-nomCoordinador" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Nom Coordinador</label>
              <input 
                id="fc-nomCoordinador"
                v-model="form.nom_coordinador"
                type="text"
                maxlength="255"
                class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none placeholder:text-[#022B3A]/20 shadow-sm"
                placeholder="Nom i Cognoms"
              />
            </div>

            <!-- Email del Coordinador -->
            <div class="space-y-1.5">
              <label for="fc-emailCoordinador" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Email del Coordinador *</label>
              <div class="relative group">
                <Mail :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                <input 
                  id="fc-emailCoordinador"
                  v-model="form.email_coordinador"
                  type="email"
                  maxlength="255"
                  class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-10 pr-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none placeholder:text-[#022B3A]/20 shadow-sm"
                  placeholder="coordinador@centre.cat"
                  @input="validateField('email_coordinador')"
                />
              </div>
              <p v-if="fieldErrors.email_coordinador" class="text-sm text-red-600 mt-1">{{ fieldErrors.email_coordinador }}</p>
            </div>

            <!-- Contrasenya (compte del centre) -->
            <div class="md:col-span-2 space-y-1.5">
              <label for="fc-password" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Contrasenya (compte del centre) *</label>
              <div class="relative group">
                <Lock :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                <input 
                  id="fc-password"
                  v-model="form.password"
                  type="password"
                  @input="validateField('password')"
                  class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-10 pr-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none placeholder:text-[#022B3A]/20 shadow-sm"
                  placeholder="••••••••"
                />
              </div>
              <p v-if="fieldErrors.password" class="text-sm text-red-600 mt-1">{{ fieldErrors.password }}</p>
            </div>
          </div>
        </div>

        <!-- Error d'API / xarxa -->
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <!-- Botons -->
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
            <template v-if="loading">Creant...</template>
            <template v-else><Plus :size="14" /> Crear centre</template>
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
  Plus,
  X
} from 'lucide-vue-next';

const emit = defineEmits(['close', 'created']);

const tokenRef = useCookie('authToken');

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
const message = ref('');
const error = ref('');
const fieldErrors = ref({});

const mostrarNomManual = computed(() => form.value.nom_centre === 'Altres');

function validEmail(s) {
  const v = (s || '').trim();
  return v.length > 0 && v.includes('@') && v.includes('.') && v.indexOf('.') > v.indexOf('@') + 1;
}

function validateField(key) {
  const v = form.value;
  if (key === 'codi_centre') {
    if (!(v.codi_centre || '').trim()) { fieldErrors.value['codi_centre'] = "El codi del centre és obligatori."; return; }
    delete fieldErrors.value['codi_centre'];
  } else if (key === 'nom_centre') {
    if (!(v.nom_centre || '').trim()) { fieldErrors.value['nom_centre'] = "Seleccioneu un nom de centre."; return; }
    delete fieldErrors.value['nom_centre'];
  } else if (key === 'nom_centre_manual') {
    if (v.nom_centre === 'Altres' && !(v.nom_centre_manual || '').trim()) { fieldErrors.value['nom_centre_manual'] = "Introduïu el nom del centre (manual)."; return; }
    delete fieldErrors.value['nom_centre_manual'];
  } else if (key === 'email_coordinador') {
    const e = (v.email_coordinador || '').trim();
    if (!e) { fieldErrors.value['email_coordinador'] = "L'email del coordinador és obligatori."; return; }
    if (!validEmail(e)) { fieldErrors.value['email_coordinador'] = "Introduïu un email vàlid (ha de contenir @ i un punt)."; return; }
    delete fieldErrors.value['email_coordinador'];
  } else if (key === 'password') {
    const p = v.password || '';
    if (!p) { fieldErrors.value['password'] = "La contrasenya és obligatòria."; return; }
    if (p.length < 6) { fieldErrors.value['password'] = "La contrasenya ha de tenir almenys 6 caràcters."; return; }
    delete fieldErrors.value['password'];
  }
}

function validateAll() {
  validateField('codi_centre');
  validateField('nom_centre');
  validateField('nom_centre_manual');
  validateField('email_coordinador');
  validateField('password');
  return Object.keys(fieldErrors.value).length === 0;
}

function resetForm() {
  form.value.codi_centre = '';
  form.value.nom_centre = '';
  form.value.nom_centre_manual = '';
  form.value.adreca = '';
  form.value.email_oficial = '';
  form.value.municipi = '';
  form.value.telefon = '';
  form.value.nom_coordinador = '';
  form.value.email_coordinador = '';
  form.value.password = '';
  message.value = '';
  error.value = '';
  fieldErrors.value = {};
}

async function submitForm() {
  error.value = '';
  message.value = '';

  const nomFinal = form.value.nom_centre === 'Altres' 
    ? (form.value.nom_centre_manual || '').trim() 
    : (form.value.nom_centre || '').trim();

  if (!validateAll()) return;

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
      email_coordinador: (form.value.email_coordinador || '').trim(),
      password: form.value.password || ''
    };

    const tok = tokenRef.value;
    await $fetch('/api/admin/centres', {
      method: 'POST',
      headers: tok ? { Authorization: 'Bearer ' + tok } : {},
      body: payload
    });

    useSwal().fire({ title: 'Fet', text: 'Centre creat correctament.', icon: 'success' }).then(() => { resetForm(); emit('created'); });
  } catch (err) {
    console.error('Error creant centre:', err);
    const msg = err?.data?.message || err?.message || 'Error en crear el centre.';
    error.value = msg;
  } finally {
    loading.value = false;
  }
}
</script>
