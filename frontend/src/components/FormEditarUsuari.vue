<template>
  <div 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#022B3A]/40 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#BFDBF7] bg-[#E1E5F2] shadow-2xl animate-in zoom-in-95 duration-300">
      
      <div class="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/80 border-b border-[#BFDBF7]/60 backdrop-blur-sm">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-[#1F7A8C]/10 flex items-center justify-center text-[#1F7A8C]">
            <User :size="18" />
          </div>
          <div>
            <h2 class="text-lg font-black text-[#022B3A] tracking-tight">Editar Usuari</h2>
            <p class="text-[10px] font-bold text-[#022B3A]/50 uppercase tracking-widest">Modificar dades de l'usuari</p>
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
        <!-- SECCIÓ 1: DADES DE L'USUARI -->
        <div class="space-y-4">
          <h3 class="text-base font-black text-[#022B3A] tracking-tight flex items-center gap-2">
            <User :size="16" class="text-[#1F7A8C]" />
            Dades de l'Usuari
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2 space-y-1.5">
              <label for="feu-email" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Email *</label>
              <div class="relative group">
                <Mail :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                <input 
                  id="feu-email"
                  v-model="form.email"
                  type="email"
                  maxlength="255"
                  @input="validateField('email')"
                  class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-10 pr-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 shadow-sm"
                  placeholder="usuari@xtec.cat"
                />
              </div>
              <p v-if="fieldErrors.email" class="text-sm text-red-600 mt-1">{{ fieldErrors.email }}</p>
            </div>

            <div class="md:col-span-2 space-y-1.5">
              <label for="feu-password" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Contrasenya</label>
              <div class="relative group">
                <Lock :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                <input 
                  id="feu-password"
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

        <div class="w-full h-px bg-[#BFDBF7]/40"></div>

        <!-- SECCIÓ 2: ROL I ASSIGNACIÓ (rol només lectura; Centre per PROFESSOR; Nom i Cognoms per ADMIN i PROFESSOR) -->
        <div class="space-y-4">
          <h3 class="text-base font-black text-[#022B3A] tracking-tight flex items-center gap-2">
            <Shield :size="16" class="text-[#1F7A8C]" />
            Rol i Assignació
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label for="feu-rol" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Rol</label>
              <input 
                id="feu-rol"
                :value="etiquetaRol(form.rol)"
                type="text"
                readonly
                class="w-full bg-[#E1E5F2]/60 border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm text-[#022B3A]/70 cursor-not-allowed"
              />
            </div>

            <div v-if="form.rol === 'PROFESSOR'" class="space-y-1.5">
              <label for="feu-centre" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Centre *</label>
              <div class="relative group">
                <Building2 :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors pointer-events-none z-10" />
                <select 
                  id="feu-centre"
                  v-model="form.centre_id"
                  @change="validateField('centre_id')"
                  class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-10 pr-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none appearance-none cursor-pointer"
                >
                  <option value="" disabled>-- Selecciona un centre --</option>
                  <option v-for="c in centres" :key="c.id" :value="c.id">{{ c.nom_centre }} ({{ c.codi_centre }})</option>
                </select>
              </div>
              <p v-if="fieldErrors.centre_id" class="text-sm text-red-600 mt-1">{{ fieldErrors.centre_id }}</p>
            </div>

            <div v-if="form.rol === 'ADMIN' || form.rol === 'PROFESSOR'" class="space-y-1.5">
              <label for="feu-nom" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Nom</label>
              <input 
                id="feu-nom"
                v-model="form.nom"
                type="text"
                maxlength="100"
                class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none placeholder:text-[#022B3A]/20 shadow-sm"
                :placeholder="form.rol === 'ADMIN' ? 'Nom de l\'administrador' : 'Nom del professor'"
              />
            </div>

            <div v-if="form.rol === 'ADMIN' || form.rol === 'PROFESSOR'" class="space-y-1.5">
              <label for="feu-cognoms" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Cognoms</label>
              <input 
                id="feu-cognoms"
                v-model="form.cognoms"
                type="text"
                maxlength="100"
                class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none placeholder:text-[#022B3A]/20 shadow-sm"
                :placeholder="form.rol === 'ADMIN' ? 'Cognoms de l\'administrador' : 'Cognoms del professor'"
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
  User,
  Mail,
  Lock,
  Shield,
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
  userId: { type: [Number, String], required: true },
  centres: { type: Array, default: function () { return []; } }
});

// 2. Esdeveniments que emet el component
const emit = defineEmits(['close', 'updated']);

// 3. Cookie d'autenticació
const tokenCookie = useCookie('authToken');
const tokenRef = tokenCookie.value;

// 4. Estat reactiu del formulari
const form = ref({
  email: '',
  password: '',
  rol: '',
  centre_id: '',
  nom: '',
  cognoms: ''
});

// 5. Estats de control de la interfície i errors
const loading = ref(false);
const loadingInitial = ref(true);
const message = ref('');
const error = ref('');
const fieldErrors = ref({});
const dadesOriginals = ref(null);

// 6. Propietat computada per a la llista de centres
const centres = computed(function () {
  let llista = props.centres;
  if (Array.isArray(llista) === false) {
    llista = [];
  }
  return llista;
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
  const dadesForm = form.value;
  const errors = fieldErrors.value;

  // 1. Validació de l'email
  if (key === 'email') {
    let emailStr = dadesForm.email;
    if (!emailStr) {
      errors.email = "L'email és obligatori.";
    } else {
      let net = emailStr.trim();
      if (!net) {
        errors.email = "L'email és obligatori.";
      } else {
        const esCorrecte = validEmail(net);
        if (esCorrecte === false) {
          errors.email = "Introduïu un email vàlid (ha de contenir @ i un punt).";
        } else {
          delete errors.email;
        }
      }
    }
  } 
  
  // 2. Validació de la contrasenya (opcional en edició)
  else if (key === 'password') {
    let pwd = dadesForm.password;
    if (pwd) {
      let net = pwd.trim();
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
  
  // 3. Validació del centre (només per a professors)
  else if (key === 'centre_id') {
    let rolActual = dadesForm.rol;
    if (rolActual) {
      if (rolActual.toUpperCase() === 'PROFESSOR') {
        if (!dadesForm.centre_id) {
          errors.centre_id = "Cal seleccionar un centre per a un professor.";
        } else {
          delete errors.centre_id;
        }
      } else {
        delete errors.centre_id;
      }
    } else {
      delete errors.centre_id;
    }
  }
}

// C) --- Validació de tot el formulari ---
function validateAll() {
  validateField('email');
  validateField('password');
  validateField('centre_id');
  
  const llistaClausErrors = Object.keys(fieldErrors.value);
  let esValid = false;
  if (llistaClausErrors.length === 0) {
    esValid = true;
  }
  return esValid;
}

// D) --- Obtenir l'etiqueta descriptiva del rol ---
function etiquetaRol(rolInput) {
  if (!rolInput) { return '—'; }
  const r = rolInput.toUpperCase();
  if (r === 'ADMIN') { return 'Administrador'; }
  if (r === 'PROFESSOR') { return 'Professor'; }
  if (r === 'CENTRE') { return 'Centre'; }
  return rolInput;
}

// E) --- Omplir el model amb les dades de l'API ---
function omplirForm(d) {
  if (!d) { return; }
  
  // 1. Assignem cada camp
  form.value.email = d.email;
  form.value.password = ''; // Sempre buida al carregar per seguretat
  
  let rolFormat = '';
  if (d.rol) { rolFormat = d.rol.toUpperCase(); }
  form.value.rol = rolFormat;
  
  let centreFormat = '';
  if (d.centre_id !== null) {
    if (d.centre_id !== undefined) {
      centreFormat = String(d.centre_id);
    }
  }
  form.value.centre_id = centreFormat;
  
  form.value.nom = d.nom;
  form.value.cognoms = d.cognoms;
  
  // Corregim nuls
  if (form.value.email === null) { form.value.email = ''; }
  if (form.value.nom === null) { form.value.nom = ''; }
  if (form.value.cognoms === null) { form.value.cognoms = ''; }
}

// F) --- Reinicialització del formulari ---
function resetForm() {
  const originals = dadesOriginals.value;
  if (originals) {
    omplirForm(originals);
  }
  form.value.password = '';
  message.value = '';
  error.value = '';
  fieldErrors.value = {};
}

// G) --- Càrrega de l'usuari des de l'API ---
async function carregarUsuari() {
  const idUsuari = props.userId;
  if (!idUsuari) {
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

    const dadesAPI = await $fetch('/api/admin/usuaris/' + idUsuari, {
      headers: opcionsCapçalera
    });
    
    dadesOriginals.value = dadesAPI;
    omplirForm(dadesAPI);
    
  } catch (errCarrega) {
    console.error('Error carregant usuari:', errCarrega);
    let msgError = "Error en carregar l'usuari.";
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

// H) --- Enviament de les modificacions a l'API ---
async function submitForm() {
  error.value = '';
  message.value = '';

  // 1. Validem el formulari
  const esValid = validateAll();
  if (esValid === false) {
    return;
  }

  loading.value = true;
  try {
    const dadesForm = form.value;
    
    // 2. Preparem el payload
    let emailFinal = '';
    if (dadesForm.email) {
      emailFinal = dadesForm.email.trim().toLowerCase();
    }
    
    const payload = {
      email: emailFinal,
      nom: null,
      cognoms: null
    };
    
    if (dadesForm.nom) { payload.nom = dadesForm.nom.trim(); }
    if (dadesForm.cognoms) { payload.cognoms = dadesForm.cognoms.trim(); }
    
    // Contrasenya només si s'ha omplert
    if (dadesForm.password) {
      let pwdNeta = dadesForm.password.trim();
      if (pwdNeta.length > 0) {
         payload.password = pwdNeta;
      }
    }
    
    // Centre si és professor
    const rActual = dadesForm.rol;
    if (rActual) {
      if (rActual.toUpperCase() === 'PROFESSOR') {
        if (dadesForm.centre_id) {
          payload.centre_id = Number(dadesForm.centre_id);
        }
      }
    }

    const idAct = props.userId;
    const tok = tokenRef;
    const headers = {};
    if (tok) {
      headers.Authorization = 'Bearer ' + tok;
    }

    // 3. Petició PUT
    await $fetch('/api/admin/usuaris/' + idAct, {
      method: 'PUT',
      headers: headers,
      body: payload
    });

    // 4. Notificació d'èxit
    const swal = useSwal();
    swal.fire({ 
      title: 'Fet', 
      text: 'Usuari actualitzat correctament.', 
      icon: 'success' 
    }).then(function () { 
      emit('updated'); 
    });
    
  } catch (errPeticio) {
    console.error('Error actualitzant usuari:', errPeticio);
    let msgErr = "Error en desar els canvis.";
    if (errPeticio.data) {
      if (errPeticio.data.message) {
        msgErr = errPeticio.data.message;
      }
    }
    error.value = msgErr;
  } finally {
    loading.value = false;
  }
}

// I) --- Vigilant de canvis en la ID de l'usuari ---
watch(function () { return props.userId; }, function (nouId) {
  if (nouId) {
    carregarUsuari();
  }
}, { immediate: true });
</script>
