<template>
  <div class="page">
    <div class="header-section">
      <div class="header-top">
        <h2>Gestió de Peticions de Tallers</h2>
        <button 
          class="btn-auto-assign" 
          @click="executeAutoAssignment" 
          :disabled="autoAssignLoading"
          title="Executar assignació automàtica de tallers"
        >
          <span v-if="autoAssignLoading">⏳ Processant...</span>
          <span v-else>⚡ Executar Assignació Automàtica</span>
        </button>
      </div>
      <div v-if="assignmentResult" class="assignment-result" :class="assignmentResult.success ? 'success' : 'error'">
        <strong>{{ assignmentResult.message }}</strong>
        <div v-if="assignmentResult.summary" class="summary-details">
          Assignades: {{ assignmentResult.summary.success }} | 
          Rebutjades: {{ assignmentResult.summary.rejected }} | 
          Errors: {{ assignmentResult.summary.errors }}
        </div>
      </div>
    </div>

    <div v-if="pending && !detallsPeticions.length" class="loading">
      <div class="spinner"></div>
      Carregant peticions...
    </div>
    
    <div v-else-if="error" class="error">
      <span class="error-icon">⚠️</span>
      Error carregant les peticions: {{ error.message }}
    </div>

    <div v-else class="table-container">
      <table v-if="detallsPeticions && detallsPeticions.length > 0">
        <thead>
          <tr>
            <th>Centre</th>
            <th>Taller</th>
            <th>Trimestre</th>
            <th>Participants</th>
            <th>Prioritat</th>
            <th>Estat</th>
            <th class="actions-header">Accions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="detall in detallsPeticions" :key="`${detall.peticio_id}-${detall.taller_id}`" class="main-row">
            <td>
              <div class="centre-name">{{ detall.nom_centre }}</div>
              <div class="meta">Sol·licitat el {{ formatDate(detall.data_creacio) }}</div>
            </td>
            <td>
              <div class="taller-info">
                <span class="modalitat-badge">{{ detall.modalitat }}</span>
                <span class="taller-title">{{ detall.titol }}</span>
              </div>
              <div v-if="detall.descripcio" class="descripcio-text">
                <strong>💡 Descripció:</strong> {{ detall.descripcio }}
              </div>
              <div v-if="detall.es_preferencia_referent" class="preferencia-referent-section">
                <div class="ref-tag">
                  Preferència Referent
                </div>
                <div v-if="detall.docent_nom" class="docent-info">
                  <strong>Professor:</strong> {{ detall.docent_nom }} 
                  <small v-if="detall.docent_email">({{ detall.docent_email }})</small>
                </div>
                <div v-else class="docent-info missing">
                  <strong>Professor:</strong> <em>No especificat</em>
                </div>
              </div>
              <div v-else-if="detall.docent_nom" class="docent-info">
                <strong>Docent:</strong> {{ detall.docent_nom }} 
                <small v-if="detall.docent_email">({{ detall.docent_email }})</small>
              </div>
            </td>
            <td><span class="trimestre-tag">{{ detall.trimestre }}</span></td>
            <td><span class="count-pill">{{ detall.num_participants }}</span></td>
            <td>
              <span class="priority-badge" :class="'prio-level-' + detall.prioritat">
                {{ detall.prioritat }}
              </span>
            </td>
            <td>
              <span :class="['status-badge', (detall.estat || 'PENDENT').toLowerCase()]">
                {{ detall.estat || 'PENDENT' }}
              </span>
            </td>
            <td class="actions-cell">
              <div v-if="(detall.estat || 'PENDENT') === 'PENDENT'" class="taller-btn-group">
                <button class="btn-action approve" title="Assignar Taller" @click="updateTallerStatus(detall.peticio_id, detall.taller_id, 'ASSIGNADA')" :disabled="actionLoading">
                  ✓ Assignar
                </button>
                <button class="btn-action reject" title="Rebutjar Taller" @click="updateTallerStatus(detall.peticio_id, detall.taller_id, 'REBUTJADA')" :disabled="actionLoading">
                  ✕ Rebutjar
                </button>
              </div>
              <span v-else class="no-actions">—</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="no-data">
        <p>No hi ha detalls de peticions de tallers enregistrats.</p>
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
const autoAssignLoading = ref(false)
const assignmentResult = ref(null)
const detallsPeticions = ref([])
const pending = ref(true)
const error = ref(null)

// Funció per obtenir els detalls de peticions (el backend retorna peticions amb detalls)
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
    // Aplanar les peticions per obtenir tots els detalls com a llista principal
    detallsPeticions.value = data.flatMap(peticio => 
      (peticio.detalls || []).map(detall => ({
        ...detall,
        peticio_id: peticio.id,
        nom_centre: peticio.nom_centre,
        data_creacio: peticio.data_creacio
      }))
    ).sort((a, b) => (a.prioritat || 0) - (b.prioritat || 0))
  } catch (err) {
    console.error('Error fetching peticions:', err)
    error.value = err
  } finally {
    pending.value = false
  }
}

onMounted(() => {
  fetchPeticions()
})

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
    const token = tokenCookie.value;
    await $fetch(`http://localhost:1700/api/admin/peticions/${peticioId}/tallers/${tallerId}/estat`, {
      method: 'PUT',
      headers: { Authorization: token ? `Bearer ${token}` : '' },
      body: { estat }
    })
    await fetchPeticions()
  } catch (err) {
    console.error('Error actualitzant estat:', err)
    alert('No s\'ha pogut actualitzar l\'estat.')
  } finally {
    actionLoading.value = false
  }
}

const executeAutoAssignment = async () => {
  if (!confirm('Vols executar l\'assignació automàtica de tallers? Això assignarà automàticament les peticions pendents segons prioritat i disponibilitat.')) {
    return
  }

  autoAssignLoading.value = true
  assignmentResult.value = null
  
  try {
    const token = tokenCookie.value
    const result = await $fetch('http://localhost:1700/api/admin/matching/auto', {
      method: 'POST',
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    })
    
    assignmentResult.value = {
      success: true,
      message: `Assignació automàtica completada!`,
      summary: result.summary
    }
    
    // Actualitzar la llista de peticions
    await fetchPeticions()
    
    // Ocultar el missatge després de 8 segons
    setTimeout(() => {
      assignmentResult.value = null
    }, 8000)
    
  } catch (err) {
    console.error('Error executant assignació automàtica:', err)
    assignmentResult.value = {
      success: false,
      message: `Error: ${err?.data?.message || 'No s\'ha pogut executar l\'assignació automàtica.'}`
    }
  } finally {
    autoAssignLoading.value = false
  }
}
</script>

<style scoped>
.page { padding: 30px; max-width: 1200px; margin: 0 auto; }

.header-section { 
  margin-bottom: 30px; 
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

h2 { color: #1e293b; font-weight: 850; font-size: 1.8rem; margin: 0; }

.btn-auto-assign {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
}

.btn-auto-assign:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(59, 130, 246, 0.4);
}

.btn-auto-assign:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.assignment-result {
  padding: 16px 20px;
  border-radius: 10px;
  margin-top: 15px;
  font-size: 0.95rem;
}

.assignment-result.success {
  background: #dcfce7;
  color: #15803d;
  border-left: 4px solid #22c55e;
}

.assignment-result.error {
  background: #fee2e2;
  color: #b91c1c;
  border-left: 4px solid #ef4444;
}

.summary-details {
  margin-top: 8px;
  font-size: 0.85rem;
  opacity: 0.9;
}

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

.actions-cell { 
  display: flex; 
  justify-content: center; 
  align-items: center;
}
.no-actions { color: #94a3b8; font-size: 0.85rem; }

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
.taller-info { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.modalitat-badge { 
  font-size: 0.65rem; 
  font-weight: 800; 
  background: #f1f5f9; 
  color: #64748b; 
  padding: 2px 6px; 
  border-radius: 4px; 
}
.descripcio-text { 
  font-size: 0.85rem; 
  color: #64748b; 
  margin-top: 8px; 
  padding: 8px; 
  background: #f8fafc; 
  border-radius: 4px; 
}
.priority-badge {
  display: inline-block;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #1e293b;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}
.prio-level-1 { background: #dbeafe; color: #1e40af; }

.taller-details { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 15px; font-size: 0.85rem; color: #64748b; }
.preferencia-referent-section {
  margin-top: 12px;
  padding: 12px;
  background: #fef3c7;
  border-left: 3px solid #f59e0b;
  border-radius: 6px;
}
.ref-tag { 
  color: #059669; 
  font-weight: 700; 
  font-size: 0.9rem;
  margin-bottom: 8px;
  display: block;
}
.docent-info {
  font-size: 0.85rem;
  color: #334155;
  margin-top: 6px;
}
.docent-info.missing {
  color: #94a3b8;
  font-style: italic;
}
.docent-info small {
  color: #64748b;
  font-size: 0.8rem;
}

/* Botons d'acció */
.taller-status-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
.taller-btn-group { display: flex; gap: 8px; }

.btn-action {
  padding: 6px 12px; border-radius: 8px; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; transition: transform 0.1s;
  font-size: 0.85rem;
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