<template>
  <div class="page">
    <div class="detail-header">
       <button class="btn-back" @click="goBack">
         &larr; Tornar al Panell
       </button>
       <h3>Control d'Assistència {{ tallerInfo ? '- ' + tallerInfo.titol : '' }}</h3>
    </div>

    <div v-if="loading" class="loading">Carregant dades...</div>
    <div v-else-if="error" class="error">Error: {{ error }}</div>
    
    <div v-else>
        <!-- Info Taller -->
        <div v-if="tallerInfo" class="taller-info-card">
            <p><strong>Ubicació:</strong> {{ tallerInfo.ubicacio }}</p>
            <p><strong>Horari:</strong> {{ tallerInfo.modalitat }} ({{ tallerInfo.places_maximes }} places)</p>
        </div>

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
</template>

<script setup>
const route = useRoute();
const router = useRouter();
const token = useCookie('authToken');
const detallId = route.params.id;

const loading = ref(true);
const error = ref(null);
const assistenciaList = ref([]);
const tallerInfo = ref(null);

const goBack = () => {
    router.push('/professors/tallers');
}

const loadData = async () => {
  loading.value = true;
  try {
     // 1. Carregar llista d'assistència
     const data = await $fetch(`/api/professors/assistencia/${detallId}`, {
        headers: { Authorization: `Bearer ${token.value}` }
     });
     assistenciaList.value = data;

     // 2. Carregar info bàsica del taller (Podem reutilitzar el endpoint de llista de tallers i filtrar, o fer call específica)
     // Per simplicitat i rapidesa, estem assumint que tenim info minima.
     // Idealment, tindríem un endpoint /api/professors/tallers/:id
     // Intentem treure el titol de la llista general si està carregada o fem fetch.
     // Farem un fetch a tallers i buscarem aquest ID. No és súper eficient però reutilitzem endpoints existents.
     const tallers = await $fetch('/api/professors/tallers', {
        headers: { Authorization: `Bearer ${token.value}` }
     });
     const found = tallers.find(t => t.detall_id == detallId);
     if (found) {
         tallerInfo.value = found;
     }

  } catch (err) {
     console.error("Error carregant dades", err);
     error.value = "No s'han pogut carregar les dades.";
  } finally {
     loading.value = false;
  }
};

const toggleAssistencia = async (student, isChecked) => {
  try {
    // Optimistic update
    student.ha_assistit = isChecked ? 1 : 0;
    
    await $fetch(`/api/professors/assistencia/${student.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { ha_assistit: isChecked }
    });
    
  } catch (err) {
    console.error("Error actualitzant assistència", err);
    student.ha_assistit = !isChecked ? 1 : 0; // Revert
    alert("Error actualitzant l'estat.");
  }
}

onMounted(() => {
    if (detallId) {
        loadData();
    } else {
        error.value = "ID de taller no especificat.";
        loading.value = false;
    }
});
</script>

<style scoped>
.page {
  padding: 30px;
  max-width: 1000px; /* Alumnes list view a bit narrower for focus */
  margin: 0 auto;
}

.detail-header { display: flex; align-items: center; margin-bottom: 30px; }
.detail-header h3 { flex-grow: 1; margin: 0; font-size: 1.6rem; color: #1a202c; }

.taller-info-card {
    background: #f8fafc;
    padding: 15px 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    border-left: 4px solid #3b82f6;
}
.taller-info-card p { margin: 5px 0; color: #4a5568; }

/* Table */
table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
th, td { padding: 16px 20px; text-align: left; border-bottom: 1px solid #e2e8f0; }
th { background: #f1f5f9; font-weight: 600; color: #475569; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.05em; }
tr:last-child td { border-bottom: none; }
tr:hover td { background-color: #f8fafc; }

/* Toggle Switch Styles */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
}
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #cbd5e1;
  transition: .4s;
  border-radius: 34px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
input:checked + .slider { background-color: #10b981; }
input:checked + .slider:before { transform: translateX(22px); }

.btn-back { 
    background: transparent; 
    border: 1px solid #e2e8f0; 
    color: #64748b; 
    cursor: pointer; 
    font-size: 0.95rem; 
    margin-right: 20px; 
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 600;
    transition: all 0.2s;
}
.btn-back:hover { background: #f1f5f9; color: #1e293b; border-color: #cbd5e1; }

.loading, .error, .no-data-small { text-align: center; padding: 40px; color: #64748b; }
.error { color: #ef4444; }
</style>
