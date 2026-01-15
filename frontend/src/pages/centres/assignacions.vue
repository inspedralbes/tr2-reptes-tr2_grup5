<template>
  <div class="assignacions-container">
    <header class="page-header">
      <h1>Els Meus Tallers Assignats</h1>
      <p class="subtitle">Consulta els tallers que han estat confirmats i assignats al teu centre.</p>
    </header>

    <div v-if="loading" class="loading">
      <div class="spinner"></div> Carregant assignacions...
    </div>

    <div v-else-if="assignacions.length === 0" class="empty-state">
      <div class="empty-icon">📅</div>
      <h3>Encara no tens cap taller assignat.</h3>
      <p>Les assignacions apareixeran aquí un cop la teva sol·licitud hagi estat acceptada i programada.</p>
    </div>

    <div v-else class="assignacions-grid">
      <div v-for="assignacio in assignacions" :key="assignacio.assignacio_id" class="assignacio-card">
        <div class="card-status status-confirmed">Confirmada</div>
        <div class="card-header">
          <h3>{{ assignacio.taller_titol }}</h3>
          <span class="academic-year">{{ assignacio.curs_academic }}</span>
        </div>
        
        <div class="card-body">
          <div class="info-item">
            <span class="label">📅 Data Inici</span>
            <span class="value">{{ formatDate(assignacio.data_inici) }}</span>
          </div>
          <div class="info-item">
            <span class="label">🏁 Data Fi</span>
            <span class="value">{{ formatDate(assignacio.data_fi) }}</span>
          </div>
          <div class="info-item">
            <span class="label">👥 Participants</span>
            <span class="value">{{ assignacio.num_places_assignades }} alumnes</span>
          </div>
        </div>

        <div class="card-footer">
          <button class="btn-details">Veure Detalls</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const assignacions = ref([]);
const loading = ref(true);

const fetchData = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const headers = { 'Authorization': `Bearer ${token}` };
    
    const response = await fetch('http://localhost:1700/api/centre/assignacions', { headers });
    if (!response.ok) throw new Error('Error al carregar assignacions');
    
    const data = await response.json();
    assignacions.value = data;
  } catch (error) {
    console.error('Error carregant assignacions:', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'Pendent de definir';
  const date = new Date(dateString);
  return date.toLocaleDateString('ca-ES', { day: '2-digit', month: 'long', year: 'numeric' });
};

onMounted(fetchData);
</script>

<style scoped>
.assignacions-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 1rem;
  font-family: 'Inter', sans-serif;
}

.page-header {
  margin-bottom: 3rem;
  text-align: center;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #64748b;
  font-size: 1.1rem;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  color: #64748b;
  min-height: 200px;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.assignacions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 2rem;
}

.assignacio-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  border: 1px solid #f1f5f9;
}

.assignacio-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.card-status {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-confirmed {
  background-color: #dcfce7;
  color: #166534;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(to right, #ffffff, #f8fafc);
}

.card-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.academic-year {
  font-size: 0.875rem;
  color: #64748b;
  background: #e2e8f0;
  padding: 2px 8px;
  border-radius: 4px;
}

.card-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item .label {
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
}

.info-item .value {
  color: #334155;
  font-weight: 600;
}

.card-footer {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
}

.btn-details {
  width: 100%;
  padding: 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-details:hover {
  background: #2563eb;
}

@media (max-width: 640px) {
  .assignacions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
