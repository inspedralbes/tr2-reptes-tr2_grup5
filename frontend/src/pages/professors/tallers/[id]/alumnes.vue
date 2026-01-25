<template>
  <div class="page">
    <div class="header-actions">
      <h2>Gestió de Llista - {{ titolTaller }}</h2>
      <div class="actions">
        <button class="btn-primary" @click="openModal" :disabled="!taller">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
          Afegir Alumnes
        </button>
        <button class="btn-secondary" @click="router.back()">Tornar</button>
      </div>
    </div>

    <div v-if="pending" class="loading">Carregant dades...</div>
    <div v-else-if="error" class="error">Error: {{ error.message }}</div>

    <div v-else class="content-container">
      <div class="info-banner">
        <p>Com a docent assignat, pots afegir alumnes a la llista. Aquesta llista serà visible per al professor referent per passar llista.</p>
      </div>

      <!-- Llista d'alumnes ja registrats -->
      <div v-if="assistencia && assistencia.length > 0" class="students-list">
        <h3>Alumnes a la Llista</h3>
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Cognoms</th>
              <th>Email</th>
              <th>Accions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in assistencia" :key="student.id">
              <td>{{ student.nom }}</td>
              <td>{{ student.cognoms }}</td>
              <td>{{ student.email }}</td>
              <td>
                <button class="btn-delete" @click="deleteStudent(student.id)" title="Eliminar de la llista">
                   🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="no-data">
        <p>No hi ha alumnes a la llista. Afegeix-ne perquè el referent pugui passar assistència.</p>
      </div>
    </div>

    <!-- MODAL -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Afegir Alumnes ({{ placesTaller }} places totals)</h3>
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
              <!-- Eliminat checkbox d'assistència inicial -->
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeModal">Cancel·lar</button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ textBotoEnviar }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
// ======================================
// Importacions i Composables (Rutes, Cookies, Stores)
// ======================================
const route = useRoute();
const router = useRouter();
const detalleId = route.params.id;

// ======================================
// Estat Reactiu i Refs (Variables i Formularis)
// ======================================
const token = useCookie('authToken');
const showModal = ref(false);
const submitting = ref(false);
const studentsForm = ref([]);

const resTallers = await useFetch('/api/professor/tallers', {
  headers: { Authorization: 'Bearer ' + token.value }
});

const resAssistencia = await useFetch('/api/professor/tallers/' + detalleId + '/alumnes', {
  headers: { Authorization: 'Bearer ' + token.value }
});

const assistencia = computed(function () {
  let d = resAssistencia.data;
  if (d && d.value) return d.value;
  return [];
});

const taller = computed(function () {
  let d = resTallers.data;
  if (!d || !d.value) return null;
  let arr = d.value;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].detall_id == detalleId) {
      return arr[i];
    }
  }
  return null;
});

const pending = resAssistencia.pending;
const error = resAssistencia.error;
const refreshAssistencia = resAssistencia.refresh;

const titolTaller = computed(function () {
  if (taller.value && taller.value.titol) {
    return taller.value.titol;
  }
  return '';
});

const placesTaller = computed(function () {
  if (taller.value && taller.value.num_participants) {
    return taller.value.num_participants;
  }
  return 0;
});

const textBotoEnviar = computed(function () {
  if (submitting.value) {
    return 'Enviant...';
  } else {
    return 'Enviar Llista';
  }
});

// ======================================
// Lògica i Funcions (Handlers i Lifecycle)
// ======================================

function openModal() {
  if (!taller.value) return;

  let total = 0;
  if (taller.value.num_participants) {
    total = taller.value.num_participants;
  }
  let current = 0;
  if (assistencia.value && assistencia.value.length) {
    current = assistencia.value.length;
  }
  let remaining = total - current;

  if (remaining <= 0) {
    useSwal().fire({ title: 'Atenció', text: 'La llista està plena.', icon: 'warning' });
    return;
  }

  let nova = [];
  for (let i = 0; i < remaining; i++) {
    let ob = {};
    ob.nom = '';
    ob.cognoms = '';
    ob.email = '';
    ob.ha_assistit = true;
    nova.push(ob);
  }
  studentsForm.value = nova;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

async function deleteStudent(studentId) {
  const confirmResult = await useSwal().fire({ title: 'Confirmar', text: 'Segur que vols eliminar aquest alumne de la llista?', icon: 'question', showCancelButton: true, confirmButtonText: 'Sí' });
  if (!confirmResult.isConfirmed) return;
  try {
    await $fetch('/api/professor/tallers/' + detalleId + '/alumnes/' + studentId, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token.value }
    });
    refreshAssistencia();
  } catch (e) {
    let msg = 'Error eliminant alumne: ';
    if (e && e.message) {
      msg = msg + e.message;
    }
    useSwal().fire({ title: 'Error', text: msg, icon: 'error' });
  }
}

async function submitAssistencia() {
  submitting.value = true;
  try {
    await $fetch('/api/professor/tallers/' + detalleId + '/alumnes', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token.value },
      body: {
        alumnes: studentsForm.value
      }
    });
    await refreshAssistencia();
    closeModal();
    useSwal().fire({ title: 'Fet', text: 'Llista enviada correctament!', icon: 'success' });
  } catch (err) {
    console.error('Error enviant llista:', err);
    let msg = 'Error enviant la llista: ';
    if (err && err.data && err.data.message) {
      msg = msg + err.data.message;
    } else if (err && err.message) {
      msg = msg + err.message;
    } else {
      msg = msg + 'Error desconegut';
    }
    useSwal().fire({ title: 'Error', text: msg, icon: 'error' });
  } finally {
    submitting.value = false;
  }
}
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

.info-banner {
    background-color: #ebf8ff;
    border-left: 4px solid #4299e1;
    color: #2b6cb0;
    padding: 12px 16px;
    margin-bottom: 20px;
    border-radius: 4px;
    font-size: 0.95rem;
}

.btn-delete {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 5px;
    transition: transform 0.2s;
}
.btn-delete:hover {
    transform: scale(1.1);
}
</style>
