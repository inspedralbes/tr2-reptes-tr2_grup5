<template>
  <div style="padding: 20px;">
    <h1>Panell de Professor</h1>
    <div v-if="pending">Carregant...</div>
    <div v-if="error" style="color: red">{{ error.message }}</div>

    <div v-if="!pending && !error">
      
      <!-- SECCIÓ 1: ASSIGNATS (DOCENT) -->
      <div style="margin-bottom: 40px;">
        <h2>Gestió de Llistes (Docent)</h2>
        <p>Afegeix els alumnes als tallers on ets docent.</p>
        
        <table v-if="assignedTallers.length > 0" border="1" cellpadding="10" style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr style="background: #eee;">
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
              <td>{{ taller.actiu ? 'Actiu' : 'Inactiu' }}</td>
              <td>
                <button @click="goToAlumnes(taller)">Gestionar Alumnes</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else>No tens tallers assignats.</p>
      </div>

      <hr>

      <!-- SECCIÓ 2: REFERENT -->
      <div style="margin-bottom: 40px;">
        <h2>Control d'Assistència (Referent)</h2>
        <p>Verifica l'assistència dels tallers on ets referent.</p>

        <table v-if="referentTallers.length > 0" border="1" cellpadding="10" style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr style="background: #eee;">
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
              <td>{{ taller.docent_nom || 'Pendent' }}</td>
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
const header = useHeaderStore()
header.setHeaderProfessors()
const router = useRouter()
const token = useCookie('authToken');

const { data: tallers, pending, error } = await useFetch('/api/professors/tallers', {
  headers: { Authorization: token.value ? `Bearer ${token.value}` : '' }
})

const assignedTallers = computed(() => {
  if (!tallers.value) return [];
  return tallers.value.filter(t => t.permissions && t.permissions.canManageList);
});

const referentTallers = computed(() => {
  if (!tallers.value) return [];
  return tallers.value.filter(t => t.permissions && t.permissions.canTakeAttendance);
});

const goToAlumnes = (taller) => {
  if (taller && taller.detall_id) {
    router.push(`/professors/tallers/${taller.detall_id}/alumnes`);
  }
}

const goToAssistencia = (taller) => {
  if (taller && taller.detall_id) {
    router.push(`/professors/assistencia/${taller.detall_id}`);
  }
}
</script>
