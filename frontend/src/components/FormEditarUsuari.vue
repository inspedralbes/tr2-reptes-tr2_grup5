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

      <form v-else @submit.prevent="submitForm" class="p-6 space-y-8">
        <!-- SECCIÓ 1: DADES DE L'USUARI -->
        <div class="space-y-4">
          <h3 class="text-base font-black text-[#022B3A] tracking-tight flex items-center gap-2">
            <User :size="16" class="text-[#1F7A8C]" />
            Dades de l'Usuari
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2 space-y-1.5">
              <label for="feu-email" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Email</label>
              <div class="relative group">
                <Mail :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                <input 
                  id="feu-email"
                  v-model="form.email"
                  type="email"
                  maxlength="255"
                  class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-10 pr-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none transition-all placeholder:text-[#022B3A]/20 shadow-sm"
                  placeholder="usuari@xtec.cat"
                  required
                />
              </div>
            </div>

            <div class="md:col-span-2 space-y-1.5">
              <label for="feu-password" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Contrasenya</label>
              <div class="relative group">
                <Lock :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors" />
                <input 
                  id="feu-password"
                  v-model="form.password"
                  type="password"
                  class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-10 pr-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none placeholder:text-[#022B3A]/20 shadow-sm"
                  placeholder="Deixeu en blanc per no canviar-la"
                />
              </div>
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
              <label for="feu-centre" class="text-[10px] font-black text-[#022B3A]/60 uppercase tracking-widest ml-1 block">Centre</label>
              <div class="relative group">
                <Building2 :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#022B3A]/20 group-focus-within:text-[#1F7A8C] transition-colors pointer-events-none z-10" />
                <select 
                  id="feu-centre"
                  v-model="form.centre_id"
                  class="w-full bg-white border border-[#BFDBF7]/60 rounded-xl pl-10 pr-4 py-3 text-sm text-[#022B3A] focus:ring-4 focus:ring-[#1F7A8C]/10 focus:border-[#1F7A8C] outline-none appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled>-- Selecciona un centre --</option>
                  <option v-for="c in centres" :key="c.id" :value="c.id">{{ c.nom_centre }} ({{ c.codi_centre }})</option>
                </select>
              </div>
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

const props = defineProps({
  userId: { type: [Number, String], required: true },
  centres: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'updated']);

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
const loadingInitial = ref(true);
const message = ref('');
const error = ref('');
const dadesOriginals = ref(null);

const centres = computed(() => Array.isArray(props.centres) ? props.centres : []);

function etiquetaRol(r) {
  const v = (r || '').toUpperCase();
  if (v === 'ADMIN') return 'Administrador';
  if (v === 'PROFESSOR') return 'Professor';
  if (v === 'CENTRE') return 'Centre';
  return r || '—';
}

function omplirForm(d) {
  form.value.email = d.email || '';
  form.value.password = '';
  form.value.rol = (d.rol || '').toUpperCase();
  form.value.centre_id = d.centre_id != null ? String(d.centre_id) : '';
  form.value.nom = d.nom || '';
  form.value.cognoms = d.cognoms || '';
}

function resetForm() {
  if (dadesOriginals.value) omplirForm(dadesOriginals.value);
  form.value.password = '';
  message.value = '';
  error.value = '';
}

async function carregarUsuari() {
  if (!props.userId) return;
  loadingInitial.value = true;
  error.value = '';
  try {
    const tok = tokenRef.value;
    const d = await $fetch('/api/admin/usuaris/' + props.userId, {
      headers: tok ? { Authorization: 'Bearer ' + tok } : {}
    });
    dadesOriginals.value = d;
    omplirForm(d);
  } catch (err) {
    error.value = err?.data?.message || err?.message || "Error en carregar l'usuari.";
  } finally {
    loadingInitial.value = false;
  }
}

watch(() => props.userId, (id) => {
  if (id) carregarUsuari();
}, { immediate: true });

async function submitForm() {
  error.value = '';
  message.value = '';

  const email = (form.value.email || '').trim().toLowerCase();
  if (!email) {
    error.value = "L'email és obligatori.";
    return;
  }

  const pwd = (form.value.password || '').trim();
  if (pwd && pwd.length < 6) {
    error.value = 'La contrasenya ha de tenir almenys 6 caràcters.';
    return;
  }

  if ((form.value.rol || '').toUpperCase() === 'PROFESSOR') {
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
      nom: (form.value.nom || '').trim() || null,
      cognoms: (form.value.cognoms || '').trim() || null
    };
    if (pwd) payload.password = pwd;
    if ((form.value.rol || '').toUpperCase() === 'PROFESSOR') {
      payload.centre_id = Number(form.value.centre_id) || null;
    }

    const tok = tokenRef.value;
    await $fetch('/api/admin/usuaris/' + props.userId, {
      method: 'PUT',
      headers: tok ? { Authorization: 'Bearer ' + tok } : {},
      body: payload
    });

    useSwal().fire({ title: 'Fet', text: 'Usuari actualitzat correctament.', icon: 'success' }).then(() => { emit('updated'); });
  } catch (err) {
    console.error('Error actualitzant usuari:', err);
    error.value = err?.data?.message || err?.message || "Error en desar els canvis.";
  } finally {
    loading.value = false;
  }
}
</script>
