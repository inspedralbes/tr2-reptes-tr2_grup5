<template>
  <div class="page">
    <h2>Gestió de Peticions de Tallers</h2>

    <div v-if="pending" class="loading">Carregant peticions...</div>
    <div v-else-if="error" class="error">Error carregant les peticions: {{ error.message }}</div>

    <div v-else class="table-container">
      <table v-if="peticions && peticions.length > 0">
        <thead>
          <tr>
            <th class="expand-col"></th>
            <th>Centre</th>
            <th>Trimestre</th>
            <th class="tallers-count">Tallers</th>
            <th>Estat General</th>
            <th class="actions-header">Accions</th>
          </tr>
        </thead>
        <tbody v-for="peticio in peticions" :key="peticio.id">
          <tr class="main-row" @click="toggleRow(peticio.id)">
            <td class="expand-col">
              <span :class="['arrow', expandedRows.includes(peticio.id) ? 'down' : 'right']">▶</span>
            </td>
            <td>
              <strong>{{ peticio.nom_centre }}</strong>
              <div class="meta">{{ formatDate(peticio.data_creacio) }}</div>
            </td>
            <td>{{ peticio.trimestre }}</td>
            <td class="tallers-count">{{ peticio.detalls?.length || 0 }} talleres</td>
            <td>
              <span :class="['status-badge', (peticio.estat || 'PENDENT').toLowerCase()]">
                {{ peticio.estat || 'PENDENT' }}
              </span>
            </td>
            <td class="actions-cell">
              <button class="btn-toggle" @click.stop="toggleRow(peticio.id)">
                {{ expandedRows.includes(peticio.id) ? 'Amagar' : 'Veure Tallers' }}
              </button>
            </td>
          </tr>
          
          <!-- FILA DESPLEGABLE -->
          <transition name="fade">
            <tr v-if="expandedRows.includes(peticio.id)" class="details-row">
              <td colspan="6">
                <div class="details-content">
                  <div class="details-header">
                    <h4>Tallers Sol·licitats</h4>
                    <p v-if="peticio.comentaris" class="comentaris"><strong>Comentaris:</strong> {{ peticio.comentaris }}</p>
                  </div>
                  
                  <div class="tallers-grid">
                    <div v-for="t in peticio.detalls" :key="t.taller_id" class="taller-card">
                      <div class="taller-info">
                        <span class="badge">{{ t.modalitat }}</span>
                        <span class="taller-title">{{ t.titol }}</span>
                        <div class="taller-meta">
                          <span>{{ t.num_participants }} part.</span>
                          <span v-if="t.es_preferencia_referent" class="ref-badge">Preferència Referent</span>
                        </div>
                        <div v-if="t.docent_nom" class="docent-info">
                          Docent: {{ t.docent_nom }}
                        </div>
                      </div>
                      
                      <div class="taller-status-actions">
                        <span :class="['status-badge small', (t.estat || 'PENDENT').toLowerCase()]">
                          {{ t.estat || 'PENDENT' }}
                        </span>
                        
                        <div v-if="(t.estat || 'PENDENT') === 'PENDENT'" class="taller-btn-group">
                          <button class="btn-accept-mini" @click="updateTallerStatus(peticio.id, t.taller_id, 'ASSIGNADA')" :disabled="actionLoading">
                            ✓
                          </button>
                          <button class="btn-reject-mini" @click="updateTallerStatus(peticio.id, t.taller_id, 'REBUTJADA')" :disabled="actionLoading">
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
      <p v-else class="no-data">No hi ha peticions de tallers enregistrades.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const header = useHeaderStore()
header.setHeaderAdmin()

const actionLoading = ref(false)
const expandedRows = ref([])
const peticions = ref([])
const pending = ref(true)
const error = ref(null)

// Fetching peticions
const fetchPeticions = async () => {
  pending.value = true
  error.value = null
  try {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : ''
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
  if (expandedRows.value.includes(id)) {
    expandedRows.value = expandedRows.value.filter(rowId => rowId !== id)
  } else {
    expandedRows.value.push(id)
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('ca-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const updateTallerStatus = async (peticioId, tallerId, estat) => {
  const confirmMsg = estat === 'ASSIGNADA' 
    ? 'Estàs segur que vols marcar aquest taller com a ASSIGNAT?' 
    : 'Estàs segur que vols REBUTJAR aquest taller?'
    
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
    console.error('Error actualitzant estat del taller:', err)
    alert('Error al actualitzar l\'estat del taller.')
  } finally {
    actionLoading.value = false
  }
}
</script>

<style scoped>
.page { padding: 20px; }
h2 { color: #203a63; margin-bottom: 24px; font-weight: 800; }

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(15,30,70,0.08);
  overflow: hidden;
}

table { width: 100%; border-collapse: collapse; }
th { background: #f8fafc; color: #64748b; text-align: left; padding: 16px; font-weight: 700; font-size: 0.85em; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; }
td { padding: 16px; border-bottom: 1px solid #f1f5f9; }

.expand-col { width: 40px; text-align: center; color: #94a3b8; font-size: 0.7em; }
.arrow { display: inline-block; transition: transform 0.2s; }
.arrow.down { transform: rotate(90deg); color: #3b82f6; }

.main-row { cursor: pointer; transition: background 0.2s; }
.main-row:hover { background: #f8fafc; }

.meta { color: #94a3b8; font-size: 0.85em; }

.tallers-count { color: #64748b; font-weight: 600; }

.status-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.75em; font-weight: 800; letter-spacing: 0.05em; }
.status-badge.small { padding: 2px 8px; font-size: 0.7em; }
.status-badge.pendent { background: #fef3c7; color: #92400e; }
.status-badge.assignada { background: #dcfce7; color: #166534; }
.status-badge.rebutjada { background: #fee2e2; color: #991b1b; }

.btn-toggle { background: #eff6ff; color: #2563eb; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 700; font-size: 0.85em; cursor: pointer; transition: all 0.2s; }
.btn-toggle:hover { background: #dbeafe; }

/* DETALLES DESPLEGABLES */
.details-row { background: #f8fafc; }
.details-content { padding: 24px; border-left: 4px solid #3b82f6; }
.details-header { margin-bottom: 20px; }
.details-header h4 { margin: 0 0 8px 0; color: #1e293b; font-weight: 800; }
.comentaris { font-size: 0.9em; color: #64748b; background: #fff; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; }

.tallers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
.taller-card { background: white; padding: 16px; border-radius: 10px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-start; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }

.taller-info { flex: 1; }
.taller-title { font-weight: 700; color: #334155; display: block; margin-top: 4px; }
.badge { background: #f1f5f9; color: #475569; padding: 2px 6px; border-radius: 4px; font-weight: 800; font-size: 0.75em; }
.taller-meta { font-size: 0.85em; color: #94a3b8; margin-top: 4px; display: flex; gap: 8px; align-items: center; }
.ref-badge { background: #ecfdf5; color: #059669; padding: 1px 4px; border-radius: 4px; font-size: 0.7em; font-weight: 800; }
.docent-info { margin-top: 8px; font-size: 0.8em; color: #64748b; }

.taller-status-actions { text-align: right; display: flex; flex-direction: column; gap: 10px; align-items: flex-end; }
.taller-btn-group { display: flex; gap: 6px; }
.btn-accept-mini { background: #10b981; color: white; border: none; width: 28px; height: 28px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold; transition: opacity 0.2s; }
.btn-reject-mini { background: #ef4444; color: white; border: none; width: 28px; height: 28px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold; transition: opacity 0.2s; }
.btn-accept-mini:hover, .btn-reject-mini:hover { opacity: 0.8; }
.btn-accept-mini:disabled, .btn-reject-mini:disabled { opacity: 0.3; cursor: not-allowed; }

.loading, .error, .no-data { text-align: center; padding: 60px; color: #94a3b8; font-weight: 600; }
.error { color: #ef4444; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
