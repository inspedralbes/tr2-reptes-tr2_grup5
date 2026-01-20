<template>
  <div class="page">
    <div class="header-section">
      <div class="title-with-icon">
        <span class="header-icon">🎓</span>
        <div>
          <h2>Les meves Assignacions</h2>
          <p class="subtitle">Tallers confirmats i acceptats per al teu centre.</p>
        </div>
      </div>
    </div>

    <div v-if="pending" class="loading-state">
      <div class="spinner"></div>
      <span>Carregant les teves assignacions...</span>
    </div>

    <div v-else-if="error" class="error-state">
      <span class="error-status">⚠️</span>
      <p>No s'hi ha pogut conectar al servidor: {{ error.message }}</p>
      <button @click="refresh" class="btn-retry">Reintentar</button>
    </div>

    <div v-else class="content-wrapper">
      <div v-if="assignacions && assignacions.length > 0" class="assignments-grid">
        <div v-for="assignacio in assignacions" :key="assignacio.id" class="assignment-card">
          <div class="card-status-bar">
            {{ assignacio.trimestre }} Trimestre
          </div>
          
          <div class="card-body">
            <div class="taller-info">
              <div class="modalitat-indicator" :class="'mod-' + assignacio.modalitat.toLowerCase()">
                {{ assignacio.modalitat }}
              </div>
              <div class="taller-main">
                <h3>{{ assignacio.titol }}</h3>
                <p class="ubicacio">📍 {{ assignacio.ubicacio || 'Ubicació per confirmar' }}</p>
              </div>
            </div>

            <div class="assignment-details">
              <div class="detail-item">
                <span class="label">Participants</span>
                <span class="value">{{ assignacio.num_participants }} alumnes</span>
              </div>
              <div class="detail-item">
                <span class="label">Docent Referent</span>
                <span class="value">{{ assignacio.docent_nom || 'Pendent d\'assignar' }}</span>
              </div>
              <div class="detail-item" v-if="assignacio.docent_email">
                <span class="label">Email Docent</span>
                <span class="value small">{{ assignacio.docent_email }}</span>
              </div>
            </div>

            <div class="footer-actions">
              <NuxtLink :to="`/centres/assignacions/${assignacio.id}`" class="btn-details">
                Veure detalls i sessions ❯
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-illustration">📅</div>
        <h3>Encara no tens cap taller assignat</h3>
        <p>Quan l'administració accepti les teves sol·licituds, apareixeran aquí.</p>
        <NuxtLink to="/peticions" class="btn-primary">Anar a Sol·licituds</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const header = useHeaderStore()
header.setHeaderCentres()

const { data: assignacions, pending, error, refresh } = await useFetch('http://localhost:1700/api/centre/assignacions', {
  server: false,
  headers: {
    Authorization: typeof localStorage !== 'undefined' ? `Bearer ${localStorage.getItem('authToken')}` : ''
  }
})
</script>

<style scoped>
.page { 
  padding: 40px; 
  background: #f8fafc; 
  min-height: 100vh; 
  font-family: 'Inter', sans-serif;
}

.header-section { margin-bottom: 40px; }
.title-with-icon { display: flex; align-items: center; gap: 20px; }
.header-icon { font-size: 2.5em; background: white; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }

h2 { color: #0f172a; font-weight: 800; font-size: 2em; margin: 0; }
.subtitle { color: #64748b; font-size: 1.1em; margin-top: 4px; }

.content-wrapper { max-width: 1200px; margin: 0 auto; }

.assignments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.assignment-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.assignment-card:hover {
  transform: translateY(-5px);
}

.card-status-bar {
  background: #0f172a;
  color: white;
  padding: 8px 20px;
  font-size: 0.8em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-body { padding: 24px; }

.taller-info { 
  display: flex; 
  gap: 16px; 
  align-items: flex-start; 
  margin-bottom: 24px;
}

.modalitat-indicator {
  min-width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 1.25em;
  color: white;
}

.mod-a { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.mod-b { background: linear-gradient(135deg, #10b981, #059669); }
.mod-c { background: linear-gradient(135deg, #f59e0b, #d97706); }

.taller-main h3 { margin: 0; color: #1e293b; font-size: 1.25em; font-weight: 700; line-height: 1.2; }
.ubicacio { color: #64748b; font-size: 0.9em; margin-top: 4px; }

.assignment-details {
  background: #f1f5f9;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item { display: flex; justify-content: space-between; align-items: center; }
.label { color: #64748b; font-size: 0.8em; font-weight: 600; text-transform: uppercase; }
.value { color: #334155; font-size: 0.95em; font-weight: 700; }
.value.small { font-size: 0.85em; font-weight: 500; }

.footer-actions { border-top: 1px solid #f1f5f9; padding-top: 20px; }
.btn-details {
  display: block;
  text-align: center;
  background: transparent;
  color: #3b82f6;
  padding: 12px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9em;
  text-decoration: none;
  border: 2px solid #3b82f6;
  transition: all 0.2s;
}

.btn-details:hover {
  background: #3b82f6;
  color: white;
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 100px 20px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.empty-illustration { font-size: 5em; margin-bottom: 20px; }
.empty-state h3 { font-size: 1.5em; color: #1e293b; margin-bottom: 8px; }
.empty-state p { color: #64748b; margin-bottom: 24px; }

.btn-primary {
  display: inline-block;
  background: #3b82f6;
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
}

.btn-retry {
  background: #ef4444;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 16px;
}
</style>
