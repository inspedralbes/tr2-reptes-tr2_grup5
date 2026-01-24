<template>
  <div class="page">
    <h1>Panell de Professor</h1>
    <div v-if="pending">Carregant...</div>
    <div v-if="error" class="error">{{ missatgeError }}</div>

    <div v-if="mostrarContingut">
      <!-- Secció 1: tallers assignats (docent) -->
      <div class="seccio">
        <h2>Gestió de Llistes (Docent)</h2>
        <p>Afegeix els alumnes als tallers on ets docent.</p>

        <table v-if="assignedTallers.length > 0" class="taula">
          <thead>
            <tr class="thead-row">
              <th>ID</th>
              <th>Taller</th>
              <th>Sector</th>
              <th>Places</th>
              <th>Estat</th>
              <th>Accions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="taller in assignedTallers" :key="taller.id">
              <td>{{ taller.id }}</td>
              <td>
                <strong>{{ taller.titol }}</strong><br>
                <small>{{ taller.modalitat }}</small>
              </td>
              <td>{{ taller.sector }}</td>
              <td>{{ taller.places_maximes }}</td>
              <td>{{ textEstatTaller(taller) }}</td>
              <td>
                <button @click="goToAlumnes(taller)">Gestionar Alumnes</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else>No tens tallers assignats.</p>
      </div>

      <hr>
    </div>
  </div>
</template>

<script setup>
// ======================================
// Importacions i Composables (Rutes, Cookies, Stores)
// ======================================
const header = useHeaderStore();
header.setHeaderProfessors();
const router = useRouter();
const token = useCookie('authToken');

// Valor per a l'header Authorization (sense ternari).
let valorAuth = '';
if (token.value) {
  valorAuth = 'Bearer ' + token.value;
} else {
  valorAuth = '';
}
const resFetch = await useFetch('/api/professors/tallers', {
  headers: { Authorization: valorAuth }
});

// ======================================
// Estat Reactiu i Refs (Variables i Formularis)
// ======================================
const pending = resFetch.pending;
const error = resFetch.error;

const tallers = computed(function () {
  const d = resFetch.data;
  if (d && d.value) {
    return d.value;
  }
  return [];
});

const assignedTallers = computed(function () {
  const arr = tallers.value;
  if (!arr) {
    return [];
  }
  const resultat = [];
  for (let i = 0; i < arr.length; i++) {
    const t = arr[i];
    if (t.permissions && t.permissions.canManageList) {
      resultat.push(t);
    }
  }
  return resultat;
});

// Mostrar el contingut principal quan no hi ha càrrega ni error (lògica fora del template).
const mostrarContingut = computed(function () {
  if (pending.value) {
    return false;
  }
  if (error.value) {
    return false;
  }
  return true;
});

const missatgeError = computed(function () {
  if (error.value && error.value.message) {
    return error.value.message;
  }
  return '';
});

// Retorna el text d'estat del taller (evitar ternari al template).
function textEstatTaller(taller) {
  if (taller.actiu) {
    return 'Actiu';
  }
  return 'Inactiu';
}

// ======================================
// Lògica i Funcions (Handlers i Lifecycle)
// ======================================

// A) --- Navegar a la pàgina de gestió d'alumnes d'un taller ---
function goToAlumnes(taller) {
  // 1. Comprovar que el taller i el detall_id existeixen.
  if (taller && taller.detall_id) {
    // 2. Navegar a la ruta d'alumnes del taller.
    router.push('/professors/tallers/' + taller.detall_id + '/alumnes');
  }
}
</script>

<style scoped>
.page {
  padding: 20px;
}

.error {
  color: red;
}

.seccio {
  margin-bottom: 40px;
}

.taula {
  border: 1px solid #ccc;
  border-collapse: collapse;
  width: 100%;
}

.taula th,
.taula td {
  padding: 10px;
  border: 1px solid #ccc;
}

.thead-row {
  background: #eee;
}
</style>
