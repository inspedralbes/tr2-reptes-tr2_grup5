<template>
  <div style="padding: 20px;">
    <h1>Control d'Assistència</h1>
    <div v-if="pending">Carregant...</div>
    <div v-if="error" style="color: red">{{ error.message }}</div>

    <div v-if="!pending && !error">
      
      <!-- SECCIÓ 2: REFERENT -->
      <div style="margin-bottom: 40px;">
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

const referentTallers = computed(() => {
  if (!tallers.value) return [];
  return tallers.value.filter(t => t.permissions && t.permissions.canTakeAttendance);
});

const goToAssistencia = (taller) => {
  if (taller && taller.detall_id) {
    router.push(`/professors/assistencia/${taller.detall_id}`);
  }
}
</script>
