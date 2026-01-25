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

      <form @submit.prevent="submitForm" class="p-6 space-y-8">
            
        <!-- SECCIÓ 1: DADES DE L'USUARI -->
        <div class="space-y-4">
          <h3 class="text-base font-black text-[#022B3A] tracking-tight flex items-center gap-2">
            <User :size="16" class="text-[#1F7A8C]" />
            Dades de l'Usuari
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Email -->
            <div class="md:col-span-2 space-y-1.5">
              <label for="fu-email" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Email</label>
              <div class="relative group">
                <Mail :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                <input 
                  id="fu-email"
                  v-model="form.email"
                  type="email"
                  maxlength="255"
                  class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-10 pr-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 shadow-sm"
                  placeholder="usuari@xtec.cat"
                  required
                />
              </div>
            </div>

            <!-- Contrasenya -->
            <div class="md:col-span-2 space-y-1.5">
              <label for="fu-password" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Contrasenya</label>
              <div class="relative group">
                <Lock :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                <input 
                  id="fu-password"
                  v-model="form.password"
                  type="password"
                  minlength="6"
                  class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-10 pr-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none placeholder:text-[#022B3A]/20 shadow-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
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
              <label for="fu-rol" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Rol</label>
              <select 
                id="fu-rol"
                v-model="form.rol"
                class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl px-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none appearance-none cursor-pointer"
                required
              >
                <option value="" disabled>-- Selecciona el rol --</option>
                <option value="ADMIN">Administrador</option>
                <option value="PROFESSOR">Professor</option>
              </select>
            </div>

            <!-- Centre (només quan rol === PROFESSOR) -->
            <div v-if="form.rol === 'PROFESSOR'" class="space-y-1.5">
              <label for="fu-centre" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Centre</label>
              <div class="relative group">
                <Building2 :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors pointer-events-none z-10" />
                <select 
                  id="fu-centre"
                  v-model="form.centre_id"
                  class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-10 pr-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none appearance-none cursor-pointer"
                  :required="form.rol === 'PROFESSOR'"
                >
                  <option value="" disabled>-- Selecciona un centre --</option>
                  <option v-for="c in centres" :key="c.id" :value="c.id">{{ c.nom_centre }} ({{ c.codi_centre }})</option>
                </select>
              </div>
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

        <!-- Missatges -->
        <p v-if="message" class="text-sm text-green-600">{{ message }}</p>
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

const props = defineProps({
  centres: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'created']);

const tokenRef = useCookie('authToken');

const form = ref({
  email: '',
  password: '',
  rol: '',
  centre_id: '',
  nom: '',
  cognoms: ''
});

const loading = ref(false);
const message = ref('');
const error = ref('');

const centres = computed(() => Array.isArray(props.centres) ? props.centres : []);

function resetForm() {
  form.value.email = '';
  form.value.password = '';
  form.value.rol = '';
  form.value.centre_id = '';
  form.value.nom = '';
  form.value.cognoms = '';
  message.value = '';
  error.value = '';
}

async function submitForm() {
  error.value = '';
  message.value = '';

  const email = (form.value.email || '').trim().toLowerCase();
  const pwd = form.value.password || '';

  if (!email) {
    error.value = "L'email és obligatori.";
    return;
  }
  if (!pwd || pwd.length < 6) {
    error.value = 'La contrasenya és obligatòria i ha de tenir almenys 6 caràcters.';
    return;
  }
  if (form.value.rol !== 'ADMIN' && form.value.rol !== 'PROFESSOR') {
    error.value = 'Heu de seleccionar un rol (Administrador o Professor).';
    return;
  }

  if (form.value.rol === 'PROFESSOR') {
    const cid = form.value.centre_id;
    if (!cid) {
      error.value = 'Cal seleccionar un centre per a un professor.';
      return;
    }
  }

  loading.value = true;
  try {
    const payload = {
      email,
      password: pwd,
      rol: form.value.rol,
      nom: (form.value.nom || '').trim() || null,
      cognoms: (form.value.cognoms || '').trim() || null
    };
    if (form.value.rol === 'PROFESSOR') {
      payload.centre_id = Number(form.value.centre_id) || null;
    }

    const tok = tokenRef.value;
    await $fetch('/api/admin/usuaris', {
      method: 'POST',
      headers: tok ? { Authorization: 'Bearer ' + tok } : {},
      body: payload
    });

    message.value = 'Usuari creat correctament.';
    resetForm();
    emit('created');
  } catch (err) {
    console.error('Error creant usuari:', err);
    const msg = err?.data?.message || err?.message || "Error en crear l'usuari.";
    error.value = msg;
  } finally {
    loading.value = false;
  }
}
</script>
