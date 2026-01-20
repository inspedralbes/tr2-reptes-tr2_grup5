<template>
  <div class="page">
    <div class="header-section">
      <h2>Gestió de Peticions de Tallers</h2>
      <button class="btn-refresh" @click="refresh" :disabled="pending">
        {{ pending ? 'Actualitzant...' : 'Refrescar Dades' }}
      </button>
    </div>

    <div v-if="pending && !peticions.length" class="loading">
      <div class="spinner"></div>
      Carregant peticions...
    </div>
    
    <div v-else-if="error" class="error">
      <span class="error-icon">⚠️</span>
      Error carregant les peticions: {{ error.message }}
    </div>

    <div v-else class="table-container">
      <table v-if="peticions && peticions.length > 0">
        <thead>
          <tr>
            <th class="expand-col"></th>
            <th>Centre</th>
            <th>Trimestre</th>
            <th class="tallers-count">Tallers Sol·licitats</th>
            <th>Estat</th>
            <th class="actions-header">Accions</th>
          </tr>
        </thead>
        <tbody v-for="peticio in peticions" :key="peticio.id">
          <tr class="main-row" @click="toggleRow(peticio.id)" :class="{ 'is-expanded': expandedRows.includes(peticio.id) }">
            <td class="expand-col">
              <span :class="['arrow', expandedRows.includes(peticio.id) ? 'down' : 'right']">▶</span>
            </td>
            <td>
              <div class="centre-name">{{ peticio.nom_centre }}</div>
              <div class="meta">Sol·licitat el {{ formatDate(peticio.data_creacio) }}</div>
            </td>
            <td><span class="trimestre-tag">{{ peticio.trimestre }}</span></td>
            <td class="tallers-count">
              <span class="count-pill">{{ peticio.detalls?.length || 0 }}</span>
            </td>
            <td>
              <span :class="['status-badge', (peticio.estat || 'PENDENT').toLowerCase()]">
                {{ peticio.estat || 'PENDENT' }}
              </span>
            </td>
            <td class="actions-cell">
              <button class="btn-toggle">
                {{ expandedRows.includes(peticio.id) ? 'Amagar' : 'Veure detalls' }}
              </button>
            </td>
          </tr>
          
          <transition name="fade">
            <tr v-if="expandedRows.includes(peticio.id)" class="details-row">
              <td colspan="6">
                <div class="details-content">
                  <div class="details-header">
                    <h4>Tallers en ordre de prioritat</h4>
                    <p v-if="peticio.comentaris" class="comentaris">
                      <strong>💡 Comentaris del centre:</strong> {{ peticio.comentaris }}
                    </p>
                  </div>
                  
                  <div class="tallers-grid">
                    <div v-for="t in peticio.detalls" :key="t.taller_id" class="taller-card">
                      <div class="priority-section" :class="'prio-level-' + t.prioritat">
                        <span class="prio-label">PRIORITAT</span>
                        <span class="prio-num">{{ t.prioritat || '-' }}</span>
                      </div>

                      <div class="taller-main-info">
                        <div class="taller-top">
                          <span class="modalitat-badge">{{ t.modalitat }}</span>
                          <span class="taller-title">{{ t.titol }}</span>
                        </div>
                        
                        <div class="taller-details">
                          <div class="detail-item">
                            <strong>Participants:</strong> {{ t.num_participants }}
                          </div>
                          <div v-if="t.es_preferencia_referent" class="ref-tag">
                            ⭐ Preferència Referent
                          </div>
                          <div v-if="t.docent_nom" class="docent-info">
                            <strong>Docent:</strong> {{ t.docent_nom }} <small>({{ t.docent_email }})</small>
                          </div>
                        </div>
                      </div>
                      
                      <div class="taller-status-actions">
                        <span :class="['status-badge small', (t.estat || 'PENDENT').toLowerCase()]">
                          {{ t.estat || 'PENDENT' }}
                        </span>
                        
                        <div v-if="(t.estat || 'PENDENT') === 'PENDENT'" class="taller-btn-group">
                          <button class="btn-action approve" title="Assignar Taller" @click="updateTallerStatus(peticio.id, t.taller_id, 'ASSIGNADA')" :disabled="actionLoading">
                            ✓
                          </button>
                          <button class="btn-action reject" title="Rebutjar Taller" @click="updateTallerStatus(peticio.id, t.taller_id, 'REBUTJADA')" :disabled="actionLoading">
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </transition>
        </tbody>
      </table>
      <div v-else class="no-data">
        <p>No hi ha peticions de tallers enregistrades.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const header = useHeaderStore()
header.setHeaderAdmin()

const tokenCookie = useCookie('authToken')
const actionLoading = ref(false)
const expandedRows = ref([])
const peticions = ref([])
const pending = ref(true)
const error = ref(null)

// Funció per obtenir les peticions (el backend ja les ordena per prioritat ASC)
const fetchPeticions = async () => {
  pending.value = true
  error.value = null
  try {
    const token = tokenCookie.value
    const data = await $fetch('http://localhost:1700/api/admin/peticions', {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    })
    peticions.value = data
  } catch (err) {
    console.error('Error fetching peticions:', err)
    error.value = err
  } finally {
    pending.value = false
  }
}

const refresh = () => fetchPeticions()

onMounted(() => {
  fetchPeticions()
})

const toggleRow = (id) => {
  const index = expandedRows.value.indexOf(id)
  if (index > -1) {
    expandedRows.value.splice(index, 1)
  } else {
    expandedRows.value.push(id)
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('ca-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}

const updateTallerStatus = async (peticioId, tallerId, estat) => {
  const confirmMsg = estat === 'ASSIGNADA' 
    ? 'Vols marcar aquest taller com a ASSIGNAT?' 
    : 'Vols REBUTJAR aquesta sol·licitud?'
    
  if (!confirm(confirmMsg)) return

  actionLoading.value = true
  try {
    const token = tokenCookie.value
    await $fetch(`http://localhost:1700/api/admin/peticions/${peticioId}/tallers/${tallerId}/estat`, {
      method: 'PUT',
      headers: { Authorization: token ? `Bearer ${token}` : '' },
      body: { estat }
    })
    await refresh()
  } catch (err) {
    console.error('Error actualitzant estat:', err)
    alert('No s\'ha pogut actualitzar l\'estat.')
  } finally {
    actionLoading.value = false
  }
}
</script>

<style scoped>
.page { padding: 30px; max-width: 1200px; margin: 0 auto; }

.header-section { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 30px; 
}

h2 { color: #1e293b; font-weight: 850; font-size: 1.8rem; margin: 0; }

.btn-refresh {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-refresh:hover { background: #f8fafc; border-color: #cbd5e1; }

/* Taula Principal */
.table-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

table { width: 100%; border-collapse: collapse; }
th { 
  background: #f8fafc; 
  padding: 16px; 
  text-align: left; 
  color: #64748b; 
  font-size: 0.75rem; 
  text-transform: uppercase; 
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e2e8f0;
}

.main-row { cursor: pointer; transition: background 0.2s; }
.main-row:hover { background: #f1f5f9; }
.main-row.is-expanded { background: #f8fafc; }

td { padding: 18px 16px; border-bottom: 1px solid #f1f5f9; }

.centre-name { font-weight: 700; color: #334155; font-size: 1rem; }
.meta { font-size: 0.8rem; color: #94a3b8; margin-top: 4px; }
.trimestre-tag { background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 0.8rem; }
.count-pill { background: #f1f5f9; color: #475569; padding: 4px 12px; border-radius: 20px; font-weight: 800; }

/* Status Badges */
.status-badge { 
  padding: 5px 12px; 
  border-radius: 12px; 
  font-size: 0.7rem; 
  font-weight: 800; 
  text-transform: uppercase;
}
.status-badge.pendent { background: #fef3c7; color: #92400e; }
.status-badge.assignada { background: #dcfce7; color: #15803d; }
.status-badge.rebutjada { background: #fee2e2; color: #b91c1c; }

/* Grid de Tallers (Desplegable) */
.details-row { background: #f8fafc; }
.details-content { padding: 30px; border-left: 5px solid #3b82f6; }
.details-header h4 { margin: 0 0 15px 0; color: #1e293b; font-weight: 800; font-size: 1.1rem; }

.tallers-grid { display: grid; grid-template-columns: 1fr; gap: 15px; }

.taller-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  padding: 16px;
  transition: transform 0.2s;
}

/* Secció Prioritat */
.priority-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 70px;
  border-right: 2px solid #f1f5f9;
  margin-right: 20px;
  padding-right: 10px;
}
.prio-label { font-size: 0.6rem; font-weight: 800; color: #94a3b8; }
.prio-num { font-size: 1.6rem; font-weight: 900; color: #1e293b; line-height: 1; }

.prio-level-1 .prio-num { color: #3b82f6; } /* Color blau per prioritat 1 */

.taller-main-info { flex: 1; }
.taller-title { font-weight: 700; color: #334155; font-size: 1.05rem; }
.modalitat-badge { 
  font-size: 0.65rem; 
  font-weight: 800; 
  background: #f1f5f9; 
  color: #64748b; 
  padding: 2px 6px; 
  border-radius: 4px; 
  margin-right: 8px;
}

.taller-details { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 15px; font-size: 0.85rem; color: #64748b; }
.ref-tag { color: #059669; font-weight: 700; }

/* Botons d'acció */
.taller-status-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
.taller-btn-group { display: flex; gap: 8px; }

.btn-action {
  width: 34px; height: 34px; border-radius: 8px; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; transition: transform 0.1s;
}
.btn-action.approve { background: #10b981; }
.btn-action.reject { background: #ef4444; }
.btn-action:hover { transform: scale(1.1); }
.btn-action:disabled { opacity: 0.3; cursor: not-allowed; }

/* Estats de càrrega */
.loading { text-align: center; padding: 100px; color: #64748b; }
.spinner { 
  width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3b82f6; 
  border-radius: 50%; margin: 0 auto 20px; animation: spin 1s linear infinite; 
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>