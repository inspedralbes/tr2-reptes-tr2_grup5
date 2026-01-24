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
      <div v-if="assignmentResult" :class="classeResultatAssignacio">
        <strong>{{ assignmentResult.message }}</strong>
        <div v-if="assignmentResult.summary" class="summary-details">
          Assignades: {{ assignmentResult.summary.success }} |
          Rebutjades: {{ assignmentResult.summary.rejected }} |
          Errors: {{ assignmentResult.summary.errors }}
        </div>
      </div>
    </div>

    <div v-if="mostraLoading" class="loading">
      <div class="spinner"></div>
      Carregant peticions...
    </div>

    <div v-else-if="errorFetch" class="error">
      <span class="error-icon">⚠️</span>
      Error carregant les peticions: {{ textError }}
    </div>

    <div v-else class="table-container">
      <table v-if="hiHaDetalls">
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
          <tr v-for="detall in detallsPeticions" :key="clauDetall(detall)" class="main-row">
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
              <span :class="classeEstatBadge(detall)">
                {{ textEstat(detall) }}
              </span>
            </td>
            <td class="actions-cell">
              <div v-if="esPendent(detall)" class="taller-btn-group">
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
// ======================================
// Importacions i Composables (Rutes, Cookies, Stores)
// ======================================
import { ref, onMounted } from 'vue';

const header = useHeaderStore();
header.setHeaderAdmin();

// ======================================
// Estat Reactiu i Refs (Variables i Formularis)
// ======================================
const tokenCookie = useCookie('authToken');
const actionLoading = ref(false);
const autoAssignLoading = ref(false);
const assignmentResult = ref(null);
const detallsPeticions = ref([]);
const pending = ref(true);
const error = ref(null);

const mostraLoading = computed(function () {
  if (pending.value && detallsPeticions.value.length === 0) {
    return true;
  } else {
    return false;
  }
});

const errorFetch = computed(function () {
  return error.value !== null;
});

const textError = computed(function () {
  if (error.value && error.value.message) {
    return error.value.message;
  }
  return '';
});

const hiHaDetalls = computed(function () {
  let d = detallsPeticions.value;
  if (d && d.length > 0) {
    return true;
  } else {
    return false;
  }
});

const classeResultatAssignacio = computed(function () {
  if (assignmentResult.value && assignmentResult.value.success) {
    return 'assignment-result success';
  } else {
    return 'assignment-result error';
  }
});

// ======================================
// Lògica i Funcions (Handlers i Lifecycle)
// ======================================

// A) --- Obtenir els detalls de peticions des de l'API ---
async function fetchPeticions() {
  // 1. Activem pending i netegem error.
  pending.value = true;
  error.value = null;
  try {
    let tok = tokenCookie.value;
    let data = await $fetch('/api/admin/peticions', {
      headers: {
        Authorization: tok ? 'Bearer ' + tok : ''
      }
    });
    // 2. Aplaniem les peticions: per cada petició, per cada detall, afegim a una llista.
    let llista = [];
    for (let i = 0; i < data.length; i++) {
      let peticio = data[i];
      let detalls = peticio.detalls;
      if (!detalls) detalls = [];
      for (let j = 0; j < detalls.length; j++) {
        let detall = detalls[j];
        let ob = {};
        ob.peticio_id = peticio.id;
        ob.nom_centre = peticio.nom_centre;
        ob.data_creacio = peticio.data_creacio;
        ob.id = detall.id;
        ob.taller_id = detall.taller_id;
        ob.modalitat = detall.modalitat;
        ob.titol = detall.titol;
        ob.descripcio = detall.descripcio;
        ob.trimestre = detall.trimestre;
        ob.num_participants = detall.num_participants;
        ob.prioritat = detall.prioritat;
        ob.estat = detall.estat;
        ob.es_preferencia_referent = detall.es_preferencia_referent;
        ob.docent_nom = detall.docent_nom;
        ob.docent_email = detall.docent_email;
        llista.push(ob);
      }
    }
    // 3. Ordenem per prioritat (bombolla o simple: comparem prioritat).
    for (let a = 0; a < llista.length - 1; a++) {
      for (let b = a + 1; b < llista.length; b++) {
        let pa = llista[a].prioritat || 0;
        let pb = llista[b].prioritat || 0;
        if (pa > pb) {
          let tmp = llista[a];
          llista[a] = llista[b];
          llista[b] = tmp;
        }
      }
    }
    detallsPeticions.value = llista;
  } catch (err) {
    console.error('Error fetching peticions:', err);
    error.value = err;
  } finally {
    pending.value = false;
  }
}

onMounted(function () {
  fetchPeticions();
});

// A) --- Formatar la data ---
function formatDate(dateStr) {
  if (!dateStr) return '—';
  let d = new Date(dateStr);
  let opts = {};
  opts.day = '2-digit';
  opts.month = '2-digit';
  opts.year = 'numeric';
  return d.toLocaleDateString('ca-ES', opts);
}

// A) --- Actualitzar l'estat d'un taller dins una petició ---
async function updateTallerStatus(peticioId, tallerId, estat) {
  // 1. Missatge de confirmació segons l'estat.
  let confirmMsg = '';
  if (estat === 'ASSIGNADA') {
    confirmMsg = 'Vols marcar aquest taller com a ASSIGNAT?';
  } else {
    confirmMsg = 'Vols REBUTJAR aquesta sol·licitud?';
  }
  if (!confirm(confirmMsg)) return;

  actionLoading.value = true;
  try {
    let tok = tokenCookie.value;
    await $fetch('/api/admin/peticions/' + peticioId + '/tallers/' + tallerId + '/estat', {
      method: 'PUT',
      headers: { Authorization: tok ? 'Bearer ' + tok : '' },
      body: { estat: estat }
    });
    await fetchPeticions();
  } catch (err) {
    console.error('Error actualitzant estat:', err);
    alert('No s\'ha pogut actualitzar l\'estat.');
  } finally {
    actionLoading.value = false;
  }
}

// A) --- Executar l'assignació automàtica ---
async function executeAutoAssignment() {
  if (!confirm('Vols executar l\'assignació automàtica de tallers? Això assignarà automàticament les peticions pendents segons prioritat i disponibilitat.')) {
    return;
  }

  autoAssignLoading.value = true;
  assignmentResult.value = null;

  try {
    let tok = tokenCookie.value;
    let result = await $fetch('/api/admin/matching/auto', {
      method: 'POST',
      headers: { Authorization: tok ? 'Bearer ' + tok : '' }
    });

    let ob = {};
    ob.success = true;
    ob.message = 'Assignació automàtica completada!';
    ob.summary = result.summary;
    assignmentResult.value = ob;

    await fetchPeticions();

    setTimeout(function () {
      assignmentResult.value = null;
    }, 8000);
  } catch (err) {
    console.error('Error executant assignació automàtica:', err);
    let ob = {};
    ob.success = false;
    let msg = 'No s\'ha pogut executar l\'assignació automàtica.';
    if (err && err.data && err.data.message) {
      msg = err.data.message;
    }
    ob.message = 'Error: ' + msg;
    assignmentResult.value = ob;
  } finally {
    autoAssignLoading.value = false;
  }
}

// A) --- Clau única per al detall ---
function clauDetall(detall) {
  return String(detall.peticio_id) + '-' + String(detall.taller_id);
}

// A) --- Retornar la classe de l'estat badge ---
function classeEstatBadge(detall) {
  let e = detall.estat;
  if (!e) e = 'PENDENT';
  return 'status-badge ' + e.toLowerCase();
}

// A) --- Retornar el text d'estat ---
function textEstat(detall) {
  if (detall.estat) {
    return detall.estat;
  } else {
    return 'PENDENT';
  }
}

// A) --- Comprovar si el detall és PENDENT ---
function esPendent(detall) {
  let e = detall.estat;
  if (!e) e = 'PENDENT';
  if (e === 'PENDENT') {
    return true;
  } else {
    return false;
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

.loading { text-align: center; padding: 100px; color: #64748b; }
.spinner {
  width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3b82f6;
  border-radius: 50%; margin: 0 auto 20px; animation: spin 1s linear infinite;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
