<template>
  <div class="edit-page">
    <div class="header">
      <NuxtLink to="/admin/tallers" class="btn-back">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Tornar al catàleg
      </NuxtLink>
      <h2>Editar Taller #{{ idTaller }}</h2>
    </div>

    <div v-if="pendent" class="state-msg">Carregant dades del taller...</div>
    <div v-else-if="errorFetch" class="state-msg error">Error: No s'ha pogut trobar el taller.</div>

    <form v-else @submit.prevent="handleUpdate" class="form-container">
      <div class="form-grid">
        <div class="form-group full-width">
          <label>Títol del Taller</label>
          <input v-model="formData.titol" type="text" required placeholder="Ex: Robòtica i IA">
        </div>

        <div class="form-group full-width">
          <label>Descripció</label>
          <textarea v-model="formData.descripcio" rows="3" placeholder="Explica de què tracta el taller..."></textarea>
        </div>

        <div class="form-group">
          <label>Sector</label>
          <select v-model="formData.sector" required>
            <option v-for="s in sectors" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>Modalitat</label>
          <select v-model="formData.modalitat" required>
            <option value="A">Projecte A</option>
            <option value="B">Projecte B</option>
            <option value="C">Projecte C</option>
          </select>
        </div>

        <div class="form-group">
          <label>Places Màximes (Capacitat)</label>
          <input v-model.number="formData.places_maximes" type="number" min="1" required>
          <p class="helper">Això no modificarà les places restants actuals a menys que s'indiqui.</p>
        </div>

        <div class="form-group">
          <label>Trimestres Disponibles</label>
          <input v-model="formData.trimestres_disponibles" type="text" placeholder="Ex: 1r, 2n">
        </div>

        <div class="form-group">
          <label>Adreça</label>
          <input v-model="formData.adreca" type="text">
        </div>

        <div class="form-group">
          <label>Ubicació (Aula/Taller)</label>
          <input v-model="formData.ubicacio" type="text">
        </div>

        <div class="form-group checkbox">
          <label class="switch-label">
            <input type="checkbox" v-model="formData.actiu" :true-value="1" :false-value="0">
            <span class="slider"></span>
            Taller Actiu
          </label>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-save" :disabled="saving">
          {{ textBoto }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
// ======================================
// Importacions i Composables (Rutes, Cookies, Stores)
// ======================================
const route = useRoute();
const router = useRouter();
const token = useCookie('authToken');
const saving = ref(false);

// ======================================
// Estat Reactiu i Refs (Variables i Formularis)
// ======================================
const sectors = [
  'Agroalimentari', 'Manufacturer', 'Energia i Aigua', 'Construcció',
  'Comerç i Turisme', 'Transport', 'Hoteleria', 'Informació i Comunicació',
  'Financer', 'Immobiliari', 'Professional'
];

const formData = ref({
  titol: '',
  descripcio: '',
  sector: '',
  modalitat: '',
  trimestres_disponibles: '',
  places_maximes: 12,
  adreca: '',
  ubicacio: '',
  actiu: 1
});

const idTaller = computed(function () {
  return route.query.id;
});

const respostaFetch = await useFetch('/api/admin/tallers/' + route.query.id, {
  headers: { Authorization: 'Bearer ' + token.value }
});

const taller = computed(function () {
  let d = respostaFetch.data;
  if (d && d.value) {
    return d.value;
  }
  return null;
});

const pendent = computed(function () {
  if (respostaFetch.pending) {
    return respostaFetch.pending.value;
  }
  return false;
});

const errorFetch = computed(function () {
  if (respostaFetch.error && respostaFetch.error.value) {
    return true;
  }
  return false;
});

const textBoto = computed(function () {
  if (saving.value) {
    return 'Guardant...';
  } else {
    return 'Actualitzar Taller';
  }
});

// Actualitzar formData quan taller carregui o canviï
watch(function () {
  return taller.value;
}, function (nou) {
  if (nou) {
    formData.value.titol = nou.titol;
    formData.value.descripcio = nou.descripcio;
    formData.value.sector = nou.sector;
    formData.value.modalitat = nou.modalitat;
    if (nou.trimestres_disponibles) {
      formData.value.trimestres_disponibles = nou.trimestres_disponibles;
    } else {
      formData.value.trimestres_disponibles = '';
    }
    if (nou.places_maximes !== undefined) {
      formData.value.places_maximes = nou.places_maximes;
    } else {
      formData.value.places_maximes = 12;
    }
    if (nou.adreca) {
      formData.value.adreca = nou.adreca;
    } else {
      formData.value.adreca = '';
    }
    if (nou.ubicacio) {
      formData.value.ubicacio = nou.ubicacio;
    } else {
      formData.value.ubicacio = '';
    }
    if (nou.actiu !== undefined) {
      formData.value.actiu = nou.actiu;
    } else {
      formData.value.actiu = 1;
    }
  }
});

// ======================================
// Lògica i Funcions (Handlers i Lifecycle)
// ======================================

// A) --- Actualitzar el taller a l'API ---
async function handleUpdate() {
  saving.value = true;
  try {
    await $fetch('/api/admin/tallers/' + route.query.id, {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + token.value },
      body: formData.value
    });
    alert('Taller actualitzat correctament!');
    router.push('/admin/tallers');
  } catch (err) {
    let msg = 'Error al guardar: ';
    if (err && err.message) {
      msg = msg + err.message;
    } else {
      msg = msg + 'Error desconegut';
    }
    alert(msg);
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.edit-page { padding: 40px; max-width: 900px; margin: 0 auto; }
.header { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; }
.btn-back { display: flex; align-items: center; gap: 8px; color: #64748b; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
.btn-back:hover { color: #2563eb; }

.form-container { background: white; padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.full-width { grid-column: span 2; }

.form-group { display: flex; flex-direction: column; gap: 8px; }
label { font-size: 0.85rem; font-weight: 700; color: #1e293b; }
input, select, textarea {
  padding: 10px 14px; border-radius: 8px; border: 1px solid #cbd5e1;
  font-size: 0.95rem; transition: border-color 0.2s;
}
input:focus, select:focus, textarea:focus { outline: none; border-color: #3b82f6 }

.helper { font-size: 0.75rem; color: #94a3b8; margin: 0; }

.form-actions { margin-top: 32px; display: flex; justify-content: flex-end; }
.btn-save {
  background: #2563eb; color: white; padding: 12px 32px; border: none;
  border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s;
}
.btn-save:hover { background: #1d4ed8; }
.btn-save:disabled { background: #94a3b8; cursor: not-allowed; }

.state-msg { text-align: center; padding: 40px; color: #64748b; }
.state-msg.error { color: #ef4444; }

.switch-label { display: flex; align-items: center; gap: 12px; cursor: pointer; }
</style>
