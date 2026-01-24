<template>
  <div class="admin-panel">
    <header class="panel-header">
      <div class="header-content">
        <h1 class="main-title">Gestió del Professorat</h1>
        <p class="subtitle">Llistat complet de docents del centre</p>
      </div>
    </header>

    <main class="content-section">
      <div class="toolbar-card">
        <div class="search-container">
          <span class="search-icon">🔍</span>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Cercar docent per nom o email..." 
          />
        </div>
        <button @click="openModal" class="btn-add">
          <span class="plus-icon">+</span> Afegir Docent
        </button>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="pl-xl">USUARI</th>
              <th>ROL</th>
              <th>ESTAT</th>
              <th class="text-right pr-xl">ACCIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="prof in filteredProfessors" :key="prof.id">
              <td class="user-cell pl-xl">
                <div class="avatar">{{ prof.nom[0] }}{{ prof.cognoms[0] }}</div>
                <div class="user-info">
                  <span class="full-name">{{ prof.nom }} {{ prof.cognoms }}</span>
                  <span class="email">{{ prof.email }}</span>
                </div>
              </td>
              <td><span class="badge badge-rol">Professor</span></td>
              <td><span class="badge badge-status">Actiu</span></td>
              <td class="text-right pr-xl">
                <div class="actions-wrapper">
                  <button @click="prepareEdit(prof)" class="action-btn edit">✏️</button>
                  <button @click="handleDelete(prof.id)" class="action-btn delete">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card-bottom">
        <div class="modal-header">
          <h3>{{ titolModal }}</h3>
          <button @click="closeModal" class="close-x">×</button>
        </div>
        
        <form @submit.prevent="handleSave" class="modal-form">
          <div class="form-grid">
            <div class="form-group">
              <label>Nom</label>
              <input v-model="form.nom" type="text" placeholder="Ex: Joan" required />
            </div>
            <div class="form-group">
              <label>Cognoms</label>
              <input v-model="form.cognoms" type="text" placeholder="Ex: Garcia" required />
            </div>
            <div class="form-group full-width">
              <label>Correu Electrònic</label>
              <input v-model="form.email" type="email" placeholder="usuari@xtec.cat" required />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn-secondary">Cancel·lar</button>
            <button type="submit" class="btn-primary" :disabled="loading">
              {{ textBotoModal }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
// ======================================
// Importacions i Composables (Rutes, Cookies, Stores)
// ======================================
import { ref, computed, onMounted } from 'vue';

// ======================================
// Estat Reactiu i Refs (Variables i Formularis)
// ======================================
const professors = ref([]);
const loading = ref(false)
const editingId = ref(null)
const showModal = ref(false)
const tokenCookie = useCookie('authToken')
const searchQuery = ref('')

const form = ref({ nom: '', cognoms: '', email: '' })

const titolModal = computed(function () {
  if (editingId.value) {
    return 'Editar Docent';
  } else {
    return 'Registrar Nou Docent';
  }
})

const textBotoModal = computed(function () {
  if (editingId.value) {
    return 'Guardar canvis';
  } else {
    return 'Registrar Docent';
  }
})

const filteredProfessors = computed(function () {
  if (!searchQuery.value) return professors.value;
  let q = searchQuery.value.toLowerCase();
  let arr = professors.value;
  let resultat = [];
  for (let i = 0; i < arr.length; i++) {
    let p = arr[i];
    let nom = '';
    if (p.nom) nom = p.nom.toLowerCase();
    let email = '';
    if (p.email) email = p.email.toLowerCase();
    if (nom.indexOf(q) >= 0 || email.indexOf(q) >= 0) {
      resultat.push(p);
    }
  }
  return resultat;
});

// ======================================
// Lògica i Funcions (Handlers i Lifecycle)
// ======================================

async function fetchProfessors() {
  try {
    let token = tokenCookie.value;
    professors.value = await $fetch('/api/centre/professors', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
  } catch (e) {
    console.error('Error carregant professors:', e);
  }
}

async function handleSave() {
  loading.value = true;
  try {
    let token = tokenCookie.value;
    let method = 'POST';
    if (editingId.value) {
      method = 'PUT';
    }
    let url = '/api/centre/professors';
    let finalUrl = url;
    if (editingId.value) {
      finalUrl = url + '/' + editingId.value;
    }
    await $fetch(finalUrl, { method: method, headers: { 'Authorization': 'Bearer ' + token }, body: form.value });
    closeModal();
    fetchProfessors();
  } catch (e) {
    console.error('Error desant docent:', e);
  } finally {
    loading.value = false;
  }
}

async function handleDelete(id) {
  if (!confirm('Eliminar docent?')) return;
  try {
    let token = tokenCookie.value;
    await $fetch('/api/centre/professors/' + id, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } });
    fetchProfessors();
  } catch (e) {
    console.error('Error eliminant docent:', e);
  }
}

function openModal() {
  showModal.value = true;
}
function closeModal() {
  showModal.value = false;
  editingId.value = null;
  form.value.nom = '';
  form.value.cognoms = '';
  form.value.email = '';
}
function prepareEdit(prof) {
  editingId.value = prof.id;
  form.value.nom = prof.nom;
  form.value.cognoms = prof.cognoms;
  form.value.email = prof.email;
  showModal.value = true;
}

onMounted(fetchProfessors)
</script>

<style scoped>
.admin-panel { background-color: #f1f5f9; min-height: 100vh; font-family: 'Inter', sans-serif; }

/* Header */
.panel-header { background: white; padding: 2.5rem 4rem; border-bottom: 1px solid #e2e8f0; }
.header-content { max-width: 1200px; margin: 0 auto; }
.main-title { font-size: 1.8rem; font-weight: 800; color: #0f172a; margin: 0; }

/* Toolbar corregida (60% / 25%) */
.toolbar-card {
  max-width: 1200px; margin: 2rem auto; padding: 1.25rem;
  background: white; border-radius: 12px; display: flex;
  justify-content: space-between; align-items: center;
}
.search-container { width: 60%; position: relative; }
.search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.search-container input { width: 100%; padding: 0.8rem 1rem 0.8rem 2.8rem; border: 1px solid #e2e8f0; border-radius: 8px; }
.btn-add { width: 25%; background: #1e3a8a; color: white; padding: 0.8rem; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; }

/* Taula */
.content-section { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
.table-container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { background: #f8fafc; padding: 1rem; font-size: 0.75rem; color: #64748b; text-align: left; border-bottom: 1px solid #e2e8f0; }
.data-table td { padding: 1.25rem 1rem; border-bottom: 1px solid #f1f5f9; }
.pl-xl { padding-left: 2.5rem !important; }
.pr-xl { padding-right: 2.5rem !important; }

/* Avatar i Text */
.user-cell { display: flex; align-items: center; gap: 1rem; }
.avatar { width: 40px; height: 40px; background: #eff6ff; color: #1e40af; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; }
.full-name { font-weight: 600; color: #1e293b; display: block; }
.email { font-size: 0.85rem; color: #64748b; }

.badge { padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; }
.badge-rol { background: #f5f3ff; color: #7c3aed; }
.badge-status { background: #f0fdf4; color: #16a34a; }

/* MODAL SIMÈTRIC A BAIX */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4);
  display: flex; justify-content: center; align-items: flex-end; padding-bottom: 4rem; z-index: 1000;
}
.modal-card-bottom {
  background: white; width: 100%; max-width: 550px; border-radius: 20px;
  box-shadow: 0 -10px 40px rgba(0,0,0,0.1); animation: slideUp 0.3s ease-out;
}
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

.modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
.modal-form { padding: 2rem; }

/* Grid per simetria */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.full-width { grid-column: span 2; }

.form-group label {
  display: block; font-weight: 600; color: #475569; margin-bottom: 0.5rem; font-size: 0.9rem;
}
.form-group input {
  width: 100%; padding: 0.8rem; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 0.95rem;
}

.modal-footer { margin-top: 2rem; display: flex; justify-content: flex-end; gap: 1rem; }
.btn-primary { background: #1e3a8a; color: white; border: none; padding: 0.8rem 2rem; border-radius: 10px; font-weight: 600; cursor: pointer; }
.btn-secondary { background: #f1f5f9; color: #475569; border: none; padding: 0.8rem 2rem; border-radius: 10px; font-weight: 600; cursor: pointer; }
.close-x { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }
</style>