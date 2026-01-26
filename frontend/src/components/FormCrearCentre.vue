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
// ======================================
// Importem les dependències
// ======================================
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

// ======================================
// Definició de l'Esquema
// ======================================

// 1. Definim els esdeveniments que emet el component
const emit = defineEmits(['close', 'created']);

// 2. Obtenim la cookie d'autenticació
const tokenCookie = useCookie('authToken');
const tokenRef = tokenCookie.value;

// 3. Estat reactiu del formulari
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

// 4. Estats de control de la interfície
const loading = ref(false);
const message = ref('');
const error = ref('');
const fieldErrors = ref({});

// 5. Propietat computada per mostrar el camp de nom manual
const mostrarNomManual = computed(function () {
  const nom = form.value.nom_centre;
  let esAltres = false;
  if (nom === 'Altres') {
    esAltres = true;
  }
  return esAltres;
});

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Validació de format de correu electrònic ---
function validEmail(s) {
  // 1. Verifiquem que el text existeixi
  let text = '';
  if (s) {
    text = s.trim();
  }
  
  // 2. Validem regles bàsiques de format
  let esValid = false;
  if (text.length > 0) {
    if (text.includes('@')) {
      if (text.includes('.')) {
        const indexArrova = text.indexOf('@');
        const indexPunt = text.indexOf('.');
        if (indexPunt > indexArrova + 1) {
          esValid = true;
        }
      }
    }
  }
  return esValid;
}

// B) --- Validació d'un camp específic ---
function validateField(key) {
  const dades = form.value;
  const errors = fieldErrors.value;

  // 1. Validació del codi de centre
  if (key === 'codi_centre') {
    let codi = dades.codi_centre;
    if (!codi) {
      errors.codi_centre = "El codi del centre és obligatori.";
    } else {
      let net = codi.trim();
      if (!net) {
        errors.codi_centre = "El codi del centre és obligatori.";
      } else {
        delete errors.codi_centre;
      }
    }
  } 
  
  // 2. Validació del nom de centre seleccionat
  else if (key === 'nom_centre') {
    let nom = dades.nom_centre;
    if (!nom) {
      errors.nom_centre = "Seleccioneu un nom de centre.";
    } else {
      let net = nom.trim();
      if (!net) {
        errors.nom_centre = "Seleccioneu un nom de centre.";
      } else {
        delete errors.nom_centre;
      }
    }
  } 
  
  // 3. Validació del nom manual (si s'ha triat 'Altres')
  else if (key === 'nom_centre_manual') {
    if (dades.nom_centre === 'Altres') {
      let manual = dades.nom_centre_manual;
      if (!manual) {
        errors.nom_centre_manual = "Introduïu el nom del centre (manual).";
      } else {
        let net = manual.trim();
        if (!net) {
          errors.nom_centre_manual = "Introduïu el nom del centre (manual).";
        } else {
          delete errors.nom_centre_manual;
        }
      }
    } else {
      delete errors.nom_centre_manual;
    }
  } 
  
  // 4. Validació de l'email del coordinador
  else if (key === 'email_coordinador') {
    let email = dades.email_coordinador;
    if (!email) {
      errors.email_coordinador = "L'email del coordinador és obligatori.";
    } else {
      let net = email.trim();
      if (!net) {
        errors.email_coordinador = "L'email del coordinador és obligatori.";
      } else {
        const esCorrecte = validEmail(net);
        if (esCorrecte === false) {
           errors.email_coordinador = "Introduïu un email vàlid (ha de contenir @ i un punt).";
        } else {
          delete errors.email_coordinador;
        }
      }
    }
  } 
  
  // 5. Validació de la contrasenya
  else if (key === 'password') {
    let contrasenya = dades.password;
    if (!contrasenya) {
      errors.password = "La contrasenya és obligatòria.";
    } else if (contrasenya.length < 6) {
      errors.password = "La contrasenya ha de tenir almenys 6 caràcters.";
    } else {
      delete errors.password;
    }
  }
}

// C) --- Validació de tot el formulari ---
function validateAll() {
  // 1. Cridem a validar cada camp
  validateField('codi_centre');
  validateField('nom_centre');
  validateField('nom_centre_manual');
  validateField('email_coordinador');
  validateField('password');
  
  // 2. Comprovem si hi ha cap clau d'error
  const llistaErrors = Object.keys(fieldErrors.value);
  let esValid = false;
  if (llistaErrors.length === 0) {
    esValid = true;
  }
  return esValid;
}

// D) --- Reinicialització del formulari ---
function resetForm() {
  // 1. Netegem els camps del model
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
  
  // 2. Netegem estats de missatges
  message.value = '';
  error.value = '';
  fieldErrors.value = {};
}

// E) --- Enviament de les dades al servidor ---
async function submitForm() {
  // 1. Netegem alertes prèvies
  error.value = '';
  message.value = '';

  // 2. Determinem el nom final del centre
  let nomFinal = '';
  const dadesForm = form.value;
  if (dadesForm.nom_centre === 'Altres') {
    if (dadesForm.nom_centre_manual) {
      nomFinal = dadesForm.nom_centre_manual.trim();
    }
  } else {
    if (dadesForm.nom_centre) {
      nomFinal = dadesForm.nom_centre.trim();
    }
  }

  // 3. Validem tot el formulari abans d'enviar
  const esValid = validateAll();
  if (esValid === false) {
    return;
  }

  // 4. Iniciem procés de càrrega
  loading.value = true;
  
  try {
    // 5. Preparem el paquet de dades
    const payload = {
      codi_centre: dadesForm.codi_centre.trim(),
      nom_centre: nomFinal,
      email_oficial: null,
      adreca: null,
      municipi: null,
      telefon: null,
      nom_coordinador: null,
      email_coordinador: dadesForm.email_coordinador.trim(),
      password: dadesForm.password
    };
    
    // Omplim dades opcionals si n'hi ha
    if (dadesForm.email_oficial) { payload.email_oficial = dadesForm.email_oficial.trim(); }
    if (dadesForm.adreca) { payload.adreca = dadesForm.adreca.trim(); }
    if (dadesForm.municipi) { payload.municipi = dadesForm.municipi.trim(); }
    if (dadesForm.telefon) { payload.telefon = dadesForm.telefon.trim(); }
    if (dadesForm.nom_coordinador) { payload.nom_coordinador = dadesForm.nom_coordinador.trim(); }

    // 6. Fem la petició a l'API
    const tok = tokenRef;
    const opcionsCapçalera = {};
    if (tok) {
      opcionsCapçalera.Authorization = 'Bearer ' + tok;
    }

    await $fetch('/api/admin/centres', {
      method: 'POST',
      headers: opcionsCapçalera,
      body: payload
    });

    // 7. Mostrem missatge d'èxit i tanquem
    const swal = useSwal();
    swal.fire({ 
      title: 'Fet', 
      text: 'Centre creat correctament.', 
      icon: 'success' 
    }).then(function () { 
      resetForm(); 
      emit('created'); 
    });
    
  } catch (errPeticio) {
    // 8. Gestionem l'error del servidor
    console.error('Error creant centre:', errPeticio);
    let missatgeError = 'Error en crear el centre.';
    if (errPeticio.data) {
      if (errPeticio.data.message) {
        missatgeError = errPeticio.data.message;
      }
    } else if (errPeticio.message) {
      missatgeError = errPeticio.message;
    }
    error.value = missatgeError;
  } finally {
    // 9. Finalitzem l'estat de càrrega
    loading.value = false;
  }
}
</script>
