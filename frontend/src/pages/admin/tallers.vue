<template>
  <div class="page">
    <div class="header-actions">
      <h2>Catàleg de Tallers</h2>
      <NuxtLink to="/admin/tallers/FormTallers">
        <button class="btn-primary">Crear Taller</button>
      </NuxtLink>
    </div>

    <div v-if="pending" class="loading">Carregant tallers...</div>
    <div v-else-if="error" class="error">Error carregant els tallers: {{ error.message }}</div>
    
    <div v-else class="content-container">
      <div v-if="tallers && tallers.length > 0" class="tallers-grid">
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
              <button class="btn-icon" title="Editar">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>

              <button class="btn-icon btn-delete" title="Eliminar" @click="deleteTaller(taller.id)">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="no-data">No hi ha tallers disponibles actualment.</p>
    </div>
  </div>
</template>

<script setup>
const header = useHeaderStore()
header.setHeaderAdmin()

// Fem la petició al backend per obtenir els tallers (només des del client per evitar errors de Docker SSR)
const token = useCookie('authToken');
const { data: tallers, pending, error, refresh } = await useFetch('http://localhost:1700/api/admin/tallers', {
  server: false,
  headers: {
    Authorization: token.value ? `Bearer ${token.value}` : ''
  }
})

const deleteTaller = async (id) => {
  try {
    await $fetch(`http://localhost:1700/api/admin/tallers/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: token.value ? `Bearer ${token.value}` : ''
      }
    });
    refresh();
  } catch (error) {
    console.error('Error eliminant taller:', error);
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

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
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

.loading, .error, .no-data {
  text-align: center;
  padding: 60px 20px;
  font-weight: 500;
}

.loading { color: #3b82f6; }
.error { color: #ef4444; }
.no-data { color: #64748b; }
</style>
