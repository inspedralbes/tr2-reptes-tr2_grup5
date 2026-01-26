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
            <User :size="18" />
          </div>
          <div>
            <h2 class="text-lg font-black text-[#022B3A] tracking-tight">Crear Usuari</h2>
            <p class="text-[10px] font-bold text-[#022B3A]/50 uppercase tracking-widest">Dades de l'usuari i rol</p>
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
            
        <!-- SECCIÓ 1: DADES DE L'USUARI -->
        <div class="space-y-4">
          <h3 class="text-base font-black text-[#022B3A] tracking-tight flex items-center gap-2">
            <User :size="16" class="text-[#1F7A8C]" />
            Dades de l'Usuari
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Email -->
            <div class="md:col-span-2 space-y-1.5">
              <label for="fu-email" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Email *</label>
              <div class="relative group">
                <Mail :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                <input 
                  id="fu-email"
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

            <!-- Contrasenya -->
            <div class="md:col-span-2 space-y-1.5">
              <label for="fu-password" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Contrasenya *</label>
              <div class="relative group">
                <Lock :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                <input 
                  id="fu-password"
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

        <!-- Línia separadora -->
        <div class="w-full h-px bg-[#BFDBF7]/40"></div>

        <!-- SECCIÓ 2: ROL I ASSIGNACIÓ -->
        <div class="space-y-4">
          <h3 class="text-base font-black text-[#022B3A] tracking-tight flex items-center gap-2">
            <Shield :size="16" class="text-[#1F7A8C]" />
            Rol i Assignació
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Rol -->
            <div class="space-y-1.5">
              <label for="fu-rol" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Rol *</label>
              <select 
                id="fu-rol"
                v-model="form.rol"
                @change="validateField('rol'); validateField('centre_id')"
                class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none appearance-none cursor-pointer"
              >
                <option value="" disabled>-- Selecciona el rol --</option>
                <option value="ADMIN">Administrador</option>
                <option value="PROFESSOR">Professor</option>
              </select>
              <p v-if="fieldErrors.rol" class="text-sm text-red-600 mt-1">{{ fieldErrors.rol }}</p>
            </div>

            <!-- Centre (només quan rol === PROFESSOR) -->
            <div v-if="form.rol === 'PROFESSOR'" class="space-y-1.5">
              <label for="fu-centre" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Centre *</label>
              <div class="relative group">
                <Building2 :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors pointer-events-none z-10" />
                <select 
                  id="fu-centre"
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

            <!-- Nom (per a ADMIN i PROFESSOR) -->
            <div v-if="form.rol === 'ADMIN' || form.rol === 'PROFESSOR'" class="space-y-1.5">
              <label for="fu-nom" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Nom</label>
              <input 
                id="fu-nom"
                v-model="form.nom"
                type="text"
                maxlength="100"
                class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none placeholder:text-[#022B3A]/20 shadow-sm"
                :placeholder="form.rol === 'ADMIN' ? 'Nom de l\'administrador' : 'Nom del professor'"
              />
            </div>

            <!-- Cognoms (per a ADMIN i PROFESSOR) -->
            <div v-if="form.rol === 'ADMIN' || form.rol === 'PROFESSOR'" class="space-y-1.5">
              <label for="fu-cognoms" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Cognoms</label>
              <input 
                id="fu-cognoms"
                v-model="form.cognoms"
                type="text"
                maxlength="100"
                class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none placeholder:text-[#022B3A]/20 shadow-sm"
                :placeholder="form.rol === 'ADMIN' ? 'Cognoms de l\'administrador' : 'Cognoms del professor'"
              />
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
            <template v-else><Plus :size="14" /> Crear usuari</template>
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
  Plus,
  X
} from 'lucide-vue-next';

// ======================================
// Definició de l'Esquema
// ======================================

// 1. Propietats que rep el component
const props = defineProps({
  centres: { type: Array, default: function () { return []; } }
});

// 2. Definim els esdeveniments que emet el component
const emit = defineEmits(['close', 'created']);

// 3. Obtenim la cookie d'autenticació
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
const message = ref('');
const error = ref('');
const fieldErrors = ref({});

// 6. Propietat computada per assegurar que centres sigui sempre una llista
const centres = computed(function () {
  let llistaCentres = props.centres;
  if (Array.isArray(llistaCentres) === false) {
    llistaCentres = [];
  }
  return llistaCentres;
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
  
  // 2. Validació de la contrasenya
  else if (key === 'password') {
    let pwd = dadesForm.password;
    if (!pwd) {
      errors.password = "La contrasenya és obligatòria.";
    } else if (pwd.length < 6) {
      errors.password = "La contrasenya ha de tenir almenys 6 caràcters.";
    } else {
      delete errors.password;
    }
  } 
  
  // 3. Validació del rol
  else if (key === 'rol') {
    const r = dadesForm.rol;
    if (r !== 'ADMIN') {
      if (r !== 'PROFESSOR') {
        errors.rol = "Heu de seleccionar un rol (Administrador o Professor).";
      } else {
        delete errors.rol;
      }
    } else {
      delete errors.rol;
    }
  } 
  
  // 4. Validació del centre (només per a professors)
  else if (key === 'centre_id') {
    if (dadesForm.rol === 'PROFESSOR') {
      if (!dadesForm.centre_id) {
        errors.centre_id = "Cal seleccionar un centre per a un professor.";
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
  validateField('rol');
  validateField('centre_id');
  
  const llistaErrors = Object.keys(fieldErrors.value);
  let esValid = false;
  if (llistaErrors.length === 0) {
    esValid = true;
  }
  return esValid;
}

// D) --- Reinicialització del formulari ---
function resetForm() {
  form.value.email = '';
  form.value.password = '';
  form.value.rol = '';
  form.value.centre_id = '';
  form.value.nom = '';
  form.value.cognoms = '';
  message.value = '';
  error.value = '';
  fieldErrors.value = {};
}

// E) --- Enviament de les dades del nou usuari a l'API ---
async function submitForm() {
  // 1. Netegem estats previs
  error.value = '';
  message.value = '';
  
  // 2. Validem el formulari
  const esFormuValid = validateAll();
  if (esFormuValid === false) {
    return;
  }

  const dades = form.value;
  loading.value = true;
  
  try {
    // 3. Preparem l'objecte per a la petició
    let emailFinal = '';
    if (dades.email) {
      emailFinal = dades.email.trim().toLowerCase();
    }
    
    const payload = {
      email: emailFinal,
      password: dades.password,
      rol: dades.rol,
      nom: null,
      cognoms: null
    };
    
    if (dades.nom) { payload.nom = dades.nom.trim(); }
    if (dades.cognoms) { payload.cognoms = dades.cognoms.trim(); }
    
    if (dades.rol === 'PROFESSOR') {
      if (dades.centre_id) {
        payload.centre_id = Number(dades.centre_id);
      }
    }

    // 4. Executem la crida POST
    const tok = tokenRef;
    const headers = {};
    if (tok) {
      headers.Authorization = 'Bearer ' + tok;
    }

    await $fetch('/api/admin/usuaris', {
      method: 'POST',
      headers: headers,
      body: payload
    });

    // 5. Notificació d'èxit
    const swal = useSwal();
    swal.fire({ 
      title: 'Fet', 
      text: 'Usuari creat correctament.', 
      icon: 'success' 
    }).then(function () { 
      resetForm(); 
      emit('created'); 
    });
    
  } catch (errPeticio) {
    // 6. Gestió de l'error del servidor
    console.error('Error creant usuari:', errPeticio);
    let msgError = "Error en crear l'usuari.";
    if (errPeticio.data) {
      if (errPeticio.data.message) {
        msgError = errPeticio.data.message;
      }
    } else if (errPeticio.message) {
      msgError = errPeticio.message;
    }
    error.value = msgError;
  } finally {
    // 7. Finalitzem càrrega
    loading.value = false;
  }
}
</script>
