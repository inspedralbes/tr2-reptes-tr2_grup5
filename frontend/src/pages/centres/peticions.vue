<template>
  <div class="inscripcio-container">
    <div v-if="currentStep === 1" class="step-view">
      <header class="page-header">
        <h1>Inscripció a Tallers ENGINY</h1>
        <div v-if="centre" class="centre-info">
          Sessió iniciada com a: <strong>{{ centre.nom_centre }}</strong>
        </div>
        <p class="subtitle">Selecciona els tallers que t'interessen per al teu centre.</p>
        
        <div v-if="centre && centre.config" class="info-period">
          <p v-if="isEnrollmentOpen" class="text-success">
            ✅ Període d'inscripció obert: {{ formatDate(centre.config.enrollment_start) }} - {{ formatDate(centre.config.enrollment_end) }}
          </p>
          <p v-else class="text-danger">
            ⛔ Període d'inscripció tancat. (Obert: {{ formatDate(centre.config.enrollment_start) }} - {{ formatDate(centre.config.enrollment_end) }})
          </p>
        </div>
      </header>

      <div class="tallers-grid">
        <div v-for="taller in tallers" :key="taller.id" :class="classeTallerCard(taller)">
          <div class="card-header">
            <span class="modality-tag">Projecte {{ taller.modalitat }}</span>
            <span class="sector-tag">{{ taller.sector }}</span>
          </div>
          <div class="card-body">
            <h3>{{ taller.titol }}</h3>
            <p class="description">{{ taller.descripcio }}</p>
            <div class="extra-info">
              <span><strong>Places:</strong> {{ taller.places_maximes }}</span>
              <span><strong>Trimestres:</strong> {{ taller.trimestres_disponibles }}</span>
              <span v-if="taller.data_execucio"><strong>📅 Data prevista:</strong> {{ formatDate(taller.data_execucio) }}</span>
              <span v-if="taller.adreca"><strong>📍 Adreça:</strong> {{ taller.adreca }}</span>
            </div>
          </div>
          <div class="card-footer">
            <button @click="toggleTaller(taller)" :class="classeBtnSelect(taller)">
              {{ textBotoSelect(taller) }}
            </button>
          </div>
        </div>
      </div>

      <div class="footer-actions" v-if="selectedTallers.length > 0">
        <div class="count-badge">{{ selectedTallers.length }} taller(s) seleccionats</div>
        <button @click="nextStep" class="btn-primary">Continuar Sol·licitud →</button>
      </div>
    </div>

    <div v-else class="step-view">
      <header class="page-header">
        <button @click="currentStep = 1" class="btn-back">← Tornar al catàleg</button>
        <h1>Detalls de la Sol·licitud</h1>
      </header>

      <form @submit.prevent="handleSubmit" class="peticio-form">
        <section class="form-section">
          <h2>Tallers seleccionats</h2>
          <p class="section-description">Configura els detalls per a cada taller seleccionat</p>
          <div v-for="(t, index) in form.tallers" :key="t.taller_id" class="taller-detail-item">
            <div class="item-header">
              <h3>{{ getTallerTitol(t.taller_id) }}</h3>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Trimestre *</label>
                <select v-model="t.trimestre" required>
                  <option value="" disabled>Selecciona un trimestre</option>
                  <option value="1r">1r Trimestre</option>
                  <option value="2n">2n Trimestre</option>
                  <option value="3r">3r Trimestre</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Num. Participants (max 4) *</label>
                <input type="number" v-model="t.num_participants" min="1" max="4" required>
              </div>
              <div class="form-group">
                <label>Prioritat (1-10) *</label>
                <input
                  type="number"
                  v-model.number="t.prioritat"
                  min="1"
                  max="10"
                  placeholder="1 = Mínima, 10 = Màxima"
                  required
                >
                <small class="help-text">1: Mínima, 10: Màxima</small>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Docent Responsable *</label>
                <select v-model="t.docent_nom" @change="updateDocentEmail(t)" required>
                  <option value="" disabled>Selecciona un docent</option>
                  <option v-for="prof in professors" :key="prof.id" :value="prof.nom + ' ' + prof.cognoms">
                    {{ prof.nom }} {{ prof.cognoms }}
                  </option>
                </select>
                <button type="button" @click="activeDocentFormIndex = index" class="btn-add-docent">Afegir Docent</button>
                <div v-if="activeDocentFormIndex === index" class="docent-form">
                  <h4>Nou Docent</h4>
                  <input type="text" v-model="newDocent.nom" placeholder="Nom" required>
                  <input type="text" v-model="newDocent.cognoms" placeholder="Cognoms" required>
                  <input type="email" v-model="newDocent.email" placeholder="Email" required>
                  <button type="button" @click="handleSaveDocent(index)">Desar Docent</button>
                </div>
              </div>
              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="t.es_preferencia_referent">
                  <span>Preferència Referent</span>
                </label>
                <small class="help-text">Marca si aquest professor serà el referent d'aquest taller</small>
              </div>
            </div>

            <div class="form-group">
              <label>Descripció / Comentaris (Transport, horaris, etc.)</label>
              <textarea v-model="t.descripcio" rows="3" placeholder="Observacions específiques per a aquest taller..."></textarea>
            </div>
          </div>
        </section>

        <div class="form-submit">
          <button type="submit" class="btn-submit" :disabled="submitting">
            {{ textBotoSubmit }}
          </button>
        </div>
      </form>
    </div>

    <div v-if="message" :class="classeAlert">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
// ======================================
// Importacions i Composables (Rutes, Cookies, Stores)
// ======================================
import { ref, onMounted } from 'vue';

// ======================================
// Estat Reactiu i Refs (Variables i Formularis)
// ======================================
const currentStep = ref(1);
const tokenCookie = useCookie('authToken');
const tallers = ref([]);
const professors = ref([]);
const centre = ref(null);
const selectedTallers = ref([]);
const submitting = ref(false);
const message = ref('');
const messageType = ref('');
const activeDocentFormIndex = ref(null);

const newDocent = ref({
  nom: '',
  cognoms: '',
  email: ''
});

const form = ref({
  tallers: []
});

const isEnrollmentOpen = computed(() => {
  if (!centre.value || !centre.value.config) return false;
  
  const now = new Date();
  
  // Funció per parsejar dates "YYYY-MM-DD" directament a hora local (00:00:00)
  // Evitem problemes de Timezone que té new Date("YYYY-MM-DD") que ho tracta com UTC
  const parseLocal = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]); // Any, Mes (0-index), Dia
  };

  const start = parseLocal(centre.value.config.enrollment_start);
  const end = parseLocal(centre.value.config.enrollment_end);
  
  if (!start || !end) return false;

  // Ajustem l'hora final per incloure tot el dia final (23:59:59.999)
  end.setHours(23, 59, 59, 999);
  
  // Debug (opcional, per veure a consola si cal)
  // console.log("Now:", now, "Start:", start, "End:", end);

  return now >= start && now <= end;
});

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES');
}

const textBotoSubmit = computed(function () {
  if (submitting.value) {
    return 'Enviant...';
  } else {
    return 'Confirmar Sol·licitud';
  }
});

const classeAlert = computed(function () {
  return 'alert ' + messageType.value;
});

// ======================================
// Lògica i Funcions (Handlers i Lifecycle)
// ======================================

// A) --- Desar un nou docent i afegir-lo a la llista ---
async function handleSaveDocent(tallerIndex) {
  if (!newDocent.value.nom || !newDocent.value.email) {
    alert('El nom i el mail són obligatoris');
    return;
  }

  try {
    let token = tokenCookie.value;
    let payload = {};
    payload.nom = newDocent.value.nom;
    payload.cognoms = newDocent.value.cognoms;
    payload.email = newDocent.value.email;
    payload.centre_id = centre.value.id;

    let savedProf = await $fetch('/api/centre/professors', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: payload
    });
    professors.value.push(savedProf);
    newDocent.value.nom = '';
    newDocent.value.cognoms = '';
    newDocent.value.email = '';
    activeDocentFormIndex.value = null;
  } catch (error) {
    console.error('Error guardant el docent:', error);
  }
}

// A) --- Carregar tallers, professors i perfil del centre ---
async function fetchData() {
  try {
    let token = tokenCookie.value;
    let headers = { 'Authorization': 'Bearer ' + token };
    let prom1 = $fetch('/api/centre/tallers', { headers });
    let prom2 = $fetch('/api/centre/professors', { headers });
    let prom3 = $fetch('/api/centre/perfil', { headers });
    let res = await Promise.all([prom1, prom2, prom3]);
    tallers.value = res[0];
    professors.value = res[1];
    centre.value = res[2];
  } catch (error) {
    console.error('Error carregant dades:', error);
  }
}

// A) --- Comprovar si un taller està seleccionat ---
function isSelected(id) {
  let arr = selectedTallers.value;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].id === id) {
      return true;
    }
  }
  return false;
}

// A) --- Afegir o treure un taller de la selecció ---
function toggleTaller(taller) {
  // Check date first
  if (!isSelected(taller.id) && !isEnrollmentOpen.value) {
    alert("El període d'inscripció està tancat.");
    return;
  }

  let index = -1;
  let arr = selectedTallers.value;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].id === taller.id) {
      index = i;
      break;
    }
  }
  if (index > -1) {
    let nova = [];
    for (let i = 0; i < arr.length; i++) {
      if (i !== index) {
        nova[nova.length] = arr[i];
      }
    }
    selectedTallers.value = nova;
  } else {
    let nova = [];
    for (let i = 0; i < arr.length; i++) {
      nova[nova.length] = arr[i];
    }
    nova[nova.length] = taller;
    selectedTallers.value = nova;
  }
}

// A) --- Passar al pas 2 i preparar form.tallers ---
function nextStep() {
  let sel = selectedTallers.value;
  let nova = [];
  for (let i = 0; i < sel.length; i++) {
    let t = sel[i];
    let ob = {};
    ob.taller_id = t.id;
    ob.trimestre = '';
    ob.num_participants = 1;
    ob.docent_nom = '';
    ob.docent_email = '';
    ob.prioritat = 1;
    ob.es_preferencia_referent = false;
    ob.descripcio = '';
    nova[nova.length] = ob;
  }
  form.value.tallers = nova;
  currentStep.value = 2;
}

// A) --- Obtenir el títol d'un taller per id ---
function getTallerTitol(id) {
  let arr = tallers.value;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].id === id) {
      return arr[i].titol;
    }
  }
  return 'Taller';
}

// A) --- Actualitzar l'email del docent al formulari ---
function updateDocentEmail(tallerFormObj) {
  let nomComplet = tallerFormObj.docent_nom;
  let arr = professors.value;
  for (let i = 0; i < arr.length; i++) {
    let p = arr[i];
    let nc = p.nom + ' ' + p.cognoms;
    if (nc === nomComplet) {
      tallerFormObj.docent_email = p.email;
      return;
    }
  }
}

// A) --- Retornar la classe de la targeta del taller ---
function classeTallerCard(taller) {
  if (isSelected(taller.id)) {
    return 'taller-card selected';
  } else {
    return 'taller-card';
  }
}

// A) --- Retornar la classe del botó de selecció ---
function classeBtnSelect(taller) {
  if (isSelected(taller.id)) {
    return 'btn-select active';
  } else if (!isEnrollmentOpen.value) {
    return 'btn-select disabled';
  } else {
    return 'btn-select';
  }
}

// A) --- Retornar el text del botó de selecció ---
function textBotoSelect(taller) {
  if (isSelected(taller.id)) {
    return '✓ Seleccionat';
  } else if (!isEnrollmentOpen.value) {
    return '⛔ Tancat';
  } else {
    return '+ Afegir';
  }
}

// A) --- Enviar la sol·licitud de peticions ---
async function handleSubmit() {
  submitting.value = true;
  try {
    let token = tokenCookie.value;
    await $fetch('/api/centre/peticions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: form.value
    });
    message.value = 'Sol·licitud enviada!';
    messageType.value = 'success';
    setTimeout(function () {
      window.location.reload();
    }, 2000);
  } catch (error) {
    message.value = 'Error en enviar.';
    messageType.value = 'error';
  } finally {
    submitting.value = false;
  }
}

onMounted(fetchData);
</script>

<style scoped>
.inscripcio-container { max-width: 1000px; margin: 2rem auto; padding: 1rem; }
.page-header { margin-bottom: 2rem; border-bottom: 1px solid #eee; padding-bottom: 1rem; }
.centre-info { background: #f0f7ff; padding: 0.5rem; border-radius: 4px; margin: 0.5rem 0; }
.tallers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; margin-bottom: 4rem; }
.taller-card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; background: white; }
.taller-card.selected { border-color: #3b82f6; background: #f0f7ff; }
.card-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
.modality-tag { background: #3b82f6; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; }
.sector-tag { background: #eee; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; }
.extra-info { font-size: 0.85rem; color: #666; margin-top: 1rem; display: flex; flex-direction: column; gap: 4px; }
.btn-select { width: 100%; margin-top: 1rem; padding: 0.5rem; cursor: pointer; border: 1px solid #3b82f6; background: white; color: #3b82f6; border-radius: 4px; }
.btn-select.active { background: #3b82f6; color: white; }
.btn-select.disabled { border-color: #ccc; color: #999; cursor: not-allowed; background: #f9f9f9; }
.footer-actions { position: fixed; bottom: 0; left: 0; right: 0; background: white; padding: 1rem; border-top: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
.btn-primary, .btn-submit { background: #3b82f6; color: white; border: none; padding: 0.7rem 1.5rem; border-radius: 4px; cursor: pointer; }
.form-section { margin-bottom: 2rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
.form-group { display: flex; flex-direction: column; }
.checkbox-group { justify-content: center; }
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 600;
  color: #334155;
}
.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}
.checkbox-label span {
  user-select: none;
}
.taller-detail-item { border: 1px solid #eee; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; background: #fafafa; }
.alert { padding: 1rem; margin-top: 1rem; border-radius: 4px; }
.success { background: #dcfce7; color: #166534; }
.error { background: #fee2e2; color: #b91c1c; }
.info-period { margin: 1rem 0; padding: 1rem; background: #f8fafc; border-radius: 6px; border-left: 4px solid #3b82f6; }
.text-success { color: #166534; font-weight: bold; }
.text-danger { color: #b91c1c; font-weight: bold; }
</style>
