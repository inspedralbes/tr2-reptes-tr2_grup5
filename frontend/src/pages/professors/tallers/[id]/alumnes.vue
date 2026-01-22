<template>
  <div class="page">
    <div class="header-actions">
      <h2>Assistència - {{ taller?.titol }}</h2>
      <div class="actions">
        <button class="btn-primary" @click="openModal" :disabled="!taller">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
          Afegir alumnes
        </button>
        <button class="btn-secondary" @click="router.back()">Tornar</button>
      </div>
    </div>

    <div v-if="pending" class="loading">Carregant dades...</div>
    <div v-else-if="error" class="error">Error: {{ error.message }}</div>

    <div v-else class="content-container">
      <!-- Llista d'alumnes ja registrats -->
      <div v-if="assistencia && assistencia.length > 0" class="students-list">
        <h3>Alumnes Registrats</h3>
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Cognoms</th>
              <th>Email</th>
              <th>Assistència</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in assistencia" :key="student.id">
              <td>{{ student.nom }}</td>
              <td>{{ student.cognoms }}</td>
              <td>{{ student.email }}</td>
              <td>
                <span :class="student.ha_assistit ? 'badge-success' : 'badge-danger'">
                  {{ student.ha_assistit ? 'Sí' : 'No' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="no-data">
        <p>No hi ha alumnes registrats encara.</p>
      </div>
    </div>

    <!-- MODAL -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Afegir Alumnes ({{ taller?.num_participants }} places)</h3>
        <form @submit.prevent="submitAssistencia">
          <div class="students-form-grid">
            <div v-for="(student, index) in studentsForm" :key="index" class="student-row">
              <span class="row-number">#{{ index + 1 }}</span>
              <div class="form-group">
                <input v-model="student.nom" placeholder="Nom" required />
              </div>
              <div class="form-group">
                <input v-model="student.cognoms" placeholder="Cognoms" required />
              </div>
              <div class="form-group">
                <input v-model="student.email" type="email" placeholder="Email" required />
              </div>
              <div class="form-group checkbox">
                <label>
                  <input type="checkbox" v-model="student.ha_assistit"> Assistència
                </label>
              </div>
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeModal">Cancel·lar</button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? 'Guardant...' : 'Guardar Tot' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
const route = useRoute();
const router = useRouter();
const detalleId = route.params.id; 

console.log("Detalle ID:", detalleId);

const token = useCookie('authToken');
const showModal = ref(false);
const submitting = ref(false);
const studentsForm = ref([]);

// 1. Fetch taller info (per saber num_participants) + assistencia actual
// Necessitem un endpoint que ens doni info del taller concret o reutilitzar getTallers i filtrar
// Per simplificar, farem servir el getTallers i buscarem el que coincideixi amb l'ID
const { data: tallers } = await useFetch('http://localhost:1700/api/professors/tallers', {
  headers: { Authorization: `Bearer ${token.value}` }
});

const taller = computed(() => {
  if (!tallers.value) return null;
  return tallers.value.find(t => t.detall_id == detalleId);
});

// 2. Fetch assistencia existent
const { data: assistencia, refresh: refreshAssistencia, pending, error } = await useFetch(`http://localhost:1700/api/professors/assistencia/${detalleId}`, {
  headers: { Authorization: `Bearer ${token.value}` }
});

const openModal = () => {
  if (!taller.value) return;
  
  // Inicialitzar el formulari amb tantes files com participants hi hagi
  const count = taller.value.num_participants || 0;
  studentsForm.value = Array.from({ length: count }, () => ({
    nom: '',
    cognoms: '',
    email: '',
    ha_assistit: true
  }));
  
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const submitAssistencia = async () => {
  submitting.value = true;
  try {
    await $fetch('http://localhost:1700/api/professors/assistencia', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: {
        peticio_detall_id: detalleId,
        alumnes: studentsForm.value
      }
    });
    
    await refreshAssistencia();
    closeModal();
    alert('Alumnes guardats correctament!');
  } catch (err) {
    console.error(err);
    alert('Error guardant assistència');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.page { padding: 30px; max-width: 1200px; margin: 0 auto; }
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.actions { display: flex; gap: 10px; }

h2 { font-size: 1.8rem; color: #1a202c; }
h3 { color: #1e293b; margin-bottom: 1rem; }

.btn-primary { 
  background: #2b63b6; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 500;
}
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-secondary { background: white; border: 1px solid #cbd5e1; color: #475569; padding: 10px 20px; border-radius: 8px; cursor: pointer; }

/* Table styles */
table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #e2e8f0; }
th { background: #f8fafc; font-weight: 600; color: #475569; }

.badge-success { background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 9999px; font-size: 0.8rem; font-weight: 600; }
.badge-danger { background: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 9999px; font-size: 0.8rem; font-weight: 600; }

/* Modal styles */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;
}
.modal-content {
  background: white; padding: 30px; border-radius: 12px; width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto;
}

.students-form-grid { display: grid; gap: 15px; margin-bottom: 20px; }
.student-row { display: grid; grid-template-columns: 40px 1fr 1fr 1.5fr auto; gap: 10px; align-items: center; padding: 10px; background: #f8fafc; border-radius: 8px; }
.row-number { font-weight: bold; color: #94a3b8; }

input { width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; }
.checkbox { display: flex; align-items: center; }

.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
</style>
