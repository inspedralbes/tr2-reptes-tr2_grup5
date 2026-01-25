<template>
  <div class="page">
    <h1>Control d'Assistència</h1>
    <div v-if="pending">Carregant...</div>
    <div v-if="error" class="error">{{ missatgeError }}</div>

    <div v-if="mostrarContingut">
      <!-- Secció: tallers on ets referent -->
      <div class="seccio">
        <p>Verifica l'assistència dels tallers on ets referent.</p>

        <table v-if="referentTallers.length > 0" class="taula">
          <thead>
            <tr class="thead-row">
              <th>ID Detall</th>
              <th>Taller</th>
              <th>Ubicació</th>
              <th>Trimestre</th>
              <th>Docent</th>
              <th>Accions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="taller in referentTallers" :key="taller.detall_id">
              <td>{{ taller.detall_id }}</td>
              <td>
                <strong>{{ taller.titol }}</strong><br>
                <small>{{ taller.modalitat }}</small>
              </td>
              <td>{{ taller.ubicacio }}</td>
              <td>{{ taller.trimestre }}</td>
              <td>{{ textDocent(taller) }}</td>
              <td>
                <button @click="goToAssistencia(taller)">Passar Llista</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else>
          No ets referent de cap taller.
        </p>
      </div>

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

// Obtenim la resposta de useFetch sense desestructurar.
let valorAuth = '';
if (token.value) {
  valorAuth = 'Bearer ' + token.value;
} else {
  valorAuth = '';
}
const resFetch = await useFetch('/api/professor/tallers', {
  headers: { Authorization: valorAuth }
});


// ======================================
// Estat Reactiu i Refs (Variables i Formularis)
// ======================================
const pending = resFetch.pending;
const error = resFetch.error;

// Dades de tallers: accedim a resFetch.data (ref).
const tallers = computed(function () {
  const d = resFetch.data;
  if (d && d.value) {
    return d.value;
  }
  return [];
});

// Llista de tallers on l'usuari és referent (bucle for, sense .filter).
const referentTallers = computed(function () {
  const arr = tallers.value;
  if (!arr) {
    return [];
  }
  const resultat = [];
  for (let i = 0; i < arr.length; i++) {
    const t = arr[i];
    if (t.permissions && t.permissions.canTakeAttendance) {
      resultat.push(t);
    }
  }
  return resultat;
});

// Variable per amagar lògica de "!pending && !error" del template.
const mostrarContingut = computed(function () {
  if (pending.value) {
    return false;
  }
  if (error.value) {
    return false;
  }
  return true;
});

// Missatge d'error per no posar .message al template.
const missatgeError = computed(function () {
  if (error.value && error.value.message) {
    return error.value.message;
  }
  return '';
});

// Retorna el text a mostrar per al docent (evitar || al template).
function textDocent(taller) {
  if (taller.docent_nom) {
    return taller.docent_nom;
  }
  return 'Pendent';
}

// ======================================
// Lògica i Funcions (Handlers i Lifecycle)
// ======================================

// A) --- Navegar a la pàgina de passar llista d'un taller ---
function goToAssistencia(taller) {
  // 1. Comprovar que el taller i el detall_id existeixen.
  if (taller && taller.detall_id) {
    // 2. Navegar a la ruta d'assistència amb l'ID de detall.
    router.push('/professors/assistencia/' + taller.detall_id);
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
