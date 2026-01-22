<template>
  <div class="page">
    <div class="header-actions">
      <h2>Assistència - Els meus Tallers</h2>
    </div>

    <!-- LOADING / ERROR -->
    <div v-if="pending" class="loading">Carregant tallers...</div>
    <div v-else-if="error" class="error">Error: {{ error.message }}</div>

    <!-- MAIN CONTENT -->
    <div v-else class="content-container">
      
      <!-- LLISTA DE TALLERS (MODE SELECCIÓ) -->
      <div v-if="!selectedTaller" class="tallers-grid">
        <div v-if="tallers && tallers.length > 0">
           <!-- ÚS D'ESTIL DE TARGETES ORIGINAL -->
           <div v-for="taller in tallers" :key="taller.id" class="taller-card">
            <div class="card-header">
              <div class="modality-badge" :class="'mod-' + taller.modalitat">
                Projecte {{ taller.modalitat }}
              </div>
              <div class="status-indicator" :title="taller.actiu ? 'Actiu' : 'Arxivat'">
                <span :class="taller.actiu ? 'dot active' : 'dot archived'"></span>
                {{ taller.actiu ? 'Actiu' : 'Arxivat' }}
              </div>
            </div>
            
            <div class="card-content">
              <h3 class="taller-title">{{ taller.titol }}</h3>
              <p class="description">{{ taller.descripcio || 'Sense descripció disponible.' }}</p>
              
              <div class="detail-row">
                <span class="label">Sector:</span>
                <span class="value">{{ taller.sector }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Places:</span>
                <span class="value">{{ taller.places_maximes }} participants</span>
              </div>
              <div class="detail-row" v-if="taller.trimestres_disponibles">
                <span class="label">Trimestres:</span>
                <span class="value">{{ taller.trimestres_disponibles }}</span>
              </div>
            </div>
            
            <div class="card-footer">
              <span class="taller-id">#{{ taller.id }}</span>
              <div class="actions">
                <button class="btn-icon" title="Llista d'alumnes" @click="selectTaller(taller)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-data">No tens tallers assignats actualment.</div>
      </div>

      <!-- DETALL TALLER SELECCIONAT (LLISTA ALUMNES) -->
      <div v-else class="taller-detail">
        <div class="detail-header">
           <button class="btn-back" @click="selectedTaller = null">
             &larr; Tornar
           </button>
           <h3>{{ selectedTaller.titol }}</h3>
           <button class="btn-primary" @click="openModal">
             Afegir Alumnes
           </button>
        </div>

        <div v-if="loadingAssistencia" class="loading">Carregant assistència...</div>
        <div v-else>
            <div v-if="assistenciaList && assistenciaList.length > 0" class="students-list">
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
                  <tr v-for="student in assistenciaList" :key="student.id">
                    <td>{{ student.nom }}</td>
                    <td>{{ student.cognoms }}</td>
                    <td>{{ student.email }}</td>
                    <td>
                      <label class="toggle-switch">
                        <input 
                          type="checkbox" 
                          :checked="!!student.ha_assistit" 
                          @change="toggleAssistencia(student, $event.target.checked)"
                        />
                        <span class="slider"></span>
                      </label>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="no-data-small">
              <p>No hi ha alumnes registrats per aquest taller.</p>
            </div>
        </div>
      </div>

    </div>

    <!-- MODAL AFEGIR ALUMNES -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Afegir Alumnes ({{ studentsForm.length }} places restants)</h3>
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
const token = useCookie('authToken');

// 1. CARREGAR TALLERS
const { data: tallers, pending, error } = await useFetch('http://localhost:1700/api/professors/tallers', {
  headers: { Authorization: `Bearer ${token.value}` },
  server: false
});

// ESTAT
const selectedTaller = ref(null);
const assistenciaList = ref([]);
const loadingAssistencia = ref(false);

const showModal = ref(false);
const submitting = ref(false);
const studentsForm = ref([]);

// ACCIONS
const selectTaller = async (taller) => {
  selectedTaller.value = taller;
  await loadAssistencia(taller.detall_id);
};

const loadAssistencia = async (detallId) => {
  loadingAssistencia.value = true;
  try {
     const data = await $fetch(`http://localhost:1700/api/professors/assistencia/${detallId}`, {
        headers: { Authorization: `Bearer ${token.value}` }
     });
     assistenciaList.value = data;
  } catch (err) {
     console.error("Error carregant assistència", err);
  } finally {
     loadingAssistencia.value = false;
  }
};

const toggleAssistencia = async (student, isChecked) => {
  try {
    // Optimistic update (UI first)
    student.ha_assistit = isChecked ? 1 : 0;
    
    await $fetch(`http://localhost:1700/api/professors/assistencia/${student.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { ha_assistit: isChecked }
    });
    
    console.log(`Assistència de ${student.nom} actualitzada a: ${isChecked}`);
  } catch (err) {
    console.error("Error actualitzant assistència", err);
    // Revert logic could be added here
    student.ha_assistit = !isChecked ? 1 : 0;
    alert("Error actualitzant l'estat.");
  }
}

const openModal = () => {
  if (!selectedTaller.value) return;
  
  const totalSlots = selectedTaller.value.num_participants || 0;
  const currentCount = assistenciaList.value.length;
  const remainingSlots = totalSlots - currentCount;

  if (remainingSlots <= 0) {
    alert("Ja has assolit el nombre màxim de participants assignats.");
    return;
  }

  // Prepara el formulari només amb els forats que queden
  studentsForm.value = Array.from({ length: remainingSlots }, () => ({
    nom: '',
    cognoms: '',
    email: '',
    ha_assistit: true // Default (tot i que ja no es veu, s'envia igual)
  }));
  showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
};

const submitAssistencia = async () => {
  if (!selectedTaller.value) return;
  submitting.value = true;
  try {
    await $fetch('http://localhost:1700/api/professors/assistencia', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: {
        peticio_detall_id: selectedTaller.value.detall_id,
        alumnes: studentsForm.value
      }
    });
    
    await loadAssistencia(selectedTaller.value.detall_id);
    closeModal();
    // alert('Alumnes guardats correctament!'); // Opcional, millor feedback visual
  } catch (err) {
    console.error(err);
    alert('Error guardant assistència: ' + (err.data?.message || err.message));
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.page {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-actions h2 {
  font-size: 1.8rem;
  color: #1a202c;
  font-weight: 700;
  margin: 0;
}

/* Grids */
.tallers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

/* Card Styling */
.taller-card {
  background: white;
  border-radius: 16px;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.taller-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

.card-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
}

.modality-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.mod-A { background: #dbeafe; color: #1e40af; }
.mod-B { background: #fef3c7; color: #92400e; }
.mod-C { background: #dcfce7; color: #166534; }

.status-indicator {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 500;
  color: #64748b;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

.dot.active { background-color: #10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }
.dot.archived { background-color: #94a3b8; }

.card-content {
  padding: 24px 20px;
  flex-grow: 1;
}

.taller-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 12px 0;
  line-height: 1.2;
}

.description {
  font-size: 0.9rem;
  color: #4b5563;
  line-height: 1.5;
  margin-bottom: 20px;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  display: -webkit-box;
  overflow: hidden;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.85rem;
}

.detail-row .label {
  color: #64748b;
  font-weight: 500;
}

.detail-row .value {
  color: #1e293b;
  font-weight: 600;
}

.card-footer {
  padding: 16px 20px;
  background-color: #f8fafc;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.taller-id {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
}

.btn-icon {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background-color: #e2e8f0;
  color: #2563eb;
}

/* Detail View */
.taller-detail {
    animation: fadeIn 0.3s ease;
}
.detail-header { display: flex; align-items: center; margin-bottom: 20px; }
.detail-header h3 { flex-grow: 1; margin: 0; font-size: 1.5rem; text-align: left;}

/* Table */
table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #f1f5f9; }
th { background: #f8fafc; font-weight: 600; color: #475569; }
.badge-success { background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 99px; font-size: 0.8rem; font-weight: bold; }
.badge-danger { background: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 99px; font-size: 0.8rem; font-weight: bold; }

/* Toggle Switch Styles */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}
input:checked + .slider { background-color: #10b981; }
input:checked + .slider:before { transform: translateX(20px); }

/* Modal */
.modal-overlay { position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 50; }
.modal-content { background: white; padding: 30px; border-radius: 12px; width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; }
.students-form-grid { display: grid; gap: 15px; }
.student-row { display: grid; grid-template-columns: 30px 1fr 1fr 1.5fr auto; gap: 10px; align-items: center; background: #f8fafc; padding: 10px; border-radius: 8px; }
.row-number { font-weight: bold; color: #94a3b8; }
input { width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; }
.modal-actions { margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px; }
.btn-primary { background: #2b63b6; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
.btn-secondary { background: white; border: 1px solid #cbd5e1; color: #475569; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
.btn-back { background: transparent; border: none; color: #64748b; cursor: pointer; font-size: 1rem; margin-right: 15px; }

.loading, .error, .no-data { text-align: center; padding: 40px; color: #64748b; }
.error { color: #ef4444; }

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
