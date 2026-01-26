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

      <form v-else @submit.prevent="submitForm" class="p-6 space-y-8" novalidate>
        <!-- SECCIÓ 1: DADES DEL CENTRE (mateixa estructura que FormCrearCentre) -->
        <div class="space-y-4">
          <h3 class="text-base font-black text-[#022B3A] tracking-tight flex items-center gap-2">
            <Building2 :size="16" class="text-[#1F7A8C]" />
            Dades del Centre
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label for="fe-codi" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Codi Centre *</label>
              <input 
                id="fe-codi"
                v-model="form.codi_centre"
                type="text"
                maxlength="50"
                @input="validateField('codi_centre')"
                class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 shadow-sm"
                placeholder="Ex: 0800..."
              />
              <p v-if="fieldErrors.codi_centre" class="text-sm text-red-600 mt-1">{{ fieldErrors.codi_centre }}</p>
            </div>

            <div class="space-y-1.5">
              <label for="fe-nomCentre" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Nom del Centre *</label>
              <select 
                id="fe-nomCentre"
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

            <div v-if="mostrarNomManual" class="md:col-span-2 space-y-1.5">
              <label for="fe-nomCentreManual" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Nom del centre (manual) *</label>
              <input 
                id="fe-nomCentreManual"
                v-model="form.nom_centre_manual"
                type="text"
                maxlength="255"
                @input="validateField('nom_centre_manual')"
                class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none placeholder:text-[#022B3A]/20 shadow-sm"
                placeholder="Introduïu el nom del centre"
              />
              <p v-if="fieldErrors.nom_centre_manual" class="text-sm text-red-600 mt-1">{{ fieldErrors.nom_centre_manual }}</p>
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
              <label for="fe-emailCoordinador" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Email del Coordinador *</label>
              <div class="relative group">
                <Mail :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                <input 
                  id="fe-emailCoordinador"
                  v-model="form.email_coordinador"
                  type="email"
                  maxlength="255"
                  @input="validateField('email_coordinador')"
                  class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-10 pr-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none placeholder:text-[#022B3A]/20 shadow-sm"
                  placeholder="coordinador@centre.cat"
                />
              </div>
              <p v-if="fieldErrors.email_coordinador" class="text-sm text-red-600 mt-1">{{ fieldErrors.email_coordinador }}</p>
            </div>

            <div class="md:col-span-2 space-y-1.5">
              <label for="fe-password" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Contrasenya (compte del centre)</label>
              <div class="relative group">
                <Lock :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                <input 
                  id="fe-password"
                  v-model="form.password"
                  type="password"
                  @input="validateField('password')"
                  class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-10 pr-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none placeholder:text-[#022B3A]/20 shadow-sm"
                  placeholder="Deixeu en blanc per no canviar-la"
                />
              </div>
              <p v-if="fieldErrors.password" class="text-sm text-red-600 mt-1">{{ fieldErrors.password }}</p>
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

// ======================================
// Definició de l'Esquema
// ======================================

// 1. Propietats que rep el component
const props = defineProps({
  centreId: { type: [Number, String], required: true }
});

// 2. Esdeveniments que emet el component
const emit = defineEmits(['close', 'updated']);

// 3. Obtenim la cookie d'autenticació
const tokenCookie = useCookie('authToken');
const tokenRef = tokenCookie.value;

// 4. Llista de noms predefinits per a la lògica de centre manual
const OPCIONS_NOM = ['Institut Pedralbes', 'Institut Tecnològic de Barcelona', 'Institut TIC de Barcelona', 'Altres'];

// 5. Estat reactiu del formulari
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

// 6. Estats de control de la interfície
const loading = ref(false);
const loadingInitial = ref(true);
const message = ref('');
const error = ref('');
const fieldErrors = ref({});
const dadesOriginals = ref(null);

// 7. Propietat computada per mostrar el camp de nom manual
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
  let text = '';
  if (s) {
    text = s.trim();
  }
  
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
  
  // 2. Validació del nom de centre
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
  
  // 3. Validació del nom manual
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
  
  // 5. Validació de la contrasenya (opcional en edició)
  else if (key === 'password') {
    let p = dades.password;
    if (p) {
      let net = p.trim();
      if (net.length > 0) {
        if (net.length < 6) {
          errors.password = "La contrasenya ha de tenir almenys 6 caràcters.";
        } else {
          delete errors.password;
        }
      } else {
        delete errors.password;
      }
    } else {
      delete errors.password;
    }
  }
}

// C) --- Validació de tot el formulari ---
function validateAll() {
  validateField('codi_centre');
  validateField('nom_centre');
  validateField('nom_centre_manual');
  validateField('email_coordinador');
  validateField('password');
  
  const llistaErrors = Object.keys(fieldErrors.value);
  let esValid = false;
  if (llistaErrors.length === 0) {
    esValid = true;
  }
  return esValid;
}

// D) --- Omplir el formulari amb dades del centre ---
function omplirForm(d) {
  // 1. Assignem els valors bàsics
  form.value.codi_centre = d.codi_centre;
  form.value.adreca = d.adreca;
  form.value.email_oficial = d.email_oficial;
  form.value.municipi = d.municipi;
  form.value.telefon = d.telefon;
  form.value.nom_coordinador = d.nom_coordinador;
  form.value.email_coordinador = d.email_coordinador;
  form.value.password = ''; // Sempre buida al carregar per seguretat

  // 2. Gestionem la lògica del nom del centre (predefinit o manual)
  let nomOriginal = '';
  if (d.nom_centre) {
    nomOriginal = d.nom_centre.trim();
  }
  
  let trobat = false;
  for (let k = 0; k < OPCIONS_NOM.length; k++) {
    if (OPCIONS_NOM[k] === nomOriginal) {
      trobat = true;
      break;
    }
  }

  if (trobat === true) {
    form.value.nom_centre = nomOriginal;
    form.value.nom_centre_manual = '';
  } else {
    form.value.nom_centre = 'Altres';
    form.value.nom_centre_manual = nomOriginal;
  }
  
  // Corregim nuls si n'hi ha
  if (form.value.codi_centre === null) { form.value.codi_centre = ''; }
  if (form.value.adreca === null) { form.value.adreca = ''; }
  if (form.value.email_oficial === null) { form.value.email_oficial = ''; }
  if (form.value.municipi === null) { form.value.municipi = ''; }
  if (form.value.telefon === null) { form.value.telefon = ''; }
  if (form.value.nom_coordinador === null) { form.value.nom_coordinador = ''; }
  if (form.value.email_coordinador === null) { form.value.email_coordinador = ''; }
}

// E) --- Reinicialització del formulari ---
function resetForm() {
  const originals = dadesOriginals.value;
  if (originals) {
    omplirForm(originals);
  }
  message.value = '';
  error.value = '';
  fieldErrors.value = {};
}

// F) --- Càrrega inicial del centre des de l'API ---
async function carregarCentre() {
  const id = props.centreId;
  if (!id) {
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

    const dades = await $fetch('/api/admin/centres/' + id, {
      headers: opcionsCapçalera
    });
    
    dadesOriginals.value = dades;
    omplirForm(dades);
    
  } catch (errCarrega) {
    console.error('Error carregant centre:', errCarrega);
    let msgError = 'Error en carregar el centre.';
    if (errCarrega.data) {
      if (errCarrega.data.message) {
        msgError = errCarrega.data.message;
      }
    }
    error.value = msgError;
  } finally {
    loadingInitial.value = false;
  }
}

// G) --- Enviament de les modificacions ---
async function submitForm() {
  error.value = '';
  message.value = '';

  // 1. Determinem el nom final
  const dadesForm = form.value;
  let nomFinal = '';
  if (dadesForm.nom_centre === 'Altres') {
    if (dadesForm.nom_centre_manual) {
      nomFinal = dadesForm.nom_centre_manual.trim();
    }
  } else {
    if (dadesForm.nom_centre) {
      nomFinal = dadesForm.nom_centre.trim();
    }
  }

  // 2. Validem el formulari
  const esValid = validateAll();
  if (esValid === false) {
    return;
  }

  const idActual = props.centreId;
  loading.value = true;
  
  try {
    // 3. Preparem el payload
    const payload = {
      codi_centre: dadesForm.codi_centre.trim(),
      nom_centre: nomFinal,
      email_oficial: null,
      adreca: null,
      municipi: null,
      telefon: null,
      nom_coordinador: null,
      email_coordinador: dadesForm.email_coordinador.trim()
    };
    
    if (dadesForm.email_oficial) { payload.email_oficial = dadesForm.email_oficial.trim(); }
    if (dadesForm.adreca) { payload.adreca = dadesForm.adreca.trim(); }
    if (dadesForm.municipi) { payload.municipi = dadesForm.municipi.trim(); }
    if (dadesForm.telefon) { payload.telefon = dadesForm.telefon.trim(); }
    if (dadesForm.nom_coordinador) { payload.nom_coordinador = dadesForm.nom_coordinador.trim(); }

    // Si hi ha contrasenya nova, l'afegim
    if (dadesForm.password) {
      const pwd = dadesForm.password.trim();
      if (pwd.length > 0) {
        payload.password = pwd;
      }
    }

    // 4. Petició PUT a l'API
    const tok = tokenRef;
    const opcionsCapçalera = {};
    if (tok) {
      opcionsCapçalera.Authorization = 'Bearer ' + tok;
    }

    await $fetch('/api/admin/centres/' + idActual, {
      method: 'PUT',
      headers: opcionsCapçalera,
      body: payload
    });

    // 5. Missatge d'èxit
    const swal = useSwal();
    swal.fire({ 
      title: 'Fet', 
      text: 'Centre actualitzat correctament.', 
      icon: 'success' 
    }).then(function () { 
      emit('updated'); 
    });
    
  } catch (errUpdate) {
    console.error('Error actualitzant centre:', errUpdate);
    let msgError = 'Error en desar els canvis.';
    if (errUpdate.data) {
      if (errUpdate.data.message) {
        msgError = errUpdate.data.message;
      }
    }
    error.value = msgError;
  } finally {
    loading.value = false;
  }
}

// H) --- Vigilant de canvis en la ID de centre ---
watch(function () { return props.centreId; }, function (nouId) {
  if (nouId) {
    carregarCentre();
  }
}, { immediate: true });
</script>
