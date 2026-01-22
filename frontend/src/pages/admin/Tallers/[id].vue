<template>
  <div class="edit-page">
    <div class="header">
      <NuxtLink to="/admin/tallers" class="btn-back">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Tornar al catàleg
      </NuxtLink>
      <h2>Editar Taller #{{ route.params.id }}</h2>
    </div>

    <div v-if="pending" class="state-msg">Carregant dades del taller...</div>
    <div v-else-if="error" class="state-msg error">Error: No s'ha pogut trobar el taller.</div>

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
          {{ saving ? 'Guardant...' : 'Actualitzar Taller' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
const route = useRoute();
const router = useRouter();
const token = useCookie('authToken');
const saving = ref(false);

// IMPORTANTE: Extraemos el ID de los parámetros de la ruta (params)
const tallerId = route.params.id;

const sectors = [
  "Agroalimentari", "Manufacturer", "Energia i Aigua", "Construcció", 
  "Comerç i Turisme", "Transport", "Hoteleria", "Informació i Comunicació", 
  "Financer", "Immobiliari", "Professional"
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

// 1. Carregar dades inicials usando el ID de la URL
const { data: taller, pending, error } = await useFetch(`http://localhost:1700/api/admin/tallers/${tallerId}`, {
  headers: { Authorization: `Bearer ${token.value}` }
});

// Rellenar el formulario cuando los datos lleguen
watchEffect(() => {
  if (taller.value) {
    formData.value = { ...taller.value };
  }
});

// 2. Función para actualizar
const handleUpdate = async () => {
  saving.value = true;
  try {
    await $fetch(`http://localhost:1700/api/admin/tallers/${tallerId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.value}` },
      body: formData.value
    });
    alert('Taller actualitzat correctament!');
    router.push('/admin/tallers');
  } catch (err) {
    alert('Error al guardar: ' + err.message);
  } finally {
    saving.value = false;
  }
};
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
input:focus, select:focus, textarea:focus { outline: none; border-color: #3b82f6; }

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