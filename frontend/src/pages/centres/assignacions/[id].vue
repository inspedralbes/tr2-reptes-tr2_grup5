<template>
  <div class="page">
    <div class="header-section">
      <NuxtLink to="/centres/assignacions" class="btn-back">
        ⬅ Tornar a la llista
      </NuxtLink>
      
      <div v-if="assignacio" class="title-with-icon">
        <div class="modalitat-indicator" :class="'mod-' + assignacio.modalitat.toLowerCase()">
          {{ assignacio.modalitat }}
        </div>
        <div>
          <h2>{{ assignacio.titol }}</h2>
          <p class="subtitle">Detalls i planificació de les sessions del centre.</p>
        </div>
      </div>
    </div>

    <div v-if="pending" class="loading-state">
      <div class="spinner"></div>
      <span>Carregant detalls del taller...</span>
    </div>

    <div v-else-if="error" class="error-state">
      <span class="error-status">⚠️</span>
      <p>No s'ha pogut carregar la informació: {{ error.message }}</p>
      <NuxtLink to="/centres/assignacions" class="btn-retry">Tornar enrere</NuxtLink>
    </div>

    <div v-else-if="assignacio" class="content-wrapper">
      <div class="details-grid">
        
        <div class="main-details">
          <div class="card detail-card">
            <h3>Informació General</h3>
            <div class="info-list">
              <div class="info-item">
                <span class="label">Ubicació</span>
                <span class="value">📍 {{ assignacio.ubicacio || 'Per confirmar' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Trimestre</span>
                <span class="value">{{ assignacio.trimestre }} Trimestre</span>
              </div>
              <div class="info-item">
                <span class="label">Alumnes totals</span>
                <span class="value">{{ assignacio.num_participants }} participants</span>
              </div>
            </div>

            <div class="docent-box">
              <h4>Docent Referent</h4>
              <div class="docent-info">
                <p><strong>Nom:</strong> {{ assignacio.docent_nom || 'Pendent d\'assignar' }}</p>
                <p v-if="assignacio.docent_email"><strong>Email:</strong> {{ assignacio.docent_email }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="sessions-section">
          <div class="card sessions-card">
            <h3>📅 Sessions Programades</h3>
            
            <div v-if="sessionsList.length > 0" class="sessions-list">
              <div v-for="(sesio, index) in paginatedSessions" :key="sesio.id" class="sesio-item">
                <div class="sesio-number">{{ (currentPageSessions - 1) * itemsPerPage + index + 1 }}</div>
                <div class="sesio-data">
                  <span class="date">{{ formatDate(sesio.data) }}</span>
                  <span class="time">🕒 {{ sesio.hora_inici }} - {{ sesio.hora_fi }}</span>
                </div>
              </div>
            </div>
            <div v-if="sessionsList.length > 0 && totalPagesSessions > 1" class="mt-4 flex justify-center">
              <Pagination :current-page="currentPageSessions" :total-pages="totalPagesSessions" @go-to-page="goToPageSessions" />
            </div>
            <div v-else-if="sessionsList.length === 0" class="no-sessions">
              <p>No hi ha sessions programades encara per a aquesta assignació.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
// ======================================
// Importacions i Composables (Rutes, Cookies, Stores)
// ======================================
const route = useRoute();
const tokenCookie = useCookie('authToken');

// ======================================
// Estat Reactiu i Refs (Variables i Formularis)
// ======================================
const resFetch = await useFetch('/api/centre/assignacions/' + route.params.id, {
  server: false,
  headers: {
    Authorization: tokenCookie.value ? 'Bearer ' + tokenCookie.value : ''
  }
});

const assignacio = computed(function () {
  let d = resFetch.data;
  if (d && d.value) return d.value;
  return null;
});

const pending = resFetch.pending;
const error = resFetch.error;

const itemsPerPage = 10;
const currentPageSessions = ref(1);
watch(() => route.params.id, () => { currentPageSessions.value = 1; });
const sessionsList = computed(() => assignacio.value?.sessions || []);
const totalPagesSessions = computed(() => Math.max(1, Math.ceil(sessionsList.value.length / itemsPerPage)));
const paginatedSessions = computed(() => {
  const list = sessionsList.value;
  const start = (currentPageSessions.value - 1) * itemsPerPage;
  return list.slice(start, start + itemsPerPage);
});
function goToPageSessions(p) { if (p >= 1 && p <= totalPagesSessions.value) currentPageSessions.value = p; }

// ======================================
// Lògica i Funcions (Handlers i Lifecycle)
// ======================================

// A) --- Formatar la data per a la sessió ---
function formatDate(dateStr) {
  if (!dateStr) return 'Data pendent';
  let date = new Date(dateStr);
  let opts = {};
  opts.weekday = 'long';
  opts.year = 'numeric';
  opts.month = 'long';
  opts.day = 'numeric';
  return date.toLocaleDateString('ca-ES', opts);
}
</script>

<style scoped>
.page { padding: 40px; background: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; }

.btn-back {
  display: inline-block;
  margin-bottom: 24px;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.9em;
  transition: transform 0.2s;
}
.btn-back:hover { transform: translateX(-5px); }

.header-section { margin-bottom: 40px; }
.title-with-icon { display: flex; align-items: center; gap: 20px; }

h2 { color: #0f172a; font-weight: 800; font-size: 2.2em; margin: 0; }
.subtitle { color: #64748b; font-size: 1.1em; margin-top: 4px; }

.modalitat-indicator {
  min-width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 1.5em;
  color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.mod-a { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.mod-b { background: linear-gradient(135deg, #10b981, #059669); }
.mod-c { background: linear-gradient(135deg, #f59e0b, #d97706); }

.content-wrapper { max-width: 1200px; margin: 0 auto; }

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 32px;
}

.card {
  background: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0;
}

h3 { color: #1e293b; font-size: 1.4em; margin-bottom: 24px; font-weight: 700; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; }

.info-list { display: flex; flex-direction: column; gap: 20px; }
.info-item { display: flex; flex-direction: column; }
.label { color: #64748b; font-size: 0.8em; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
.value { color: #0f172a; font-size: 1.1em; font-weight: 600; }

.docent-box {
  margin-top: 32px;
  padding: 20px;
  background: #f1f5f9;
  border-radius: 16px;
}
.docent-box h4 { margin-top: 0; color: #475569; font-size: 0.9em; text-transform: uppercase; }
.docent-info p { margin: 8px 0; color: #1e293b; }

/* Sesiones */
.sessions-list { display: flex; flex-direction: column; gap: 16px; }
.sesio-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}
.sesio-number {
  background: #3b82f6;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.9em;
}
.sesio-data { display: flex; flex-direction: column; }
.sesio-data .date { font-weight: 700; color: #1e293b; text-transform: capitalize; }
.sesio-data .time { color: #64748b; font-size: 0.9em; }

.loading-state, .error-state {
  text-align: center;
  padding: 100px 20px;
  background: white;
  border-radius: 24px;
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

@media (max-width: 900px) {
  .details-grid { grid-template-columns: 1fr; }
}
</style>