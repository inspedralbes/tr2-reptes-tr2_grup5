<template>
  <div class="page">
    <div class="header-actions">
      <div>
        <h2>Estadístiques de Logística</h2>
        <p class="subtitle">Anàlisi d'impacte i percentatges de participació real</p>
      </div>
    </div>

    <div v-if="pending" class="loading-state">
      <div class="spinner"></div>
      <p>Calculant dades d'activitat confirmada...</p>
    </div>

    <div v-else-if="stats && stats.data" class="dashboard-grid">
      
      <section class="stat-section">
        <div class="section-header">
          <span class="icon">🏫</span>
          <h3>Impacte en Centres</h3>
        </div>
        
        <div class="centres-container">
          <div class="kpi-column">
            <div class="kpi-card">
              <span class="label">Centres amb Activitat</span>
              <span class="value">{{ stats.data.centres.solicitants }}</span>
            </div>
            <div class="kpi-card">
              <span class="label">Total Alumnes</span>
              <span class="value">{{ stats.data.centres.totalAlumnes }}</span>
            </div>
            <div class="kpi-card">
              <span class="label">Mitjana Alumnes/Taller</span>
              <span class="value">{{ stats.data.centres.mediaAlumnes }}</span>
            </div>
          </div>

          <div class="priority-box">
            <h4>Rànquing de Centres i % d'Assistència Global</h4>
            <div class="ranking-list">
              <p v-if="!stats.data.centres.ranking?.length" class="empty-msg">Encara no hi ha tallers assignats.</p>
              
              <div v-for="(c, index) in stats.data.centres.ranking" :key="c.nom_centre" class="ranking-item">
                <div class="rank-badge">{{ index + 1 }}</div>
                <div class="rank-info">
                  <span class="rank-name">{{ c.nom_centre }}</span>
                  <span class="rank-sub">{{ c.total_alumnes }} alumnes participen ({{ c.percentatge_asistencia }}%)</span>
                  
                  <div class="progress-bar-container">
                    <div class="progress-bar-fill" :style="{ width: c.percentatge_asistencia + '%' }"></div>
                  </div>
                </div>
                <div class="rank-stat">
                  <strong>{{ c.total_tallers }}</strong>
                  <small>tallers</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="stat-section">
        <div class="section-header">
          <span class="icon">🛠️</span>
          <h3>Anàlisi de Tallers Realitzats</h3>
        </div>

        <div class="tallers-container">
          <div class="info-list">
            <h4>Tallers amb més execució i % d'impacte</h4>
            <div v-if="!stats.data.tallers.mesSolicitats?.length" class="empty-msg">Sense dades d'execució.</div>
            
            <div v-for="(t, index) in stats.data.tallers.mesSolicitats" :key="t.titol" class="list-row">
              <span class="row-index">#{{ index + 1 }}</span>
              <div class="row-content">
                <strong>{{ t.titol }}</strong>
                <div class="row-details">
                  <span>{{ t.sector }}</span>
                  <span class="impact-tag">{{ t.percentatge_impacte }}% impacte</span>
                </div>
              </div>
              <div class="row-val">{{ t.total_peticions }}</div>
            </div>
          </div>

          <div class="metrics-grid">
            <div class="m-card">
              <label>Sector Líder</label>
              <p>{{ stats.data.tallers.sectorTop }}</p>
            </div>
            <div class="m-card">
              <label>Modalitat més executada</label>
              <p>{{ stats.data.tallers.modalitatTop }}</p>
            </div>
            <div class="m-card">
              <label>Trimestre de més activitat</label>
              <p>{{ stats.data.tallers.trimestreTop }}º Trimestre</p>
            </div>
            <div class="m-card alert">
              <label>Estat del Sistema</label>
              <p>Dades Confirmades</p>
            </div>
          </div>
        </div>
      </section>

    </div>

    <div v-else class="error-state">
      <p>No s'han pogut carregar les estadístiques. Revisa la connexió amb el servidor.</p>
    </div>
  </div>
</template>

<script setup>
const token = useCookie('authToken');

const { data: stats, pending, error } = await useFetch('http://localhost:1700/api/admin/stats/dashboard', {
    headers: { Authorization: `Bearer ${token.value}` },
    initialCache: false 
});
</script>

<style scoped>
.page { padding: 30px; background: #f0f2f5; min-height: 100vh; font-family: 'Inter', system-ui, sans-serif; }
.header-actions { margin-bottom: 30px; }
.header-actions h2 { margin: 0; color: #1e293b; font-size: 1.8rem; }
.subtitle { color: #64748b; margin: 4px 0 0 0; }

.loading-state, .error-state { text-align: center; padding: 50px; color: #64748b; }
.spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3b82f6; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 0 auto 15px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.stat-section { background: white; padding: 25px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom: 30px; }
.section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 25px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; }
.section-header h3 { margin: 0; color: #334155; }

/* Barra de progrés per a Centres */
.progress-bar-container { background: #e2e8f0; height: 8px; border-radius: 4px; margin-top: 8px; width: 100%; overflow: hidden; }
.progress-bar-fill { background: #3b82f6; height: 100%; border-radius: 4px; transition: width 0.8s ease-out; }

/* Etiqueta d'impacte per a Tallers */
.row-details { display: flex; align-items: center; gap: 12px; margin-top: 4px; }
.impact-tag { background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }

/* Layouts */
.centres-container { display: grid; grid-template-columns: 300px 1fr; gap: 40px; }
.kpi-column { display: flex; flex-direction: column; gap: 15px; }
.kpi-card { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
.kpi-card .label { font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; }
.kpi-card .value { font-size: 1.8rem; font-weight: 800; color: #0f172a; display: block; margin-top: 5px; }

.priority-box h4 { font-size: 0.85rem; color: #64748b; text-transform: uppercase; margin-bottom: 20px; }
.ranking-list { display: flex; flex-direction: column; gap: 12px; }
.ranking-item { display: flex; align-items: center; padding: 15px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; }
.rank-badge { background: #3b82f6; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem; margin-right: 15px; flex-shrink: 0; }
.rank-info { flex-grow: 1; }
.rank-name { display: block; font-weight: 600; color: #1e293b; }
.rank-sub { font-size: 0.75rem; color: #94a3b8; }
.rank-stat { text-align: right; margin-left: 15px; }
.rank-stat strong { display: block; color: #3b82f6; font-size: 1.1rem; }
.rank-stat small { font-size: 0.65rem; text-transform: uppercase; color: #64748b; }

.tallers-container { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
.info-list h4 { font-size: 0.85rem; color: #64748b; text-transform: uppercase; margin-bottom: 20px; }
.list-row { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
.row-index { color: #cbd5e1; font-weight: bold; margin-right: 15px; width: 30px; }
.row-content { flex-grow: 1; }
.row-content strong { display: block; font-size: 0.95rem; }
.row-val { font-weight: 800; color: #3b82f6; font-size: 1.2rem; margin-left: 10px; }

.metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.m-card { background: #f8fafc; padding: 20px; border-radius: 12px; }
.m-card label { font-size: 0.7rem; color: #64748b; text-transform: uppercase; }
.m-card p { font-weight: 700; color: #1e293b; margin: 8px 0 0 0; }
.m-card.alert { border-left: 4px solid #10b981; }

@media (max-width: 1024px) { .centres-container, .tallers-container { grid-template-columns: 1fr; } }
</style>