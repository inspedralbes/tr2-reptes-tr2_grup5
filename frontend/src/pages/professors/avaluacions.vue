<template>
  <div class="page">
    <h2>Avaluacions de Tallers</h2>
    <p>Selecciona un taller per avaluar els alumnes.</p>

    <div v-if="loading">Carregant tallers...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-else class="content-wrapper">
      <!-- LLISTA DE TALLERS (LEFT) -->
      <div class="tallers-list">
        <ul v-if="assignedTallers.length > 0">
          <li 
            v-for="taller in assignedTallers" 
            :key="taller.id"
            @click="selectTaller(taller)"
            :class="{ active: selectedTaller && selectedTaller.id === taller.id }"
          >
            <div class="taller-info">
              <strong>{{ taller.titol }}</strong>
              <small>{{ taller.modalitat }}</small>
            </div>
            <span class="chevron">&rsaquo;</span>
          </li>
        </ul>
        <p v-else>No tens tallers assignats per avaluar.</p>
      </div>

      <!-- DETALL TALLER I ALUMNES (RIGHT) -->
      <div class="students-panel" v-if="selectedTaller">
        <h3>{{ selectedTaller.titol }} <small> - Llista d'Alumnes</small></h3>
        
        <div v-if="loadingStudents" class="loading-msg">Carregant alumnes...</div>
        <div v-else-if="students.length === 0" class="empty-msg">No hi ha alumnes en aquest taller.</div>
        
        <div v-else class="students-table-container">
           <table class="students-table">
             <thead>
               <tr>
                 <th>Nom i Cognoms</th>
                 <th>Email</th>
                 <th style="width: 150px; text-align: center;">Accions</th>
               </tr>
             </thead>
             <tbody>
               <tr v-for="student in students" :key="student.id">
                 <td><strong>{{ student.nom }} {{ student.cognoms }}</strong></td>
                 <td>{{ student.email }}</td>
                 <td style="text-align: center;">
                   <button class="btn-action" @click="openReviewModal(student)">
                     {{ student.avaluacio ? 'Editar Valoració' : 'Valorar' }}
                   </button>
                 </td>
               </tr>
             </tbody>
           </table>
        </div>
      </div>
      <div class="students-panel empty-selection" v-else>
          <p>Selecciona un taller per veure els alumnes.</p>
      </div>
    </div>

    <!-- MODAL -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3>Valoració: {{ currentStudent?.nom }} {{ currentStudent?.cognoms }}</h3>
        <textarea 
            v-model="reviewText" 
            placeholder="Escriu el comentari o valoració de l'alumne..."
            rows="6"
        ></textarea>
        <div class="modal-actions">
          <button class="btn-cancel" @click="closeModal">Cancel·lar</button>
          <button class="btn-save" @click="saveCurrentReview" :disabled="saving">
            {{ saving ? 'Guardant...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
const header = useHeaderStore()
header.setHeaderProfessors()
const token = useCookie('authToken');

const loading = ref(true);
const error = ref(null);
const allTallers = ref([]);
const selectedTaller = ref(null);
const students = ref([]);
const loadingStudents = ref(false);

// Modal state
const showModal = ref(false);
const currentStudent = ref(null);
const reviewText = ref('');
const saving = ref(false);

// 1. Fetch Tallers Assignats
const fetchTallers = async () => {
  loading.value = true;
  try {
    const data = await $fetch('/api/professor/tallers', {
      headers: { Authorization: `Bearer ${token.value}` }
    });
    allTallers.value = data;
  } catch (err) {
    console.error(err);
    error.value = "Error carregant tallers.";
  } finally {
    loading.value = false;
  }
};

const assignedTallers = computed(() => {
    return allTallers.value.filter(t => t.permissions && t.permissions.canManageList);
});

// 2. Select Taller & Fetch Alumnes
const selectTaller = async (taller) => {
    selectedTaller.value = taller;
    students.value = [];
    loadingStudents.value = true;

    try {
        const data = await $fetch(`/api/professor/tallers/${taller.detall_id}/alumnes`, {
           headers: { Authorization: `Bearer ${token.value}` } 
        });
        students.value = data; 
    } catch (err) {
        alert("Error carregant alumnes.");
    } finally {
        loadingStudents.value = false;
    }
}

// 3. Modal Logic
const openReviewModal = (student) => {
  currentStudent.value = student;
  reviewText.value = student.comentarios || student.avaluacio || '';
  showModal.value = true;
}

const closeModal = () => {
  showModal.value = false;
  currentStudent.value = null;
  reviewText.value = '';
}

// 4. Save Review
const saveCurrentReview = async () => {
    if (!currentStudent.value) return;
    
    saving.value = true;
    const student = currentStudent.value;
    const text = reviewText.value;

    try {
        const tallerId = selectedTaller.value.detall_id;
        await $fetch(`/api/professor/tallers/${tallerId}/alumnes/${student.id}/avaluacio`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token.value}` },
            body: { comentarios: text }
        });
        
        // Update local state
        student.comentarios = text;
        closeModal();

    } catch (err) {
        console.error(err);
        alert("Error guardant l'avaluació.");
    } finally {
        saving.value = false;
    }
}

onMounted(() => {
    fetchTallers();
});
</script>

<style scoped>
.page { padding: 30px; max-width: 1200px; margin: 0 auto; }
h2 { color: #1e293b; margin-bottom: 5px; }
.error { color: red; padding: 20px; }

.content-wrapper {
    display: flex;
    gap: 30px;
    margin-top: 30px;
    height: calc(100vh - 200px); 
}

/* LEFT LIST */
.tallers-list {
    width: 300px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow-y: auto;
    flex-shrink: 0;
}
.tallers-list ul { list-style: none; padding: 0; margin: 0; }
.tallers-list li {
    padding: 15px 20px;
    border-bottom: 1px solid #f1f5f9;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background 0.2s;
}
.tallers-list li:hover { background: #f8fafc; }
.tallers-list li.active { background: #eff6ff; border-left: 4px solid #3b82f6; }
.taller-info strong { display: block; color: #334155; }
.taller-info small { color: #64748b; }
.chevron { color: #cbd5e1; font-size: 1.2rem; }

/* RIGHT PANEL */
.students-panel {
    flex-grow: 1;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 0; /* Remove padding to flush table */
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}
.students-panel h3 { margin: 0; padding: 20px 25px; border-bottom: 1px solid #e2e8f0; }
.empty-selection { padding: 25px; align-items: center; justify-content: center; color: #94a3b8; font-size: 1.1rem; }
.loading-msg, .empty-msg { padding: 30px; text-align: center; color: #64748b; }

/* TABLE STYLES */
.students-table { width: 100%; border-collapse: collapse; }
.students-table th, .students-table td { padding: 15px 25px; text-align: left; border-bottom: 1px solid #f1f5f9; }
.students-table th { background: #f8fafc; color: #64748b; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; position: sticky; top: 0; }
.students-table tr:hover td { background: #fcfcfc; }

.btn-action {
    background: white; border: 1px solid #cbd5e1; color: #475569;
    padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 500;
    transition: all 0.2s;
}
.btn-action:hover { border-color: #3b82f6; color: #2563eb; background: #eff6ff; }

/* MODAL STYLES */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}
.modal-content {
  background: white; padding: 30px; border-radius: 12px; width: 500px; max-width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
}
.modal-content h3 { margin-top: 0; margin-bottom: 20px; color: #1e293b; font-size: 1.4rem; }
.modal-content textarea {
  width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px;
  margin-bottom: 20px; font-family: inherit; font-size: 1rem; color: #334155;
  box-sizing: border-box;
}
.modal-content textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }

.modal-actions { display: flex; justify-content: flex-end; gap: 12px; }
.btn-cancel { background: white; border: 1px solid #cbd5e1; color: #475569; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 500; }
.btn-save { background: #3b82f6; border: none; color: white; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-save:hover { background: #2563eb; }
.btn-save:disabled { background: #94a3b8; cursor: not-allowed; }
</style>
