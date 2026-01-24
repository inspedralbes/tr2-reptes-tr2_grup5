<template>
  <div class="page">
    <h2>Sol·licituds de Centres <small v-if="comptePendents > 0">({{ comptePendents }} pendents)</small></h2>

    <div v-if="loading">Carregant sol·licituds...</div>
    <div v-else>
      <div>
        <div v-if="pendingSolicitudesLength === 0" class="empty-message">No hi ha sol·licituds pendents</div>
        <ul v-else class="list">
          <li
            v-for="s in pendingSolicitudes"
            :key="s.id"
            @click="selectSolicitud(s)"
            :class="classeItem(s)"
          >
            <div class="item-left">
              <div class="avatar">{{ lletraInicial(s) }}</div>
              <div class="info">
                <strong class="name">{{ nomCentreDisplay(s) }}</strong>
                <div class="meta">{{ s.email_coordinador }} · {{ telefonDisplay(s) }}</div>
              </div>
            </div>
            <div class="item-right">
              <div class="centre-name">{{ centreDisplay(s) }}</div>
              <div class="status-badge">{{ s.estat }}</div>
              <div class="row-actions">
                <button class="btn-accept" @click.stop="updateEstado(s.id, 'acceptada')" :disabled="actionLoading" title="Acceptar">Acceptar</button>
                <button class="btn-reject" @click.stop="updateEstado(s.id, 'rebutjada')" :disabled="actionLoading" title="Rebutjar">Rebutjar</button>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <div v-if="selected" class="detail">
        <h3>Detall: {{ selected.nom_centre }}</h3>
        <div class="detail-row"><div class="detail-label">Codi</div><div class="detail-tag">{{ codiSelected }}</div></div>
        <div class="detail-row"><div class="detail-label">Nom</div><div class="detail-tag">{{ selected.nom_centre }}</div></div>
        <div class="detail-row"><div class="detail-label">Email coordinador</div><div class="detail-tag">{{ selected.email_coordinador }}</div></div>
        <div class="detail-row"><div class="detail-label">Telèfon</div><div class="detail-tag">{{ telefonSelected }}</div></div>
        <div class="detail-row"><div class="detail-label">Adreça</div><div class="detail-tag">{{ adrecaSelected }}</div></div>
        <div class="detail-row"><div class="detail-label">Primera vegada</div><div class="detail-tag">{{ textPrimeraVegada }}</div></div>
        <div class="detail-row"><div class="detail-label">Data enviament</div><div class="detail-tag">{{ dataEnviamentSelected }}</div></div>
        <div class="detail-row"><div class="detail-label">Estat</div><div class="detail-tag status-badge">{{ selected.estat }}</div></div>
        <p v-if="actionMessage" class="msg">{{ actionMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// ======================================
// Importacions i Composables (Rutes, Cookies, Stores)
// ======================================
import { ref, onMounted, computed } from 'vue';

// ======================================
// Estat Reactiu i Refs (Variables i Formularis)
// ======================================
const solicitudes = ref([]);
const loading = ref(true);
const selected = ref(null);
const actionLoading = ref(false);
const actionMessage = ref('');

const pendingSolicitudes = computed(function () {
  let arr = solicitudes.value;
  let resultat = [];
  for (let i = 0; i < arr.length; i++) {
    let s = arr[i];
    let e = (s.estat || '').toString().toLowerCase();
    if (e === 'pendent') {
      resultat.push(s);
    }
  }
  return resultat;
});

const pendingSolicitudesLength = computed(function () {
  return pendingSolicitudes.value.length;
});

const comptePendents = computed(function () {
  return pendingSolicitudes.value.length;
});

const codiSelected = computed(function () {
  if (selected.value && selected.value.codi_centre) {
    return selected.value.codi_centre;
  }
  return '—';
});

const telefonSelected = computed(function () {
  if (selected.value && selected.value.telefon) {
    return selected.value.telefon;
  }
  return '—';
});

const adrecaSelected = computed(function () {
  if (selected.value && selected.value.adreca) {
    return selected.value.adreca;
  }
  return '—';
});

const textPrimeraVegada = computed(function () {
  if (selected.value && selected.value.es_primera_vegada) {
    return 'Sí';
  } else {
    return 'No';
  }
});

const dataEnviamentSelected = computed(function () {
  if (selected.value) {
    if (selected.value.data_enviament_formatted) {
      return selected.value.data_enviament_formatted;
    }
    if (selected.value.data_creacio) {
      return selected.value.data_creacio;
    }
  }
  return '—';
});

// ======================================
// Lògica i Funcions (Handlers i Lifecycle)
// ======================================

// A) --- Obtenir la classe de l'item segons l'estat ---
function classeItem(s) {
  if (s.estat === 'acceptada') {
    return 'item acceptada';
  }
  if (s.estat === 'pendent') {
    return 'item pendent';
  }
  if (s.estat === 'rebutjada') {
    return 'item rebutjada';
  }
  return 'item';
}

// A) --- Obtenir la lletra inicial per l'avatar ---
function lletraInicial(s) {
  let nom = '';
  if (s.nom_centre_manual) {
    nom = s.nom_centre_manual;
  } else if (s.nom_centre) {
    nom = s.nom_centre;
  }
  if (nom && nom.charAt) {
    return nom.charAt(0);
  }
  return '?';
}

// A) --- Nom del centre per mostrar ---
function nomCentreDisplay(s) {
  if (s.nom_centre_manual) {
    return s.nom_centre_manual;
  } else {
    return s.nom_centre;
  }
}

// A) --- Telèfon per mostrar ---
function telefonDisplay(s) {
  if (s.telefon) {
    return s.telefon;
  } else {
    return '—';
  }
}

// A) --- Centre display ---
function centreDisplay(s) {
  if (s.centre_display) {
    return s.centre_display;
  } else {
    return s.nom_centre;
  }
}

// A) --- Obtenir les sol·licituds de l'API ---
async function fetchSolicitudes() {
  loading.value = true;
  try {
    const tokenCookie = useCookie('authToken');
    let token = tokenCookie.value;

    if (!token) {
      console.warn('No auth token found - redirecting to login');
      loading.value = false;
      navigateTo('/login');
      return;
    }
    let res = await $fetch('/api/solicituds-registre', {
      headers: { Authorization: 'Bearer ' + token }
    });
    if (Array.isArray(res)) {
      solicitudes.value = res;
    } else if (res && typeof res === 'object') {
      if (res.data && Array.isArray(res.data)) {
        solicitudes.value = res.data;
      } else {
        solicitudes.value = Object.values(res);
      }
    } else {
      solicitudes.value = [];
    }
  } catch (err) {
    console.error('Error fetching solicitudes', err);
    if (err && err.response) {
      let st = err.response.status;
      if (st === 401 || st === 403) {
        actionMessage.value = 'Accés denegat. Si us plau, inicia sessió amb un usuari amb permisos d\'administrador.';
        navigateTo('/login');
      }
    }
    solicitudes.value = [];
  } finally {
    loading.value = false;
  }
}

// A) --- Seleccionar una sol·licitud i mostrar el detall ---
function selectSolicitud(s) {
  if (selected.value && selected.value.id === s.id) {
    selected.value = null;
    actionMessage.value = '';
    return;
  }

  try {
    let copy = JSON.parse(JSON.stringify(s));
    if (copy.data_enviament) {
      copy.data_enviament_formatted = new Date(copy.data_enviament).toLocaleString();
    } else {
      copy.data_enviament_formatted = copy.data_creacio || '—';
    }
    selected.value = copy;
  } catch (e) {
    selected.value = s;
  }
  actionMessage.value = '';
}

// A) --- Actualitzar l'estat d'una sol·licitud ---
async function updateEstado(id, estado) {
  if (!confirm('Estàs segur que vols marcar la sol·licitud com ' + estado + '?')) return;
  actionLoading.value = true;
  actionMessage.value = '';
  try {
    const tokenCookie = useCookie('authToken');
    let token = tokenCookie.value;
    let res = await $fetch('/api/solicituds-registre/' + id, {
      method: 'PUT',
      headers: { Authorization: token ? 'Bearer ' + token : '' },
      body: { estat: estado }
    });
    if (res && res.message) {
      actionMessage.value = res.message;
    } else {
      actionMessage.value = 'Actualitzat';
    }
    await fetchSolicitudes();
    if (selected.value && selected.value.id === id) {
      selected.value = null;
    } else {
      let trobat = null;
      let arr = solicitudes.value;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].id === id) {
          trobat = arr[i];
          break;
        }
      }
      if (trobat) {
        selected.value = JSON.parse(JSON.stringify(trobat));
      } else {
        selected.value = null;
      }
    }
  } catch (err) {
    console.error('Error updating estado', err);
    if (err && err.data && err.data.message) {
      actionMessage.value = err.data.message;
    } else {
      actionMessage.value = 'Error actualitzant';
    }
  } finally {
    actionLoading.value = false;
  }
}

onMounted(fetchSolicitudes);
</script>

<style scoped>
.list { list-style:none; padding:0; margin:0 }
.list .item {
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:14px 16px;
  border-radius:8px;
  background: #fff;
  margin-bottom:12px;
  box-shadow: 0 1px 0 rgba(15,30,70,0.04);
  border: 1px solid #eef4fb;
  cursor:pointer;
}

.item-left { display:flex; align-items:center; gap:12px }
.avatar {
  width:40px; height:40px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  background: linear-gradient(180deg,#e9f2ff,#cfe6ff);
  color:#134a8a; font-weight:700;
}
.info .name { color:#203a63; display:block }
.meta { color:#7a869a; font-size:0.9em }

.item-right { display:flex; align-items:center; gap:16px }
.centre-name { color:#55617a; font-size:0.95em }
.status-badge { background:#e9f8ee; color:#1f8a4a; padding:6px 10px; border-radius:12px; font-weight:600 }
.row-actions { display:flex; gap:8px; align-items:center }
.btn-accept { background:#2ecc71; color:white; border:none; padding:6px 10px; border-radius:6px; cursor:pointer }
.btn-reject { background:#ff6b6b; color:white; border:none; padding:6px 10px; border-radius:6px; cursor:pointer }
.row-actions .btn-icon { background:transparent; border:none; color:#d33; cursor:pointer; font-size:18px }

.item.acceptada { border-left:4px solid #2ecc71 }
.item.pendent { border-left:4px solid #f1c40f }
.item.rebutjada { border-left:4px solid #e74c3c }

.detail { margin-top:1rem; padding:1rem; border:1px solid #dde6f7; background:#fbfdff }
.actions { margin-top:1rem; display:flex; gap:8px }
.msg { margin-top:0.5rem; color:green }

.detail-row { display:flex; align-items:center; gap:12px; margin:8px 0 }
.detail-label { width:160px; color:#6d7a97; font-weight:700 }
.detail-tag { background:#eef7ff; color:#2b63b6; padding:6px 10px; border-radius:12px; font-weight:600 }
</style>
