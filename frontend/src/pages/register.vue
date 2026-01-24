<template>
  <main class="min-h-screen bg-[#E1E5F2] flex flex-col items-center justify-center p-6 font-sans relative overflow-y-auto">
    
    <!-- Botó superior esquerra: INICI -->
    <button 
      @click="goToInici"
      type="button"
      class="absolute top-8 left-8 flex items-center gap-2 text-[#022B3A]/40 hover:text-[#1F7A8C] transition-all group z-20"
    >
      <div class="p-2 rounded-lg bg-white/50 group-hover:bg-white border border-transparent group-hover:border-[#BFDBF7]/60 transition-all shadow-sm">
        <Home :size="18" />
      </div>
      <span class="text-[10px] font-black uppercase tracking-widest">Inici</span>
    </button>

    <!-- Contenidor principal -->
    <div class="w-full max-w-4xl animate-in zoom-in-95 duration-500 pb-12 mt-16 md:mt-0">
       
       <!-- Capçalera -->
       <header class="mb-12 text-center">
          <h2 class="text-4xl font-light text-[#022B3A] tracking-tighter mb-2">
            Sol·licitud de <span class="font-extrabold text-[#1F7A8C]">Registre</span>
          </h2>
          <p class="text-[#022B3A]/40 text-[10px] font-black uppercase tracking-[0.2em]">
            Completa les dades del centre i del coordinador
          </p>
       </header>

       <form @submit.prevent="submitForm" class="space-y-12">
             
             <!-- SECCIÓ 1: DADES DEL CENTRE -->
             <div class="space-y-6">
                <div class="flex items-center gap-3 mb-6 px-1">
                   <div class="w-8 h-8 rounded-lg bg-[#1F7A8C]/10 flex items-center justify-center text-[#1F7A8C]">
                      <Building2 :size="18" />
                   </div>
                   <h3 class="text-xl font-black text-[#022B3A] tracking-tight">Dades del Centre</h3>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                   
                   <!-- Codi Centre (form.codi_centre) -->
                   <div class="space-y-2">
                      <label for="codi" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Codi Centre</label>
                      <input 
                        id="codi"
                        v-model="form.codi_centre"
                        type="text"
                        maxlength="50"
                        class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-4 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 shadow-sm"
                        placeholder="Ex: 0800..."
                        required
                      />
                   </div>

                   <!-- Nom del Centre (form.nom_centre) -->
                   <div class="space-y-2">
                      <label for="nomCentre" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Nom del Centre</label>
                      <div class="relative">
                        <select 
                            id="nomCentre"
                            v-model="form.nom_centre"
                            class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-4 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none transition-all appearance-none cursor-pointer"
                            required
                        >
                            <option value="" disabled>-- Selecciona un centre --</option>
                            <option value="Institut Pedralbes">Institut Pedralbes</option>
                            <option value="Institut Tecnològic de Barcelona">Institut Tecnològic de Barcelona</option>
                            <option value="Institut TIC de Barcelona">Institut TIC de Barcelona</option>
                            <option value="Altres">Altres</option>
                        </select>
                        <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#022B3A]/30">
                            <Building2 :size="14" />
                        </div>
                      </div>
                   </div>

                   <!-- Nom del centre (manual) - només quan nom_centre === Altres (form.nom_centre_manual) -->
                   <div v-if="mostrarNomManual" class="md:col-span-2 space-y-2">
                      <label for="nomCentreManual" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Nom del centre (manual)</label>
                      <input 
                        id="nomCentreManual"
                        v-model="form.nom_centre_manual"
                        type="text"
                        maxlength="255"
                        class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-4 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 shadow-sm"
                        placeholder="Introduïu el nom del centre"
                        required
                      />
                   </div>
                   
                   <!-- Contrasenya (form.password) -->
                   <div class="md:col-span-2 space-y-2">
                      <label for="password" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Contrasenya (Compte del Centre)</label>
                      <div class="relative group">
                         <Lock :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                         <input 
                           id="password"
                           v-model="form.password"
                           type="password"
                           minlength="6"
                           class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-11 pr-4 py-4 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 shadow-sm"
                           placeholder="••••••••"
                           required
                         />
                      </div>
                   </div>

                   <!-- Adreça (form.adreca) -->
                   <div class="md:col-span-2 space-y-2">
                      <label for="adreca" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Adreça Completa</label>
                      <div class="relative group">
                         <MapPin :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                         <input 
                           id="adreca"
                           v-model="form.adreca"
                           type="text"
                           maxlength="255"
                           class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-11 pr-4 py-4 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 shadow-sm"
                           placeholder="Carrer, número, codi postal..."
                         />
                      </div>
                   </div>

                   <!-- Email oficial (form.email_oficial) -->
                   <div class="md:col-span-2 space-y-2">
                      <label for="email" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Email Oficial</label>
                      <div class="relative group">
                         <Mail :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                         <input 
                           id="email"
                           v-model="form.email_oficial"
                           type="email"
                           maxlength="255"
                           class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-11 pr-4 py-4 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 shadow-sm"
                           placeholder="centre@xtec.cat"
                           required
                         />
                      </div>
                   </div>

                   <!-- Municipi (form.municipi) -->
                   <div class="space-y-2">
                      <label for="municipi" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Municipi</label>
                      <div class="relative group">
                         <Globe :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                         <input 
                           id="municipi"
                           v-model="form.municipi"
                           type="text"
                           maxlength="100"
                           class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-11 pr-4 py-4 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 shadow-sm"
                           placeholder="Barcelona"
                         />
                      </div>
                   </div>

                   <!-- Telèfon (form.telefon) -->
                   <div class="space-y-2">
                      <label for="telefon" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Telèfon</label>
                      <div class="relative group">
                         <Phone :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                         <input 
                           id="telefon"
                           v-model="form.telefon"
                           type="tel"
                           maxlength="20"
                           class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-11 pr-4 py-4 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 shadow-sm"
                           placeholder="93 000 00 00"
                         />
                      </div>
                   </div>
                </div>
             </div>

             <!-- Línia separadora -->
             <div class="w-full h-px bg-[#BFDBF7]/40"></div>

             <!-- SECCIÓ 2: COORDINADOR -->
             <div class="space-y-6">
                <div class="flex items-center gap-3 mb-6 px-1">
                   <div class="w-8 h-8 rounded-lg bg-[#1F7A8C]/10 flex items-center justify-center text-[#1F7A8C]">
                      <User :size="18" />
                   </div>
                   <h3 class="text-xl font-black text-[#022B3A] tracking-tight">Informació del Coordinador</h3>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <!-- Nom Coordinador (form.nom_coordinador) -->
                   <div class="space-y-2">
                      <label for="nomCoordinador" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Nom Coordinador</label>
                      <input 
                        id="nomCoordinador"
                        v-model="form.nom_coordinador"
                        type="text"
                        maxlength="255"
                        class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-4 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 shadow-sm"
                        placeholder="Nom i Cognoms"
                      />
                   </div>
                   <!-- Email Coordinador (form.email_coordinador) -->
                   <div class="space-y-2">
                      <label for="emailCoordinador" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Email Coordinador</label>
                      <input 
                        id="emailCoordinador"
                        v-model="form.email_coordinador"
                        type="email"
                        maxlength="255"
                        class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-4 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 shadow-sm"
                        placeholder="coordinador@centre.cat"
                        required
                      />
                   </div>
                </div>
                
                <!-- Checkbox: és la primera vegada? (form.es_primera_vegada) -->
                <div class="pt-2">
                   <label class="flex items-center gap-3 cursor-pointer group select-none p-4 rounded-xl hover:bg-white/50 transition-colors -ml-4">
                      <div class="relative flex-shrink-0">
                         <input 
                           type="checkbox" 
                           v-model="form.es_primera_vegada"
                           class="peer sr-only" 
                         />
                         <div class="w-5 h-5 border-2 border-[#BFDBF7] rounded-md peer-checked:bg-[#1F7A8C] peer-checked:border-[#1F7A8C] transition-all bg-white group-hover:border-[#1F7A8C]/50"></div>
                         <CheckSquare :size="12" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity" :stroke-width="4" />
                      </div>
                      <span class="text-[11px] font-bold text-[#022B3A]/70 group-hover:text-[#022B3A] transition-colors uppercase tracking-wide">
                        És la primera vegada que sol·liciteu accés?
                      </span>
                   </label>
                </div>
             </div>

             <!-- Missatges d'èxit i d'error (lògica del Codi A) -->
             <p v-if="message" class="text-sm text-green-600">{{ message }}</p>
             <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

             <!-- Peu: botons i submit -->
             <div class="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div class="flex gap-4 w-full md:w-auto">
                    <button 
                      type="button"
                      @click="goBack"
                      class="flex-1 md:flex-none px-8 py-4 rounded-xl border border-[#BFDBF7]/60 bg-white text-[#022B3A]/40 hover:text-[#022B3A] hover:shadow-lg transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 h-[54px]"
                    >
                       <ArrowLeft :size="16" /> Tornar
                    </button>
                    <button 
                      type="button"
                      @click="resetForm"
                      class="flex-1 md:flex-none px-8 py-4 rounded-xl border border-[#BFDBF7]/60 bg-white text-[#022B3A]/40 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 h-[54px]"
                    >
                       <Eraser :size="16" /> Netejar
                    </button>
                 </div>
                 
                 <button 
                   type="submit"
                   :disabled="loading"
                   class="w-full md:w-auto px-12 py-4 bg-[#1F7A8C] text-white rounded-xl shadow-lg shadow-[#1F7A8C]/20 hover:bg-[#022B3A] hover:shadow-2xl transition-all text-[11px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3 h-[54px] disabled:opacity-70 disabled:cursor-not-allowed"
                 >
                    <template v-if="loading">
                      <span>Enviant...</span>
                    </template>
                    <template v-else>
                      <Send :size="16" />
                      <span>{{ textBoto }}</span>
                    </template>
                 </button>
             </div>
       </form>
    </div>

    <!-- Peu de pàgina -->
    <div class="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-2 px-6 pb-8">
      <a href="#" class="text-[10px] font-bold text-[#022B3A]/30 hover:text-[#1F7A8C] transition-colors uppercase tracking-widest">Ajuda</a>
      <a href="#" class="text-[10px] font-bold text-[#022B3A]/30 hover:text-[#1F7A8C] transition-colors uppercase tracking-widest">Privacitat</a>
      <span class="text-[10px] font-bold text-[#022B3A]/20 uppercase tracking-widest">© 2025 ENGINY PLATFORM</span>
    </div>
    
  </main>
</template>

<script setup>
import {
  Home,
  Building2,
  Lock,
  MapPin,
  Mail,
  Globe,
  Phone,
  User,
  CheckSquare,
  ArrowLeft,
  Eraser,
  Send
} from 'lucide-vue-next';

// ======================================
// Metadades i layout
// ======================================
definePageMeta({
  layout: false
});

// ======================================
// Importacions i Composables (Rutes, Cookies, Stores)
// ======================================
// (useRouter / navigateTo s’usen a les funcions)

// ======================================
// Estat Reactiu i Refs (Variables i Formularis)
// ======================================
const form = ref({
  codi_centre: '',
  nom_centre: '',
  nom_centre_manual: '',
  password: '',
  adreca: '',
  municipi: '',
  telefon: '',
  nom_coordinador: '',
  email_coordinador: '',
  email_oficial: '',
  es_primera_vegada: false,
  estat: 'pendent'
});

const loading = ref(false);
const message = ref('');
const error = ref('');

const mostrarNomManual = computed(function () {
  if (form.value.nom_centre === 'Altres') {
    return true;
  }
  return false;
});

const textBoto = computed(function () {
  if (loading.value) {
    return 'Enviant...';
  }
  return 'Enviar sol·licitud';
});

// ======================================
// Lògica i Funcions (Handlers i Lifecycle)
// ======================================

// A) --- Anar a la pàgina d’inici (botó Inici) ---
function goToInici() {
  navigateTo('/');
}

// A) --- Netejar el formulari i els missatges ---
function resetForm() {
  form.value.codi_centre = '';
  form.value.nom_centre = '';
  form.value.nom_centre_manual = '';
  form.value.password = '';
  form.value.adreca = '';
  form.value.municipi = '';
  form.value.telefon = '';
  form.value.nom_coordinador = '';
  form.value.email_coordinador = '';
  form.value.email_oficial = '';
  form.value.es_primera_vegada = false;
  form.value.estat = 'pendent';
  message.value = '';
  error.value = '';
}

// A) --- Tornar enrere a la pàgina anterior (botó Tornar) ---
function goBack() {
  history.back();
}

// A) --- Enviar el formulari de sol·licitud de registre ---
async function submitForm() {
  error.value = '';
  message.value = '';

  if (!form.value.codi_centre || !form.value.nom_centre || !form.value.password || !form.value.email_coordinador) {
    error.value = 'Si us plau, omple els camps obligatoris (codi, nom, password, email).';
    return;
  }

  loading.value = true;
  try {
    const payload = {};
    payload.codi_centre = form.value.codi_centre;
    payload.nom_centre = form.value.nom_centre;
    if (form.value.nom_centre_manual) {
      payload.nom_centre_manual = form.value.nom_centre_manual;
    } else {
      payload.nom_centre_manual = null;
    }
    payload.password = form.value.password;
    payload.adreca = form.value.adreca;
    payload.municipi = form.value.municipi;
    payload.telefon = form.value.telefon;
    payload.nom_coordinador = form.value.nom_coordinador;
    payload.email_coordinador = form.value.email_coordinador;
    if (form.value.email_oficial) {
      payload.email_centre = form.value.email_oficial;
    } else {
      payload.email_centre = null;
    }
    if (form.value.es_primera_vegada) {
      payload.es_primera_vegada = true;
    } else {
      payload.es_primera_vegada = false;
    }

    const res = await $fetch('/api/solicituds-registre', {
      method: 'POST',
      body: payload
    });

    let missatgeRes = 'Sol·licitud enviada correctament.';
    if (res && res.message) {
      missatgeRes = res.message;
    }
    message.value = missatgeRes;
    resetForm();
  } catch (err) {
    console.error('Error enviant sol·licitud:', err);
    let missatgeErr = 'Error en enviar la sol·licitud';
    if (err && err.data && err.data.message) {
      missatgeErr = err.data.message;
    } else if (err && err.message) {
      missatgeErr = err.message;
    }
    error.value = missatgeErr;
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* Fons #E1E5F2 i colors de marca a les classes Tailwind. */
</style>
