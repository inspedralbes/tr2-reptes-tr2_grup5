<template>
  <div class="page">
    <div class="header-actions">
      <div>
        <h2>Estadístiques de Logística</h2>
        <p class="subtitle">Anàlisi d'impacte i participació (Total inscrits vs Assistència real)</p>
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
            
            <div class="kpi-card highlight">
              <span class="label">Total Alumnes Registrats</span>
              <span class="value">{{ stats.data.centres.totalAlumnes }}</span>
              <small>Total absolut a la base de dades</small>
            </div>

            <div class="kpi-card success-kpi">
              <span class="label">Assistència Real</span>
              <span class="value">{{ stats.data.centres.totalAlumnesConfirmats }}</span>
              <small>Alumnes han assistit</small>
            </div>
          </div>

          <div class="priority-box">
            <h4>Rànquing de Centres (Basat en Alumnes Inscrits)</h4>
            <div class="ranking-list">
              <p v-if="!stats.data.centres.ranking?.length" class="empty-msg">Encara no hi ha tallers amb llista d'assistència.</p>
              
              <div v-for="(c, index) in stats.data.centres.ranking" :key="c.nom_centre" class="ranking-item">
                <div class="rank-badge">{{ index + 1 }}</div>
                <div class="rank-info">
                  <div class="rank-header-row">
                    <span class="rank-name">{{ c.nom_centre }}</span>
                    <span class="percentage-tag" :class="getStatusClass(c.percentatge_asistencia)">
                      {{ c.percentatge_asistencia }}% d'assistència real
                    </span>
                  </div>
                  <span class="rank-sub">
                    Participen <strong>{{ c.total_alumnes_planificats }}</strong> alumnes en total
                    <span class="real-count">({{ c.alumnes_reals }} presents)</span>
                  </span>
                  
                  <div class="progress-bar-container">
                    <div 
                      class="progress-bar-fill" 
                      :style="{ 
                        width: c.percentatge_asistencia + '%',
                        backgroundColor: getBarColor(c.percentatge_asistencia)
                      }"
                    ></div>
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
            <h4>Tallers amb més execució</h4>
            <div v-if="!stats.data.tallers.mesSolicitats?.length" class="empty-msg">Sense dades d'execució.</div>
            
            <div v-for="(t, index) in stats.data.tallers.mesSolicitats" :key="t.titol" class="list-row taller-row">
              <div class="row-left">
                <span class="row-index">#{{ index + 1 }}</span>
                <div class="row-content">
                  <strong class="taller-titol">{{ t.titol }}</strong>
                  <div class="row-details">
                    <span class="sector-text">{{ formatText(t.sector) }}</span>
                    <span class="impact-badge">{{ t.percentatge_impacte }}% d'impacte</span>
                  </div>
                </div>
              </div>
              <div class="row-val-container">
                <span class="row-val">{{ t.total_peticions }}</span>
                <small>peticions</small>
              </div>
            </div>
          </div>

          <div class="metrics-grid">
            <div class="m-card">
              <label>Sector Líder</label>
              <p>{{ formatText(stats.data.tallers.sectorTop) }}</p>
            </div>
            <div class="m-card">
              <label>Modalitat més executada</label>
              <p>{{ formatModalitat(stats.data.tallers.modalitatTop) }}</p>
            </div>
            <div class="m-card">
              <label>Trimestre de més activitat</label>
              <p>{{ stats.data.tallers.trimestreTop }}</p>
            </div>
            <div class="m-card alert-card">
              <label>Estat del Sistema</label>
              <p>Dades actualitzades</p>
            </div>
          </div>
        </div>
      </section>

    </div>

    <div v-else class="error-state">
      <p>No s'han pogut carregar les estadístiques.</p>
    </div>
  </div>
</template>

<script setup>
const token = useCookie('authToken');

const { data: stats, pending, error } = await useFetch('/api/admin/stats/dashboard', {
    headers: { Authorization: `Bearer ${token.value}` },
    initialCache: false 
});

// Neteja de caràcters per problemes de codificació (UTF-8)
const formatText = (text) => {
  if (!text) return 'N/A';
  return text.replace(/Ã¨/g, 'è').replace(/Ã/g, 'à').replace(/Â²/g, '²');
};

const formatModalitat = (mod) => {
  const map = { 'B': 'Híbrida', 'P': 'Presencial', 'V': 'Virtual' };
  return map[mod] || mod || 'N/A';
};

const getBarColor = (p) => {
  if (p >= 80) return '#10b981';
  if (p >= 50) return '#3b82f6';
  return '#f59e0b';
};

const getStatusClass = (p) => {
  if (p >= 80) return 'status-high';
  if (p >= 50) return 'status-mid';
  return 'status-low';
};
</script>

<style scoped>
.page { padding: 30px; background: #f0f2f5; min-height: 100vh; font-family: 'Inter', sans-serif; }
.stat-section { background: white; padding: 25px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom: 30px; }
.section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 25px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; }
.section-header h3 { margin: 0; color: #1e293b; }

/* LAYOUT GRID */
.centres-container, .tallers-container { display: grid; grid-template-columns: 320px 1fr; gap: 40px; }

/* KPIs */
.kpi-column { display: flex; flex-direction: column; gap: 15px; }
.kpi-card { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; transition: transform 0.2s; }
.kpi-card:hover { transform: translateY(-2px); }
.kpi-card.highlight { border-left: 4px solid #3b82f6; background: #eff6ff; }
.kpi-card.success-kpi { border-left: 4px solid #10b981; background: #f0fdf4; }
.kpi-card.success-kpi .value { color: #166534; }
.kpi-card .value { font-size: 1.8rem; font-weight: 800; color: #0f172a; display: block; }
.kpi-card .label { font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; }
.kpi-card small { font-size: 0.7rem; color: #94a3b8; }

/* RANKINGS (CENTRES I TALLERS) */
.ranking-list, .info-list { display: flex; flex-direction: column; gap: 12px; }

.ranking-item, .taller-row { 
  display: flex; 
  align-items: center; 
  padding: 15px; 
  background: #ffffff; 
  border: 1px solid #e2e8f0; 
  border-radius: 12px; 
}

.taller-row { justify-content: space-between; }
.row-left { display: flex; align-items: center; gap: 15px; }

.rank-badge, .row-index { 
  background: #3b82f6; color: white; width: 32px; height: 32px; 
  border-radius: 50%; display: flex; align-items: center; 
  justify-content: center; font-weight: bold; flex-shrink: 0;
}
.row-index { background: #f1f5f9; color: #64748b; font-size: 0.85rem; }

.rank-info, .row-content { flex-grow: 1; }
.rank-name, .taller-titol { font-weight: 700; color: #1e293b; font-size: 1rem; }

.row-details { display: flex; align-items: center; gap: 10px; margin-top: 4px; }
.sector-text { font-size: 0.8rem; color: #64748b; }

.impact-badge { 
  background: #e0f2fe; color: #0369a1; padding: 2px 8px; 
  border-radius: 6px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase;
}

.row-val-container { text-align: right; }
.row-val { font-size: 1.4rem; font-weight: 800; color: #3b82f6; line-height: 1; display: block; }
.row-val-container small { font-size: 0.65rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; }

/* BARRES PROGRESS */
.progress-bar-container { background: #f1f5f9; height: 8px; border-radius: 10px; margin-top: 10px; overflow: hidden; }
.progress-bar-fill { height: 100%; transition: width 1s ease-in-out; }

/* METRICS GRID */
.metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.m-card { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #f1f5f9; }
.m-card label { font-size: 0.7rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; }
.m-card p { font-weight: 700; color: #1e293b; margin-top: 5px; font-size: 1.1rem; }
.alert-card { border-left: 4px solid #10b981; background: #f0fdf4; }

/* ESTATS UI */
.percentage-tag { font-size: 0.65rem; font-weight: 800; padding: 2px 8px; border-radius: 6px; }
.status-high { background: #dcfce7; color: #166534; }
.status-mid { background: #dbeafe; color: #1e40af; }
.status-low { background: #fef3c7; color: #92400e; }

.loading-state, .error-state { text-align: center; padding: 60px; color: #64748b; }
.spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3b82f6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

@media (max-width: 1024px) { 
  .centres-container, .tallers-container { grid-template-columns: 1fr; gap: 20px; } 
}
</style>