<template>
  <main class="min-h-screen bg-[#E1E5F2] flex flex-col items-center justify-center p-6 font-sans relative overflow-y-auto">
    
    <!-- 1. BOTÓ DE RETORN A L'INICI -->
    <button 
      @click="handleGoToInici"
      type="button"
      class="absolute top-8 left-8 flex items-center gap-2 text-[#022B3A]/40 hover:text-[#1F7A8C] transition-all group z-20"
    >
      <div class="p-2 rounded-lg bg-white/50 group-hover:bg-white border border-transparent group-hover:border-[#BFDBF7]/60 transition-all shadow-sm">
        <Home :size="18" />
      </div>
      <span class="text-[10px] font-black uppercase tracking-widest">Inici</span>
    </button>

    <!-- 2. CONTENIDOR DEL FORMULARI -->
    <div class="w-full max-w-4xl animate-in zoom-in-95 duration-500 pb-12 mt-16 md:mt-0">
       
       <!-- Capçalera visual -->
       <header class="mb-12 text-center">
          <h2 class="text-4xl font-light text-[#022B3A] tracking-tighter mb-2">
            Sol·licitud de <span class="font-extrabold text-[#1F7A8C]">Registre</span>
          </h2>
          <p class="text-[#022B3A]/40 text-[10px] font-black uppercase tracking-[0.2em]">
            Completa les dades del centre i del coordinador
          </p>
       </header>

       <form @submit.prevent="handleSubmitFormulari" class="space-y-12" novalidate>
             
             <!-- SECCIÓ 1: DADES DEL CENTRE -->
             <div class="space-y-6">
                <div class="flex items-center gap-3 mb-6 px-1">
                   <div class="w-8 h-8 rounded-lg bg-[#1F7A8C]/10 flex items-center justify-center text-[#1F7A8C]">
                      <Building2 :size="18" />
                   </div>
                   <h3 class="text-xl font-black text-[#022B3A] tracking-tight">Dades del Centre</h3>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                   
                   <!-- Camp: Codi Centre -->
                   <div class="space-y-2">
                      <label for="codi" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Codi Centre *</label>
                      <input 
                        id="codi"
                        v-model="formulariRegistre.codi_centre"
                        type="text"
                        maxlength="50"
                        class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-4 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 shadow-sm"
                        placeholder="Ex: 0800..."
                        @input="executarValidacioCamp('codi_centre')"
                      />
                      <p v-if="errorsCamps.codi_centre" class="text-sm text-red-600 mt-1">{{ errorsCamps.codi_centre }}</p>
                   </div>

                   <!-- Camp: Selecció del Centre -->
                   <div class="space-y-2">
                      <label for="nomCentre" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Nom del Centre *</label>
                      <div class="relative">
                        <select 
                            id="nomCentre"
                            v-model="formulariRegistre.nom_centre"
                            class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-4 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none transition-all appearance-none cursor-pointer"
                            @change="handleCanviNomCentre"
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
                      <p v-if="errorsCamps.nom_centre" class="text-sm text-red-600 mt-1">{{ errorsCamps.nom_centre }}</p>
                   </div>

                   <!-- Camp: Nom del centre (manual) -->
                   <div v-if="isNomManualVisible === true" class="md:col-span-2 space-y-2">
                      <label for="nomCentreManual" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Nom del centre (manual) *</label>
                      <input 
                        id="nomCentreManual"
                        v-model="formulariRegistre.nom_centre_manual"
                        type="text"
                        maxlength="255"
                        class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-4 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 shadow-sm"
                        placeholder="Introduïu el nom del centre"
                        @input="executarValidacioCamp('nom_centre_manual')"
                      />
                      <p v-if="errorsCamps.nom_centre_manual" class="text-sm text-red-600 mt-1">{{ errorsCamps.nom_centre_manual }}</p>
                   </div>

                   <!-- Camp: Adreça -->
                   <div class="md:col-span-2 space-y-2">
                      <label for="adreca" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Adreça Completa</label>
                      <div class="relative group">
                         <MapPin :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                         <input 
                           id="adreca"
                           v-model="formulariRegistre.adreca"
                           type="text"
                           maxlength="255"
                           class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-11 pr-4 py-4 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 shadow-sm"
                           placeholder="Carrer, número, codi postal..."
                         />
                      </div>
                   </div>

                   <!-- Camp: Email oficial -->
                   <div class="md:col-span-2 space-y-2">
                      <label for="email" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Email Oficial</label>
                      <div class="relative group">
                         <Mail :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                         <input 
                           id="email"
                           v-model="formulariRegistre.email_oficial"
                           type="email"
                           maxlength="255"
                           class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-11 pr-4 py-4 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 shadow-sm"
                           placeholder="centre@xtec.cat"
                         />
                      </div>
                   </div>

                   <!-- Camp: Municipi -->
                   <div class="space-y-2">
                      <label for="municipi" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Municipi</label>
                      <div class="relative group">
                         <Globe :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                         <input 
                           id="municipi"
                           v-model="formulariRegistre.municipi"
                           type="text"
                           maxlength="100"
                           class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-11 pr-4 py-4 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 shadow-sm"
                           placeholder="Barcelona"
                         />
                      </div>
                   </div>

                   <!-- Camp: Telèfon -->
                   <div class="space-y-2">
                      <label for="telefon" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Telèfon</label>
                      <div class="relative group">
                         <Phone :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                         <input 
                           id="telefon"
                           v-model="formulariRegistre.telefon"
                           type="tel"
                           maxlength="20"
                           class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-11 pr-4 py-4 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 shadow-sm"
                           placeholder="93 000 00 00"
                         />
                      </div>
                   </div>
                </div>
             </div>

             <!-- Línia decorativa -->
             <div class="w-full h-px bg-[#BFDBF7]/40"></div>

             <!-- SECCIÓ 2: INFORMACIÓ DEL COORDINADOR -->
             <div class="space-y-6">
                <div class="flex items-center gap-3 mb-6 px-1">
                   <div class="w-8 h-8 rounded-lg bg-[#1F7A8C]/10 flex items-center justify-center text-[#1F7A8C]">
                      <User :size="18" />
                   </div>
                   <h3 class="text-xl font-black text-[#022B3A] tracking-tight">Informació del Coordinador</h3>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                   
                   <!-- Camp: Nom Coordinador -->
                   <div class="space-y-2">
                      <label for="nomCoordinador" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Nom Coordinador</label>
                      <input 
                        id="nomCoordinador"
                        v-model="formulariRegistre.nom_coordinador"
                        type="text"
                        maxlength="255"
                        class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-4 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 shadow-sm"
                        placeholder="Nom i Cognoms"
                      />
                   </div>

                   <!-- Camp: Email Coordinador -->
                   <div class="space-y-2">
                      <label for="emailCoordinador" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Email Coordinador *</label>
                      <input 
                        id="emailCoordinador"
                        v-model="formulariRegistre.email_coordinador"
                        type="email"
                        maxlength="255"
                        class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-4 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 shadow-sm"
                        placeholder="coordinador@centre.cat"
                        @input="executarValidacioCamp('email_coordinador')"
                      />
                      <p v-if="errorsCamps.email_coordinador" class="text-sm text-red-600 mt-1">{{ errorsCamps.email_coordinador }}</p>
                   </div>

                   <!-- Camp: Contrasenya -->
                   <div class="md:col-span-2 space-y-2">
                      <label for="password" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Contrasenya (Compte del Centre) *</label>
                      <div class="relative group">
                         <Lock :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                         <input 
                           id="password"
                           v-model="formulariRegistre.password"
                           type="password"
                           class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-11 pr-4 py-4 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 shadow-sm"
                           placeholder="••••••••"
                           @input="executarValidacioCamp('password')"
                         />
                      </div>
                      <p v-if="errorsCamps.password" class="text-sm text-red-600 mt-1">{{ errorsCamps.password }}</p>
                   </div>
                </div>
                
                <!-- Checkbox: Primera vegada -->
                <div class="pt-2">
                   <label class="flex items-center gap-3 cursor-pointer group select-none p-4 rounded-xl hover:bg-white/50 transition-colors -ml-4">
                      <div class="relative flex-shrink-0">
                         <input 
                           type="checkbox" 
                           v-model="formulariRegistre.es_primera_vegada"
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

             <!-- Missatges de feedback de l'API -->
             <p v-if="msgFeedbackExit" class="text-sm text-green-600 font-bold p-4 bg-green-50 rounded-xl border border-green-100">{{ msgFeedbackExit }}</p>
             <p v-if="msgErrorApi" class="text-sm text-red-600 font-bold p-4 bg-red-50 rounded-xl border border-red-100">{{ msgErrorApi }}</p>

             <!-- Barra d'accions finals -->
             <div class="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div class="flex gap-4 w-full md:w-auto">
                    <button 
                      type="button"
                      @click="handleGoBack"
                      class="flex-1 md:flex-none px-8 py-4 rounded-xl border border-[#BFDBF7]/60 bg-white text-[#022B3A]/40 hover:text-[#022B3A] hover:shadow-lg transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 h-[54px]"
                    >
                       <ArrowLeft :size="16" /> Tornar
                    </button>
                    <button 
                      type="button"
                      @click="handleResetFormulari"
                      class="flex-1 md:flex-none px-8 py-4 rounded-xl border border-[#BFDBF7]/60 bg-white text-[#022B3A]/40 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 h-[54px]"
                    >
                       <Eraser :size="16" /> Netejar
                    </button>
                 </div>
                 
                 <button 
                   type="submit"
                   :disabled="isPendentPeticio === true"
                   class="w-full md:w-auto px-12 py-4 bg-[#1F7A8C] text-white rounded-xl shadow-lg shadow-[#1F7A8C]/20 hover:bg-[#022B3A] hover:shadow-2xl transition-all text-[11px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3 h-[54px] disabled:opacity-70 disabled:cursor-not-allowed"
                 >
                    <div v-if="isPendentPeticio === true" class="flex items-center gap-2">
                       <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                       <span>Enviant...</span>
                    </div>
                    <div v-else class="flex items-center gap-3">
                       <Send :size="16" />
                       <span>{{ textBotoEnviarUI }}</span>
                    </div>
                 </button>
             </div>
       </form>
    </div>

    <!-- Peu de pàgina secundari -->
    <div class="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-2 px-6 pb-8">
      <a href="#" class="text-[10px] font-bold text-[#022B3A]/30 hover:text-[#1F7A8C] transition-colors uppercase tracking-widest">Ajuda</a>
      <a href="#" class="text-[10px] font-bold text-[#022B3A]/30 hover:text-[#1F7A8C] transition-colors uppercase tracking-widest">Privacitat</a>
      <span class="text-[10px] font-bold text-[#022B3A]/20 uppercase tracking-widest">© 2025 ENGINY PLATFORM</span>
    </div>
    
  </main>
</template>

<script setup>
// ======================================
// Importem les dependències
// ======================================
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
// Configuració del Component
// ======================================

// 1. Definim que aquesta pàgina no utilitza el layout general
definePageMeta({
  layout: false
});

// ======================================
// Estat Reactiu (Esquema del Formulari i Errors)
// ======================================

const formulariRegistre = ref({
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

const isPendentPeticio = ref(false);
const msgFeedbackExit = ref('');
const msgErrorApi = ref('');
const errorsCamps = ref({});

// ======================================
// Propietats Computades (Anàlisi de dades)
// ======================================

// 1. Control de visibilitat del camp manual per a centres no llistats
const isNomManualVisible = computed(function () {
  if (formulariRegistre.value.nom_centre === 'Altres') {
    return true;
  }
  return false;
});

// 2. Text dinàmic del botó principal
const textBotoEnviarUI = computed(function () {
  if (isPendentPeticio.value === true) {
    return 'Enviant...';
  }
  return 'Enviar sol·licitud';
});

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Validacions ---

function comprovarFormatEmail(textEmail) {
  const t = String(textEmail || '').trim();
  let valid = false;
  if (t !== '') {
    const arrobaIdx = t.indexOf('@');
    if (arrobaIdx !== -1) {
      const partDespres = t.slice(arrobaIdx + 1);
      if (partDespres.indexOf('.') !== -1) {
        valid = true;
      }
    }
  }
  return valid;
}

function executarValidacioCamp(clau) {
  const dades = formulariRegistre.value;
  
  if (clau === 'codi_centre') {
    const textCodi = String(dades.codi_centre || '').trim();
    if (textCodi === '') {
      errorsCamps.value.codi_centre = 'Introduïu el codi del centre.';
    } else {
      errorsCamps.value.codi_centre = null;
    }
  }

  if (clau === 'nom_centre') {
    const selectCentre = String(dades.nom_centre || '').trim();
    if (selectCentre === '') {
      errorsCamps.value.nom_centre = 'Seleccioneu un centre.';
    } else {
      errorsCamps.value.nom_centre = null;
    }
  }

  if (clau === 'nom_centre_manual') {
    if (dades.nom_centre === 'Altres') {
      const manualCentre = String(dades.nom_centre_manual || '').trim();
      if (manualCentre === '') {
        errorsCamps.value.nom_centre_manual = 'Introduïu el nom del centre.';
      } else {
        errorsCamps.value.nom_centre_manual = null;
      }
    } else {
      errorsCamps.value.nom_centre_manual = null;
    }
  }

  if (clau === 'email_coordinador') {
    const emailCoord = String(dades.email_coordinador || '').trim();
    if (comprovarFormatEmail(emailCoord) === false) {
      errorsCamps.value.email_coordinador = 'Email de coordinador no vàlid.';
    } else {
      errorsCamps.value.email_coordinador = null;
    }
  }

  if (clau === 'password') {
    const pass = dades.password || '';
    if (pass === '') {
      errorsCamps.value.password = 'La contrasenya és obligatòria.';
    } else if (pass.length < 6) {
      errorsCamps.value.password = 'Mínim 6 caràcters per seguretat.';
    } else {
      errorsCamps.value.password = null;
    }
  }
}

function validarTotElFormulari() {
  executarValidacioCamp('codi_centre');
  executarValidacioCamp('nom_centre');
  executarValidacioCamp('nom_centre_manual');
  executarValidacioCamp('email_coordinador');
  executarValidacioCamp('password');
  
  let esValid = true;
  if (errorsCamps.value.codi_centre) { esValid = false; }
  if (errorsCamps.value.nom_centre) { esValid = false; }
  if (errorsCamps.value.nom_centre_manual) { esValid = false; }
  if (errorsCamps.value.email_coordinador) { esValid = false; }
  if (errorsCamps.value.password) { esValid = false; }
  
  return esValid;
}

// B) --- Handlers d'accions UI ---

function handleGoToInici() {
  navigateTo('/');
}

function handleGoBack() {
  // Tornem enrere en l'historial del navegador
  if (window.history.length > 1) {
    window.history.back();
  } else {
    navigateTo('/');
  }
}

function handleResetFormulari() {
  formulariRegistre.value.codi_centre = '';
  formulariRegistre.value.nom_centre = '';
  formulariRegistre.value.nom_centre_manual = '';
  formulariRegistre.value.password = '';
  formulariRegistre.value.adreca = '';
  formulariRegistre.value.municipi = '';
  formulariRegistre.value.telefon = '';
  formulariRegistre.value.nom_coordinador = '';
  formulariRegistre.value.email_coordinador = '';
  formulariRegistre.value.email_oficial = '';
  formulariRegistre.value.es_primera_vegada = false;
  formulariRegistre.value.estat = 'pendent';
  
  msgFeedbackExit.value = '';
  msgErrorApi.value = '';
  errorsCamps.value = {};
}

function handleCanviNomCentre() {
  executarValidacioCamp('nom_centre');
  executarValidacioCamp('nom_centre_manual');
}

// C) --- API i enviament ---

async function handleSubmitFormulari() {
  // 1. Netegem estats de resposta
  msgErrorApi.value = '';
  msgFeedbackExit.value = '';

  // 2. Validem tot el formulari abans d'enviar
  const esCorrecte = validarTotElFormulari();
  if (esCorrecte === false) { return; }

  isPendentPeticio.value = true;
  
  try {
    // 3. Construïm el payload neteja d'extres
    const dadesForm = formulariRegistre.value;
    const bodyPeticio = {
      codi_centre: dadesForm.codi_centre,
      nom_centre: dadesForm.nom_centre,
      nom_centre_manual: dadesForm.nom_centre === 'Altres' ? dadesForm.nom_centre_manual : null,
      password: dadesForm.password,
      adreca: dadesForm.adreca,
      municipi: dadesForm.municipi,
      telefon: dadesForm.telefon,
      nom_coordinador: dadesForm.nom_coordinador,
      email_coordinador: dadesForm.email_coordinador,
      email_centre: dadesForm.email_oficial || null,
      es_primera_vegada: dadesForm.es_primera_vegada === true
    };

    // 4. Executem la petició d'alta de sol·licitud
    const respostaApi = await $fetch('/api/solicituds-registre', {
      method: 'POST',
      body: bodyPeticio
    });

    // 5. Gestionem l'èxit
    let missatgeFinal = 'Sol·licitud enviada correctament.';
    if (respostaApi) {
      if (respostaApi.message) {
        missatgeFinal = respostaApi.message;
      }
    }
    msgFeedbackExit.value = missatgeFinal;
    
    // Netejem el formulari després de l'èxit
    handleResetFormulari();
    
    // Mostrem confirmació visual a l'usuari
    const swalInst = useSwal();
    swalInst.fire({
      title: 'Sol·licitud Enviada',
      text: missatgeFinal,
      icon: 'success'
    });

  } catch (errorPet) {
    // 6. Gestionem l'error d'enviament
    console.error('Error enviant sol·licitud de registre:', errorPet);
    let msgE = 'Error en enviar la sol·licitud. Torneu-ho a provar més tard.';
    if (errorPet.data) {
      if (errorPet.data.message) {
        msgE = errorPet.data.message;
      }
    } else if (errorPet.message) {
      msgE = errorPet.message;
    }
    msgErrorApi.value = msgE;
  } finally {
    isPendentPeticio.value = false;
  }
}
</script>

<style scoped>
/* Estils de fons i marca gestionats via Tailwind */
</style>
