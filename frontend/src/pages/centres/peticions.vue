<template>
  <div class="inscripcio-container">
    <div v-if="currentStep === 1" class="step-view">
      <header class="page-header">
        <h1>Inscripció a Tallers ENGINY</h1>
        <div v-if="centre" class="centre-info">
          Sessió iniciada com a: <strong>{{ centre.nom_centre }}</strong>
        </div>
        <p class="subtitle">Selecciona els tallers que t'interessen per al teu centre.</p>
      </header>

      <div class="tallers-grid">
        <div v-for="taller in tallers" :key="taller.id" :class="['taller-card', { selected: isSelected(taller.id) }]">
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
              <span v-if="taller.adreca"><strong>📍 Adreça:</strong> {{ taller.adreca }}</span>
            </div>
          </div>
          <div class="card-footer">
            <button @click="toggleTaller(taller)" :class="['btn-select', { active: isSelected(taller.id) }]">
              {{ isSelected(taller.id) ? '✓ Seleccionat' : '+ Afegir' }}
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
          <h2>Dades de la Petició</h2>
          <div class="form-row">
            <div class="form-group">
              <label>Trimestre</label>
              <select v-model="form.trimestre" required>
                <option value="" disabled>Selecciona un trimestre</option>
                <option value="2n">2n Trimestre</option>
                <option value="3r">3r Trimestre</option>
              </select>
            </div>
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" v-model="form.disponibilitat_dimarts">
                Disponibilitat Dimarts
              </label>
            </div>
          </div>
          <div class="form-group">
            <label>Comentaris (Transport, horaris, etc.)</label>
            <textarea v-model="form.comentaris" rows="3" placeholder="Observacions..."></textarea>
          </div>
        </section>

        <section class="form-section">
          <h2>Tallers seleccionats</h2>
          <div v-for="(t, index) in form.tallers" :key="t.taller_id" class="taller-detail-item">
            <div class="item-header">
              <h3>{{ getTallerTitol(t.taller_id) }}</h3>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Num. Participants (max 4)</label>
                <input type="number" v-model="t.num_participants" min="1" max="4" required>
              </div>
              <div class="form-group">
                <label>Docent Responsable</label>
                <select v-model="t.docent_nom" @change="updateDocentEmail(t)" required>
                  <option value="" disabled>Selecciona un docent</option>
                  <option v-for="prof in professors" :key="prof.id" :value="prof.nom + ' ' + prof.cognoms">
                    {{ prof.nom }} {{ prof.cognoms }}
                  </option>
                </select>
                <button @click="activeDocentFormIndex = index">Afegir Docent</button>
                <h4>Nou Docent</h4>
                <div v-if="activeDocentFormIndex === index" class="docent-form">
                  <input type="text" v-model="newDocent.nom" placeholder="Nom" required>
                  <input type="text" v-model="newDocent.cognoms" placeholder="Cognoms" required>
                  <input type="email" v-model="newDocent.email" placeholder="Email" required>
                  <button @click="handleSaveDocent(index)">Desar Docent</button>
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group checkbox-group">
                <label>
                  <input type="checkbox" v-model="t.es_preferencia_referent">
                  És preferència referent
                </label>
              </div>
            </div>

          </div>
        </section>

        <div class="form-submit">
          <button type="submit" class="btn-submit" :disabled="submitting">
            {{ submitting ? 'Enviant...' : 'Confirmar Sol·licitud' }}
          </button>
        </div>
      </form>
    </div>

    <div v-if="message" :class="['alert', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const currentStep = ref(1);
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

const handleSaveDocent = async (tallerIndex) => {
  if (!newDocent.value.nom || !newDocent.value.email){
    alert ("El nom i el mail són obligatoris");
    return;
  };

  try{
    const token = localStorage.getItem('authToken');
    const payload = {
      ...newDocent.value,
      centre_id: centre.value.id
    };
    const savedProf = await $fetch('http://localhost:1700/api/centre/professors', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: payload
    });
    professors.value.push (savedProf);
    newDocent.value = {
      nom: '',
      cognoms: '',
      email: ''
    };
    activeDocentFormIndex.value = null;
  } catch (error) {
    console.error('Error guardant el docent:', error);
  }
};

const form = ref({
  trimestre: '',
  disponibilitat_dimarts: false,
  comentaris: '',
  tallers: []
});

const fetchData = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const headers = { 'Authorization': `Bearer ${token}` };
    
    const [resTallers, resProfs, resCentre] = await Promise.all([
      $fetch('http://localhost:1700/api/centre/tallers', { headers }),
      $fetch('http://localhost:1700/api/centre/professors', { headers }),
      $fetch('http://localhost:1700/api/centre/perfil', { headers })
    ]);
    
    tallers.value = resTallers;
    professors.value = resProfs;
    centre.value = resCentre;
  } catch (error) {
    console.error('Error carregant dades:', error);
  }
};

const isSelected = (id) => selectedTallers.value.some(t => t.id === id);

const toggleTaller = (taller) => {
  const index = selectedTallers.value.findIndex(t => t.id === taller.id);
  if (index > -1) {
    selectedTallers.value.splice(index, 1);
  } else {
    selectedTallers.value.push(taller);
  }
};

const nextStep = () => {
  form.value.tallers = selectedTallers.value.map(t => ({
    taller_id: t.id,
    num_participants: 1,
    docent_nom: '',
    docent_email: '',
    es_preferencia_referent: false
  }));
  currentStep.value = 2;
};

const getTallerTitol = (id) => tallers.value.find(t => t.id === id)?.titol || 'Taller';

const updateDocentEmail = (tallerFormObj) => {
  const prof = professors.value.find(p => `${p.nom} ${p.cognoms}` === tallerFormObj.docent_nom);
  if (prof) {
    tallerFormObj.docent_email = prof.email;
  }
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    const token = localStorage.getItem('authToken');
    await $fetch('http://localhost:1700/api/centre/peticions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: form.value
    });
    message.value = 'Sol·licitud enviada!';
    messageType.value = 'success';
    setTimeout(() => window.location.reload(), 2000);
  } catch (error) {
    message.value = 'Error en enviar.';
    messageType.value = 'error';
  } finally {
    submitting.value = false;
  }
};

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
.footer-actions { position: fixed; bottom: 0; left: 0; right: 0; background: white; padding: 1rem; border-top: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
.btn-primary, .btn-submit { background: #3b82f6; color: white; border: none; padding: 0.7rem 1.5rem; border-radius: 4px; cursor: pointer; }
.form-section { margin-bottom: 2rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
.form-group { display: flex; flex-direction: column; }
.taller-detail-item { border: 1px solid #eee; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; background: #fafafa; }
.alert { padding: 1rem; margin-top: 1rem; border-radius: 4px; }
.success { background: #dcfce7; color: #166534; }
.error { background: #fee2e2; color: #b91c1c; }
</style>
