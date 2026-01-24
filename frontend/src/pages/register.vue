<template>
  <div class="page">
    <h1>Sol·licitud de registre de Centre</h1>

    <form @submit.prevent="submitForm" class="form">
      <label>Codi centre
        <input v-model="form.codi_centre" type="text" maxlength="50" required />
      </label>

      <label>Nom del centre
        <select v-model="form.nom_centre" required>
          <option value="" disabled>-- Selecciona un centre --</option>
          <option>Institut Pedralbes</option>
          <option>Institut Tecnològic de Barcelona</option>
          <option>Institut TIC de Barcelona</option>
          <option>Altres</option>
        </select>
      </label>

      <label v-if="mostrarNomManual">Nom del centre (manual)
        <input v-model="form.nom_centre_manual" type="text" maxlength="255" required />
      </label>

      <label>Contrasenya (per al compte del centre)
        <input v-model="form.password" type="password" minlength="6" required />
      </label>

      <label>Adreça
        <input v-model="form.adreca" type="text" maxlength="255" />
      </label>

      <label>Email oficial
        <input v-model="form.email_oficial" type="email" maxlength="255" required />
      </label>

      <label>Municipi
        <input v-model="form.municipi" type="text" maxlength="100" />
      </label>

      <label>Telèfon
        <input v-model="form.telefon" type="text" maxlength="20" />
      </label>
      <h1>Informació del coordinador</h1>
      <label>Nom coordinador
        <input v-model="form.nom_coordinador" type="text" maxlength="255" />
      </label>

      <label>Email coordinador
        <input v-model="form.email_coordinador" type="email" maxlength="255" required />
      </label>

      <label>
        <input v-model="form.es_primera_vegada" type="checkbox" /> Primera vegada?
      </label>

      <div class="actions">
        <button type="submit" :disabled="loading">{{ textBoto }}</button>
        <button type="button" @click="resetForm">Netejar</button>
        <button type="button" @click="goBack">Tornar</button>
      </div>

      <p v-if="message" class="message">{{ message }}</p>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
// ======================================
// Importacions i Composables (Rutes, Cookies, Stores)
// ======================================
definePageMeta({
  layout: 'false'
});

// ======================================
// Estat Reactiu i Refs (Variables i Formularis)
// ======================================
const form = ref({
  codi_centre: '',
  nom_centre: '',
  nom_centre_manual: '',
  password: '',
  adreca: '',
  municipi: '',
  telefon: '',
  nom_coordinador: '',
  email_coordinador: '',
  email_oficial: '',
  es_primera_vegada: false,
  estat: 'pendent'
});

const loading = ref(false);
const message = ref('');
const error = ref('');

const mostrarNomManual = computed(function () {
  if (form.value.nom_centre === 'Altres') {
    return true;
  } else {
    return false;
  }
});

const textBoto = computed(function () {
  if (loading.value) {
    return 'Enviant...';
  } else {
    return 'Enviar sol·licitud';
  }
});

// ======================================
// Lògica i Funcions (Handlers i Lifecycle)
// ======================================

// A) --- Netejar el formulari i els missatges ---
function resetForm() {
  // 1. Restablim cada camp del formulari un a un.
  form.value.codi_centre = '';
  form.value.nom_centre = '';
  form.value.nom_centre_manual = '';
  form.value.password = '';
  form.value.adreca = '';
  form.value.municipi = '';
  form.value.telefon = '';
  form.value.nom_coordinador = '';
  form.value.email_coordinador = '';
  form.value.email_oficial = '';
  form.value.es_primera_vegada = false;
  form.value.estat = 'pendent';
  // 2. Netegem els missatges.
  message.value = '';
  error.value = '';
}

// A) --- Tornar enrere a la pàgina anterior ---
function goBack() {
  // 1. Cridem history.back.
  history.back();
}

// A) --- Enviar el formulari de sol·licitud de registre ---
async function submitForm() {
  // 1. Netegem errors i missatges.
  error.value = '';
  message.value = '';

  // 2. Validem els camps obligatoris.
  if (!form.value.codi_centre || !form.value.nom_centre || !form.value.password || !form.value.email_coordinador) {
    error.value = 'Si us plau, omple els camps obligatoris (codi, nom, password, email).';
    return;
  }

  loading.value = true;
  try {
    // 3. Construïm el payload assignant propietats una a una.
    let payload = {};
    payload.codi_centre = form.value.codi_centre;
    payload.nom_centre = form.value.nom_centre;
    if (form.value.nom_centre_manual) {
      payload.nom_centre_manual = form.value.nom_centre_manual;
    } else {
      payload.nom_centre_manual = null;
    }
    payload.password = form.value.password;
    payload.adreca = form.value.adreca;
    payload.municipi = form.value.municipi;
    payload.telefon = form.value.telefon;
    payload.nom_coordinador = form.value.nom_coordinador;
    payload.email_coordinador = form.value.email_coordinador;
    if (form.value.email_oficial) {
      payload.email_centre = form.value.email_oficial;
    } else {
      payload.email_centre = null;
    }
    if (form.value.es_primera_vegada) {
      payload.es_primera_vegada = true;
    } else {
      payload.es_primera_vegada = false;
    }

    // 4. Fem la petició POST a l'API.
    const res = await $fetch('/api/solicituds-registre', {
      method: 'POST',
      body: payload
    });

    // 5. Obtenim el missatge de la resposta.
    let missatgeRes = 'Sol·licitud enviada correctament.';
    if (res && res.message) {
      missatgeRes = res.message;
    }
    message.value = missatgeRes;
    resetForm();
  } catch (err) {
    // 6. En cas d'error, extreure el missatge i mostrar-lo.
    console.error('Error enviant sol·licitud:', err);
    let missatgeErr = 'Error en enviar la sol·licitud';
    if (err && err.data && err.data.message) {
      missatgeErr = err.data.message;
    } else if (err && err.message) {
      missatgeErr = err.message;
    }
    error.value = missatgeErr;
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.page {
  max-width: 760px;
  margin: 2.4rem auto;
  padding: 22px 20px 20px 26px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #e9f2ff;
  box-shadow: 0 6px 20px rgba(15,30,70,0.06);
  position: relative;
}

.page::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 8px;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  background: linear-gradient(180deg, #2b63b6, #4a8fe6);
}

h1 { margin: 0 0 14px 12px; color: #1e4f9a }

form.form { display:block }

label { display: block; margin-bottom: 0.75rem; color:#55617a; font-weight:600 }

input[type="text"], input[type="email"], input[type="password"], select {
  width: 100%;
  padding: 10px 12px;
  box-sizing: border-box;
  border-radius: 8px;
  border: 1px solid #e6eef9;
  background: #fbfdff;
  margin-top: 6px;
}

input[type="checkbox"] { transform: translateY(2px) }

.actions { margin-top: 1.2rem; display:flex; gap:10px }

button[type="submit"] {
  background: #2b63b6;
  color: white;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
}

.actions button[type="button"] {
  background: transparent;
  color: #55617a;
  border: 1px solid #e6eef9;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
}

.message { color: #2b8a4a; margin-top: .6rem }
.error { color: #d33; margin-top: .6rem }

@media (max-width: 640px) {
  .page { margin: 1.2rem; padding: 16px }
  .page::before { width:6px }
}
</style>
