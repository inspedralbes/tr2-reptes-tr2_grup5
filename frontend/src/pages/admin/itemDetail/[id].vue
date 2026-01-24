<template>
  <div class="page detail-page">
    <div v-if="pendent" class="loading-state">
      <div class="spinner"></div>
      <p>Carregant dades del centre...</p>
    </div>

    <div v-else-if="centre" class="detail-container">
      <div class="top-nav">
        <button class="btn-back" @click="tornarEnrere">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Tornar al llistat
        </button>
      </div>

      <div class="main-card">
        <header class="detail-header">
          <div class="header-info">
            <span class="codi-tag">{{ codiCentre }}</span>
            <h1>{{ centre.nom_centre }}</h1>
            <p class="location">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              {{ centre.municipi }}
            </p>
          </div>

          <div class="detail-tabs">
            <button
              :class="classeTabInfo"
              @click="activeTab = 'info'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Info i Tallers
            </button>
            <button
              :class="classeTabPersonal"
              @click="activeTab = 'personal'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              Personal (Professors/Alumnes)
            </button>
          </div>
        </header>

        <Transition name="slide-fade" mode="out-in">
          <div v-if="activeTab === 'info'" key="info" class="tab-content">
            <div class="detail-grid">
              <section class="info-section">
                <h3>Dades de Contacte</h3>
                <div class="info-card">
                  <div class="data-row">
                    <span class="label">Email Oficial</span>
                    <span class="value">{{ emailOficial }}</span>
                  </div>
                  <div class="data-row">
                    <span class="label">Telèfon</span>
                    <span class="value">{{ telefonCentre }}</span>
                  </div>
                </div>
              </section>

              <section class="tallers-section">
                <h3>Tallers Assignats ({{ compteTallers }})</h3>
                <div v-if="compteTallers > 0" class="tallers-list">
                  <div v-for="taller in centre.tallers" :key="taller.id" class="taller-item">
                    <div class="taller-icon">🎓</div>
                    <div class="taller-text">
                      <p class="t-name">{{ taller.titol }}</p>
                      <span class="t-status">{{ taller.estat }}</span>
                    </div>
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
                  <div v-for="profe in llistaProfessors" :key="profe.id" class="person-card teacher">
                    <div class="p-info">
                      <p class="p-name">{{ profe.nom }} {{ profe.cognoms }}</p>
                      <p class="p-role">Professor/a del centre</p>
                    </div>
                  </div>
                  <div v-if="llistaProfessorsLength === 0" class="person-card teacher">
                    <div class="p-info">
                      <p class="p-name">{{ nomCoordinador }}</p>
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
                    <span class="stat-num">{{ totalAlumnes }}</span>
                    <span class="stat-label">Alumnes totals</span>
                  </div>
                  <div class="stat-box secondary">
                    <span class="stat-num">{{ compteGrups }}</span>
                    <span class="stat-label">Grups actius</span>
                  </div>
                </div>

                <div class="alumnes-list mt-6">
                  <div v-for="(grup, index) in llistaGrups" :key="clauGrup(grup, index)" class="person-card student">
                    <div class="p-info">
                      <p class="p-name">Grup de {{ grup.nom }}</p>
                      <p class="p-role">{{ grup.n_alumnes }} alumnes • {{ grup.taller }}</p>
                    </div>
                  </div>
                  <div v-if="llistaGrupsLength === 0" class="empty-mini">
                    No hi ha grups assignats actualment.
                  </div>
                </div>
              </section>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
// ======================================
// Importacions i Composables (Rutes, Cookies, Stores)
// ======================================
const route = useRoute();
const activeTab = ref('info');
const token = useCookie('authToken').value;
const centreId = route.params.id;

// ======================================
// Estat Reactiu i Refs (Variables i Formularis)
// ======================================
const respostaFetch = await useFetch('/api/admin/centres/' + centreId, {
  headers: token ? { Authorization: 'Bearer ' + token } : {}
});

const centre = computed(function () {
  let d = respostaFetch.data;
  if (d && d.value) {
    return d.value;
  }
  return null;
});

const pendent = computed(function () {
  if (respostaFetch.pending) {
    return respostaFetch.pending.value;
  }
  return false;
});

const codiCentre = computed(function () {
  if (centre.value && centre.value.codi_centre) {
    return centre.value.codi_centre;
  } else {
    return 'SENSE CODI';
  }
});

const emailOficial = computed(function () {
  if (centre.value && centre.value.email_oficial) {
    return centre.value.email_oficial;
  } else {
    return 'No disponible';
  }
});

const telefonCentre = computed(function () {
  if (centre.value && centre.value.telefon) {
    return centre.value.telefon;
  } else {
    return '—';
  }
});

const compteTallers = computed(function () {
  if (centre.value && centre.value.tallers) {
    return centre.value.tallers.length;
  } else {
    return 0;
  }
});

const llistaProfessors = computed(function () {
  if (centre.value && centre.value.professors) {
    return centre.value.professors;
  } else {
    return [];
  }
});

const llistaProfessorsLength = computed(function () {
  return llistaProfessors.value.length;
});

const nomCoordinador = computed(function () {
  if (centre.value && centre.value.nom_coordinador) {
    return centre.value.nom_coordinador;
  } else {
    return 'Coordinador General';
  }
});

const llistaGrups = computed(function () {
  if (centre.value && centre.value.responsables_grups) {
    return centre.value.responsables_grups;
  } else {
    return [];
  }
});

const llistaGrupsLength = computed(function () {
  return llistaGrups.value.length;
});

const compteGrups = computed(function () {
  return llistaGrups.value.length;
});

const totalAlumnes = computed(function () {
  let grups = centre.value && centre.value.responsables_grups ? centre.value.responsables_grups : [];
  let suma = 0;
  for (let i = 0; i < grups.length; i++) {
    let n = grups[i].n_alumnes;
    if (n) {
      suma = suma + n;
    }
  }
  return suma;
});

const classeTabInfo = computed(function () {
  if (activeTab.value === 'info') {
    return 'tab-btn active';
  } else {
    return 'tab-btn';
  }
});

const classeTabPersonal = computed(function () {
  if (activeTab.value === 'personal') {
    return 'tab-btn active';
  } else {
    return 'tab-btn';
  }
});

// ======================================
// Lògica i Funcions (Handlers i Lifecycle)
// ======================================

// A) --- Tornar enrere al llistat ---
function tornarEnrere() {
  const r = useRouter();
  r.back();
}

// A) --- Clau única per al grup al v-for ---
function clauGrup(grup, index) {
  if (grup && grup.nom) {
    return 'grup-' + String(index) + '-' + grup.nom;
  } else {
    return 'grup-' + String(index);
  }
}
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
</style>
