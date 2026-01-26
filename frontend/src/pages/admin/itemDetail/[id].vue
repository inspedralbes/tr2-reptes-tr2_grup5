<template>
  <div class="page detail-page">
    <div v-if="isPendentApi === true" class="loading-state">
      <div class="spinner"></div>
      <p>Carregant dades del centre...</p>
    </div>

    <div v-else-if="dadesCentre" class="detail-container">
      <div class="top-nav">
        <button class="btn-back" @click="handleGoBack">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Tornar al llistat
        </button>
      </div>

      <div class="main-card">
        <header class="detail-header">
          <div class="header-info">
            <span class="codi-tag">{{ codiCentreUI }}</span>
            <h1>{{ dadesCentre.nom_centre }}</h1>
            <p class="location">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              {{ dadesCentre.municipi }}
            </p>
          </div>

          <div class="detail-tabs">
            <button
              :class="classeTabInfoUI"
              @click="handleCanviarPestanya('info')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Info i Tallers
            </button>
            <button
              :class="classeTabPersonalUI"
              @click="handleCanviarPestanya('personal')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              Personal (Professors/Alumnes)
            </button>
          </div>
        </header>

        <Transition name="slide-fade" mode="out-in">
          <div v-if="pestanyaActiva === 'info'" key="info" class="tab-content">
            <div class="detail-grid">
              <section class="info-section">
                <h3>Dades de Contacte</h3>
                <div class="info-card">
                  <div class="data-row">
                    <span class="label">Email Oficial</span>
                    <span class="value">{{ emailOficialUI }}</span>
                  </div>
                  <div class="data-row">
                    <span class="label">Telèfon</span>
                    <span class="value">{{ telefonUI }}</span>
                  </div>
                </div>
              </section>

              <section class="tallers-section">
                <h3>Tallers Assignats ({{ nTallers }})</h3>
                <div v-if="nTallers > 0" class="tallers-list">
                  <div 
                    v-for="taller in dadesCentre.tallers" 
                    :key="taller.id" 
                    class="taller-item clickable"
                    @click="handleObrirComentaris(taller)"
                    title="Clic per veure comentaris"
                  >
                    <div class="taller-icon">🎓</div>
                    <div class="taller-text">
                      <p class="t-name">{{ taller.titol }}</p>
                      <span class="t-status">{{ taller.estat }}</span>
                    </div>
                    <div class="taller-arrow">👉</div>
                  </div>
                </div>
                <div v-else class="empty-box">Sense tallers actualment</div>
              </section>
            </div>
          </div>

          <div v-else key="personal" class="tab-content">
            <div class="personal-grid">
              <section class="p-group">
                <div class="p-header">
                  <span class="p-icon">👨‍🏫</span>
                  <h3>Equip Docent</h3>
                </div>
                <div class="p-cards">
                  <div v-for="profe in professorsList" :key="profe.id" class="person-card teacher">
                    <div class="p-info">
                      <p class="p-name">{{ profe.nom }} {{ profe.cognoms }}</p>
                      <p class="p-role">Professor/a del centre</p>
                    </div>
                  </div>
                  <div v-if="professorsList.length === 0" class="person-card teacher">
                    <div class="p-info">
                      <p class="p-name">{{ nomCoordinadorUI }}</p>
                      <p class="p-role">Responsable de projectes</p>
                    </div>
                  </div>
                </div>
              </section>

              <section class="p-group">
                <div class="p-header">
                  <span class="p-icon">👥</span>
                  <h3>Grups i Alumnat</h3>
                </div>
                <div class="p-stats-grid">
                  <div class="stat-box">
                    <span class="stat-num">{{ totalAlumnesNum }}</span>
                    <span class="stat-label">Alumnes totals</span>
                  </div>
                  <div class="stat-box secondary">
                    <span class="stat-num">{{ grupsList.length }}</span>
                    <span class="stat-label">Grups actius</span>
                  </div>
                </div>

                <div class="alumnes-list mt-6">
                  <div v-for="(grup, index) in grupsList" :key="handleGetClauGrup(grup, index)" class="person-card student">
                    <div class="p-info">
                      <p class="p-name">Grup de {{ grup.nom }}</p>
                      <p class="p-role">{{ grup.n_alumnes }} alumnes • {{ grup.taller }}</p>
                    </div>
                  </div>
                  <div v-if="grupsList.length === 0" class="empty-mini">
                    No hi ha grups assignats actualment.
                  </div>
                </div>
              </section>
            </div>
          </div>
        </Transition>

        <!-- MODAL DE COMENTARIS (Dins de la targeta però fora de la transició) -->
        <div v-if="visibleModalComentaris === true" class="modal-overlay" @click.self="handleTancarModalComentaris">
          <div class="modal-content">
            <div class="modal-header">
              <h3>Comentaris: {{ nomTallerSeleccionat }}</h3>
              <button class="close-btn" @click="handleTancarModalComentaris">✕</button>
            </div>
            <div class="modal-body">
              <ul v-if="llistaComentarisTaller.length > 0" class="comments-list">
                <li v-for="(com, idx) in llistaComentarisTaller" :key="idx" class="comment-item">
                  "{{ com }}"
                </li>
              </ul>
              <div v-else class="empty-comments">
                No hi ha comentaris registrats per a aquest taller.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// ======================================
// Importem les dependències
// ======================================
import { ref, computed, onMounted } from 'vue';

// ======================================
// Configuració i Serveis
// ======================================

// 1. Serveis de rutes i cookies
const routeInstancia = useRoute();
const routerInstancia = useRouter();
const tokenCookie = useCookie('authToken');
const tokenRef = tokenCookie.value;
const idCentreUrl = routeInstancia.params.id;

// 2. Petició a l'API per dades del centre
const resultatApiCentre = await useFetch('/api/admin/centres/' + idCentreUrl, {
  headers: tokenRef ? { Authorization: 'Bearer ' + tokenRef } : {}
});

// ======================================
// Estat Reactiu (Esquema)
// ======================================

const pestanyaActiva = ref('info');
const totsElsComentaris = ref([]);
const visibleModalComentaris = ref(false);
const nomTallerSeleccionat = ref("");
const llistaComentarisTaller = ref([]);

// ======================================
// Propietats Computades (Anàlisi de dades)
// ======================================

// 1. Dades bases del centre i estat de càrrega
const dadesCentre = computed(function () {
  let val = null;
  if (resultatApiCentre.data) {
    if (resultatApiCentre.data.value) {
      val = resultatApiCentre.data.value;
    }
  }
  return val;
});

const isPendentApi = computed(function () {
  let p = false;
  if (resultatApiCentre.pending) {
    if (resultatApiCentre.pending.value === true) {
      p = true;
    }
  }
  return p;
});

// 2. Camps de text segurs del centre
const codiCentreUI = computed(function () {
  const c = dadesCentre.value;
  if (c) {
    if (c.codi_centre) {
      return c.codi_centre;
    }
  }
  return 'SENSE CODI';
});

const emailOficialUI = computed(function () {
  const c = dadesCentre.value;
  if (c) {
    if (c.email_oficial) {
      return c.email_oficial;
    }
  }
  return 'No disponible';
});

const telefonUI = computed(function () {
  const c = dadesCentre.value;
  if (c) {
    if (c.telefon) {
      return c.telefon;
    }
  }
  return '—';
});

// 3. Comptadors i llistes
const nTallers = computed(function () {
  const c = dadesCentre.value;
  let count = 0;
  if (c) {
    if (c.tallers) {
      count = c.tallers.length;
    }
  }
  return count;
});

const professorsList = computed(function () {
  const c = dadesCentre.value;
  if (c) {
    if (c.professors) {
      return c.professors;
    }
  }
  return [];
});

const nomCoordinadorUI = computed(function () {
  const c = dadesCentre.value;
  if (c) {
    if (c.nom_coordinador) {
      return c.nom_coordinador;
    }
  }
  return 'Coordinador General';
});

const grupsList = computed(function () {
  const c = dadesCentre.value;
  if (c) {
    if (c.responsables_grups) {
      return c.responsables_grups;
    }
  }
  return [];
});

const totalAlumnesNum = computed(function () {
  const llistaG = grupsList.value;
  let suma = 0;
  for (let i = 0; i < llistaG.length; i++) {
    const n = llistaG[i].n_alumnes;
    if (n) {
      suma = suma + n;
    }
  }
  return suma;
});

// 4. Estils de classes per pestanyes
const classeTabInfoUI = computed(function () {
  if (pestanyaActiva.value === 'info') {
    return 'tab-btn active';
  }
  return 'tab-btn';
});

const classeTabPersonalUI = computed(function () {
  if (pestanyaActiva.value === 'personal') {
    return 'tab-btn active';
  }
  return 'tab-btn';
});

// ======================================
// Declaracions de funcions
// ======================================

// A) --- Gestió d'accions d'usuari ---

function handleGoBack() {
  routerInstancia.back();
}

function handleCanviarPestanya(nomP) {
  pestanyaActiva.value = nomP;
}

function handleGetClauGrup(g, idx) {
  let cl = 'grup-' + String(idx);
  if (g) {
    if (g.nom) {
      cl = cl + '-' + String(g.nom);
    }
  }
  return cl;
}

// B) --- Lògica de comentaris i API ---

async function carregarComentarisApi() {
  try {
    const headersC = {};
    if (tokenRef) {
      headersC.Authorization = 'Bearer ' + tokenRef;
    }
    const dadesC = await $fetch('/api/admin/centres/' + idCentreUrl + '/comments', {
      headers: headersC
    });
    totsElsComentaris.value = dadesC || [];
  } catch (errC) {
    console.error('Error carregant comentaris del centre:', errC);
  }
}

function handleObrirComentaris(tallerObj) {
  if (!tallerObj) { return; }
  nomTallerSeleccionat.value = tallerObj.titol || "Taller";
  
  const llistaTots = totsElsComentaris.value;
  const filtrats = [];
  
  // Filtrem i mapegem manualment (Bucles for)
  for (let j = 0; j < llistaTots.length; j++) {
    const c = llistaTots[j];
    let coincideix = false;
    
    // Comprovem per ID o per títol
    if (String(c.taller_detall_id) === String(tallerObj.id)) {
      coincideix = true;
    } else if (c.nom_taller === tallerObj.titol) {
      coincideix = true;
    }
    
    if (coincideix === true) {
      if (c.comentarios) {
        filtrats.push(c.comentarios);
      }
    }
  }
  
  llistaComentarisTaller.value = filtrats;
  visibleModalComentaris.value = true;
}

function handleTancarModalComentaris() {
  visibleModalComentaris.value = false;
  nomTallerSeleccionat.value = "";
  llistaComentarisTaller.value = [];
}

// ======================================
// Cicle de vida
// ======================================

onMounted(function () {
  if (idCentreUrl) {
    carregarComentarisApi();
  }
});
</script>

<style scoped>
.detail-page { padding: 30px; background: #f0f4f8; min-height: 100vh; font-family: 'Inter', sans-serif; }
.btn-back { display: flex; align-items: center; gap: 8px; background: white; border: 1px solid #e2e8f0; padding: 10px 18px; border-radius: 12px; color: #475569; cursor: pointer; font-weight: 600; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 20px; }
.btn-back:hover { color: #2b63b6; border-color: #2b63b6; transform: translateX(-4px); }

.main-card { background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }

.detail-header { padding: 40px; background: linear-gradient(to right, #ffffff, #f8fafc); border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 20px; }
.codi-tag { background: #2b63b6; color: white; padding: 5px 14px; border-radius: 8px; font-size: 12px; font-weight: 800; letter-spacing: 0.5px; }
.detail-header h1 { font-size: 32px; color: #0f172a; margin: 12px 0 8px; font-weight: 800; }
.location { display: flex; align-items: center; gap: 6px; color: #64748b; font-size: 16px; font-weight: 500; }

.detail-tabs { display: flex; background: #f1f5f9; padding: 6px; border-radius: 14px; gap: 4px; }
.tab-btn { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border: none; background: transparent; border-radius: 10px; cursor: pointer; color: #64748b; font-weight: 700; font-size: 14px; transition: all 0.2s; }
.tab-btn.active { background: white; color: #2b63b6; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }

.tab-content { padding: 40px; }
.detail-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 40px; }

.info-card { background: #f8fafc; border-radius: 16px; padding: 24px; border: 1px solid #eef2f8; margin-top: 15px; }
.data-row { margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
.data-row:last-child { border: none; }
.label { display: block; font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 800; margin-bottom: 4px; }
.value { font-size: 15px; color: #1e293b; font-weight: 600; }

.tallers-list { display: grid; gap: 12px; margin-top: 15px; }
.taller-item { display: flex; align-items: center; gap: 15px; padding: 18px; background: white; border: 1px solid #e2e8f0; border-radius: 16px; transition: transform 0.2s; }
.taller-item:hover { transform: scale(1.02); border-color: #2b63b6; }
.taller-icon { font-size: 24px; background: #f0f7ff; padding: 10px; border-radius: 12px; }
.t-name { font-weight: 700; color: #1e293b; margin: 0; }
.t-status { font-size: 11px; color: #2b63b6; font-weight: 800; text-transform: uppercase; background: #e0f2fe; padding: 2px 8px; border-radius: 4px; }

.personal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
.p-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.p-icon { font-size: 24px; }
.p-group h3 { font-size: 18px; color: #1e293b; margin: 0; }

.p-cards { display: grid; gap: 12px; }
.person-card { background: white; border: 1px solid #e2e8f0; padding: 20px; border-radius: 16px; display: flex; align-items: center; gap: 15px; }
.teacher { border-left: 5px solid #2b63b6; }
.student { border-left: 5px solid #64748b; background: #f8fafc; margin-bottom: 8px; }
.p-name { font-weight: 700; color: #1e293b; margin: 0; }
.p-role { font-size: 13px; color: #64748b; margin: 0; }

.p-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.stat-box { background: #2b63b6; color: white; padding: 25px; border-radius: 20px; text-align: center; }
.stat-box.secondary { background: #f8fafc; color: #1e293b; border: 1px solid #e2e8f0; }
.stat-num { display: block; font-size: 32px; font-weight: 800; }
.stat-label { font-size: 12px; font-weight: 600; opacity: 0.9; }

.mt-6 { margin-top: 24px; }
.empty-mini { font-size: 14px; color: #94a3b8; font-style: italic; padding: 10px; }

.slide-fade-enter-active { transition: all 0.3s ease-out; }
.slide-fade-leave-active { transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1); }
.slide-fade-enter-from { transform: translateX(20px); opacity: 0; }
.slide-fade-leave-to { transform: translateX(-20px); opacity: 0; }

.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: #64748b; }
.spinner { width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top: 4px solid #2b63b6; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 15px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* UI Enhancements */
.taller-item.clickable { cursor: pointer; position: relative; }
.taller-item.clickable:hover { background-color: #f1f8ff; border-color: #2b63b6; }
.taller-arrow { margin-left: auto; font-size: 18px; opacity: 0; transition: opacity 0.2s; }
.taller-item.clickable:hover .taller-arrow { opacity: 1; }

/* Modal Styles */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(2px); }
.modal-content { background: white; padding: 25px; border-radius: 16px; width: 90%; max-width: 600px; max-height: 80vh; display: flex; flex-direction: column; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
.modal-header h3 { margin: 0; color: #2b63b6; font-size: 20px; }
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #666; }
.modal-body { overflow-y: auto; padding-right: 5px; }

.comments-list { list-style: none; padding: 0; margin: 0; }
.comment-item { background: #f8fafc; padding: 15px; margin-bottom: 10px; border-radius: 10px; border-left: 4px solid #3b82f6; font-style: italic; color: #475569; }
.empty-comments { text-align: center; color: #94a3b8; padding: 30px; }
</style>
