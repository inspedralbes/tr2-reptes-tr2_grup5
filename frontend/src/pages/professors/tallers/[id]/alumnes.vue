<template>
  <div class="page">
    <div class="header-actions">
      <!-- 1. Capçalera de la pàgina -->
      <h2>Gestió de Llista - {{ workshopTitle }}</h2>
      <div class="actions">
        <button class="btn-primary" @click="handleOpenModal" :disabled="!tallerDada">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
          Afegir Alumnes
        </button>
        <button class="btn-secondary" @click="router.back()">Tornar</button>
      </div>
    </div>

    <!-- 2. Estats de càrrega i error -->
    <div v-if="isPending === true" class="loading">Carregant dades...</div>
    <div v-else-if="isError === true" class="error">Error: {{ errorMsg }}</div>

    <div v-else class="content-container">
      <div class="info-banner">
        <p>Com a docent assignat, pots afegir alumnes a la llista. Aquesta llista serà visible per al professor referent per passar llista.</p>
      </div>

      <!-- 3. Llistat d'alumnes ja registrats -->
      <div v-if="assistenciaList.length > 0" class="students-list">
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
            <tr v-for="student in assistenciaList" :key="student.id">
              <td>{{ student.nom }}</td>
              <td>{{ student.cognoms }}</td>
              <td>{{ student.email }}</td>
              <td>
                <button class="btn-delete" @click="handleDeleteStudent(student.id)" title="Eliminar de la llista">
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

    <!-- 4. MODAL PER AFEGIR ALUMNES -->
    <div v-if="showModal === true" class="modal-overlay">
      <div class="modal-content">
        <h3>Afegir Alumnes ({{ workshopCapacity }} places totals)</h3>
        <form @submit.prevent="handleSubmitAssistencia">
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
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="handleCloseModal">Cancel·lar</button>
            <button type="submit" class="btn-primary" :disabled="submitting === true">
              {{ submitButtonText }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
// ======================================
// Importacions i Dependències
// ======================================

// 1. Serveis de rutes de Nuxt
const route = useRoute();
const router = useRouter();

// 2. ID del detall del taller des dels paràmetres de la URL
const detallIdUrl = route.params.id;

// ======================================
// Estat Reactiu del Component
// ======================================

// 1. Variables de control de la interfície
const tokenCookie = useCookie('authToken');
const tokenRef = tokenCookie.value;

const showModal = ref(false);
const submitting = ref(false);
const studentsForm = ref([]);

// 2. Comunicació amb l'API (sense desestructuració)
const headersAPI = {};
if (tokenRef) {
  headersAPI.Authorization = 'Bearer ' + tokenRef;
}

const resultatTallers = await useFetch('/api/professor/tallers', {
  headers: headersAPI
});

const resultatAssistencia = await useFetch('/api/professor/tallers/' + detallIdUrl + '/alumnes', {
  headers: headersAPI
});

// ======================================
// Propietats Computades (Tractament de dades)
// ======================================

// 1. Llista d'assistència actual (Bucle for si calgués processar)
const assistenciaList = computed(function () {
  let llista = [];
  if (resultatAssistencia.data) {
    if (resultatAssistencia.data.value) {
      llista = resultatAssistencia.data.value;
    }
  }
  return llista;
});

// 2. Detall del taller seleccionat (Cerca manual amb bucle)
const tallerDada = computed(function () {
  let objecteTallers = null;
  if (resultatTallers.data) {
    if (resultatTallers.data.value) {
      objecteTallers = resultatTallers.data.value;
    }
  }
  
  if (!objecteTallers) { return null; }
  
  let trobat = null;
  for (let i = 0; i < objecteTallers.length; i++) {
    const t = objecteTallers[i];
    if (String(t.detall_id) === String(detallIdUrl)) {
      trobat = t;
      break;
    }
  }
  return trobat;
});

// 3. Estats de càrrega i error per a la interfície
const isPending = computed(function () {
  let p = false;
  if (resultatAssistencia.pending) {
    if (resultatAssistencia.pending.value === true) { p = true; }
  }
  return p;
});

const isError = computed(function () {
  let e = false;
  if (resultatAssistencia.error) {
    if (resultatAssistencia.error.value) { e = true; }
  }
  return e;
});

const errorMsg = computed(function () {
  let text = '';
  if (resultatAssistencia.error) {
    if (resultatAssistencia.error.value) {
      if (resultatAssistencia.error.value.message) {
        text = resultatAssistencia.error.value.message;
      }
    }
  }
  return text;
});

// 4. Formateig visual per al Header
const workshopTitle = computed(function () {
  let titol = '';
  const td = tallerDada.value;
  if (td) {
    if (td.titol) { titol = td.titol; }
  }
  return titol;
});

const workshopCapacity = computed(function () {
  let num = 0;
  const td = tallerDada.value;
  if (td) {
    if (td.num_participants) { num = td.num_participants; }
  }
  return num;
});

const submitButtonText = computed(function () {
  let t = 'Enviar Llista';
  if (submitting.value === true) {
    t = 'Enviant...';
  }
  return t;
});

// ======================================
// Declaracions de funcions (Lògica d'accions)
// ======================================

// A) --- Gestió del Modal ---

function handleOpenModal() {
  const tallerObj = tallerDada.value;
  if (!tallerObj) { return; }

  const totalPlaces = tallerObj.num_participants || 0;
  const numAlumnesActuals = assistenciaList.value.length;
  const placesRestants = totalPlaces - numAlumnesActuals;

  if (placesRestants <= 0) {
    const swalW = useSwal();
    swalW.fire({ title: 'Atenció', text: 'La llista està plena.', icon: 'warning' });
    return;
  }

  // Creem tantes files com places restants hi hagi
  const novaLlistaForm = [];
  for (let k = 0; k < placesRestants; k++) {
    const objecteBuit = {
      nom: '',
      cognoms: '',
      email: '',
      ha_assistit: true
    };
    novaLlistaForm.push(objecteBuit);
  }
  studentsForm.value = novaLlistaForm;
  showModal.value = true;
}

function handleCloseModal() {
  showModal.value = false;
}

// B) --- Accions de l'API (Guardar i Eliminar) ---

async function handleDeleteStudent(idStudent) {
  const swalAsk = useSwal();
  const resConfirm = await swalAsk.fire({ 
    title: 'Confirmar', 
    text: 'Segur que vols eliminar aquest alumne de la llista?', 
    icon: 'question', 
    showCancelButton: true, 
    confirmButtonText: 'Sí' 
  });
  
  if (resConfirm.isConfirmed === false) {
    return;
  }

  try {
    const opcionsCapçaleraDel = {};
    if (tokenRef) {
      opcionsCapçaleraDel.Authorization = 'Bearer ' + tokenRef;
    }

    await $fetch('/api/professor/tallers/' + detallIdUrl + '/alumnes/' + idStudent, {
      method: 'DELETE',
      headers: opcionsCapçaleraDel
    });
    
    // Refresquem les dades de l'API
    if (resultatAssistencia.refresh) {
      await resultatAssistencia.refresh();
    }
  } catch (errDel) {
    console.error('Error eliminant alumne:', errDel);
    let msgE = 'Error desconegut';
    if (errDel.message) { msgE = errDel.message; }
    swalAsk.fire({ title: 'Error', text: 'No s\'ha pogut eliminar l\'alumne: ' + msgE, icon: 'error' });
  }
}

async function handleSubmitAssistencia() {
  submitting.value = true;
  try {
    const opcionsCapçaleraPost = {};
    if (tokenRef) {
      opcionsCapçaleraPost.Authorization = 'Bearer ' + tokenRef;
    }

    await $fetch('/api/professor/tallers/' + detallIdUrl + '/alumnes', {
      method: 'POST',
      headers: opcionsCapçaleraPost,
      body: {
        alumnes: studentsForm.value
      }
    });

    if (resultatAssistencia.refresh) {
      await resultatAssistencia.refresh();
    }
    
    handleCloseModal();
    const swalSuccess = useSwal();
    swalSuccess.fire({ title: 'Fet', text: 'Llista enviada correctament!', icon: 'success' });
    
  } catch (errPost) {
    console.error('Error enviant llista d\'alumnes:', errPost);
    let msgP = 'Error desconegut';
    if (errPost.data) {
      if (errPost.data.message) { msgP = errPost.data.message; }
    } else if (errPost.message) {
      msgP = errPost.message;
    }
    const swalErrorP = useSwal();
    swalErrorP.fire({ title: 'Error', text: 'Error enviant la llista: ' + msgP, icon: 'error' });
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
